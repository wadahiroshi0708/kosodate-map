import { notFound } from "next/navigation";
import { dataRepository } from "@/lib/data/json-adapter";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";

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
    <div className="min-h-screen bg-[#f7f9fc] pb-20">
      <Header municipalityName={municipality.name_ja} />
      <main className="max-w-lg mx-auto">{children}</main>
      <BottomNav municipalityId={municipalityId} />
    </div>
  );
}
