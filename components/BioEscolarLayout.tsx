'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Bell, 
  HelpCircle, 
  ChevronDown,
  Home,
  SlidersHorizontal,
  DoorOpen,
  QrCode,
  Megaphone,
  Mail,
  Users,
  Contact,
  GraduationCap,
  BookOpen,
  Coins,
  Calendar,
  BarChart3,
  Settings
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface BioEscolarLayoutProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export default function BioEscolarLayout({
  title,
  description,
  icon,
  actions,
  children
}: BioEscolarLayoutProps) {
  const pathname = usePathname();
  const { profile, isPrimaryAdmin } = useAuth();

  // 14 horizontal navigation dock items matching Image 2 exactly
  const navDockItems = [
    { label: 'Painel', href: '/', icon: Home, match: (p: string) => p === '/' },
    { label: 'Administração', href: '/admin', icon: SlidersHorizontal, match: (p: string) => p === '/admin' || p.startsWith('/admin/users') },
    { label: 'Portaria', href: '/porter', icon: DoorOpen, match: (p: string) => p.startsWith('/porter') },
    { label: 'Gestor de QR', href: '/admin/qr-generator', icon: QrCode, match: (p: string) => p.startsWith('/admin/qr-generator') },
    { label: 'Mural', href: '/feed', icon: Megaphone, match: (p: string) => p.startsWith('/feed') },
    { label: 'Mensagens', href: '/chat', icon: Mail, match: (p: string) => p.startsWith('/chat'), badge: 3 },
    { label: 'Alunos', href: '/students', icon: Users, match: (p: string) => p.startsWith('/students') },
    { label: 'Funcionários', href: '/staff', icon: Contact, match: (p: string) => p.startsWith('/staff') },
    { label: 'Gestão Académica', href: '/academic', icon: GraduationCap, match: (p: string) => p.startsWith('/academic') },
    { label: 'Controlo Escolar', href: '/control', icon: BookOpen, match: (p: string) => p.startsWith('/control') },
    { label: 'Finanças', href: '/financial', icon: Coins, match: (p: string) => p.startsWith('/financial') },
    { label: 'Calendários', href: '/calendar', icon: Calendar, match: (p: string) => p.startsWith('/calendar') },
    { label: 'Relatórios', href: '/claims', icon: BarChart3, match: (p: string) => p.startsWith('/claims') },
    { label: 'Definições', href: '/settings', icon: Settings, match: (p: string) => p.startsWith('/settings') || p.startsWith('/profile') }
  ];

  return (
    <div className="min-h-screen bg-[#020817] text-white flex flex-col relative font-sans selection:bg-cyan-500/30 overflow-x-hidden">
      
      {/* Top Background Campus Architecture Photograph with gradient blend */}
      <div className="absolute top-0 right-0 w-full sm:w-[60%] lg:w-[48%] h-[340px] z-0 pointer-events-none overflow-hidden">
        <div 
          className="w-full h-full bg-cover bg-no-repeat bg-center"
          style={{ backgroundImage: `url('/images/campus-header.jpg')` }}
        />
        {/* Soft navy gradient overlays blending the image smoothly into the page */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#020817] via-[#020817]/65 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020817] via-[#020817]/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#020817] via-transparent to-transparent" />
        <div className="absolute inset-0 bg-blue-950/25 mix-blend-multiply" />
      </div>

      {/* Global Top Bar */}
      <header className="relative z-20 w-full px-4 sm:px-8 pt-5 pb-3 flex items-center justify-between">
        
        {/* Left: Bio Escolar® Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          {/* Logo mark: Glowing cyan mortarboard resting over an open book */}
          <div className="relative w-10 h-10 flex items-center justify-center transition-transform group-hover:scale-105">
            <svg 
              viewBox="0 0 64 64" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="w-10 h-10 drop-shadow-[0_0_12px_rgba(6,182,212,0.8)]"
            >
              <defs>
                <linearGradient id="capGradLayout" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#0284c7" />
                </linearGradient>
                <linearGradient id="bookGradLayout" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#22d3ee" />
                  <stop offset="100%" stopColor="#0369a1" />
                </linearGradient>
              </defs>
              {/* Mortarboard Diamond */}
              <polygon points="32,8 58,19 32,30 6,19" fill="url(#capGradLayout)" stroke="#38bdf8" strokeWidth="1.5" />
              {/* Cap under-rim */}
              <path d="M19 25v10c0 4.5 5.8 8 13 8s13-3.5 13-8V25" fill="none" stroke="#38bdf8" strokeWidth="2" />
              {/* Tassel */}
              <path d="M50 20v14c0 1.5 1 2 2 2" stroke="#bae6fd" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="52" cy="37" r="1.5" fill="#bae6fd" />
              {/* Open Book Base */}
              <path d="M14 42c6-3 12-3 18 1 6-4 12-4 18-1v10c-6-3-12-3-18 1-6-4-12-4-18-1V42z" fill="url(#bookGradLayout)" opacity="0.9" stroke="#7dd3fc" strokeWidth="1.2" />
              <line x1="32" y1="43" x2="32" y2="53" stroke="#e0f2fe" strokeWidth="1.5" />
            </svg>
          </div>

          <div>
            <div className="flex items-baseline">
              <span className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Bio Escolar
              </span>
              <span className="text-[11px] font-bold text-white ml-0.5 relative -top-2">
                ®
              </span>
            </div>
            <span className="text-[9px] tracking-[0.22em] font-semibold text-cyan-400 block -mt-1 uppercase">
              PLATAFORMA DIGITAL
            </span>
          </div>
        </Link>

        {/* Right: Actions, Notifications & User Info */}
        <div className="flex items-center gap-3 sm:gap-4">
          
          {/* Notification Button with red badge "1" */}
          <Link 
            href="/feed"
            aria-label="Notificações" 
            className="w-10 h-10 rounded-full bg-[#0a193d]/60 hover:bg-[#0f2456] border border-blue-500/20 backdrop-blur-md flex items-center justify-center text-blue-200 hover:text-white transition-all relative group"
          >
            <Bell className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#ef4444] text-white font-bold text-[9px] flex items-center justify-center shadow-[0_0_8px_rgba(239,68,68,0.8)] border border-[#020817]">
              1
            </span>
          </Link>

          {/* Help Button (?) */}
          <Link 
            href="/support"
            aria-label="Ajuda e Suporte" 
            className="w-10 h-10 rounded-full bg-[#0a193d]/60 hover:bg-[#0f2456] border border-blue-500/20 backdrop-blur-md flex items-center justify-center text-blue-200 hover:text-white transition-all group"
          >
            <HelpCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </Link>

          {/* User Avatar + Profile Label */}
          <Link href="/profile" className="flex items-center gap-2.5 pl-1 cursor-pointer select-none group">
            {/* Golden Circular Avatar with "AG" */}
            <div className="w-10 h-10 rounded-full bg-[#f0a828] text-slate-900 font-extrabold text-sm flex items-center justify-center shadow-[0_0_12px_rgba(240,168,40,0.3)] flex-shrink-0 group-hover:scale-105 transition-transform">
              {profile?.name ? profile.name.slice(0, 2).toUpperCase() : 'AG'}
            </div>
            <div className="hidden sm:block text-left">
              <div className="flex items-center gap-1">
                <span className="text-sm font-bold text-white leading-tight group-hover:text-cyan-300 transition-colors">
                  {isPrimaryAdmin ? 'Administrador' : profile?.name || 'Administrador'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-300" />
              </div>
              <span className="text-[11px] text-slate-400 font-normal leading-tight block">
                GPA Angola
              </span>
            </div>
          </Link>

        </div>
      </header>

      {/* Main Content Shell */}
      <main className="relative z-10 flex-1 px-4 sm:px-8 pb-10 max-w-[1720px] w-full mx-auto flex flex-col gap-6">

        {/* Section Title Section */}
        <div className="pt-2 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <div className="flex items-center gap-3">
              {icon ? (
                <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-400/30 text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.6)]">
                  {icon}
                </div>
              ) : (
                /* Default glowing cyan bar chart icon */
                <div className="flex items-end gap-1 h-7">
                  <div className="w-1.5 h-3 bg-cyan-400 rounded-full drop-shadow-[0_0_6px_rgba(6,182,212,0.8)]" />
                  <div className="w-1.5 h-4.5 bg-cyan-400 rounded-full drop-shadow-[0_0_6px_rgba(6,182,212,0.8)]" />
                  <div className="w-1.5 h-6 bg-cyan-400 rounded-full drop-shadow-[0_0_6px_rgba(6,182,212,0.8)]" />
                  <div className="w-1.5 h-7.5 bg-cyan-400 rounded-full drop-shadow-[0_0_6px_rgba(6,182,212,0.8)]" />
                </div>
              )}

              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {title}
              </h1>
            </div>
            {description && (
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
                {description}
              </p>
            )}
          </div>

          {actions && (
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {actions}
            </div>
          )}
        </div>

        {/* 14-Item Horizontal Dock Navigation Bar */}
        <nav 
          aria-label="Navegação Principal" 
          className="w-full bg-[#030d24]/75 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-1.5 flex items-center justify-between gap-1 shadow-2xl overflow-x-auto no-scrollbar"
        >
          {navDockItems.map((item, idx) => {
            const Icon = item.icon;
            const isActive = item.match(pathname);

            if (isActive) {
              return (
                <div 
                  key={idx}
                  className="flex-1 min-w-[80px] max-w-[120px] py-2 px-2.5 rounded-xl bg-gradient-to-r from-[#0062eb] via-[#007cf8] to-[#0096ff] border border-cyan-400/50 shadow-[0_0_24px_rgba(0,132,255,0.7),inset_0_1px_1px_rgba(255,255,255,0.4)] flex flex-col items-center justify-center text-white cursor-pointer select-none transition-all flex-shrink-0"
                >
                  <Icon className="w-5 h-5 mb-1 stroke-[2.2] text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.6)]" />
                  <span className="text-[11px] font-bold text-center leading-tight whitespace-nowrap">
                    {item.label}
                  </span>
                </div>
              );
            }

            return (
              <Link
                key={idx}
                href={item.href}
                className="flex-1 min-w-[76px] max-w-[115px] py-2 px-1 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.04] transition-all flex flex-col items-center justify-center flex-shrink-0 group relative"
              >
                <div className="relative">
                  <Icon className="w-5 h-5 mb-1 group-hover:scale-110 group-hover:text-cyan-400 transition-all stroke-[1.8]" />
                  {item.badge && (
                    <span className="absolute -top-1.5 -right-2 w-3.5 h-3.5 rounded-full bg-rose-500 text-white font-bold text-[8px] flex items-center justify-center shadow-[0_0_6px_rgba(244,63,94,0.8)] border border-[#030d24]">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] sm:text-[11px] font-medium text-center leading-tight whitespace-nowrap truncate max-w-full px-1">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Page Content */}
        <div className="w-full">
          {children}
        </div>

      </main>

    </div>
  );
}
