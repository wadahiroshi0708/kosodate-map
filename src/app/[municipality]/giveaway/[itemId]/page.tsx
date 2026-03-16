import GiveawayDetailClient from "./GiveawayDetailClient";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ municipality: string; itemId: string }>;
}

export default async function GiveawayDetailPage({ params }: Props) {
  const { municipality: municipalityId, itemId } = await params;
  return (
    <GiveawayDetailClient
      municipalityId={municipalityId}
      itemId={itemId}
    />
  );
}
