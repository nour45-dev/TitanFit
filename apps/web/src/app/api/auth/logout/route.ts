import { NextResponse } from 'next/server';

export async function POST() {
  const res = NextResponse.json({ success: true });
  res.cookies.delete('titanfit_access_token');
  res.cookies.delete('titanfit_refresh_token');
  return res;
}
