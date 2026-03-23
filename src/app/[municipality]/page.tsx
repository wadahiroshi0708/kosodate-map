import { dataRepository } from "@/lib/data/json-adapter";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import MunicipalityHome from "./MunicipalityHome";
import DashboardHome from "@/components/dashboard/DashboardHome";

interface MunicipalityPageProps {
  params: Promise<{ municipality: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export default async function MunicipalityPage({
  params,
  searchParams,
}: MunicipalityPageProps) {
  const { municipality: municipalityId } = await params;
  const { tab } = await searchParams;

  const municipality = await dataRepository.getMunicipality(municipalityId);

  if (!municipality) {
    notFound();
  }

  // タブ指定がない場合はダッシュボードを表示
  if (!tab) {
    return (
      <DashboardHome
        municipalityId={municipalityId}
        municipalityName={municipality.name_ja}
      />
    );
  }

  const [nurseries, clinics, govSupports] = await Promise.all([
    dataRepository.getNurseries(municipalityId),
    dataRepository.getClinics(municipalityId),
    dataRepository.getGovSupports(municipalityId),
  ]);

  return (
    <Suspense>
      <MunicipalityHome
        municipality={municipality}
        nurseries={nurseries}
        clinics={clinics}
        govSupports={govSupports}
      />
    </Suspense>
  );
}
