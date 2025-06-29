"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  ChevronDown,
  Search,
  Bell,
  User,
  Home,
  Church,
  BookOpen,
  Radio,
  Calendar,
  MessageSquare,
  GraduationCap,
  Settings,
  LogOut,
  UserCircle,
  Heart,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/glass/Button";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon?: React.ElementType;
  children?: NavItem[];
}

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navigation = getNavigation(user?.role);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "backdrop-blur-xl bg-black/20 shadow-lg" : "bg-transparent"
      )}
    >
      <div className="container px-4 mx-auto">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-transparent bg-gradient-to-r from-sacred-gold to-sacred-gold-light bg-clip-text">
              Oremus
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="items-center hidden space-x-8 lg:flex">
            {navigation.map((item) => (
              <NavLinkWithSubmenu
                key={item.href}
                item={item}
                pathname={pathname}
              />
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Icon Actions */}
            <div className="items-center hidden space-x-2 md:flex">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-300 hover:text-white"
              >
                <Search className="w-5 h-5" />
              </Button>
              {user && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative text-gray-300 hover:text-white"
                  >
                    <Bell className="w-5 h-5" />
                    <span className="absolute w-2 h-2 rounded-full top-1 right-1 bg-sacred-gold"></span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-300 hover:text-white"
                  >
                    <User className="w-5 h-5" />
                  </Button>
                </>
              )}
            </div>

            {/* Auth Buttons / User Menu */}
            {user ? (
              <UserMenu user={user} onSignOut={handleSignOut} />
            ) : (
              <AuthButtons />
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="text-white lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <MobileNavigation
            navigation={navigation}
            pathname={pathname}
            user={user}
            onSignOut={handleSignOut}
            onClose={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>
    </nav>
  );
}

function NavLinkWithSubmenu({
  item,
  pathname,
}: {
  item: NavItem;
  pathname: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const isActive = isActiveLink(pathname, item.href);

  if (item.children) {
    return (
      <div
        className="relative"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        <button
          className={cn(
            "flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors",
            isActive ? "text-sacred-gold" : "text-gray-300 hover:text-white"
          )}
        >
          {item.icon && <item.icon className="w-4 h-4" />}
          <span>{item.label}</span>
          <ChevronDown className="w-4 h-4" />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute left-0 w-48 mt-2 overflow-hidden border rounded-lg shadow-xl top-full backdrop-blur-xl bg-black/80 border-white/20"
            >
              {item.children.map((child) => (
                <Link
                  key={child.href}
                  href={child.href}
                  className="block px-4 py-2 text-sm text-gray-300 transition-colors hover:text-white hover:bg-white/10"
                >
                  {child.label}
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors",
        isActive ? "text-sacred-gold" : "text-gray-300 hover:text-white"
      )}
    >
      {item.icon && <item.icon className="w-4 h-4" />}
      <span>{item.label}</span>
    </Link>
  );
}

function UserMenu({ user, onSignOut }: { user: any; onSignOut: () => void }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-white"
      >
        <UserCircle className="w-5 h-5" />
        <span className="hidden md:inline">{user.firstName || user.email}</span>
        <ChevronDown className="w-4 h-4" />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute right-0 w-48 mt-2 overflow-hidden border rounded-lg shadow-xl backdrop-blur-xl bg-black/80 border-white/20"
          >
            <Link
              href="/dashboard"
              className="block px-4 py-2 text-sm text-gray-300 transition-colors hover:text-white hover:bg-white/10"
            >
              <BarChart3 className="inline w-4 h-4 mr-2" />
              Dashboard
            </Link>
            <Link
              href="/profile"
              className="block px-4 py-2 text-sm text-gray-300 transition-colors hover:text-white hover:bg-white/10"
            >
              <UserCircle className="inline w-4 h-4 mr-2" />
              Profil
            </Link>
            <Link
              href="/favorites"
              className="block px-4 py-2 text-sm text-gray-300 transition-colors hover:text-white hover:bg-white/10"
            >
              <Heart className="inline w-4 h-4 mr-2" />
              Ulubione
            </Link>
            {user.role === "admin" && (
              <Link
                href="/admin"
                className="block px-4 py-2 text-sm text-gray-300 transition-colors hover:text-white hover:bg-white/10"
              >
                <Settings className="inline w-4 h-4 mr-2" />
                Panel admina
              </Link>
            )}
            <button
              onClick={onSignOut}
              className="block w-full px-4 py-2 text-sm text-left text-gray-300 transition-colors hover:text-white hover:bg-white/10"
            >
              <LogOut className="inline w-4 h-4 mr-2" />
              Wyloguj
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AuthButtons() {
  return (
    <div className="flex items-center space-x-3">
      <Link href="/login">
        <Button
          variant="ghost"
          size="sm"
          className="hidden text-white md:inline-flex"
        >
          Zaloguj się
        </Button>
      </Link>
      <Link href="/register">
        <Button variant="golden" size="sm">
          Załóż konto
        </Button>
      </Link>
    </div>
  );
}

function MobileNavigation({
  navigation,
  pathname,
  user,
  onSignOut,
  onClose,
}: any) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="border-t lg:hidden backdrop-blur-xl bg-black/90 border-white/10"
    >
      <div className="container px-4 py-4 mx-auto">
        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
            <input
              type="text"
              placeholder="Szukaj..."
              className="w-full py-2 pl-10 pr-4 text-white placeholder-gray-400 border rounded-lg bg-white/10 border-white/20 focus:outline-none focus:border-sacred-gold"
            />
          </div>
        </div>

        {/* Navigation Links */}
        {navigation.map((item: NavItem) => (
          <div key={item.href} className="mb-2">
            <Link
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors",
                isActiveLink(pathname, item.href)
                  ? "bg-sacred-gold/20 text-sacred-gold"
                  : "text-gray-300 hover:bg-white/10 hover:text-white"
              )}
            >
              {item.icon && <item.icon className="w-5 h-5" />}
              <span>{item.label}</span>
            </Link>

            {item.children && (
              <div className="mt-1 ml-8 space-y-1">
                {item.children.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    onClick={onClose}
                    className="block px-4 py-2 text-sm text-gray-400 transition-colors hover:text-white"
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* User Section */}
        {user ? (
          <div className="pt-4 mt-4 border-t border-white/10">
            <div className="px-4 py-2 text-sm text-gray-400">
              Zalogowany jako: {user.email}
            </div>
            <button
              onClick={() => {
                onSignOut();
                onClose();
              }}
              className="w-full px-4 py-3 text-left text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
            >
              <LogOut className="inline w-5 h-5 mr-3" />
              Wyloguj
            </button>
          </div>
        ) : (
          <div className="pt-4 mt-4 space-y-2 border-t border-white/10">
            <Link href="/login" onClick={onClose}>
              <Button variant="glass" className="w-full">
                Zaloguj się
              </Button>
            </Link>
            <Link href="/register" onClick={onClose}>
              <Button variant="golden" className="w-full">
                Załóż konto
              </Button>
            </Link>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function getNavigation(userRole?: string) {
  const baseNavigation: NavItem[] = [
    { label: "Strona główna", href: "/", icon: Home },
    { label: "Znajdź kościół", href: "/church-finder", icon: Church },
    {
      label: "Biblioteka",
      href: "/library",
      icon: BookOpen,
      children: [
        { label: "Modlitwy", href: "/library/prayers" },
        { label: "Pieśni", href: "/library/songs" },
        { label: "Książki", href: "/library/books" },
        { label: "Audiobooki", href: "/library/audiobooks" },
      ],
    },
    { label: "Transmisje", href: "/live", icon: Radio },
    { label: "Zamów Mszę", href: "/order-mass", icon: Calendar },
    { label: "Wiadomości", href: "/messages", icon: MessageSquare },
    { label: "Akademia", href: "/academy", icon: GraduationCap },
  ];

  if (userRole === "admin") {
    baseNavigation.push({
      label: "Admin",
      href: "/admin",
      icon: Settings,
      children: [
        { label: "Dashboard", href: "/admin/dashboard" },
        { label: "Intencje", href: "/admin/intentions" },
        { label: "Użytkownicy", href: "/admin/users" },
        { label: "Raporty", href: "/admin/reports" },
      ],
    });
  }

  return baseNavigation;
}

function isActiveLink(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname.startsWith(href);
}
