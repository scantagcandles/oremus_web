const fs = require("fs");
const path = require("path");

// Funkcja tworzenia katalogów
function createDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✅ Katalog: ${dirPath}`);
  }
}

// Funkcja tworzenia pliku
function createFile(filePath, content) {
  if (fs.existsSync(filePath)) {
    console.log(`⚠️  Plik już istnieje: ${filePath}`);
    return false;
  }

  const dir = path.dirname(filePath);
  createDir(dir);

  fs.writeFileSync(filePath, content, "utf8");
  console.log(`✅ Utworzono: ${filePath}`);
  return true;
}

console.log("🚀 OREMUS - Tworzenie struktury stron");
console.log("====================================");

let created = 0;

// 1. STRONA GŁÓWNA
if (
  createFile(
    "app/page.tsx",
    `'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { GlassCard } from '@/components/glass/GlassCard';

export default function HomePage() {
  const heroActions = [
    {
      title: 'Zamów Mszę Świętą',
      description: 'Zamów intencję mszalną online',
      href: '/main/order-mass',
      icon: '⛪',
      color: 'from-blue-500 to-purple-500'
    },
    {
      title: 'Znajdź Parafię', 
      description: 'Szukaj parafii w okolicy',
      href: '/church-finder',
      icon: '🗺️',
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Transmisje Live',
      description: 'Oglądaj msze na żywo',
      href: '/live',
      icon: '▶️', 
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Wiadomości',
      description: 'Komunikuj się z duchownymi', 
      href: '/messages',
      icon: '💬',
      color: 'from-orange-500 to-red-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <section className="px-4 pt-24 pb-12">
        <div className="mx-auto text-center max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h1 className="mb-6 text-5xl font-bold text-white md:text-7xl">
              Dzień dobry! 👋
            </h1>
            <p className="max-w-3xl mx-auto text-xl text-blue-100 md:text-2xl">
              Zamów mszę świętą, śledź transmisje na żywo i pozostań w kontakcie z Twoją parafią
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
          >
            {heroActions.map((action, index) => (
              <Link key={action.title} href={action.href}>
                <GlassCard className="h-full p-6 transition-transform cursor-pointer hover:scale-105 group">
                  <div className={\`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r \${action.color} flex items-center justify-center text-2xl group-hover:scale-110 transition-transform\`}>
                    {action.icon}
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-white">{action.title}</h3>
                  <p className="text-blue-100">{action.description}</p>
                </GlassCard>
              </Link>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}`
  )
)
  created++;

// 2. DASHBOARD
if (
  createFile(
    "app/dashboard/page.tsx",
    `'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { GlassCard } from '@/components/glass/GlassCard';

export default function DashboardPage() {
  const quickActions = [
    {
      title: 'Zamów Mszę',
      description: 'Zamów intencję mszalną',
      href: '/main/order-mass',
      icon: '➕',
      color: 'from-blue-500 to-purple-500'
    },
    {
      title: 'Biblioteka',
      description: 'Zasoby duchowe',
      href: '/main/library',
      icon: '📚',
      color: 'from-cyan-500 to-blue-500'
    },
    {
      title: 'Wiadomości',
      description: 'Komunikacja',
      href: '/messages',
      icon: '💬',
      color: 'from-orange-500 to-red-500'
    }
  ];

  return (
    <div className="min-h-screen px-4 pt-20 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <div className="py-8 mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="mb-2 text-3xl font-bold text-white md:text-4xl">
            Dashboard
          </h1>
          <p className="text-lg text-blue-100">
            Witaj w swoim osobistym centrum kontroli
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {quickActions.map((action, index) => (
            <Link key={action.title} href={action.href}>
              <GlassCard className="p-4 transition-transform cursor-pointer hover:scale-105">
                <div className={\`w-12 h-12 mb-3 rounded-xl bg-gradient-to-r \${action.color} flex items-center justify-center text-xl\`}>
                  {action.icon}
                </div>
                <h3 className="mb-1 text-lg font-semibold text-white">{action.title}</h3>
                <p className="text-sm text-blue-200">{action.description}</p>
              </GlassCard>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}`
  )
)
  created++;

// 3. BIBLIOTEKA
if (
  createFile(
    "app/(main)/library/page.tsx",
    `'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { GlassCard } from '@/components/glass/GlassCard';

export default function LibraryPage() {
  const categories = [
    { id: 'books', name: 'Książki', icon: '📚', count: 145, color: 'from-green-500 to-emerald-500' },
    { id: 'audiobooks', name: 'Audiobooki', icon: '🎧', count: 67, color: 'from-purple-500 to-pink-500' },
    { id: 'prayers', name: 'Modlitwy', icon: '🙏', count: 234, color: 'from-yellow-500 to-orange-500' },
    { id: 'songs', name: 'Pieśni', icon: '🎵', count: 89, color: 'from-red-500 to-pink-500' }
  ];

  return (
    <div className="min-h-screen px-4 pt-20 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <div className="py-8 mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h1 className="mb-4 text-4xl font-bold text-white md:text-5xl">
            📚 Biblioteka Duchowa
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-blue-100">
            Odkryj bogactwo tradycji katolickiej w naszej cyfrowej bibliotece
          </p>
        </motion.div>

        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {categories.map((category, index) => (
            <Link key={category.id} href={\`/main/library/\${category.id}\`}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <GlassCard className="p-6 text-center transition-transform cursor-pointer hover:scale-105">
                  <div className={\`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r \${category.color} flex items-center justify-center text-2xl\`}>
                    {category.icon}
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-white">{category.name}</h3>
                  <p className="text-sm text-blue-200">{category.count} pozycji</p>
                </GlassCard>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}`
  )
)
  created++;

// 4. KATEGORII BIBLIOTEKI
const libraryCategories = [
  { name: "books", displayName: "Książki", icon: "📚" },
  { name: "audiobooks", displayName: "Audiobooki", icon: "🎧" },
  { name: "prayers", displayName: "Modlitwy", icon: "🙏" },
  { name: "songs", displayName: "Pieśni", icon: "🎵" },
  { name: "favorites", displayName: "Ulubione", icon: "❤️" },
];

libraryCategories.forEach((category) => {
  const componentName =
    category.name.charAt(0).toUpperCase() + category.name.slice(1);

  if (
    createFile(
      `app/(main)/library/${category.name}/page.tsx`,
      `'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { GlassCard } from '@/components/glass/GlassCard';

export default function ${componentName}Page() {
  return (
    <div className="min-h-screen px-4 pt-20 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <div className="py-8 mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <nav className="flex items-center mb-4 space-x-2 text-blue-300">
            <Link href="/main/library" className="transition-colors hover:text-white">Biblioteka</Link>
            <span>›</span>
            <span className="text-white">${category.displayName}</span>
          </nav>
          <h1 className="text-3xl font-bold text-white md:text-4xl">${category.icon} ${category.displayName}</h1>
        </motion.div>

        <GlassCard className="p-8 text-center">
          <div className="mb-4 text-6xl">🚧</div>
          <h2 className="mb-4 text-2xl font-bold text-white">Wkrótce dostępne!</h2>
          <p className="text-blue-100">Sekcja ${category.displayName} jest w trakcie przygotowania.</p>
        </GlassCard>
      </div>
    </div>
  );
}`
    )
  )
    created++;
});

// 5. CHURCH FINDER
if (
  createFile(
    "app/church-finder/page.tsx",
    `'use client';

import { motion } from 'framer-motion';
import { GlassCard } from '@/components/glass/GlassCard';

export default function ChurchFinder() {
  const churches = [
    {
      id: 1,
      name: 'Parafia św. Jana Chrzciciela',
      address: 'ul. Kościelna 1, Warszawa',
      distance: '2.5 km',
      masses: ['07:00', '09:00', '11:00', '18:00']
    },
    {
      id: 2,
      name: 'Parafia Matki Bożej Częstochowskiej',
      address: 'ul. Mariacka 15, Warszawa',
      distance: '3.2 km',
      masses: ['06:30', '08:00', '10:00', '17:30']
    }
  ];

  return (
    <div className="min-h-screen px-4 pt-20 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <div className="py-8 mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className="mb-4 text-4xl font-bold text-white md:text-5xl">
            🗺️ Znajdź Parafię
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-blue-100">
            Wyszukaj parafie w okolicy i sprawdź harmonogram mszy świętych
          </p>
        </motion.div>

        <div className="space-y-6">
          {churches.map((church, index) => (
            <motion.div
              key={church.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassCard className="p-6 hover:scale-[1.01] transition-transform cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="mb-2 text-xl font-semibold text-white">{church.name}</h3>
                    <p className="mb-2 text-blue-200">{church.address}</p>
                    <p className="mb-3 text-sm text-blue-300">📍 {church.distance}</p>
                    <div className="flex flex-wrap gap-2">
                      {church.masses.map((time) => (
                        <span key={time} className="px-2 py-1 text-sm text-blue-300 rounded bg-blue-500/20">
                          {time}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-2xl">⛪</div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}`
  )
)
  created++;

// 6. MESSAGES
if (
  createFile(
    "app/messages/page.tsx",
    `'use client';

import { motion } from 'framer-motion';
import { GlassCard } from '@/components/glass/GlassCard';

export default function MessagesPage() {
  return (
    <div className="min-h-screen px-4 pt-20 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <div className="max-w-6xl py-8 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="mb-2 text-3xl font-bold text-white md:text-4xl">
            💬 Wiadomości
          </h1>
          <p className="text-blue-100">
            Komunikuj się z duchownymi i parafią
          </p>
        </motion.div>

        <GlassCard className="p-8 text-center">
          <div className="mb-4 text-6xl">💬</div>
          <h2 className="mb-4 text-2xl font-bold text-white">System wiadomości w budowie</h2>
          <p className="text-blue-100">Już wkrótce będziesz mógł komunikować się z duchownymi.</p>
        </GlassCard>
      </div>
    </div>
  );
}`
  )
)
  created++;

// 7. LIVE
if (
  createFile(
    "app/live/page.tsx",
    `'use client';

import { motion } from 'framer-motion';
import { GlassCard } from '@/components/glass/GlassCard';

export default function LivePage() {
  return (
    <div className="min-h-screen px-4 pt-20 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <div className="py-8 mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className="mb-4 text-4xl font-bold text-white md:text-5xl">
            ▶️ Transmisje na żywo
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-blue-100">
            Oglądaj msze święte i nabożeństwa online
          </p>
        </motion.div>

        <GlassCard className="p-8 text-center">
          <div className="mb-4 text-6xl">🚧</div>
          <h2 className="mb-4 text-2xl font-bold text-white">System transmisji w budowie!</h2>
          <p className="text-lg text-blue-100">
            Pracujemy nad systemem transmisji na żywo. Już wkrótce będziesz mógł oglądać msze święte online.
          </p>
        </GlassCard>
      </div>
    </div>
  );
}`
  )
)
  created++;

// 8. ADMIN DASHBOARD
if (
  createFile(
    "app/admin/dashboard/page.tsx",
    `'use client';

import { motion } from 'framer-motion';
import { GlassCard } from '@/components/glass/GlassCard';

export default function AdminDashboard() {
  const stats = [
    { title: 'Zamówione Msze', value: '12', icon: '⛪', color: 'from-blue-500 to-cyan-500' },
    { title: 'Oczekujące', value: '3', icon: '⏳', color: 'from-yellow-500 to-orange-500' },
    { title: 'Odprawione', value: '8', icon: '✅', color: 'from-green-500 to-emerald-500' },
    { title: 'Przychód', value: '360 zł', icon: '💰', color: 'from-purple-500 to-pink-500' }
  ];

  return (
    <div className="min-h-screen px-4 pt-20 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <div className="py-8 mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="mb-2 text-3xl font-bold text-white md:text-4xl">
            Panel Administracyjny
          </h1>
          <p className="text-blue-100">
            Zarządzaj parafią i monitoruj aktywność
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              <GlassCard className="p-6 transition-transform cursor-pointer hover:scale-105">
                <div className={\`w-12 h-12 rounded-xl bg-gradient-to-r \${stat.color} flex items-center justify-center text-xl mb-4\`}>
                  {stat.icon}
                </div>
                <div className="mb-1 text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-blue-200">{stat.title}</div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}`
  )
)
  created++;

// 9. ERROR PAGES
if (
  createFile(
    "app/404/page.tsx",
    `'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen px-4 pt-20 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <div className="max-w-4xl py-8 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div className="mb-6 text-8xl">🔍</div>
          <h1 className="mb-4 text-6xl font-bold text-white md:text-8xl">404</h1>
          <h2 className="mb-4 text-2xl font-semibold text-white md:text-3xl">
            Strona nie została znaleziona
          </h2>
          <p className="max-w-2xl mx-auto mb-8 text-xl text-blue-100">
            Ups! Strona, której szukasz, nie istnieje lub została przeniesiona.
          </p>
          
          <Link href="/" className="inline-block px-6 py-3 text-white transition-colors bg-blue-500 rounded-lg hover:bg-blue-600">
            🏠 Powrót do strony głównej
          </Link>
        </motion.div>
      </div>
    </div>
  );
}`
  )
)
  created++;

if (
  createFile(
    "app/403/page.tsx",
    `'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen px-4 pt-20 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <div className="max-w-4xl py-8 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div className="mb-6 text-8xl">🚫</div>
          <h1 className="mb-4 text-6xl font-bold text-white md:text-8xl">403</h1>
          <h2 className="mb-4 text-2xl font-semibold text-white md:text-3xl">
            Brak uprawnień
          </h2>
          <p className="max-w-2xl mx-auto mb-8 text-xl text-blue-100">
            Nie masz uprawnień do wyświetlenia tej strony.
          </p>
          
          <div className="space-x-4">
            <Link href="/login" className="inline-block px-6 py-3 text-white transition-colors bg-blue-500 rounded-lg hover:bg-blue-600">
              🔑 Zaloguj się
            </Link>
            <Link href="/" className="inline-block px-6 py-3 text-white transition-colors bg-gray-500 rounded-lg hover:bg-gray-600">
              🏠 Strona główna
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}`
  )
)
  created++;

console.log(`\n🎉 UKOŃCZONO!`);
console.log(`✅ Utworzono ${created} stron`);
console.log(`\n📝 NASTĘPNE KROKI:`);
console.log(`1. Uruchom: npm run dev`);
console.log(`2. Sprawdź czy komponenty GlassCard istnieją`);
console.log(`3. Przetestuj nawigację między stronami`);
console.log(`\n🔗 DOSTĘPNE STRONY:`);
console.log(`- / (Strona główna)`);
console.log(`- /dashboard (Dashboard)`);
console.log(`- /main/library (Biblioteka + kategorie)`);
console.log(`- /church-finder (Wyszukiwarka parafii)`);
console.log(`- /messages (Wiadomości)`);
console.log(`- /live (Transmisje)`);
console.log(`- /admin/dashboard (Panel admin)`);
console.log(`- /404 i /403 (Strony błędów)`);
