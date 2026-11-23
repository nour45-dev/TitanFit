import React from 'react';
import { notFound } from 'next/navigation';
import { DesignSystemShowcase } from '../../components/design-system-showcase';

const VALID_SECTION_SLUGS = new Set([
  'public-storefront',
  'free-trial-hub',
  'overview',
  'members',
  'subscriptions',
  'payments',
  'classes',
  'access-control',
  'pos-inventory',
  'staff-trainers',
  'content-library',
  'member-pwa',
  'reports',
  'settings',
  'super-admin',
]);

export default async function SectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  if (!VALID_SECTION_SLUGS.has(section.toLowerCase())) {
    notFound();
  }
  return <DesignSystemShowcase initialLocale="ar" />;
}
