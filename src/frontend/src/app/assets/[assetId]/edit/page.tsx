import { AssetEditClient } from "@/components/asset-edit-client";

export default async function AssetEditPage({
  params,
}: {
  params: Promise<{ assetId: string }>;
}) {
  const { assetId } = await params;

  return (
    <main className="app-shell">
      <AssetEditClient assetId={assetId} />
    </main>
  );
}
