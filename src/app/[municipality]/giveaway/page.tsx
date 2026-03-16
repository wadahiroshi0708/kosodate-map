import { notFound } from "next/navigation";
import { dataRepository } from "@/lib/data/json-adapter";
import GiveawayListClient from "./GiveawayListClient";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ municipality: string }>;
}

export default async function GiveawayPage({ params }: Props) {
  const { municipality: municipalityId } = await params;
  const municipality = await dataRepository.getMunicipality(municipalityId);
  if (!municipality) notFound();

  const nurseries = await dataRepository.getNurseries(municipalityId);
  const facilities = nurseries.map((n) => ({
    id: n.id,
    name: n.name,
    subArea: n.sub_area,
  }));

  return (
    <GiveawayListClient
      municipalityId={municipalityId}
      municipalityName={municipality.name_ja}
      facilities={facilities}
    />
  );
}
