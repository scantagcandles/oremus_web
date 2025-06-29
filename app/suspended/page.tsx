// app/suspended/page.tsx
import Link from "next/link";
import { Suspense } from "react";

// Component to display the organization name from URL params
function OrganizationInfo({
  searchParams,
}: {
  searchParams: { org?: string };
}) {
  const orgName = searchParams.org || "tej parafii";
  return <span className="font-medium">{orgName}</span>;
}

export default function SuspendedPage({
  searchParams,
}: {
  searchParams: { org?: string };
}) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-red-900 to-orange-900">
      <div className="max-w-lg p-8 text-center bg-white/10 backdrop-blur-lg rounded-lg shadow-lg border border-white/20 text-white">
        <h1 className="text-3xl font-bold mb-4">Strona zawieszona</h1>
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
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          Powrót do strony głównej
        </Link>
      </div>
    </div>
  );
}
