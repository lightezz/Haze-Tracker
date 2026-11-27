interface ServerlessRequest {
  method?: string;
  query?: Record<string, unknown>;
}

interface ServerlessResponse {
  status: (code: number) => ServerlessResponse;
  setHeader: (name: string, value: string) => void;
  json: (body: unknown) => void;
}

const DATA_GOV_SG_PSI_URL = 'https://api-open.data.gov.sg/v2/real-time/api/psi';
const DATE_PARAM_REGEX = /^\d{4}-\d{2}-\d{2}$/;

interface RegionMetadataItem {
  name: 'north' | 'south' | 'east' | 'west' | 'central';
  labelLocation: {
    latitude: number;
    longitude: number;
  };
}

interface DataGovPsiItem {
  date: string;
  updatedTimestamp: string;
  timestamp: string;
  readings: {
    psi_twenty_four_hourly: Record<string, number>;
    no2_one_hour_max: Record<string, number>;
    pm10_twenty_four_hourly: Record<string, number>;
    pm25_twenty_four_hourly: Record<string, number>;
    so2_twenty_four_hourly: Record<string, number>;
    co_eight_hour_max: Record<string, number>;
    o3_eight_hour_max: Record<string, number>;
    co_sub_index: Record<string, number>;
    o3_sub_index: Record<string, number>;
    pm10_sub_index: Record<string, number>;
    pm25_sub_index: Record<string, number>;
    so2_sub_index: Record<string, number>;
  };
}

interface DataGovPsiResponse {
  code: number;
  data?: {
    regionMetadata?: RegionMetadataItem[];
    items?: DataGovPsiItem[];
  };
  errorMsg?: string;
}

function getSingaporeDateString(offsetDays = 0): string {
  const sgtMs = Date.now() + 8 * 3600 * 1000 + offsetDays * 86400 * 1000;
  return new Date(sgtMs).toISOString().slice(0, 10);
}

async function fetchPsiEndpoint(dateStr?: string): Promise<DataGovPsiResponse> {
  const url = new URL(DATA_GOV_SG_PSI_URL);
  if (dateStr) {
    url.searchParams.set('date', dateStr);
  }

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  const apiKey = process.env.DATA_GOV_SG_API_KEY;
  if (apiKey) {
    headers['x-api-key'] = apiKey;
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers,
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) {
    throw new Error(`Upstream HTTP ${response.status}`);
  }

  const payload = (await response.json()) as DataGovPsiResponse;
  if (payload.code !== 0 || !payload.data) {
    throw new Error(payload.errorMsg || 'Unexpected upstream response format');
  }

  return payload;
}

export default async function handler(
  req: ServerlessRequest,
  res: ServerlessResponse,
): Promise<void> {
  if (req.method && req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).json({ ok: false, error: 'Method not allowed' });
    return;
  }

  const rawDate = req.query?.date;
  const candidateDate = Array.isArray(rawDate) ? rawDate[0] : rawDate;
  const requestedDate =
    typeof candidateDate === 'string' ? candidateDate : undefined;

  if (rawDate !== undefined && (!requestedDate || !DATE_PARAM_REGEX.test(requestedDate))) {
    res.status(400).json({
      ok: false,
      error: 'Invalid date parameter. Expected YYYY-MM-DD.',
    });
    return;
  }

  try {
    if (requestedDate) {
      const dated = await fetchPsiEndpoint(requestedDate);
      const items = [...(dated.data?.items ?? [])].sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      );

      res.setHeader(
        'Cache-Control',
        'public, s-maxage=300, stale-while-revalidate=60',
      );
      res.status(200).json({
        ok: true,
        source: DATA_GOV_SG_PSI_URL,
        fetchedAt: new Date().toISOString(),
        regionMetadata: dated.data?.regionMetadata ?? [],
        latest: items.at(-1) ?? null,
        history: items,
      });
      return;
    }

    const todaySgt = getSingaporeDateString(0);
    const yesterdaySgt = getSingaporeDateString(-1);

    const [latestRes, todayRes, yesterdayRes] = await Promise.allSettled([
      fetchPsiEndpoint(),
      fetchPsiEndpoint(todaySgt),
      fetchPsiEndpoint(yesterdaySgt),
    ]);

    if (latestRes.status === 'rejected' && todayRes.status === 'rejected') {
      res.status(502).json({
        ok: false,
        error: 'Unable to retrieve live PSI readings from data.gov.sg',
      });
      return;
    }

    const primaryData =
      latestRes.status === 'fulfilled'
        ? latestRes.value.data
        : todayRes.status === 'fulfilled'
          ? todayRes.value.data
          : undefined;

    const mergedByTimestamp = new Map<string, DataGovPsiItem>();
    const collect = (items?: DataGovPsiItem[]) => {
      if (!items) return;
      for (const item of items) {
        if (item.timestamp) {
          mergedByTimestamp.set(item.timestamp, item);
        }
      }
    };

    if (yesterdayRes.status === 'fulfilled') collect(yesterdayRes.value.data?.items);
    if (todayRes.status === 'fulfilled') collect(todayRes.value.data?.items);
    if (latestRes.status === 'fulfilled') collect(latestRes.value.data?.items);

    const sortedHistory = Array.from(mergedByTimestamp.values())
      .sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      )
      .slice(-24);

    const latest =
      (latestRes.status === 'fulfilled' ? latestRes.value.data?.items?.[0] : undefined) ??
      sortedHistory.at(-1) ??
      null;

    res.setHeader(
      'Cache-Control',
      'public, s-maxage=300, stale-while-revalidate=60',
    );
    res.status(200).json({
      ok: true,
      source: DATA_GOV_SG_PSI_URL,
      fetchedAt: new Date().toISOString(),
      regionMetadata: primaryData?.regionMetadata ?? [],
      latest,
      history: sortedHistory,
    });
  } catch {
    res.status(502).json({
      ok: false,
      error: 'Failed to connect to data.gov.sg PSI service',
    });
  }
}
