import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL =
  process.env.API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://127.0.0.1:4000';

export async function POST(req: NextRequest) {
  const token = req.cookies.get('titanfit_access_token')?.value;

  if (token) {
    try {
      await fetch(`${API_BASE_URL}/api/v1/auth/sessions/revoke`, {
        method: 'POST',
        headers: {
          authorization: `Bearer ${token}`,
        },
        signal: AbortSignal.timeout(3000),
      });
    } catch {
      // API offline
    }
  }

  const res = NextResponse.json({ success: true, revokedCount: 1 });
  res.cookies.delete('titanfit_access_token');
  res.cookies.delete('titanfit_refresh_token');
  return res;
}
