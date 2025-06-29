"use client";

import React from "react";
import {
  navigationBase,
  navigationItemBase,
  type NavigationItem,
} from "./utils";
import { twMerge } from "tailwind-merge";
import { VariantProps } from "class-variance-authority";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { IconButton } from "../forms/Button";

export interface NavbarProps extends VariantProps<typeof navigationBase> {
  logo?: React.ReactNode;
  items: NavigationItem[];
  rightContent?: React.ReactNode;
  className?: string;
  mobileBreakpoint?: "sm" | "md" | "lg" | "xl" | "2xl";
}

export const Navbar = ({
  variant = "default",
  position = "top",
  size = "md",
  logo,
  items,
  rightContent,
  className,
  mobileBreakpoint = "md",
}: NavbarProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const pathname = usePathname();

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const breakpointClasses = {
    sm: "sm:hidden",
    md: "md:hidden",
    lg: "lg:hidden",
    xl: "xl:hidden",
    "2xl": "2xl:hidden",
  };

  const mobileMenuClasses = {
    sm: "sm:flex",
    md: "md:flex",
    lg: "lg:flex",
    xl: "xl:flex",
    "2xl": "2xl:flex",
  };

  return (
    <nav
      className={twMerge(
        navigationBase({ variant, position, size }),
        "w-full",
        className
      )}
    >
      <div className="container h-full px-4 mx-auto">
        <div className="flex items-center justify-between h-full">
          {/* Logo */}
          {logo && (
            <Link href="/" className="shrink-0" onClick={closeMenu}>
              {logo}
            </Link>
          )}

          {/* Desktop Navigation */}
          <div
            className={twMerge(
              "hidden",
              mobileMenuClasses[mobileBreakpoint],
              "items-center gap-1"
            )}
          >
            {items.map((item) => (
              <NavbarItem
                key={item.href}
                item={item}
                isActive={pathname === item.href}
                size={size}
              />
            ))}
          </div>

          {/* Right Content */}
          {rightContent && (
            <div
              className={twMerge(
                "hidden",
                mobileMenuClasses[mobileBreakpoint],
                "items-center"
              )}
            >
              {rightContent}
            </div>
          )}

          {/* Mobile Menu Button */}
          <IconButton
            icon={isOpen ? <X /> : <Menu />}
            variant="ghost"
            className={twMerge("ml-2", breakpointClasses[mobileBreakpoint])}
            onClick={toggleMenu}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
          />
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              id="mobile-menu"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className={twMerge(
                "overflow-hidden",
                breakpointClasses[mobileBreakpoint]
              )}
            >
              <div className="py-4 space-y-1">
                {items.map((item) => (
                  <NavbarItem
                    key={item.href}
                    item={item}
                    isActive={pathname === item.href}
                    size={size}
                    isMobile
                    onClick={closeMenu}
                  />
                ))}
              </div>
              {rightContent && (
                <div className="py-4 border-t border-white/10">
                  {rightContent}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

interface NavbarItemProps extends VariantProps<typeof navigationItemBase> {
  item: NavigationItem;
  isActive?: boolean;
  isMobile?: boolean;
  onClick?: () => void;
}

const NavbarItem = ({
  item,
  isActive,
  size = "md",
  isMobile,
  onClick,
}: NavbarItemProps) => {
  return (
    <Link
      href={item.href}
      className={twMerge(
        navigationItemBase({
          variant: isActive ? "active" : "default",
          size,
        }),
        isMobile && "flex w-full"
      )}
      target={item.isExternal ? "_blank" : undefined}
      rel={item.isExternal ? "noopener noreferrer" : undefined}
      onClick={onClick}
    >
      {item.icon && (
        <span className={twMerge("shrink-0", isMobile ? "mr-3" : "mr-2")}>
          {item.icon}
        </span>
      )}
      {item.label}
    </Link>
  );
};
