import { PLATFORM_CONFIG } from '@gymos/config';
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    {
      success: true,
      data: {
        status: 'ok',
        service: 'gymos-web',
        appName: PLATFORM_CONFIG.appName,
        timestamp: new Date().toISOString(),
      },
    },
    { status: 200 },
  );
}
