import { VerifyEmailClient } from "@/components/verify-email-client";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token = "" } = await searchParams;

  return (
    <main className="app-shell narrow-shell page-section">
      <VerifyEmailClient token={token} />
    </main>
  );
}
