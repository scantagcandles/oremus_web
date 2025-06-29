import React, { useState } from 'react';
import { Church, Calendar, Heart, Users, Settings, LogOut, Menu, X } from 'lucide-react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const navigation = [
    { name: 'Strona główna', href: '/dashboard', icon: Church },
    { name: 'Kalendarz', href: '/calendar', icon: Calendar },
    { name: 'Intencje', href: '/prayers', icon: Heart },
    { name: 'Wspólnota', href: '/community', icon: Users },
    { name: 'Ustawienia', href: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 bg-white rounded-lg shadow-lg"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 w-64 bg-white shadow-lg transform transition-transform lg:transform-none ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 z-40`}>
        <div className="flex items-center justify-center h-16 bg-purple-700">
          <Church className="h-8 w-8 text-white mr-2" />
          <h1 className="text-white text-xl font-bold">OREMUS</h1>
        </div>
        
        <nav className="mt-8">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = router.pathname === item.href;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-purple-50 text-purple-700 border-r-4 border-purple-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Icon className="h-5 w-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-64 p-4">
          <button className="flex items-center w-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">
            <LogOut className="h-5 w-5 mr-3" />
            Wyloguj się
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64">
        <main className="p-4 lg:p-8 pt-16 lg:pt-8">
          {children}
        </main>
      </div>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
