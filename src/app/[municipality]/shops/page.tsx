import { notFound } from "next/navigation";
import { dataRepository } from "@/lib/data/json-adapter";
import ShopsClient from "./ShopsClient";

interface ShopsPageProps {
  params: Promise<{ municipality: string }>;
}

export async function generateStaticParams() {
  const municipalities = await dataRepository.getMunicipalities();
  return municipalities.map((m) => ({ municipality: m.id }));
}

export default async function ShopsPage({ params }: ShopsPageProps) {
  const { municipality: municipalityId } = await params;

  const [municipality, shops] = await Promise.all([
    dataRepository.getMunicipality(municipalityId),
    dataRepository.getShops(municipalityId),
  ]);

  if (!municipality) notFound();
  if (!shops) notFound();

  return (
    <ShopsClient
      shops={shops}
      municipalityName={municipality.name_ja}
    />
  );
}
