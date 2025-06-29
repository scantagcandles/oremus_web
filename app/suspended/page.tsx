// app/suspended/page.tsx
import Link from "next/link";
import { Suspense } from "react";

// Component to display the organization name from URL params
async function OrganizationInfo({
  searchParams,
}: {
  searchParams: Promise<{ org?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const orgName = resolvedSearchParams.org || "tej parafii";
  return <span className="font-medium">{orgName}</span>;
}

export default async function SuspendedPage({
  searchParams,
}: {
  searchParams: Promise<{ org?: string }>;
}) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-red-900 to-orange-900">
      <div className="max-w-lg p-8 text-center text-white border rounded-lg shadow-lg bg-white/10 backdrop-blur-lg border-white/20">
        <h1 className="mb-4 text-3xl font-bold">Strona zawieszona</h1>
        <p className="mb-6">
          Przepraszamy, ale dostęp do{" "}
          <Suspense fallback="tej parafii">
            <OrganizationInfo searchParams={searchParams} />
          </Suspense>{" "}
          został tymczasowo zawieszony.
        </p>
        <p className="mb-6">
          Skontaktuj się z administratorem systemu, aby uzyskać więcej
          informacji.
        </p>
        <Link
          href="https://app.oremus.pl"
          className="px-4 py-2 text-white transition bg-red-600 rounded hover:bg-red-700"
        >
          Powrót do strony głównej
        </Link>
      </div>
    </div>
  );
}
