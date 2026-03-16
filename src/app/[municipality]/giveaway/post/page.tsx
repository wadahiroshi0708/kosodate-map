import { notFound } from "next/navigation";
import { dataRepository } from "@/lib/data/json-adapter";
import GiveawayPostClient from "./GiveawayPostClient";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ municipality: string }>;
}

export default async function GiveawayPostPage({ params }: Props) {
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
    <GiveawayPostClient
      municipalityId={municipalityId}
      municipalityName={municipality.name_ja}
      facilities={facilities}
    />
  );
}
