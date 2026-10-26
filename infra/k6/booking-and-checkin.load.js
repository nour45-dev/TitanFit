/**
 * TitanFit (Rooted Performance) — k6 Load Testing Script
 * Target: 1,000 Concurrent Virtual Users (VUs) on Class Booking & Rotating QR Check-in
 * SLA Baseline:
 *   - http_req_duration p(95) < 300ms
 *   - http_req_failed rate < 0.01 (1%)
 *
 * Usage:
 *   k6 run -e API_BASE_URL=http://localhost:4000/api/v1 infra/k6/booking-and-checkin.load.js
 */
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 250 },
    { duration: '1m', target: 1000 }, // Peak 6 PM gym check-in rush: 1,000 concurrent users
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<300'],
    http_req_failed: ['rate<0.01'],
  },
};

const BASE_URL = __ENV.API_BASE_URL || 'http://localhost:4000/api/v1';

export function setup() {
  const loginRes = http.post(
    `${BASE_URL}/auth/login`,
    JSON.stringify({
      tenantSlug: 'titanfit-cairo',
      identifier: '+201055555555',
      password: 'TitanFit#2026!',
    }),
    { headers: { 'Content-Type': 'application/json' } },
  );

  const body = JSON.parse(loginRes.body);
  return {
    accessToken: body.data.accessToken,
    memberId: body.data.user.id,
  };
}

export default function (data) {
  const headers = {
    Authorization: `Bearer ${data.accessToken}`,
    'Content-Type': 'application/json',
  };

  // 1. Fetch 30s Rotating Signed QR Token
  const qrRes = http.get(`${BASE_URL}/attendance/qr-token/${data.memberId}`, { headers });
  check(qrRes, {
    'QR token status is 200': (r) => r.status === 200,
    'QR token latency < 300ms': (r) => r.timings.duration < 300,
  });

  // 2. List Active Class Schedules
  const classesRes = http.get(`${BASE_URL}/classes`, { headers });
  check(classesRes, {
    'Classes list status is 200': (r) => r.status === 200,
  });

  sleep(0.5);
}
