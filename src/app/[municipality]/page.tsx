import { dataRepository } from "@/lib/data/json-adapter";
import { notFound } from "next/navigation";
import MunicipalityHome from "./MunicipalityHome";

interface MunicipalityPageProps {
  params: Promise<{ municipality: string }>;
}

export default async function MunicipalityPage({
  params,
}: MunicipalityPageProps) {
  const { municipality: municipalityId } = await params;
  const municipality = await dataRepository.getMunicipality(municipalityId);

  if (!municipality) {
    notFound();
  }

  const [nurseries, clinics] = await Promise.all([
    dataRepository.getNurseries(municipalityId),
    dataRepository.getClinics(municipalityId),
  ]);

  return (
    <MunicipalityHome
      municipality={municipality}
      nurseries={nurseries}
      clinics={clinics}
    />
  );
}
