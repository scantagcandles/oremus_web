#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
🧹 INTERAKTYWNY CLEANER PROJEKTU OREMUS
======================================
Usuwa duplikacje i niepotrzebne pliki z potwierdzeniem użytkownika
"""

import os
import sys
import shutil
from pathlib import Path
from datetime import datetime
import json

class OremusProjectCleaner:
    def __init__(self):
        self.root = Path.cwd()
        self.removed_files = []
        self.removed_dirs = []
        self.total_size_saved = 0
        self.backup_created = False
        
        print("🧹 OREMUS PROJECT CLEANER v1.0")
        print("=" * 50)
        print(f"📁 Katalog projektu: {self.root}")
        print()

    def get_folder_size(self, folder_path):
        """Oblicza rozmiar folderu w bajtach"""
        try:
            total_size = 0
            for dirpath, dirnames, filenames in os.walk(folder_path):
                for f in filenames:
                    fp = os.path.join(dirpath, f)
                    if os.path.exists(fp):
                        total_size += os.path.getsize(fp)
            return total_size
        except:
            return 0

    def format_size(self, size_bytes):
        """Formatuje rozmiar w bajtach na czytelną formę"""
        if size_bytes == 0:
            return "0 B"
        size_names = ["B", "KB", "MB", "GB"]
        i = 0
        while size_bytes >= 1024 and i < len(size_names) - 1:
            size_bytes /= 1024.0
            i += 1
        return f"{size_bytes:.1f} {size_names[i]}"

    def confirm_action(self, message, default="n"):
        """Pyta użytkownika o potwierdzenie"""
        suffix = " [y/N]" if default == "n" else " [Y/n]"
        while True:
            choice = input(f"{message}{suffix}: ").lower().strip()
            if choice == "":
                choice = default
            if choice in ["y", "yes", "tak"]:
                return True
            elif choice in ["n", "no", "nie"]:
                return False
            else:
                print("❌ Odpowiedz 'y' (tak) lub 'n' (nie)")

    def create_backup(self):
        """Tworzy backup przed oczyszczaniem"""
        if self.confirm_action("📦 Czy utworzyć backup przed oczyszczaniem?", "y"):
            backup_name = f"oremus_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            backup_path = self.root.parent / backup_name
            
            print(f"📦 Tworzenie backupu: {backup_path}")
            
            # Lista folderów do backupu (tylko te które będziemy modyfikować)
            backup_items = [
                "app/auth",
                "app/main", 
                "app/api/endpoint_39*",
                "components/Component_39*",
                "components/code_39*",
                "components/includes.jsx",
                "components/me.jsx", 
                "components/with.jsx",
                ".backup",
                "external",
                "database/code_39*",
                "src/database",
                "utils/code_39*",
                "styles/code_39*"
            ]
            
            backup_path.mkdir(exist_ok=True)
            backup_created = False
            
            for item in backup_items:
                source_path = self.root / item.split('*')[0] if '*' in item else self.root / item
                if source_path.exists():
                    if source_path.is_dir():
                        dest_path = backup_path / item.split('*')[0] if '*' in item else backup_path / item
                        dest_path.parent.mkdir(parents=True, exist_ok=True)
                        try:
                            shutil.copytree(source_path, dest_path, dirs_exist_ok=True)
                            backup_created = True
                        except Exception as e:
                            print(f"⚠️  Błąd podczas backupu {source_path}: {e}")
            
            if backup_created:
                print(f"✅ Backup utworzony: {backup_path}")
                self.backup_created = True
            else:
                print("⚠️  Nie utworzono backupu - brak plików do zachowania")

    def remove_file(self, file_path, description=""):
        """Usuwa plik z logowaniem"""
        try:
            if file_path.exists():
                size = file_path.stat().st_size
                file_path.unlink()
                self.removed_files.append(str(file_path.relative_to(self.root)))
                self.total_size_saved += size
                print(f"  ✅ Usunięto: {file_path.relative_to(self.root)} ({self.format_size(size)})")
            else:
                print(f"  ⚠️  Nie znaleziono: {file_path.relative_to(self.root)}")
        except Exception as e:
            print(f"  ❌ Błąd przy usuwaniu {file_path.relative_to(self.root)}: {e}")

    def remove_directory(self, dir_path, description=""):
        """Usuwa katalog z logowaniem"""
        try:
            if dir_path.exists() and dir_path.is_dir():
                size = self.get_folder_size(dir_path)
                shutil.rmtree(dir_path)
                self.removed_dirs.append(str(dir_path.relative_to(self.root)))
                self.total_size_saved += size
                print(f"  ✅ Usunięto katalog: {dir_path.relative_to(self.root)} ({self.format_size(size)})")
            else:
                print(f"  ⚠️  Nie znaleziono katalogu: {dir_path.relative_to(self.root)}")
        except Exception as e:
            print(f"  ❌ Błąd przy usuwaniu {dir_path.relative_to(self.root)}: {e}")

    def clean_auth_duplicates(self):
        """Usuwa duplikaty struktury auth"""
        print("\n🔐 OCZYSZCZANIE DUPLIKATÓW AUTORYZACJI")
        print("-" * 40)
        
        paths_to_check = [
            self.root / "app/auth/register",
            self.root / "app/auth/unauthorized", 
            self.root / "app/auth/verify-email"
        ]
        
        existing_paths = [p for p in paths_to_check if p.exists()]
        
        if not existing_paths:
            print("✅ Brak duplikatów auth do usunięcia")
            return
        
        print("📋 Znalezione duplikaty struktury auth:")
        for path in existing_paths:
            size = self.get_folder_size(path) if path.is_dir() else path.stat().st_size
            print(f"  • {path.relative_to(self.root)} ({self.format_size(size)})")
        
        print("\n📝 WYJAŚNIENIE:")
        print("Next.js App Router używa (auth) z nawiasami dla grupowania tras.")
        print("Stara struktura app/auth/ jest niepotrzebna i może powodować konflikty routingu.")
        print("Zachowujemy: app/(auth)/ - nowa struktura App Router")
        print("Usuwamy: app/auth/ - stara struktura")
        
        if self.confirm_action("\n🗑️  Usunąć duplikaty auth?", "y"):
            for path in existing_paths:
                if path.is_dir():
                    self.remove_directory(path)
                else:
                    self.remove_file(path)

    def clean_order_mass_duplicates(self):
        """Usuwa duplikaty order-mass"""
        print("\n⛪ OCZYSZCZANIE DUPLIKATÓW ORDER-MASS")
        print("-" * 40)
        
        old_path = self.root / "app/main/order-mass"
        
        if not old_path.exists():
            print("✅ Brak duplikatów order-mass do usunięcia")
            return
        
        size = self.get_folder_size(old_path)
        print(f"📋 Znaleziony duplikat: {old_path.relative_to(self.root)} ({self.format_size(size)})")
        
        print("\n📝 WYJAŚNIENIE:")
        print("Zachowujemy: app/(main)/order-mass/ - struktura z grupowaniem tras")
        print("Usuwamy: app/main/order-mass/ - duplikat bez grupowania")
        
        if self.confirm_action("\n🗑️  Usunąć duplikat order-mass?", "y"):
            self.remove_directory(old_path)

    def clean_temp_files(self):
        """Usuwa pliki tymczasowe z numerami"""
        print("\n🗂️  OCZYSZCZANIE PLIKÓW TYMCZASOWYCH")
        print("-" * 40)
        
        # Wzorce plików do usunięcia
        temp_patterns = [
            "app/api/endpoint_39*.css",
            "app/api/endpoint_39*.jsx", 
            "app/api/endpoint_39*.js",
            "components/Component_39*.jsx",
            "components/code_39*.js",
            "database/code_39*.js",
            "database/code_39*.css",
            "docs/code_39*.js",
            "styles/code_39*.css",
            "utils/code_39*.js",
            "utils/code_39*.css"
        ]
        
        # Konkretne pliki
        specific_files = [
            "components/includes.jsx",
            "components/me.jsx",
            "components/with.jsx",
            "utils/_sift.js",
            "utils/mediaRecorder.php"
        ]
        
        found_files = []
        
        # Znajdź pliki pasujące do wzorców
        for pattern in temp_patterns:
            base_dir = pattern.split('*')[0]
            base_path = self.root / base_dir.rsplit('/', 1)[0]
            if base_path.exists():
                for file_path in base_path.rglob('*'):
                    if file_path.is_file():
                        filename = file_path.name
                        if ('_39' in filename or 'code_39' in filename or 'endpoint_39' in filename or 'Component_39' in filename):
                            found_files.append(file_path)
        
        # Dodaj konkretne pliki
        for file_rel in specific_files:
            file_path = self.root / file_rel
            if file_path.exists():
                found_files.append(file_path)
        
        if not found_files:
            print("✅ Brak plików tymczasowych do usunięcia")
            return
        
        # Usuń duplikaty z listy
        found_files = list(set(found_files))
        
        total_temp_size = sum(f.stat().st_size for f in found_files)
        print(f"📋 Znaleziono {len(found_files)} plików tymczasowych ({self.format_size(total_temp_size)}):")
        
        for file_path in found_files[:10]:  # Pokaż pierwsze 10
            size = file_path.stat().st_size
            print(f"  • {file_path.relative_to(self.root)} ({self.format_size(size)})")
        
        if len(found_files) > 10:
            print(f"  • ...i {len(found_files)-10} więcej")
        
        print("\n📝 WYJAŚNIENIE:")
        print("Te pliki wyglądają na tymczasowe/testowe (zawierają _39, code_39, endpoint_39).")
        print("Prawdopodobnie powstały podczas eksperymentów lub automatycznego generowania.")
        
        if self.confirm_action(f"\n🗑️  Usunąć {len(found_files)} plików tymczasowych?", "y"):
            for file_path in found_files:
                self.remove_file(file_path)

    def clean_backup_folders(self):
        """Usuwa foldery backup"""
        print("\n📦 OCZYSZCZANIE FOLDERÓW BACKUP")
        print("-" * 40)
        
        backup_dirs = [
            self.root / ".backup",
            self.root / ".copilot-brain"
        ]
        
        existing_backups = [d for d in backup_dirs if d.exists()]
        
        if not existing_backups:
            print("✅ Brak folderów backup do usunięcia")
            return
        
        for backup_dir in existing_backups:
            size = self.get_folder_size(backup_dir)
            print(f"📋 Znaleziony backup: {backup_dir.relative_to(self.root)} ({self.format_size(size)})")
        
        print("\n📝 WYJAŚNIENIE:")
        print("Foldery .backup i .copilot-brain zawierają stare wersje plików.")
        print("Po utworzeniu własnego backupu można je bezpiecznie usunąć.")
        
        if self.confirm_action(f"\n🗑️  Usunąć {len(existing_backups)} folderów backup?", "y"):
            for backup_dir in existing_backups:
                self.remove_directory(backup_dir)

    def clean_external_folder(self):
        """Usuwa folder external"""
        print("\n📁 OCZYSZCZANIE FOLDERU EXTERNAL")
        print("-" * 40)
        
        external_dir = self.root / "external"
        
        if not external_dir.exists():
            print("✅ Folder external nie istnieje")
            return
        
        size = self.get_folder_size(external_dir)
        print(f"📋 Znaleziony folder: external/ ({self.format_size(size)})")
        
        # Sprawdź zawartość
        try:
            contents = list(external_dir.rglob('*'))[:5]
            print("📄 Zawartość (pierwsze 5 plików):")
            for item in contents:
                if item.is_file():
                    print(f"  • {item.relative_to(external_dir)}")
        except:
            pass
        
        print("\n📝 WYJAŚNIENIE:")
        print("Folder external/ zawiera pliki WooCommerce, które nie są potrzebne w aplikacji Oremus.")
        print("Wygląda na kopię/backup zewnętrznych plików.")
        
        if self.confirm_action("\n🗑️  Usunąć folder external?", "y"):
            self.remove_directory(external_dir)

    def clean_src_duplicates(self):
        """Usuwa duplikaty w folderze src"""
        print("\n📂 OCZYSZCZANIE DUPLIKATÓW W SRC")
        print("-" * 40)
        
        duplicate_dirs = [
            self.root / "src/database",
            self.root / "src/styles"
        ]
        
        existing_duplicates = [d for d in duplicate_dirs if d.exists()]
        
        if not existing_duplicates:
            print("✅ Brak duplikatów w src/ do usunięcia")
            return
        
        total_size = 0
        for dup_dir in existing_duplicates:
            size = self.get_folder_size(dup_dir)
            total_size += size
            print(f"📋 Znaleziony duplikat: {dup_dir.relative_to(self.root)} ({self.format_size(size)})")
        
        print("\n📝 WYJAŚNIENIE:")
        print("Folder src/ zawiera duplikaty struktur już istniejących w głównym katalogu.")
        print("Główne struktury są w: database/, styles/ (bez src/)")
        print("Duplikaty w src/ można bezpiecznie usunąć.")
        
        if self.confirm_action(f"\n🗑️  Usunąć duplikaty w src/ ({self.format_size(total_size)})?", "y"):
            for dup_dir in existing_duplicates:
                self.remove_directory(dup_dir)

    def clean_empty_files(self):
        """Usuwa puste pliki"""
        print("\n📄 OCZYSZCZANIE PUSTYCH PLIKÓW")
        print("-" * 40)
        
        empty_files = [
            self.root / "app/api/academy/courses/[courseId]/route.ts",
            self.root / "analysis.md",
            self.root / "drzewo.txt"
        ]
        
        existing_empty = [f for f in empty_files if f.exists() and f.stat().st_size == 0]
        
        if not existing_empty:
            print("✅ Brak pustych plików do usunięcia")
            return
        
        for empty_file in existing_empty:
            print(f"📋 Pusty plik: {empty_file.relative_to(self.root)}")
        
        print("\n📝 WYJAŚNIENIE:")
        print("Te pliki są całkowicie puste i nie zawierają żadnego kodu.")
        print("Można je bezpiecznie usunąć.")
        
        if self.confirm_action(f"\n🗑️  Usunąć {len(existing_empty)} pustych plików?", "y"):
            for empty_file in existing_empty:
                self.remove_file(empty_file)

    def analyze_services_duplicates(self):
        """Analizuje duplikaty w services (nie usuwa, tylko informuje)"""
        print("\n🔍 ANALIZA DUPLIKATÓW W SERVICES")
        print("-" * 40)
        
        duplicates = [
            ("services/AuthService.ts", "services/auth/AuthService.ts"),
            ("services/email/EmailService.ts", "services/email/EmailService.new.ts"),
            ("services/notification/", "services/notifications/")
        ]
        
        found_duplicates = []
        
        for old_path, new_path in duplicates:
            old_full = self.root / old_path
            new_full = self.root / new_path
            
            if old_full.exists() and new_full.exists():
                old_size = old_full.stat().st_size if old_full.is_file() else self.get_folder_size(old_full)
                new_size = new_full.stat().st_size if new_full.is_file() else self.get_folder_size(new_full)
                
                found_duplicates.append({
                    'old': old_path,
                    'new': new_path,
                    'old_size': old_size,
                    'new_size': new_size
                })
        
        if not found_duplicates:
            print("✅ Brak duplikatów w services/")
            return
        
        print("📋 Znalezione duplikaty w services/:")
        for dup in found_duplicates:
            print(f"\n📁 {dup['old']} ({self.format_size(dup['old_size'])})")
            print(f"📁 {dup['new']} ({self.format_size(dup['new_size'])})")
            
            if dup['old_size'] == 0:
                print("   ⚠️  Stary plik jest PUSTY - można usunąć")
            elif dup['new_size'] > dup['old_size']:
                print("   💡 Nowy plik jest większy - prawdopodobnie bardziej aktualny")
            else:
                print("   ⚠️  Wymaga ręcznego sprawdzenia")
        
        print("\n📝 REKOMENDACJA:")
        print("Duplikaty w services/ wymagają ręcznego sprawdzenia.")
        print("Zalecam sprawdzić kod w każdym pliku przed usunięciem.")
        print("Te pliki NIE zostały automatycznie usunięte.")

    def generate_report(self):
        """Generuje raport z oczyszczania"""
        print("\n📊 RAPORT Z OCZYSZCZANIA")
        print("=" * 50)
        
        print(f"📁 Usunięte katalogi: {len(self.removed_dirs)}")
        for dir_name in self.removed_dirs:
            print(f"  • {dir_name}")
        
        print(f"\n📄 Usunięte pliki: {len(self.removed_files)}")
        for file_name in self.removed_files:
            print(f"  • {file_name}")
        
        print(f"\n💾 Całkowity zaoszczędzony rozmiar: {self.format_size(self.total_size_saved)}")
        
        if self.backup_created:
            print("📦 Backup został utworzony przed oczyszczaniem")
        
        # Zapisz raport do pliku
        report_data = {
            'timestamp': datetime.now().isoformat(),
            'removed_directories': self.removed_dirs,
            'removed_files': self.removed_files,
            'total_size_saved': self.total_size_saved,
            'backup_created': self.backup_created
        }
        
        report_file = self.root / f"cleanup_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(report_data, f, indent=2, ensure_ascii=False)
        
        print(f"\n📋 Szczegółowy raport zapisano: {report_file.name}")

    def run(self):
        """Główna funkcja uruchamiająca oczyszczanie"""
        print("🎯 ROZPOCZYNAM INTERAKTYWNE OCZYSZCZANIE PROJEKTU OREMUS")
        print()
        
        # Sprawdź czy jesteśmy w odpowiednim katalogu
        if not (self.root / "package.json").exists():
            print("❌ Nie wykryto pliku package.json!")
            print("Uruchom skrypt w głównym katalogu projektu Oremus.")
            sys.exit(1)
        
        print("✅ Wykryto projekt Next.js")
        
        # Utwórz backup
        self.create_backup()
        
        # Uruchom poszczególne kroki oczyszczania
        self.clean_auth_duplicates()
        self.clean_order_mass_duplicates() 
        self.clean_temp_files()
        self.clean_backup_folders()
        self.clean_external_folder()
        self.clean_src_duplicates()
        self.clean_empty_files()
        self.analyze_services_duplicates()
        
        # Wygeneruj raport
        self.generate_report()
        
        print("\n🎉 OCZYSZCZANIE ZAKOŃCZONE!")
        print(f"💾 Zaoszczędzono: {self.format_size(self.total_size_saved)}")
        print("📋 Sprawdź raport powyżej i plik JSON z detalami.")
        print("\n💡 ZALECENIA PO OCZYSZCZENIU:")
        print("1. Sprawdź czy aplikacja nadal działa: npm run dev")
        print("2. Przejrzyj duplikaty w services/ ręcznie")
        print("3. Uruchom testy: npm test")
        print("4. Zaktualizuj dokumentację jeśli potrzeba")

if __name__ == "__main__":
    cleaner = OremusProjectCleaner()
    try:
        cleaner.run()
    except KeyboardInterrupt:
        print("\n\n⚠️  Przerwano przez użytkownika")
        print("Częściowe zmiany mogły zostać wykonane.")
    except Exception as e:
        print(f"\n❌ Nieoczekiwany błąd: {e}")
        sys.exit(1)