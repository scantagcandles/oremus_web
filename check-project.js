// check-project.js
const fs = require('fs');
const path = require('path');

const requiredFiles = [
  // Config files
  'package.json',
  'next.config.js',
  'tsconfig.json',
  'tailwind.config.ts',
  '.env.local',
  'middleware.ts',
  
  // App structure
  'app/layout.tsx',
  'app/page.tsx',
  'app/globals.css',
  'app/providers.tsx',
  
  // Auth
  'app/(auth)/layout.tsx',
  'app/(auth)/login/page.tsx',
  'app/(auth)/register/page.tsx',
  
  // Main pages
  'app/(main)/layout.tsx',
  'app/(main)/page.tsx',
  'app/(main)/candle/page.tsx',
  'app/(main)/prayer/page.tsx',
  'app/(main)/mass/page.tsx',
  'app/(main)/shop/page.tsx',
  'app/(main)/player/page.tsx',
  
  // Components
  'components/layout/Navigation.tsx',
  'components/glass/GlassCard.tsx',
  'components/glass/GlassButton.tsx',
  
  // Lib
  'lib/supabase/client.ts',
  'lib/supabase/server.ts',
  'lib/utils.ts',
  
  // Types
  'types/database.types.ts'
];

console.log('🔍 SPRAWDZANIE PROJEKTU OREMUS WEB\n');
console.log('✅ = Plik istnieje');
console.log('❌ = Plik nie istnieje\n');

let existingFiles = 0;
let missingFiles = 0;

requiredFiles.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file));
  console.log(`${exists ? '✅' : '❌'} ${file}`);
  
  if (exists) existingFiles++;
  else missingFiles++;
});

console.log('\n📊 PODSUMOWANIE:');
console.log(`✅ Pliki istniejące: ${existingFiles}`);
console.log(`❌ Pliki brakujące: ${missingFiles}`);
console.log(`📈 Kompletność: ${Math.round((existingFiles / requiredFiles.length) * 100)}%`);

// Sprawdź zawartość package.json
if (fs.existsSync('package.json')) {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  console.log('\n📦 DEPENDENCIES:');
  console.log('Next.js:', pkg.dependencies?.next || '❌ BRAK');
  console.log('React:', pkg.dependencies?.react || '❌ BRAK');
  console.log('Supabase:', pkg.dependencies?.['@supabase/supabase-js'] || '❌ BRAK');
}