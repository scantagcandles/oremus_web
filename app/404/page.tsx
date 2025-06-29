// app/404/page.tsx
import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-900 to-indigo-900">
      <div className="max-w-lg p-8 text-center bg-white/10 backdrop-blur-lg rounded-lg shadow-lg border border-white/20 text-white">
        <h1 className="text-3xl font-bold mb-4">Parafia nie znaleziona</h1>
        <p className="mb-6">
          Przepraszamy, ale szukana parafia nie istnieje w naszym systemie.
          Sprawdź, czy adres został wpisany poprawnie.
        </p>
        <Link
          href="https://app.oremus.pl"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Powrót do strony głównej
        </Link>
      </div>
    </div>
  );
}
