import { redirect } from 'next/navigation';

type QuotationRouteProps = {
  params: Promise<{ id: string }>;
};

export default async function LegacyQuotationRoute({ params }: QuotationRouteProps) {
  const { id } = await params;
  redirect(`/portal/cotacao/${encodeURIComponent(id)}`);
}
