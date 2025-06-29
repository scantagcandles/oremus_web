import React from 'react';

interface AuthCardProps {
  children: React.ReactNode;
}

export function AuthCard({ children }: AuthCardProps) {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-500 via-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md backdrop-blur-lg bg-white/10 rounded-2xl shadow-2xl p-8 space-y-6 border border-white/20">
        {children}
      </div>
    </div>
  );
}
