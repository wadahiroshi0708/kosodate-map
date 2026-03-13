import { notFound } from "next/navigation";
import { dataRepository } from "@/lib/data/json-adapter";
import AppHeader from "@/components/layout/AppHeader";

interface MunicipalityLayoutProps {
  children: React.ReactNode;
  params: Promise<{ municipality: string }>;
}

export async function generateStaticParams() {
  const municipalities = await dataRepository.getMunicipalities();
  return municipalities.map((m) => ({ municipality: m.id }));
}

export default async function MunicipalityLayout({
  children,
  params,
}: MunicipalityLayoutProps) {
  const { municipality: municipalityId } = await params;
  const municipality = await dataRepository.getMunicipality(municipalityId);

  if (!municipality) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#f7f9fc]">
      <AppHeader
        municipalityName={municipality.name_ja}
        municipalityId={municipalityId}
      />
      <main className="max-w-lg mx-auto">{children}</main>
    </div>
  );
}
