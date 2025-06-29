// app/403/page.tsx
import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-red-900 to-gray-900">
      <div className="max-w-lg p-8 text-center bg-white/10 backdrop-blur-lg rounded-lg shadow-lg border border-white/20 text-white">
        <h1 className="text-3xl font-bold mb-4">Brak dostępu</h1>
        <p className="mb-6">
          Przepraszamy, nie masz uprawnień do dostępu do tej strony.
        </p>
        <p className="mb-6">
          Jeśli uważasz, że powinieneś mieć dostęp, skontaktuj się z
          administratorem systemu.
        </p>
        <Link
          href="/"
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          Powrót do strony głównej
        </Link>
      </div>
    </div>
  );
}
