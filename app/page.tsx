"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Calendar,
  Church,
  BookOpen,
  Heart,
  Bell,
  Search,
  User,
  MapPin,
  Clock,
  ChevronRight,
  Flame,
  Radio,
  GraduationCap,
  Music,
  Headphones,
  Play,
} from "lucide-react";
import { GlassCard } from "@/components/glass/GlassCard";
import { Button } from "@/components/glass/Button";

export default function HomePage() {
  const [greeting, setGreeting] = useState("Dzień dobry!");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Dzień dobry!");
    else if (hour < 18) setGreeting("Dobry wieczór!");
    else setGreeting("Dobry wieczór!");
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-deep-blue via-purple-900 to-indigo-900">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="container px-4 pt-24 pb-12 mx-auto"
      >
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-5xl font-bold text-white md:text-6xl font-heading display-text">
            {greeting}
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-gray-300">
            Witaj w Oremus - Twojej duchowej przestrzeni online
          </p>
        </div>

        {/* Hero CTA Buttons */}
        <div className="flex flex-col justify-center gap-4 mb-12 sm:flex-row">
          <Link href="/order-mass">
            <Button variant="golden" size="lg" className="min-w-[200px]">
              <Calendar className="w-5 h-5 mr-2" />
              Zamów Mszę Świętą
            </Button>
          </Link>
          <Link href="/live">
            <Button variant="glass" size="lg" className="min-w-[200px]">
              <Radio className="w-5 h-5 mr-2" />
              Transmisja na żywo
            </Button>
          </Link>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid gap-6 mb-12 md:grid-cols-2 lg:grid-cols-4">
          <QuickActionCard
            icon={<Church className="w-8 h-8" />}
            title="Znajdź kościół"
            description="Odkryj pobliskie parafie"
            href="/church-finder"
            color="text-blue-400"
          />
          <QuickActionCard
            icon={<BookOpen className="w-8 h-8" />}
            title="Biblioteka"
            description="Modlitwy i lektury"
            href="/library"
            color="text-purple-400"
          />
          <QuickActionCard
            icon={<Flame className="w-8 h-8" />}
            title="Zapal świecę"
            description="Wirtualna intencja"
            href="/candle"
            color="text-orange-400"
          />
          <QuickActionCard
            icon={<GraduationCap className="w-8 h-8" />}
            title="Akademia"
            description="Kursy duchowe"
            href="/academy"
            color="text-green-400"
          />
        </div>
      </motion.section>

      {/* Nearby Churches Section */}
      <NearbyChurches />

      {/* Upcoming Masses */}
      <UpcomingMasses />

      {/* Featured Content */}
      <FeaturedContent />

      {/* Bottom CTA */}
      <section className="container px-4 py-16 mx-auto">
        <GlassCard className="p-8 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white">
            Dołącz do społeczności Oremus
          </h2>
          <p className="max-w-2xl mx-auto mb-6 text-gray-300">
            Stwórz bezpłatne konto i zyskaj dostęp do wszystkich funkcji
            aplikacji
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/register">
              <Button variant="golden" size="lg">
                Załóż konto za darmo
              </Button>
            </Link>
            <Link href="/login">
              <Button
                variant="outline"
                size="lg"
                className="text-white border-white/20 hover:bg-white/10"
              >
                Zaloguj się
              </Button>
            </Link>
          </div>
        </GlassCard>
      </section>
    </div>
  );
}

function QuickActionCard({ icon, title, description, href, color }: any) {
  return (
    <Link href={href}>
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <GlassCard className="h-full p-6 transition-all cursor-pointer hover:bg-white/20 group">
          <div
            className={`${color} mb-4 group-hover:scale-110 transition-transform`}
          >
            {icon}
          </div>
          <h3 className="mb-2 text-xl font-semibold text-white">{title}</h3>
          <p className="text-sm text-gray-300">{description}</p>
        </GlassCard>
      </motion.div>
    </Link>
  );
}

function NearbyChurches() {
  return (
    <section className="container px-4 py-12 mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-white">Kościoły w pobliżu</h2>
        <Link href="/church-finder">
          <Button
            variant="ghost"
            className="text-sacred-gold hover:text-sacred-gold-light"
          >
            Zobacz wszystkie <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <GlassCard key={i} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="mb-1 text-xl font-semibold text-white">
                  Parafia św. Jana Pawła II
                </h3>
                <p className="flex items-center text-sm text-gray-300">
                  <MapPin className="w-4 h-4 mr-1" />
                  2.5 km
                </p>
              </div>
              <Heart className="w-5 h-5 text-gray-400 cursor-pointer hover:text-red-400" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-300">
                <Clock className="w-4 h-4 mr-2" />
                Następna msza: 18:00
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </section>
  );
}

function UpcomingMasses() {
  return (
    <section className="container px-4 py-12 mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-white">
          Nadchodzące Msze Święte
        </h2>
        <Link href="/masses">
          <Button
            variant="ghost"
            className="text-sacred-gold hover:text-sacred-gold-light"
          >
            Kalendarz <Calendar className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {[1, 2].map((i) => (
          <GlassCard key={i} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-white">
                  Msza w intencji pokoju
                </h3>
                <p className="text-gray-300">Parafia św. Wojciecha</p>
              </div>
              <span className="px-3 py-1 text-sm rounded-full bg-sacred-gold/20 text-sacred-gold">
                Dziś 19:00
              </span>
            </div>
            <div className="flex gap-4">
              <Button variant="golden" size="sm" className="flex-1">
                Zamów intencję
              </Button>
              <Button variant="glass" size="sm" className="flex-1">
                Oglądaj online
              </Button>
            </div>
          </GlassCard>
        ))}
      </div>
    </section>
  );
}

function FeaturedContent() {
  return (
    <section className="container px-4 py-12 mx-auto">
      <h2 className="mb-6 text-3xl font-bold text-white">Polecane treści</h2>

      <div className="grid gap-6 md:grid-cols-3">
        <GlassCard className="p-6">
          <Music className="w-8 h-8 mb-4 text-purple-400" />
          <h3 className="mb-2 text-xl font-semibold text-white">
            Pieśni wielkopostne
          </h3>
          <p className="mb-4 text-sm text-gray-300">
            Kolekcja tradycyjnych pieśni na czas refleksji
          </p>
          <Button variant="glass" size="sm" className="w-full">
            <Play className="w-4 h-4 mr-2" />
            Słuchaj
          </Button>
        </GlassCard>

        <GlassCard className="p-6">
          <BookOpen className="w-8 h-8 mb-4 text-blue-400" />
          <h3 className="mb-2 text-xl font-semibold text-white">
            Lectio Divina
          </h3>
          <p className="mb-4 text-sm text-gray-300">
            Codzienna medytacja nad Słowem Bożym
          </p>
          <Button variant="glass" size="sm" className="w-full">
            Czytaj więcej
          </Button>
        </GlassCard>

        <GlassCard className="p-6">
          <Headphones className="w-8 h-8 mb-4 text-green-400" />
          <h3 className="mb-2 text-xl font-semibold text-white">
            Podcast: Rozmowy o wierze
          </h3>
          <p className="mb-4 text-sm text-gray-300">
            Inspirujące wywiady z duchownymi
          </p>
          <Button variant="glass" size="sm" className="w-full">
            <Play className="w-4 h-4 mr-2" />
            Odtwórz
          </Button>
        </GlassCard>
      </div>
    </section>
  );
}
