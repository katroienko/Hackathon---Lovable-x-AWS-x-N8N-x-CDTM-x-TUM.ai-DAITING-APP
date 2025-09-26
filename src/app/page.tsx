'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import AuthForm from '@/components/AuthForm';
import Dashboard from '@/components/Dashboard';
import { AuthProvider } from '@/contexts/AuthContext';

function AppContent() {
  const { user, loading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100">
      {user ? <Dashboard /> : <AuthForm />}
    </main>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
