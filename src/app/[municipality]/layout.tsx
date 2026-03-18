import { notFound } from "next/navigation";
import { dataRepository } from "@/lib/data/json-adapter";
import AppHeader from "@/components/layout/AppHeader";
import AnalyticsProvider from "@/components/providers/AnalyticsProvider";
import type { Metadata } from "next";

interface MunicipalityLayoutProps {
  children: React.ReactNode;
  params: Promise<{ municipality: string }>;
}

export async function generateMetadata(
  { params }: { params: Promise<{ municipality: string }> }
): Promise<Metadata> {
  const { municipality: municipalityId } = await params;
  const municipality = await dataRepository.getMunicipality(municipalityId);

  if (!municipality) return {};

  const name = `${municipality.prefecture_ja}${municipality.name_ja}`;

  return {
    title: `${name}の保育園・子育て情報｜こそだてマップ`,
    description: `${name}への転入前から確認できる保育園の空き状況・施設マップ・入園手続きチェックリスト。住所確定後すぐに動ける。`,
    keywords: ["保育園", "引越し", "転居", "子育て", "空き状況", municipality.name_ja, municipality.prefecture_ja, "転入"],
    openGraph: {
      title: `${name}の保育園・子育て情報｜こそだてマップ`,
      description: `${name}への転入前から使える保育園・子育て情報サービス。`,
      type: "website",
    },
  };
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
    <AnalyticsProvider municipalityId={municipalityId}>
      <div className="min-h-screen bg-[#f7f9fc]">
        <AppHeader
          municipalityName={municipality.name_ja}
          municipalityId={municipalityId}
        />
        <main className="max-w-lg mx-auto">{children}</main>
      </div>
    </AnalyticsProvider>
  );
}
