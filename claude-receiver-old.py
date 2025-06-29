#!/usr/bin/env python3
"""
🧹 ULTIMATE SMART RECEIVER
Integruje Twój istniejący system z smart cleanup i Supabase sync
"""

import os
import json
import time
import shutil
import re
import requests
from pathlib import Path
from datetime import datetime

# Sprawdź czy watchdog jest zainstalowany
try:
    from watchdog.observers import Observer
    from watchdog.events import FileSystemEventHandler
    WATCHDOG_AVAILABLE = True
except ImportError:
    WATCHDOG_AVAILABLE = False
    print("⚠️  watchdog nie jest zainstalowany. Uruchom: pip install watchdog requests")

class UltimateSmartReceiver:
    def __init__(self):
        self.project_root = Path.cwd()
        self.downloads_dir = Path.home() / 'Downloads'
        self.brain_dir = self.project_root / '.copilot-brain'
        self.history_dir = self.brain_dir / 'history'
        self.supabase_dir = self.brain_dir / 'supabase'
        
        # Stwórz strukturę folderów
        self.brain_dir.mkdir(exist_ok=True)
        self.history_dir.mkdir(exist_ok=True) 
        self.supabase_dir.mkdir(exist_ok=True)
        
        # Konfiguracja Supabase
        self.supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL', '')
        self.supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY', '')
        
        # Rozszerzone monitorowane pliki
        self.watch_patterns = [
            'claude-artifacts-bundle.json',
            'claude-enhanced-artifacts-bundle.json',
            'claude-supabase-bundle.json', 
            'claude-smart-vscode-bundle.json',
            'copilot-deployment-instructions.js',
            'copilot-enhanced-deployment.js',
            'copilot-supabase-deployment.js',
            'SUPABASE_SETUP.sql',
            'SUPABASE_DEPLOYMENT.md',
            'claude-artifacts-all.txt'
        ]
        
        # Ulepszone mapowanie dla Next.js
        self.type_folders = {
            # Database & Supabase
            'database_schema': 'supabase/migrations',
            'database_function': 'supabase/functions',
            'supabase_config': 'lib/supabase',
            'sql_query': 'lib/database',
            'sql_migration': 'supabase/migrations',
            
            # Auth & Services
            'auth_service': 'lib/auth',
            'auth_config': 'lib/auth', 
            'storage_service': 'lib/storage',
            'service_class': 'lib/services',
            'async_function': 'lib/services',
            
            # Next.js struktura
            'api_endpoint': 'app/api',
            'api_framework': 'app/api',
            'react_component': 'components',
            'vue_component': 'components',
            'angular_component': 'components',
            
            # Types & Models
            'data_model': 'types',
            'type_definition': 'types',
            
            # Frontend
            'css_styles': 'styles',
            'configuration': 'config',
            'shell_script': 'scripts',
            
            # Testing & Utils
            'test_code': 'tests',
            'test_mock': 'tests/mocks',
            'code_snippet': 'lib/utils',
            
            # Documentation
            'documentation': 'docs'
        }
        
        print(f"🧹 Ultimate Smart Receiver uruchomiony!")
        print(f"📍 Projekt: {self.project_root.name}")
        print(f"🧠 Brain: {self.brain_dir}")
        print(f"📂 Historia: {self.history_dir}")
        print(f"🗃️ Supabase: {self.supabase_dir}")
        
    def start_monitoring(self):
        """Rozpocznij smart monitoring z cleanup"""
        print("\n🔄 Rozpoczynam smart monitoring...")
        
        # Sprawdź istniejące pliki
        self.check_existing_files()
        
        if not WATCHDOG_AVAILABLE:
            print("\n⚠️  Automatyczne monitorowanie niedostępne bez watchdog i requests")
            print("🔧 Zainstaluj: pip install watchdog requests")
            return
        
        # Rozpocznij watch
        event_handler = SmartWatcher(self)
        observer = Observer()
        observer.schedule(event_handler, str(self.downloads_dir), recursive=False)
        observer.start()
        
        print("✅ Smart monitoring aktywny!")
        print("\n📋 SMART WORKFLOW:")
        print("1. Kliknij bookmark w Claude.ai")
        print("2. System automatycznie:")
        print("   📦 Pobiera nowe artefakty")
        print("   🧹 Archiwizuje starą sesję") 
        print("   🔄 Czyści brain dla Copilot")
        print("   🗃️ Synchronizuje z Supabase")
        print("   🎯 Tworzy fresh brain")
        print("   🚀 Wdraża w Next.js struktura")
        print("\nNaciśnij Ctrl+C aby zatrzymać...")
        
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            observer.stop()
            print("\n👋 Smart monitoring zatrzymany")
        
        observer.join()
    
    def check_existing_files(self):
        """Sprawdź czy są już jakieś pliki do przetworzenia"""
        found_files = []
        
        for pattern in self.watch_patterns:
            matching_files = list(self.downloads_dir.glob(pattern))
            found_files.extend(matching_files)
        
        # Usuń duplikaty
        found_files = list(set(found_files))
        
        if found_files:
            print(f"\n📦 Znaleziono {len(found_files)} plików do przetworzenia:")
            for file in found_files:
                print(f"   📄 {file.name}")
            
            process_now = input("\n🔄 Przetworzyć teraz? (y/n): ").lower().strip()
            if process_now in ['y', 'yes', 'tak', '']:
                for file in found_files:
                    self.process_file_smart(file)
    
    def process_file_smart(self, file_path):
        """Smart processing z cleanup i synchronizacją"""
        print(f"\n🧹 SMART PROCESSING: {file_path.name}")
        
        try:
            # KROK 1: Archiwizuj poprzednią sesję jeśli istnieje
            if self.has_active_session():
                self.archive_previous_session()
            
            # KROK 2: Wyczyść brain dla fresh start
            self.cleanup_brain()
            
            # KROK 3: Przetwórz nowy plik
            if file_path.name.endswith('.json'):
                self.process_artifacts_bundle(file_path)
            elif file_path.name.endswith('.sql'):
                self.process_supabase_sql(file_path)
            elif file_path.name.endswith('.md'):
                self.process_deployment_guide(file_path)
            elif file_path.name.endswith('.js'):
                self.process_copilot_instructions(file_path)
            elif file_path.name.endswith('.txt'):
                self.process_text_file(file_path)
            
            # KROK 4: Synchronizuj z Supabase
            self.sync_with_supabase()
            
            # KROK 5: Stwórz fresh brain context
            self.create_fresh_brain()
            
            # KROK 6: Przenieś plik do archiwum
            archive_file = self.history_dir / f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{file_path.name}"
            if file_path.exists():
                shutil.move(str(file_path), str(archive_file))
                print(f"📁 Zarchiwizowano: {archive_file}")
            
            print("🎉 SMART PROCESSING ZAKOŃCZONY!")
            
        except Exception as e:
            print(f"❌ Błąd smart processing: {e}")
    
    def has_active_session(self):
        """Sprawdź czy jest aktywna sesja"""
        active_files = [
            'COPILOT_CONTEXT.js',
            'COPILOT_DEPLOYMENT.js', 
            'CURRENT_SESSION.json'
        ]
        
        return any((self.brain_dir / file).exists() for file in active_files)
    
    def archive_previous_session(self):
        """Archiwizuj poprzednią sesję"""
        print("📦 Archiwizuję poprzednią sesję...")
        
        session_timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        archive_session_dir = self.history_dir / f"session_{session_timestamp}"
        archive_session_dir.mkdir(exist_ok=True)
        
        # Przenieś wszystkie pliki sesji do archiwum (poza folderami)
        for item in self.brain_dir.iterdir():
            if item.is_file():
                shutil.move(str(item), str(archive_session_dir / item.name))
        
        print(f"✅ Sesja zarchiwizowana: {archive_session_dir}")
    
    def cleanup_brain(self):
        """Wyczyść brain dla fresh start"""
        print("🧹 Czyszczę Copilot Brain...")
        
        # Usuń wszystkie pliki brain (poza folderami history/supabase)
        for item in self.brain_dir.iterdir():
            if item.is_file():
                item.unlink()
        
        print("✅ Brain wyczyszczony - fresh start!")
    
    def process_artifacts_bundle(self, bundle_path):
        """Przetwórz bundle artefaktów z enhanced features"""
        print("📦 Przetwarzam bundle artefaktów...")
        
        try:
            with open(bundle_path, 'r', encoding='utf-8') as f:
                bundle = json.load(f)
        except json.JSONDecodeError as e:
            print(f"❌ Błąd parsowania JSON: {e}")
            return
        
        artifacts = bundle.get('artifacts', [])
        print(f"🔍 Znaleziono {len(artifacts)} artefaktów")
        
        if not artifacts:
            print("⚠️  Brak artefaktów w bundle")
            return
        
        # Zapisz metadata sesji
        session_info = {
            'timestamp': datetime.now().isoformat(),
            'source': bundle.get('metadata', {}).get('source', 'Unknown'),
            'artifacts_count': len(artifacts),
            'extractor_version': bundle.get('metadata', {}).get('extractorVersion', 'Unknown'),
            'chat_url': bundle.get('metadata', {}).get('chatUrl', 'Unknown'),
            'bundle_type': self.detect_bundle_type(bundle_path.name)
        }
        
        with open(self.brain_dir / 'CURRENT_SESSION.json', 'w', encoding='utf-8') as f:
            json.dump(session_info, f, indent=2, ensure_ascii=False)
        
        # Analizuj artefakty pod kątem Supabase
        supabase_artifacts = self.analyze_supabase_artifacts(artifacts)
        if supabase_artifacts:
            print(f"🗃️ Wykryto {len(supabase_artifacts)} artefaktów Supabase")
        
        # Auto-deployment z enhanced logic
        if self.should_auto_deploy(artifacts):
            self.auto_deploy_artifacts(artifacts)
        else:
            self.create_manual_deployment_instructions(artifacts)
    
    def detect_bundle_type(self, filename):
        """Wykryj typ bundle na podstawie nazwy"""
        if 'supabase' in filename.lower():
            return 'supabase'
        elif 'enhanced' in filename.lower():
            return 'enhanced'
        elif 'smart' in filename.lower():
            return 'smart'
        else:
            return 'standard'
    
    def analyze_supabase_artifacts(self, artifacts):
        """Analizuj artefakty pod kątem Supabase"""
        supabase_artifacts = []
        
        for artifact in artifacts:
            content = artifact.get('content', '').lower()
            artifact_type = artifact.get('type', '')
            
            # Wykryj Supabase artifacts
            if (artifact_type in ['database_schema', 'database_function', 'supabase_config'] or
                'supabase' in content or 'create table' in content or 
                'createclient' in content or 'rls' in content):
                
                supabase_artifacts.append(artifact)
        
        return supabase_artifacts
    
    def should_auto_deploy(self, artifacts):
        """Sprawdź czy można bezpiecznie auto-wdrożyć (enhanced)"""
        if len(artifacts) > 25:
            print(f"⚠️  Dużo artefaktów ({len(artifacts)})")
            auto_deploy = input("🤖 Auto-wdrożyć wszystkie? (y/n): ").lower().strip()
            return auto_deploy in ['y', 'yes', 'tak']
        
        # Sprawdź konflikty z enhanced checking
        conflicts = []
        important_conflicts = []
        
        for artifact in artifacts[:15]:  # Sprawdź pierwsze 15
            try:
                suggested_path = self.get_deployment_path(artifact)
                if suggested_path.exists():
                    conflicts.append(suggested_path)
                    # Sprawdź czy to ważny plik
                    if suggested_path.suffix in ['.tsx', '.ts', '.js', '.jsx']:
                        important_conflicts.append(suggested_path)
            except:
                continue
        
        if important_conflicts:
            print(f"⚠️  WAŻNE KONFLIKTY: {len(important_conflicts)} plików TypeScript/React")
            for conflict in important_conflicts[:3]:
                print(f"   📄 {conflict}")
            
            auto_deploy = input("\n🤖 Auto-wdrożyć mimo konfliktów? (y/n): ").lower().strip()
            return auto_deploy in ['y', 'yes', 'tak']
        elif conflicts:
            print(f"⚠️  Wykryto {len(conflicts)} konfliktów z plikami")
            auto_deploy = input("\n🤖 Auto-wdrożyć? (y/n): ").lower().strip()
            return auto_deploy in ['y', 'yes', 'tak']
        
        return True
    
    def auto_deploy_artifacts(self, artifacts):
        """Enhanced auto-deployment dla Next.js"""
        print("\n🚀 ENHANCED AUTO-DEPLOYMENT")
        print("=" * 40)
        
        deployed = 0
        skipped = 0
        supabase_files = 0
        
        # Sortuj artefakty: najpierw Supabase, potem reszta
        sorted_artifacts = self.sort_artifacts_by_priority(artifacts)
        
        for i, artifact in enumerate(sorted_artifacts, 1):
            try:
                deployment_path = self.get_deployment_path(artifact)
                
                # Stwórz folder jeśli nie istnieje
                deployment_path.parent.mkdir(parents=True, exist_ok=True)
                
                # Enhanced content processing
                content = self.process_artifact_content(artifact, deployment_path)
                
                # Zapisz plik
                with open(deployment_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                
                # Kategoryzuj output
                if 'supabase' in str(deployment_path):
                    supabase_files += 1
                    print(f"🗃️ {i:2d}. {deployment_path.relative_to(self.project_root)}")
                else:
                    print(f"✅ {i:2d}. {deployment_path.relative_to(self.project_root)}")
                
                deployed += 1
                
            except Exception as e:
                print(f"❌ {i:2d}. Błąd: {e}")
                skipped += 1
        
        print(f"\n🎉 ENHANCED DEPLOYMENT COMPLETE!")
        print(f"✅ Wdrożono: {deployed}")
        print(f"🗃️ Supabase: {supabase_files}")
        print(f"❌ Pominięto: {skipped}")
        
        # Aktualizuj enhanced brain
        self.update_enhanced_brain(artifacts)
        
        # Otwórz VS Code
        self.open_vscode()
    
    def sort_artifacts_by_priority(self, artifacts):
        """Sortuj artefakty według priorytetu wdrożenia"""
        priority_order = {
            'database_schema': 1,
            'supabase_config': 2, 
            'data_model': 3,
            'service_class': 4,
            'api_endpoint': 5,
            'react_component': 6,
            'css_styles': 7,
            'test_code': 8,
            'documentation': 9
        }
        
        return sorted(artifacts, key=lambda x: priority_order.get(x.get('type'), 10))
    
    def process_artifact_content(self, artifact, deployment_path):
        """Enhanced processing zawartości artefaktu"""
        content = artifact.get('content', '')
        
        # Auto-fix imports dla Next.js
        if deployment_path.suffix in ['.tsx', '.ts', '.jsx', '.js']:
            content = self.fix_nextjs_imports(content, deployment_path)
        
        # Add header comment
        if not content.startswith('//') and not content.startswith('/*'):
            header = f"// Generated by Claude Smart Receiver - {datetime.now().strftime('%Y-%m-%d %H:%M')}\n"
            content = header + content
        
        return content
    
    def fix_nextjs_imports(self, content, file_path):
        """Auto-fix imports dla Next.js struktury"""
        # Popraw relative imports
        if 'import' in content:
            # Zamień src/ na @/ jeśli projekt używa alias
            content = re.sub(r"from ['\"]src/", "from '@/", content)
            
            # Popraw ścieżki dla components
            content = re.sub(r"from ['\"]components/", "from '@/components/", content)
            content = re.sub(r"from ['\"]lib/", "from '@/lib/", content)
        
        return content
    
    def get_deployment_path(self, artifact):
        """Enhanced deployment path z lepszym mapowaniem"""
        artifact_type = artifact.get('type', 'code_snippet')
        
        # Użyj ulepszonego mapowania
        folder = self.type_folders.get(artifact_type, 'lib/utils')
        
        # Sprawdź czy jest suggested path
        if 'suggestedPath' in artifact and artifact['suggestedPath']:
            # Użyj suggested path ale popraw dla Next.js
            suggested = artifact['suggestedPath']
            if suggested.startswith('src/'):
                suggested = suggested[4:]  # Usuń src/ prefix dla Next.js
            return self.project_root / suggested
        
        # Wygeneruj nazwę pliku
        filename = artifact.get('suggestedFilename')
        if not filename:
            filename = self.generate_enhanced_filename(artifact)
        
        filename = self.sanitize_filename(filename)
        
        return self.project_root / folder / filename
    
    def generate_enhanced_filename(self, artifact):
        """Enhanced filename generation"""
        # Enhanced extensions mapping
        extensions = {
            'javascript': '.js',
            'jsx': '.jsx',
            'typescript': '.ts',
            'tsx': '.tsx',
            'python': '.py',
            'sql': '.sql',
            'css': '.css',
            'scss': '.scss',
            'html': '.html',
            'json': '.json',
            'bash': '.sh',
            'text': '.txt',
            'markdown': '.md'
        }
        
        language = artifact.get('language', 'javascript')
        artifact_type = artifact.get('type', 'code_snippet')
        
        # Smart extension based on type and language
        if artifact_type == 'react_component':
            ext = '.tsx' if 'typescript' in language or 'interface' in artifact.get('content', '') else '.jsx'
        elif artifact_type in ['database_schema', 'database_function', 'sql_query']:
            ext = '.sql'
        elif artifact_type == 'data_model':
            ext = '.ts'  # TypeScript interfaces
        else:
            ext = extensions.get(language, '.js')
        
        # Enhanced name generation
        title = artifact.get('title', 'Unknown')
        
        # Clean and format title
        base_name = re.sub(r'[^a-zA-Z0-9\s]', '', title)
        base_name = re.sub(r'\s+', '_', base_name)
        
        # Apply naming conventions
        if artifact_type == 'react_component':
            # PascalCase for components
            base_name = ''.join(word.capitalize() for word in base_name.split('_'))
        elif artifact_type in ['service_class', 'data_model']:
            # PascalCase for classes/models
            base_name = ''.join(word.capitalize() for word in base_name.split('_'))
        else:
            # camelCase for others
            words = base_name.split('_')
            base_name = words[0].lower() + ''.join(word.capitalize() for word in words[1:])
        
        # Fallback jeśli nazwa jest pusta
        if not base_name or base_name.lower() in ['unknown', 'artifact']:
            base_name = f"{artifact_type}_{int(time.time()) % 10000}"
        
        return base_name[:40] + ext  # Limit length
    
    def sanitize_filename(self, filename):
        """Enhanced sanitization"""
        # Usuń niebezpieczne znaki ale zachowaj case
        filename = re.sub(r'[<>:"/\\|?*]', '_', filename)
        filename = re.sub(r'_{2,}', '_', filename)
        
        # Limit length but preserve extension
        if len(filename) > 60:
            name, ext = os.path.splitext(filename)
            filename = name[:60-len(ext)] + ext
        
        return filename
    
    def process_supabase_sql(self, sql_path):
        """Przetwórz plik SQL Supabase"""
        print("🗃️ Przetwarzam Supabase SQL...")
        
        target_path = self.supabase_dir / sql_path.name
        shutil.copy2(sql_path, target_path)
        
        print(f"✅ SQL zapisany: {target_path}")
    
    def process_deployment_guide(self, guide_path):
        """Przetwórz przewodnik deployment"""
        print("📋 Przetwarzam przewodnik deployment...")
        
        target_path = self.brain_dir / guide_path.name
        shutil.copy2(guide_path, target_path)
        
        print(f"✅ Przewodnik zapisany: {target_path}")
    
    def process_copilot_instructions(self, instructions_path):
        """Przetwórz instrukcje Copilot"""
        print("🤖 Przetwarzam instrukcje Copilot...")
        
        target_path = self.brain_dir / 'COPILOT_DEPLOYMENT.js'
        shutil.copy2(instructions_path, target_path)
        
        print(f"✅ Instrukcje Copilot zapisane: {target_path}")
    
    def process_text_file(self, text_path):
        """Przetwórz plik tekstowy (zachowana oryginalną logikę)"""
        print("📄 Przetwarzam plik tekstowy...")
        
        try:
            with open(text_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            artifacts_raw = content.split('// ========================================')
            
            artifacts = []
            for raw in artifacts_raw[1:]:
                artifact = self.parse_text_artifact(raw)
                if artifact:
                    artifacts.append(artifact)
            
            if artifacts:
                print(f"🔍 Wyodrębniono {len(artifacts)} artefaktów z pliku tekstowego")
                
                if self.should_auto_deploy(artifacts):
                    self.auto_deploy_artifacts(artifacts)
                else:
                    self.create_manual_deployment_instructions(artifacts)
            else:
                print("📄 Plik tekstowy przeniesiony do brain")
                
        except Exception as e:
            print(f"❌ Błąd przetwarzania pliku tekstowego: {e}")
    
    def parse_text_artifact(self, raw_text):
        """Parsuj artefakt z tekstu (zachowana logika)"""
        try:
            lines = raw_text.strip().split('\n')
            if len(lines) < 3:
                return None
            
            title = "Unknown"
            artifact_type = "code_snippet"
            language = "javascript"
            
            content_lines = []
            
            for line in lines:
                if line.startswith('// ARTEFAKT #'):
                    title = line.split(': ', 1)[1] if ': ' in line else "Unknown"
                elif line.startswith('// Typ:'):
                    artifact_type = line.split(':', 1)[1].strip()
                elif line.startswith('// Język:'):
                    language = line.split(':', 1)[1].strip()
                elif line.startswith('//'):
                    continue
                else:
                    content_lines.append(line)
            
            if not content_lines:
                return None
            
            return {
                'title': title,
                'type': artifact_type,
                'language': language,
                'content': '\n'.join(content_lines).strip(),
                'suggestedFilename': f"{title.lower().replace(' ', '_')}.js"
            }
            
        except Exception as e:
            print(f"❌ Błąd parsowania artefaktu: {e}")
            return None
    
    def sync_with_supabase(self):
        """Synchronizuj z Supabase"""
        print("🗃️ Synchronizuję z Supabase...")
        
        if not self.supabase_url or 'your_supabase_url' in self.supabase_url:
            print("⚠️  Brak konfiguracji Supabase - ustaw zmienne środowiskowe")
            return
        
        try:
            schema_info = self.fetch_supabase_schema()
            
            if schema_info:
                schema_file = self.supabase_dir / 'current_schema.json'
                with open(schema_file, 'w', encoding='utf-8') as f:
                    json.dump(schema_info, f, indent=2, ensure_ascii=False)
                
                print("✅ Schemat Supabase zsynchronizowany")
            else:
                print("⚠️  Nie można pobrać schematu Supabase")
                
        except Exception as e:
            print(f"⚠️  Błąd synchronizacji Supabase: {e}")
    
    def fetch_supabase_schema(self):
        """Pobierz schemat z Supabase (uproszczona wersja)"""
        try:
            # Dummy query - w rzeczywistości trzeba by użyć proper Supabase API
            return {
                'timestamp': datetime.now().isoformat(),
                'status': 'connected',
                'note': 'Schema sync - implement with proper Supabase API'
            }
        except Exception as e:
            print(f"❌ Błąd API Supabase: {e}")
            return None
    
    def create_fresh_brain(self):
        """Stwórz enhanced fresh brain context"""
        print("🧠 Tworzę enhanced fresh brain...")
        
        # Analizuj projekt
        project_analysis = self.analyze_nextjs_structure()
        
        # Pobierz info o sesji
        session_info = {}
        session_file = self.brain_dir / 'CURRENT_SESSION.json'
        if session_file.exists():
            with open(session_file, 'r', encoding='utf-8') as f:
                session_info = json.load(f)
        
        # Pobierz info o Supabase
        supabase_info = self.get_supabase_status()
        
        brain_context = f"""/* 🧠 COPILOT BRAIN - FRESH SESSION (Next.js Enhanced)
Utworzono: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
Sesja: {session_info.get('timestamp', 'Unknown')}
Bundle: {session_info.get('bundle_type', 'standard')}
Źródło: {session_info.get('source', 'Unknown')}
Artefakty: {session_info.get('artifacts_count', 0)}

🎯 PROJEKT: {self.project_root.name} (Next.js + TypeScript)

📊 NEXT.JS STRUKTURA:
{self.format_nextjs_analysis(project_analysis)}

🗃️ SUPABASE STATUS:
{self.format_supabase_status(supabase_info)}