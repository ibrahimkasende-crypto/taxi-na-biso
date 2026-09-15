import { DemandeDetail } from '@/components/admin/DemandesConsole';

export default async function DemandePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <DemandeDetail id={id} />;
}
