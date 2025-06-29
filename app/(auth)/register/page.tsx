"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authService } from "../../../services/auth/AuthService";

// Komponenty pomocnicze
const Button = ({
  children,
  className = "",
  variant = "default",
  disabled = false,
  type = "button",
  ...props
}: any) => (
  <button
    type={type}
    disabled={disabled}
    className={`px-4 py-2 rounded-lg transition-colors ${
      variant === "golden"
        ? "bg-yellow-600 hover:bg-yellow-700 text-white"
        : variant === "glass"
        ? "bg-white/10 hover:bg-white/20 text-white border border-white/20"
        : variant === "primary"
        ? "bg-blue-600 hover:bg-blue-700 text-white"
        : "bg-blue-600 hover:bg-blue-700 text-white"
    } ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
    {...props}
  >
    {children}
  </button>
);

const GlassCard = ({ children, className = "", ...props }: any) => (
  <div
    className={`bg-white/10 backdrop-blur-md rounded-xl border border-white/20 ${className}`}
    {...props}
  >
    {children}
  </div>
);

const GlassInput = ({ className = "", ...props }: any) => (
  <input
    className={`w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${className}`}
    {...props}
  />
);

const AnimatedCard = ({ children, className = "", ...props }: any) => (
  <div
    className={`transition-all duration-300 hover:scale-105 ${className}`}
    {...props}
  >
    {children}
  </div>
);

// Prosty toast system
const showToast = (message: string, type: "success" | "error" = "success") => {
  const color = type === "success" ? "green" : "red";
  const toast = document.createElement("div");
  toast.className = `fixed top-4 right-4 bg-${color}-500 text-white px-6 py-3 rounded-lg shadow-lg z-50`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
};

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [accountType, setAccountType] = useState<"user" | "parish" | null>(
    null
  );
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
    // Dla parafii
    parishName: "",
    address: "",
    nip: "",
    contact: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Sprawdź typ pliku
      const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/jpg",
      ];
      if (!allowedTypes.includes(file.type)) {
        showToast("Dozwolone formaty: PDF, JPG, PNG", "error");
        return;
      }

      // Sprawdź rozmiar pliku (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showToast("Plik jest za duży (max 5MB)", "error");
        return;
      }

      setUploadedFile(file);
      showToast("Dokument został załączony", "success");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Walidacja podstawowa
    if (!formData.email || !formData.password) {
      showToast("Proszę wypełnić wszystkie wymagane pola", "error");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      showToast("Hasła nie są identyczne", "error");
      return;
    }

    if (formData.password.length < 6) {
      showToast("Hasło musi mieć co najmniej 6 znaków", "error");
      return;
    }

    // Walidacja dla użytkownika
    if (accountType === "user" && (!formData.firstName || !formData.lastName)) {
      showToast("Proszę podać imię i nazwisko", "error");
      return;
    }

    // Walidacja dla parafii
    if (accountType === "parish") {
      if (!formData.parishName || !formData.address || !formData.nip) {
        showToast("Proszę wypełnić wszystkie dane parafii", "error");
        return;
      }

      if (!uploadedFile) {
        showToast(
          "Proszę załączyć dokument potwierdzający status parafii",
          "error"
        );
        return;
      }
    }

    setIsLoading(true);
    try {
      // Przygotuj metadane
      const metadata = {
        accountType,
        ...(accountType === "user"
          ? {
              firstName: formData.firstName,
              lastName: formData.lastName,
              phone: formData.phone,
            }
          : {
              parishName: formData.parishName,
              address: formData.address,
              nip: formData.nip,
              contact: formData.contact,
              documentUploaded: !!uploadedFile,
            }),
      };

      // Rejestracja w Supabase z metadanymi
      const result = await authService.signUpWithMetadata(
        formData.email,
        formData.password,
        metadata
      );

      if (!result.success) {
        throw new Error(result.error?.message || "Błąd rejestracji");
      }

      if (accountType === "parish") {
        showToast(
          "Wniosek o rejestrację parafii został wysłany! Sprawdź email i czekaj na weryfikację.",
          "success"
        );
      } else {
        showToast(
          "Konto zostało utworzone! Sprawdź swoją skrzynkę email aby potwierdzić rejestrację.",
          "success"
        );
      }

      // Reset formularza
      setFormData({
        email: "",
        password: "",
        confirmPassword: "",
        firstName: "",
        lastName: "",
        phone: "",
        parishName: "",
        address: "",
        nip: "",
        contact: "",
      });
      setUploadedFile(null);
      setAccountType(null);

      // Przekierowanie po 2 sekundach
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (error: any) {
      showToast(error.message || "Wystąpił błąd podczas rejestracji", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <AnimatedCard className="w-full max-w-6xl">
        {" "}
        {/* Zwiększona szerokość dla desktop */}
        <GlassCard className="p-8">
          {/* Nagłówek */}
          <div className="mb-8 text-center">
            <Link href="/" className="inline-block mb-6">
              <div className="flex items-center justify-center w-24 h-24 mx-auto text-2xl font-bold text-white bg-yellow-500 rounded-full">
                O
              </div>
            </Link>
            <h1 className="mb-2 text-3xl font-bold text-white">
              Dołącz do społeczności Oremus
            </h1>
          </div>

          {/* Wybór typu konta */}
          {!accountType && (
            <div className="space-y-6">
              <p className="mb-6 text-center text-gray-300">
                Wybierz typ konta:
              </p>

              <div className="space-y-4">
                <Button
                  variant="glass"
                  className="w-full py-4 text-lg"
                  onClick={() => setAccountType("user")}
                >
                  🙏 Użytkownik
                  <div className="mt-1 text-sm text-gray-300">
                    Zamawiaj msze, przeglądaj bibliotekę
                  </div>
                </Button>

                <Button
                  variant="glass"
                  className="w-full py-4 text-lg"
                  onClick={() => setAccountType("parish")}
                >
                  ⛪ Parafia
                  <div className="mt-1 text-sm text-gray-300">
                    Zarządzaj terminami, odbieraj zamówienia
                  </div>
                </Button>
              </div>

              <div className="mt-6 text-center">
                <p className="text-gray-300">
                  Masz już konto?{" "}
                  <Link
                    href="/login"
                    className="text-yellow-400 underline hover:text-yellow-300"
                  >
                    Zaloguj się
                  </Link>
                </p>
              </div>
            </div>
          )}

          {/* Formularz rejestracji */}
          {accountType && (
            <>
              {/* Przycisk powrotu */}
              <button
                onClick={() => setAccountType(null)}
                className="flex items-center mb-6 text-gray-300 hover:text-white"
              >
                ← Powrót do wyboru typu konta
              </button>

              <div className="mb-6">
                <h2 className="text-xl font-bold text-center text-white">
                  {accountType === "user"
                    ? "Rejestracja użytkownika"
                    : "Rejestracja parafii"}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Formularz dla użytkownika */}
                {accountType === "user" && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-300">
                          Imię *
                        </label>
                        <GlassInput
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          placeholder="Jan"
                          required
                        />
                      </div>
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-300">
                          Nazwisko *
                        </label>
                        <GlassInput
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          placeholder="Kowalski"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-300">
                        Telefon
                      </label>
                      <GlassInput
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+48 123 456 789"
                      />
                    </div>
                  </>
                )}

                {/* Formularz dla parafii - layout desktop/mobile */}
                {accountType === "parish" && (
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Lewa kolumna - Podstawowe dane */}
                    <div className="space-y-6">
                      <h3 className="pb-2 text-lg font-semibold text-white border-b border-white/20">
                        Dane parafii
                      </h3>

                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-300">
                          Nazwa parafii *
                        </label>
                        <GlassInput
                          type="text"
                          name="parishName"
                          value={formData.parishName}
                          onChange={handleChange}
                          placeholder="Parafia św. Jana"
                          required
                        />
                      </div>

                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-300">
                          Adres *
                        </label>
                        <GlassInput
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          placeholder="ul. Kościelna 1, 00-001 Warszawa"
                          required
                        />
                      </div>

                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-300">
                          NIP *
                        </label>
                        <GlassInput
                          type="text"
                          name="nip"
                          value={formData.nip}
                          onChange={handleChange}
                          placeholder="123-456-78-90"
                          required
                        />
                      </div>

                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-300">
                          Telefon kontaktowy *
                        </label>
                        <GlassInput
                          type="tel"
                          name="contact"
                          value={formData.contact}
                          onChange={handleChange}
                          placeholder="+48 123 456 789"
                          required
                        />
                      </div>
                    </div>

                    {/* Prawa kolumna - Dokumenty i dane logowania */}
                    <div className="space-y-6">
                      <h3 className="pb-2 text-lg font-semibold text-white border-b border-white/20">
                        Dokumenty i logowanie
                      </h3>

                      {/* Upload dokumentu */}
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-300">
                          Dokument potwierdzający (PDF, JPG, PNG) *
                        </label>
                        <div className="relative">
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={handleFileUpload}
                            className="hidden"
                            id="document-upload"
                          />
                          <label
                            htmlFor="document-upload"
                            className="flex flex-col items-center justify-center w-full px-4 py-6 text-gray-300 transition-colors border-2 border-dashed rounded-lg cursor-pointer bg-white/10 border-white/20 hover:bg-white/20"
                          >
                            {uploadedFile ? (
                              <div className="text-center">
                                <span className="text-lg text-green-300">
                                  ✓
                                </span>
                                <p className="font-medium text-green-300">
                                  {uploadedFile.name}
                                </p>
                                <p className="text-xs text-gray-400">
                                  Kliknij aby zmienić
                                </p>
                              </div>
                            ) : (
                              <div className="text-center">
                                <span className="mb-2 text-4xl">📄</span>
                                <p className="font-medium">
                                  Kliknij aby załączyć dokument
                                </p>
                                <p className="text-xs text-gray-400">
                                  lub przeciągnij plik tutaj
                                </p>
                              </div>
                            )}
                          </label>
                        </div>
                        <p className="mt-2 text-xs text-gray-400">
                          Załącz dokument potwierdzający status parafii (np.
                          odpis z KRS, zaświadczenie kurii)
                        </p>
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-300">
                          Email *
                        </label>
                        <GlassInput
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="parafia@example.com"
                          required
                        />
                      </div>

                      {/* Hasła */}
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-300">
                            Hasło *
                          </label>
                          <GlassInput
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            required
                          />
                        </div>

                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-300">
                            Potwierdź hasło *
                          </label>
                          <GlassInput
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="••••••••"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Wspólne pola - tylko dla użytkowników, dla parafii już są w prawej kolumnie */}
                {accountType === "user" && (
                  <>
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-300">
                        Email *
                      </label>
                      <GlassInput
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="email@example.com"
                        required
                      />
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-300">
                        Hasło *
                      </label>
                      <GlassInput
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        required
                      />
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-300">
                        Potwierdź hasło *
                      </label>
                      <GlassInput
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </>
                )}

                {/* Informacja dla parafii - pełna szerokość */}
                {accountType === "parish" && (
                  <div className="p-4 border rounded-lg bg-yellow-500/10 border-yellow-500/20 lg:col-span-2">
                    <p className="text-sm text-yellow-300">
                      <strong>Uwaga:</strong> Konta parafii wymagają weryfikacji
                      przez administratora. Po rejestracji otrzymasz email z
                      informacją o statusie wniosku.
                    </p>
                  </div>
                )}

                <div
                  className={accountType === "parish" ? "lg:col-span-2" : ""}
                >
                  <Button
                    type="submit"
                    variant="golden"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? "Rejestrowanie..." : "Zarejestruj się"}
                  </Button>
                </div>
              </form>
            </>
          )}
        </GlassCard>
      </AnimatedCard>
    </div>
  );
}
