#!/usr/bin/env python3
# PEŁNY, POPRAWIONY KOD SKRYPTU
"""
🧠 UNIVERSAL AI BRAIN - WERSJA POPRAWIONA I INTERAKTYWNA
Naprawia problemy z generowaniem PROJECT_MAP.md i dodaje menu użytkownika.
"""

import os
import json
import re
import ast
from datetime import datetime
from pathlib import Path

class UniversalAIBrain:
    """Uniwersalny mózg projektu - poprawiona wersja"""
    
    def __init__(self, project_root=None, ai_type="universal"):
        self.root = Path(project_root or os.getcwd())
        self.brain_dir = self.root / '.ai-brain'
        self.brain_dir.mkdir(exist_ok=True)
        self.ai_type = ai_type.lower()
        
        print(f"🔍 Katalog główny: {self.root}")
        print(f"🧠 Katalog brain: {self.brain_dir}")
        
        # Ignorowane foldery
        self.ignore_dirs = {
            '.git', 'node_modules', '__pycache__', '.venv', 'venv',
            'dist', 'build', '.next', '.ai-brain', 'coverage', '.pytest_cache',
            '.backup', '.copilot-brain', 'external'
        }

        # Ignorowane pliki
        self.ignore_files = {
            'package-lock.json',
            'yarn.lock',
            'pnpm-lock.yaml'
        }
        
        # Obsługiwane pliki
        self.important_files = {
            '.py': 'Python', '.js': 'JavaScript', '.jsx': 'React',
            '.ts': 'TypeScript', '.tsx': 'React+TS', '.java': 'Java',
            '.cpp': 'C++', '.cs': 'C#', '.php': 'PHP', '.go': 'Go',
            '.rs': 'Rust', '.vue': 'Vue', '.svelte': 'Svelte',
            '.html': 'HTML', '.css': 'CSS', '.scss': 'SCSS',
            '.json': 'JSON', '.xml': 'XML', '.yaml': 'YAML', '.yml': 'YAML',
            '.md': 'Markdown', '.txt': 'Text'
        }

    def scan_files(self, verbose=True):
        """Skanuje wszystkie pliki w projekcie, uwzględniając ignorowane katalogi i pliki."""
        if verbose: print(f"🔎 Skanowanie plików w: {self.root}")
        found_files = []
        for root, dirs, files in os.walk(self.root, topdown=True):
            # Usuń ignorowane foldery, aby os.walk do nich nie wchodził
            dirs[:] = [d for d in dirs if d not in self.ignore_dirs]
            
            for file in files:
                if file in self.ignore_files:
                    continue
                
                filepath = Path(root) / file
                
                # Sprawdź, czy ścieżka nie zawiera ignorowanego folderu (dodatkowe zabezpieczenie)
                is_ignored = False
                for part in filepath.parts:
                    if part in self.ignore_dirs:
                        is_ignored = True
                        break
                if is_ignored:
                    continue

                # Sprawdź, czy to plik kodu, dokumentacji lub konfiguracji
                if filepath.suffix.lower() in self.important_files or \
                   file.lower() in ['package.json', 'requirements.txt', 'dockerfile', 'tsconfig.json', 'next.config.js', '.gitignore']:
                    found_files.append(filepath)
                    
        if verbose: print(f"📊 Znaleziono {len(found_files)} plików do analizy")
        return found_files

    def analyze_code_file(self, filepath, verbose=False):
        """Analizuje pojedynczy plik kodu."""
        relative_path = filepath.relative_to(self.root)
        
        # Pomijaj zbyt duże pliki binarne lub pliki, które nie są tekstem
        try:
            if filepath.stat().st_size > 1_000_000: # Limit 1MB
                if verbose: print(f"⚠️ Pomijam duży plik: {relative_path}")
                return None
            
            with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
        except (IOError, FileNotFoundError) as e:
            if verbose: print(f"⚠️ Błąd odczytu {relative_path}: {e}")
            return None
            
        if not content.strip():
            return {'file': str(relative_path), 'lines': 0, 'size': 0, 'empty': True}

        info = {
            'file': str(relative_path), 'lines': len(content.splitlines()), 'size': len(content),
            'functions': [], 'classes': [], 'imports': [], 'exports': [], 'todos': [], 'empty': False
        }
        ext = filepath.suffix.lower()

        # Analiza Python za pomocą AST
        if ext == '.py':
            try:
                tree = ast.parse(content)
                for node in ast.walk(tree):
                    if isinstance(node, ast.FunctionDef):
                        info['functions'].append({'name': node.name, 'line': node.lineno})
                    elif isinstance(node, ast.ClassDef):
                        info['classes'].append({'name': node.name, 'line': node.lineno})
                    elif isinstance(node, ast.ImportFrom) and node.module:
                        info['imports'].append(node.module)
            except SyntaxError:
                if verbose: print(f"⚠️ Błąd składni w pliku Python: {relative_path}")

        # Analiza JS/TS za pomocą Regex (uproszczona)
        elif ext in ['.js', '.jsx', 'ts', 'tsx']:
            # Importy
            for match in re.finditer(r'import(?:.*?)from\s+[\'"]([^\'"]+)[\'"]', content):
                info['imports'].append(match.group(1))
            # Funkcje i Komponenty (nazwy z wielkiej litery)
            for match in re.finditer(r'function\s+([A-Z_]\w*)', content):
                 info['functions'].append({'name': match.group(1), 'type': 'component' if match.group(1)[0].isupper() else 'function'})
            for match in re.finditer(r'(?:const|let)\s+([A-Z_]\w*)\s*=\s*(?:React\.memo)?\((?:async\s*)?function', content):
                 info['functions'].append({'name': match.group(1), 'type': 'component' if match.group(1)[0].isupper() else 'function'})
            for match in re.finditer(r'(?:const|let)\s+([A-Z_]\w*)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>', content):
                 info['functions'].append({'name': match.group(1), 'type': 'component' if match.group(1)[0].isupper() else 'function'})

        # Notatki TODO/FIXME
        for match in re.finditer(r'(?://|#|/\*)\s*(TODO|FIXME)[\s:](.*)', content, re.IGNORECASE):
            info['todos'].append({'type': match.group(1).upper(), 'text': match.group(2).strip()})
        
        return info

    def build_project_graph(self, verbose=True):
        """Buduje graf projektu, analizując wszystkie pliki."""
        if verbose: print("🏗️ Budowanie grafu projektu...")
        files_list = self.scan_files(verbose)
        all_files = {}
        
        total_files = len(files_list)
        for i, filepath in enumerate(files_list):
            if verbose:
                print(f"  Analizuję: [{i+1}/{total_files}] {filepath.relative_to(self.root)}", end='\r')
            file_info = self.analyze_code_file(filepath, verbose=False)
            if file_info:
                all_files[file_info['file']] = file_info
        
        if verbose:
            print(" " * 120, end='\r') # Wyczyść linię postępu
            print(f"✅ Przeanalizowano {len(all_files)} plików.")
        return all_files

    def generate_project_map(self, verbose=True):
        """Generuje finalną mapę projektu."""
        if verbose: print(f"🗺️ Generowanie mapy projektu dla AI: {self.ai_type.upper()}...")
        all_files = self.build_project_graph(verbose)
        if not all_files:
            print("❌ Brak plików do wygenerowania mapy!")
            return None, None

        total_lines = sum(f.get('lines', 0) for f in all_files.values())
        total_functions = sum(len(f.get('functions', [])) for f in all_files.values())
        total_todos = sum(len(f.get('todos', [])) for f in all_files.values())

        # Budowanie treści mapy
        map_content = f"""# 🗺️ MAPA PROJEKTU (Wygenerowano: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')})

## 📊 KLUCZOWE STATYSTYKI
- **📁 Plików:** {len(all_files)}
- **📝 Linii kodu:** {total_lines:,}
- **⚙️ Funkcji/Komponentów:** {total_functions}
- **⚠️ Zadań (TODO/FIXME):** {total_todos}

## 🏗️ STRUKTURA PROJEKTU
"""
        folders = {}
        for filepath, info in sorted(all_files.items()):
            folder = str(Path(filepath).parent)
            if folder == '.': folder = '📁 ROOT'
            if folder not in folders: folders[folder] = []
            folders[folder].append(info)

        for folder, files in sorted(folders.items()):
            map_content += f"\n### {folder}/\n"
            for info in sorted(files, key=lambda x: x['file']):
                if info.get('empty', False): continue
                filename = Path(info['file']).name
                details = f"{info['lines']} linii"
                if info.get('functions'):
                    details += f", {len(info['functions'])} funkcji"
                map_content += f"- **📄 {filename}** ({details})\n"
                if info.get('functions'):
                     # Pokaż do 3 funkcji jako przykład
                    func_names = [f"`{f['name']}`" for f in info['functions'][:3]]
                    map_content += f"  - *Zawiera:* {', '.join(func_names)}{'...' if len(info['functions']) > 3 else ''}\n"

        # Zapisywanie plików
        try:
            map_file = self.brain_dir / 'PROJECT_MAP.md'
            with open(map_file, 'w', encoding='utf-8') as f: f.write(map_content)
            
            state_file = self.brain_dir / 'CURRENT_STATE.json'
            with open(state_file, 'w', encoding='utf-8') as f: json.dump(all_files, f, indent=2)
            
            print(f"\n🎉 SUKCES! Mapa projektu została zaktualizowana.")
            print(f"📍 Zobacz plik: {map_file}")
            return map_file, state_file
        except IOError as e:
            print(f"❌ Błąd podczas zapisywania plików: {e}")
            return None, None
            
def main():
    """Główna funkcja uruchamiająca skrypt."""
    print("""
    🤖 UNIVERSAL AI BRAIN - WERSJA POPRAWIONA
    =========================================
    To narzędzie analizuje Twój projekt i tworzy mapę dla AI.
    """)
    
    # Wybór AI
    ai_choices = {'1': 'claude', '2': 'chatgpt', '3': 'gemini', '4': 'universal'}
    print("Wybierz AI, dla którego generujesz mapę:")
    print("1. Claude (domyślny)")
    print("2. ChatGPT")
    print("3. Gemini")
    print("4. Uniwersalny")
    choice = input("Wybór (1-4): ").strip() or '1'
    ai_type = ai_choices.get(choice, 'claude')

    print(f"\n✅ Wybrano AI: {ai_type.upper()}. Rozpoczynam analizę...\n")
    
    try:
        brain = UniversalAIBrain(ai_type=ai_type)
        brain.generate_project_map(verbose=True)
    except KeyboardInterrupt:
        print("\n\n👋 Analiza przerwana przez użytkownika.")
    except Exception as e:
        print(f"\n❌ Wystąpił nieoczekiwany błąd: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()