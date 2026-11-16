import type {Metadata} from 'next';
import { Plus_Jakarta_Sans, Outfit, Fraunces } from 'next/font/google';
import './globals.css'; // Global styles
import { AuthProvider } from '@/context/AuthContext';
import ErrorBoundary from '@/components/ErrorBoundary';
import ProtectedRoute from '@/components/ProtectedRoute';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-headline',
  display: 'swap',
});

const fraunces = Fraunces({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Elo Escolar - Angola | Sistema Integrado de Gestão Escolar',
  description: 'O elo definitivo entre a família e a escola em Angola. Do Ensino Primário ao Secundário.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="pt-AO" className={`${jakarta.variable} ${outfit.variable} ${fraunces.variable}`}>
      <body className="bg-background text-on-surface font-sans antialiased overflow-x-hidden min-h-screen" suppressHydrationWarning>
        <ErrorBoundary>
          <AuthProvider>
            <ProtectedRoute>
              {children}
            </ProtectedRoute>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
