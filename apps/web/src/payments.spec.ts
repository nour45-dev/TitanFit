import { describe, expect, it } from 'vitest';
import { POST } from './app/api/payments/checkout/route';
import { NextRequest } from 'next/server';

describe('Egyptian Payment Gateways & Official 14% VAT Invoicing (/api/payments/checkout)', () => {
  it('generates Paymob Card checkout token and 14% VAT tax breakdown', async () => {
    const req = new NextRequest('http://localhost:3000/api/payments/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tenantSlug: 'titanfit-cairo',
        memberId: 'mem-pay-1',
        memberNameAr: 'كريم وائل',
        memberNameEn: 'Karim Wael',
        planId: 'plan-annual-pro',
        planNameAr: 'اشتراك سنوي VIP',
        planNameEn: 'Annual VIP Pro',
        amountEgp: 11400,
        paymentProvider: 'PAYMOB_CARD',
        phone: '+201012345678',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.paymentProvider).toBe('PAYMOB_CARD');
    expect(json.gateway.iframeUrl).toContain('paymob.com');
    expect(json.gateway.paymentToken).toBeDefined();

    // Verify 14% Egyptian VAT calculation: 11400 / 1.14 = 10000 subtotal, 1400 VAT
    expect(json.invoice.totalEgp).toBe(11400);
    expect(json.invoice.subtotalEgp).toBe(10000);
    expect(json.invoice.vatEgp).toBe(1400);
    expect(json.invoice.invoiceNumber).toMatch(/^INV-2026-\d{4}$/);
    expect(json.invoice.qrVerificationHash).toBeDefined();
  });

  it('generates Fawry Pay reference code with 48h validity', async () => {
    const req = new NextRequest('http://localhost:3000/api/payments/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tenantSlug: 'titanfit-cairo',
        memberId: 'mem-pay-2',
        memberNameAr: 'سارة طارق',
        memberNameEn: 'Sara Tarek',
        planId: 'plan-semi-pro',
        planNameAr: 'اشتراك 6 شهور',
        planNameEn: '6-Month Plan',
        amountEgp: 5700,
        paymentProvider: 'FAWRY',
        phone: '+201198765432',
      }),
    });

    const res = await POST(req);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.paymentProvider).toBe('FAWRY');
    expect(json.gateway.fawryReferenceNumber).toMatch(/^7\d{9}$/);
    expect(json.gateway.expiresInHours).toBe(48);
  });

  it('generates InstaPay payment reference and ETA invoice', async () => {
    const req = new NextRequest('http://localhost:3000/api/payments/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tenantSlug: 'titanfit-cairo',
        memberId: 'mem-pay-3',
        memberNameAr: 'محمد هشام',
        memberNameEn: 'Mohamed Hesham',
        planId: 'plan-3m-pro',
        planNameAr: 'اشتراك 3 شهور',
        planNameEn: '3-Month Plan',
        amountEgp: 3420,
        paymentProvider: 'INSTAPAY',
        phone: '+201255554444',
        instaPayReference: 'IPN-2026-887766',
      }),
    });

    const res = await POST(req);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.paymentProvider).toBe('INSTAPAY');
    expect(json.gateway.instaPayAddress).toBe('titanfit@instapay');
    expect(json.invoice.referenceCode).toBe('IPN-2026-887766');
    expect(json.invoice.status).toBe('PAID');
  });
});
