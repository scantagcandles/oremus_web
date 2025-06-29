"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authService } from "../../../services/auth/AuthService";

// Komponenty pomocnicze (takie same jak w rejestracji)
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
        : variant === "social"
        ? "bg-white/10 hover:bg-white/20 text-white border border-white/20 flex items-center justify-center space-x-2"
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

// Providerzy (usunięty GitHub, dodamy tylko działające)
const SOCIAL_PROVIDERS = [
  {
    key: "google",
    label: "Google",
    icon: "🔍",
    color: "bg-red-600 hover:bg-red-700",
  },
  {
    key: "facebook",
    label: "Facebook",
    icon: "📘",
    color: "bg-blue-700 hover:bg-blue-800",
  },
  {
    key: "apple",
    label: "Apple",
    icon: "🍎",
    color: "bg-gray-800 hover:bg-gray-900",
  },
  {
    key: "microsoft",
    label: "Microsoft",
    icon: "🪟",
    color: "bg-blue-600 hover:bg-blue-700",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      showToast("Proszę wypełnić wszystkie pola", "error");
      return;
    }

    setIsLoading(true);
    try {
      // Prawdziwe logowanie w Supabase
      const result = await authService.signIn(
        formData.email,
        formData.password
      );

      if (!result.success) {
        throw new Error(result.error?.message || "Błąd logowania");
      }

      showToast("Zalogowano pomyślnie!", "success");

      // Przekierowanie
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (error: any) {
      showToast(error.message || "Wystąpił błąd podczas logowania", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    setIsLoading(true);
    try {
      // Symulacja logowania social
      await new Promise((resolve) => setTimeout(resolve, 1500));

      showToast(`Logowanie przez ${provider} tymczasowo wyłączone`, "error");
    } catch (error: any) {
      showToast(`Błąd logowania przez ${provider}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!formData.email) {
      showToast("Proszę podać adres email", "error");
      return;
    }

    setIsLoading(true);
    try {
      // Prawdziwy Magic Link
      const result = await authService.signInWithEmail(formData.email);

      if (result.error) {
        throw new Error(result.error.message);
      }

      showToast("Link do logowania został wysłany na email!", "success");
    } catch (error: any) {
      showToast("Nie udało się wysłać linku", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <AnimatedCard className="w-full max-w-md">
        <GlassCard className="p-8">
          {/* Nagłówek */}
          <div className="mb-8 text-center">
            <Link href="/" className="inline-block mb-6">
              <div className="flex items-center justify-center w-24 h-24 mx-auto text-lg font-bold text-white rounded-full shadow-lg bg-gradient-to-br from-yellow-500 to-yellow-600">
                OREMUS
              </div>
            </Link>
            <p className="text-gray-300">Zaloguj się do Oremus</p>
          </div>

          {/* Formularz logowania - bezpośrednio bez wyboru metody */}
          <div className="space-y-6">
            {/* Pola logowania */}
            <form onSubmit={handleEmailLogin} className="space-y-6">
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

              <Button
                type="submit"
                variant="golden"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Logowanie..." : "Zaloguj się"}
              </Button>
            </form>

            {/* Magic Link */}
            <div className="text-center">
              <button
                onClick={handleMagicLink}
                disabled={isLoading || !formData.email}
                className="text-sm text-yellow-400 transition-colors hover:text-yellow-300 disabled:opacity-50"
              >
                Wyślij link magiczny na email
              </button>
            </div>

            {/* Zapomniałeś hasła */}
            <div className="text-center">
              <Link
                href="/forgot-password"
                className="text-sm text-gray-300 transition-colors hover:text-white"
              >
                Zapomniałeś hasła?
              </Link>
            </div>

            {/* Separator */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 text-white/60 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
                  Lub wybierz
                </span>
              </div>
            </div>

            {/* Przyciski social media */}
            <div className="grid grid-cols-2 gap-3">
              {SOCIAL_PROVIDERS.map((provider) => (
                <Button
                  key={provider.key}
                  variant="social"
                  className="py-3"
                  onClick={() => handleSocialLogin(provider.label)}
                  disabled={isLoading}
                >
                  <span className="text-lg">{provider.icon}</span>
                  <span className="text-sm">{provider.label}</span>
                </Button>
              ))}
            </div>

            {/* Informacja o social login */}
            <div className="p-4 border rounded-lg bg-yellow-500/10 border-yellow-500/20">
              <p className="text-sm text-center text-yellow-300">
                <strong>Uwaga:</strong> Logowanie przez social media wymaga
                konfiguracji w ustawieniach Supabase
              </p>
            </div>

            {/* Link do rejestracji */}
            <div className="text-center">
              <p className="text-gray-300">
                Nie masz konta?{" "}
                <Link
                  href="/register"
                  className="text-yellow-400 underline hover:text-yellow-300"
                >
                  Zarejestruj się
                </Link>
              </p>
            </div>
          </div>
        </GlassCard>
      </AnimatedCard>
    </div>
  );
}
