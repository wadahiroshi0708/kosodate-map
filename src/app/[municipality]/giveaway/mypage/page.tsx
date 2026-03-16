import GiveawayMypageClient from "./GiveawayMypageClient";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ municipality: string }>;
}

export default async function GiveawayMypagePage({ params }: Props) {
  const { municipality: municipalityId } = await params;
  return <GiveawayMypageClient municipalityId={municipalityId} />;
}
