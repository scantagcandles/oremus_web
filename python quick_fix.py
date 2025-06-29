#!/usr/bin/env python3
"""
🚀 QUICK FIX - Universal AI Brain
Naprawka problemu z pustym PROJECT_MAP.md
"""

import os
import json
from datetime import datetime
from pathlib import Path

def quick_generate_map():
    """Szybkie generowanie mapy na podstawie ostatnich danych"""
    
    root = Path.cwd()
    brain_dir = root / '.ai-brain'
    brain_dir.mkdir(exist_ok=True)
    
    # Sprawdź czy istnieją dane JSON
    state_file = brain_dir / 'CURRENT_STATE.json'
    
    if state_file.exists():
        print("📊 Znaleziono zapisane dane, generuję mapę...")
        
        with open(state_file, 'r', encoding='utf-8') as f:
            brain_state = json.load(f)
        
        all_files = brain_state.get('files', {})
        connections = brain_state.get('connections', [])
        stats = brain_state.get('stats', {})
        
    else:
        print("❌ Brak zapisanych danych. Uruchom najpierw pełną analizę.")
        return None
    
    if not all_files:
        print("❌ Brak danych o plikach w JSON!")
        return None
    
    print(f"✅ Ładowanie {len(all_files)} plików z danych...")
    
    # Generuj mapę
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    total_files = len(all_files)
    total_lines = stats.get('lines', 0)
    total_functions = stats.get('functions', 0)
    total_classes = stats.get('classes', 0)
    total_todos = stats.get('todos', 0)
    
    map_content = f"""# 🗺️ MAPA PROJEKTU OREMUS - KOMPLETNA ANALIZA
*Wygenerowano: {timestamp} | Naprawka Quick Fix*

## 🎯 PROJEKT OREMUS
Aplikacja religijna Next.js + TypeScript z funkcjonalnościami:
- 🙏 Składanie intencji mszalnych  
- 🕯️ Wirtualne świeczki
- 📚 Biblioteka modlitw i audiobooków
- 👨‍💼 Panel administracyjny
- 💳 System płatności Stripe
- 📧 Powiadomienia email/push

## 📊 STATYSTYKI PROJEKTU
- **📁 Plików:** {total_files}
- **📝 Linii kodu:** {total_lines:,}
- **⚙️ Funkcji:** {total_functions}
- **🏛️ Klas/Komponentów:** {total_classes}
- **⚠️ TODO/FIXME:** {total_todos}
- **🔗 Połączeń:** {len(connections)}

## 🏗️ STRUKTURA PROJEKTU

"""
    
    # Grupuj pliki po katalogach
    folders = {}
    for file_path, file_info in all_files.items():
        folder = str(Path(file_path).parent)
        if folder == '.':
            folder = '📄 ROOT'
        else:
            # Kategoryzuj foldery
            if folder.startswith('app/'):
                if 'api' in folder:
                    category = '🌐 API Routes'
                elif 'admin' in folder:
                    category = '👨‍💼 Admin Panel'
                elif 'auth' in folder:
                    category = '🔐 Autoryzacja'
                else:
                    category = '📱 App Pages'
            elif folder.startswith('components/'):
                if 'admin' in folder:
                    category = '👨‍💼 Admin Components'
                elif 'features' in folder:
                    category = '🎯 Feature Components'
                elif 'glass' in folder:
                    category = '✨ Glass Design System'
                else:
                    category = '🎨 UI Components'
            elif folder.startswith('services/'):
                category = '⚙️ Business Services'
            elif folder.startswith('hooks/'):
                category = '🪝 React Hooks'
            elif folder.startswith('lib/'):
                category = '📚 Libraries & Utils'
            elif folder.startswith('types/'):
                category = '🏷️ TypeScript Types'
            else:
                category = f'📁 {folder.split("/")[0]}'
            
            folder = f'{category}/{folder}'
        
        if folder not in folders:
            folders[folder] = []
        folders[folder].append((file_path, file_info))
    
    # Wyświetl strukturę
    for folder, files in sorted(folders.items()):
        if not files:
            continue
            
        map_content += f"\n### {folder}\n"
        
        # Statystyki dla folderu
        folder_functions = sum(len(f[1].get('functions', [])) for f in files)
        folder_classes = sum(len(f[1].get('classes', [])) for f in files)
        folder_lines = sum(f[1].get('lines', 0) for f in files)
        
        map_content += f"*{len(files)} plików | {folder_lines:,} linii | {folder_functions} funkcji | {folder_classes} komponentów*\n\n"
        
        # Sortuj pliki po ważności (więcej funkcji = ważniejszy)
        sorted_files = sorted(files, 
                            key=lambda x: len(x[1].get('functions', [])) + len(x[1].get('classes', [])), 
                            reverse=True)
        
        # Pokaż najważniejsze pliki (max 8 na folder)
        for file_path, file_info in sorted_files[:8]:
            filename = Path(file_path).name
            file_type = file_info.get('type', 'Other')
            lines = file_info.get('lines', 0)
            
            map_content += f"**📄 {filename}** ({file_type}, {lines} linii)\n"
            
            # Dodaj opis funkcjonalności na podstawie nazwy
            desc = get_file_description(filename, file_path)
            if desc:
                map_content += f"*{desc}*\n"
            
            # Komponenty/klasy
            classes = file_info.get('classes', [])
            if classes:
                class_names = [c.get('name', c) if isinstance(c, dict) else c for c in classes[:3]]
                map_content += f"*🏛️ Komponenty:* {', '.join(f'`{c}`' for c in class_names)}\n"
            
            # Funkcje
            functions = file_info.get('functions', [])
            if functions:
                func_names = [f.get('name', f) if isinstance(f, dict) else f for f in functions[:4]]
                map_content += f"*⚙️ Funkcje:* {', '.join(f'`{f}()`' for f in func_names)}\n"
            
            # Eksporty
            exports = file_info.get('exports', [])
            if exports:
                map_content += f"*📤 Eksporty:* {', '.join(f'`{e}`' for e in exports[:3])}\n"
            
            map_content += "\n"
    
    # Sekcja połączeń
    if connections:
        map_content += "\n## 🔗 KLUCZOWE POŁĄCZENIA\n"
        
        # Grupuj połączenia według typów
        connection_summary = {}
        for conn in connections[:20]:
            from_file = Path(conn['from']).name
            to_file = Path(conn['to']).name
            conn_key = f"{from_file} → {to_file}"
            
            if conn_key not in connection_summary:
                connection_summary[conn_key] = 0
            connection_summary[conn_key] += 1
        
        for conn_key, count in sorted(connection_summary.items(), key=lambda x: x[1], reverse=True)[:10]:
            map_content += f"- **{conn_key}** ({count} połączeń)\n"
    
    # TODO/FIXME
    if total_todos > 0:
        map_content += "\n## ⚠️ WYMAGAJĄ UWAGI\n"
        
        todo_files = []
        for file_info in all_files.values():
            todos = file_info.get('todos', [])
            if todos:
                filename = Path(file_info['file']).name
                for todo in todos[:2]:  # Max 2 per plik
                    todo_type = todo.get('type', 'TODO')
                    todo_text = todo.get('text', '')[:60]
                    todo_line = todo.get('line', 0)
                    todo_files.append(f"- **{todo_type}** `{filename}:{todo_line}` - {todo_text}")
        
        for todo_item in todo_files[:10]:  # Max 10 total
            map_content += todo_item + "\n"
    
    # Przewodnik
    map_content += """
## 🎯 PRZEWODNIK ROZWOJU OREMUS

### 📍 Gdzie dodawać kod:

**🚀 Nowe strony:**
- `app/(main)/` - strony główne aplikacji
- `app/(auth)/` - logowanie, rejestracja
- `app/admin/` - panel administracyjny
- `app/api/` - endpointy API

**🎨 Komponenty:**
- `components/features/` - funkcjonalne (msze, świeczki, player)
- `components/glass/` - glass design system
- `components/admin/` - panel administracyjny
- `components/ui/` - podstawowe UI

**⚙️ Logika:**
- `services/` - serwisy biznesowe
- `hooks/` - React hooks
- `lib/` - biblioteki pomocnicze
- `types/` - definicje TypeScript

### 🔧 Główne technologie:
- **Next.js 13+** - App Router
- **TypeScript** - statyczne typowanie
- **Supabase** - baza danych
- **Stripe** - płatności
- **Tailwind CSS** - stylowanie
- **Glass Design** - system designu

### 💡 Typowe zadania:

**Nowa intencja mszalna:**
1. Rozszerz `types/mass-intention.ts`
2. Zaktualizuj `services/mass/MassIntentionService.ts`
3. Dodaj UI w `components/features/mass/`
4. Dodaj API endpoint w `app/api/`

**Nowy typ świeczki:**
1. Zaktualizuj `types/candle.ts`
2. Rozszerz `services/candle/CandleService.ts`
3. Dodaj komponent w `components/features/candle/`
4. Dodaj powiadomienia w `services/notifications/`

**Nowa funkcja płatności:**
1. Rozszerz `services/payment/PaymentService.ts`
2. Dodaj webhook w `app/api/webhooks/`
3. Zaktualizuj UI w `components/payment/`
4. Dodaj typy w `types/payment.ts`

**Panel admina:**
1. Nowa strona w `app/admin/`
2. Komponenty w `components/admin/`
3. API w `app/api/admin/`
4. Analytics w `services/analytics/`
"""
    
    # Zapisz mapę
    map_file = brain_dir / 'PROJECT_MAP.md'
    try:
        with open(map_file, 'w', encoding='utf-8') as f:
            f.write(map_content)
        
        print(f"✅ SUKCES! Mapa zapisana: {map_file}")
        print(f"📊 {total_files} plików, {total_functions} funkcji, {total_classes} komponentów")
        
        # Sprawdź rozmiar pliku
        file_size = map_file.stat().st_size
        print(f"📁 Rozmiar pliku: {file_size:,} bajtów")
        
        if file_size < 1000:
            print("⚠️ Plik wydaje się być zbyt mały!")
        else:
            print("✅ Plik wygląda na kompletny!")
            
        return map_file
        
    except Exception as e:
        print(f"❌ Błąd zapisywania: {e}")
        return None

