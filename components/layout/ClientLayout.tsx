"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Navigation } from "@/components/layout/Navigation";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  console.log("🔍 ClientLayout rendering:", { pathname });

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="pt-16">
        <div className="p-4">
          <div className="mb-4 text-center text-white">
            <h2 className="text-lg">✅ ClientLayout działa!</h2>
            <p className="text-sm opacity-70">Path: {pathname}</p>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
