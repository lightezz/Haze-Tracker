export interface ServerlessRequest {
  method?: string;
  query?: Record<string, unknown>;
}

export interface ServerlessResponse {
  status: (code: number) => ServerlessResponse;
  setHeader: (name: string, value: string) => void;
  json: (body: unknown) => void;
}

const DATA_GOV_SG_PSI_URL = 'https://api-open.data.gov.sg/v2/real-time/api/psi';

export default async function handler(
  req: ServerlessRequest,
  res: ServerlessResponse,
): Promise<void> {
  if (req.method && req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    res.status(405).json({ ok: false, error: 'Method not allowed' });
    return;
  }

  const checkUpstream = req.query?.check === 'upstream';
  let upstreamReachable: boolean | undefined;

  if (checkUpstream) {
    try {
      const upstreamRes = await fetch(DATA_GOV_SG_PSI_URL, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(5000),
      });
      upstreamReachable = upstreamRes.ok;
    } catch {
      upstreamReachable = false;
    }
  }

  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({
    ok: true,
    status: 'healthy',
    service: 'sg-haze-watch-api',
    endpoint: DATA_GOV_SG_PSI_URL,
    ...(upstreamReachable !== undefined ? { upstreamReachable } : {}),
    timestamp: new Date().toISOString(),
  });
}