def get_file_description(filename, file_path):
    """Zwraca opis funkcjonalności pliku na podstawie nazwy"""
    filename_lower = filename.lower()
    path_lower = file_path.lower()
    
    if 'dashboard' in filename_lower:
        return '📊 Panel zarządzania'
    elif 'payment' in filename_lower or 'stripe' in filename_lower:
        return '💳 System płatności'
    elif 'mass' in filename_lower and 'intention' in filename_lower:
        return '🙏 Zarządzanie intencjami mszalnymi'
    elif 'candle' in filename_lower:
        return '🕯️ System wirtualnych świeczek'
    elif 'auth' in filename_lower or 'login' in filename_lower:
        return '🔐 Autoryzacja użytkowników'
    elif 'email' in filename_lower or 'notification' in filename_lower:
        return '📧 System powiadomień'
    elif 'admin' in path_lower and 'component' in path_lower:
        return '👨‍💼 Komponent panelu administracyjnego'
    elif 'prayer' in filename_lower:
        return '🙏 System modlitw'
    elif 'player' in filename_lower:
        return '▶️ Odtwarzacz audio/video'
    elif 'glass' in path_lower:
        return '✨ Komponent glass design'
    elif 'layout' in filename_lower or 'navigation' in filename_lower:
        return '🧭 Nawigacja i layout'
    elif filename_lower.endswith('service.ts'):
        return '⚙️ Serwis biznesowy'
    elif filename_lower.startswith('use') and filename_lower.endswith('.ts'):
        return '🪝 React Hook'
    elif 'api' in path_lower and 'route.ts' in filename_lower:
        return '🌐 Endpoint API'
    else:
        return None

if __name__ == "__main__":
    print("🚀 Quick Fix - Generuję mapę projektu...")
    result = quick_generate_map()
    
    if result:
        print(f"\n🎉 GOTOWE! Otwórz plik: {result}")
        print("📋 Teraz możesz skopiować zawartość do Claude!")
    else:
        print("❌ Nie udało się wygenerować mapy.")