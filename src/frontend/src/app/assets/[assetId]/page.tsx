import { AssetDetailClient } from "@/components/asset-detail-client";

export default async function AssetDetailPage({
  params,
}: {
  params: Promise<{ assetId: string }>;
}) {
  const { assetId } = await params;

  return (
    <main className="app-shell">
      <AssetDetailClient assetId={assetId} />
    </main>
  );
}
