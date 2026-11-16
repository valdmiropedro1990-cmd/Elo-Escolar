'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { 
  Globe,
  LayoutDashboard, 
  GraduationCap, 
  BarChart3, 
  CalendarDays, 
  Wallet, 
  Plus, 
  HelpCircle, 
  Settings,
  Sparkles,
  Menu,
  X,
  BookOpen,
  ClipboardCheck,
  LogOut,
  MessageSquare,
  UploadCloud,
  ShieldCheck,
  Users,
  User,
  Scan,
  QrCode
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/context/AuthContext';

const Sidebar = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = React.useState(false);
  const { profile, isAdmin, isPrimaryAdmin, isUser, signOut } = useAuth();

  const adminItems = [
    { name: 'Painel', icon: LayoutDashboard, href: '/' },
    { name: 'Administração', icon: ShieldCheck, href: '/admin' },
    { name: 'Portaria & QR', icon: Scan, href: '/porter' },
    { name: 'Gerador de Passes', icon: QrCode, href: '/admin/qr-generator' },
    { name: 'Alunos', icon: GraduationCap, href: '/students' },
    { name: 'Funcionários', icon: Users, href: '/staff' },
    { name: 'Gestão Académica', icon: BookOpen, href: '/academic' },
    { name: 'Controlo & Pautas', icon: ClipboardCheck, href: '/control' },
    { name: 'Financeiro & AGT', icon: Wallet, href: '/financial' },
    { name: 'Transporte Escolar', icon: LayoutDashboard, href: '/transport' },
    { name: 'Cantina & Refeitório', icon: Wallet, href: '/canteen' },
    { name: 'Comunicações SMS/WA', icon: MessageSquare, href: '/communications' },
    { name: 'Mural Oficial', icon: Globe, href: '/feed' },
    { name: 'Mensagens / IA', icon: MessageSquare, href: '/chat' },
    { name: 'Calendários', icon: CalendarDays, href: '/calendar' },
    { name: 'Funil de Vendas', icon: BarChart3, href: '/funnel' },
    { name: 'Verificação Pública', icon: ShieldCheck, href: '/verify' },
    { name: 'Meu Perfil', icon: User, href: '/profile' },
    ...(isPrimaryAdmin ? [{ name: 'Gestão de Contas', icon: Users, href: '/admin/users' }] : []),
  ];

  const userItems = [
    { name: 'Painel', icon: LayoutDashboard, href: '/' },
    { name: 'Mural', icon: Globe, href: '/feed' },
    { name: 'Mensagens', icon: MessageSquare, href: '/chat' },
    { name: 'Minhas Notas', icon: ClipboardCheck, href: '/control' },
    { name: 'Calendários', icon: CalendarDays, href: '/calendar' },
    { name: 'Reclamações', icon: MessageSquare, href: '/claims' },
    { name: 'Pagamentos', icon: UploadCloud, href: '/payments/upload' },
    { name: 'Meu Perfil', icon: User, href: '/profile' },
  ];

  const navItems = isAdmin ? adminItems : userItems;

  const toggleSidebar = () => setIsOpen(!isOpen);

  const [imageError, setImageError] = React.useState(false);

  return (
    <>
      {/* Mobile Toggle */}
      <button 
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-[60] p-2 bg-surface-container-high rounded-xl text-white border border-outline-variant/10 shadow-lg"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay */}
      <AnimatePresence>
        {(isOpen || isEnrollModalOpen) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setIsOpen(false);
              setIsEnrollModalOpen(false);
            }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[55]"
          />
        )}
      </AnimatePresence>

      {/* Enrollment Modal */}
      <AnimatePresence>
        {isEnrollModalOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 m-auto w-[90%] max-w-lg h-max bg-surface-container-low p-8 rounded-3xl z-[60] border border-outline-variant/10 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-headline font-bold text-white">Nova Matrícula</h2>
              <button onClick={() => setIsEnrollModalOpen(false)} className="p-2 hover:bg-surface-container-highest rounded-full transition-colors">
                <X className="w-6 h-6 text-on-surface-variant" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20 flex gap-4 items-center">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-on-primary-fixed">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Processo de Admissão</p>
                  <p className="text-xs text-on-surface-variant">Inicie o registo de um novo aluno no sistema.</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Nome Completo do Aluno</label>
                  <input type="text" className="w-full bg-surface-container-highest border border-outline-variant/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary/50 outline-none transition-all" placeholder="Ex: João Manuel" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Nível de Ensino</label>
                  <select className="w-full bg-surface-container-highest border border-outline-variant/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary/50 outline-none transition-all appearance-none">
                    <option>Ensino Primário</option>
                    <option>I Ciclo do Ensino Secundário</option>
                    <option>II Ciclo do Ensino Secundário</option>
                  </select>
                </div>
              </div>
              
              <button className="w-full py-4 bg-primary text-on-primary-fixed font-black rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                CONTINUAR PARA ETAPA 2
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <aside className={`fixed left-0 top-0 h-screen w-64 bg-surface-container-low/95 backdrop-blur-xl flex flex-col gap-2 p-4 z-[58] border-r border-outline-variant/10 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center gap-3 px-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-surface-container-highest flex items-center justify-center shadow-lg overflow-hidden relative">
            {!imageError ? (
              <Image 
                src="/logo.png" 
                alt="Elo Escolar Logo" 
                fill 
                className="object-contain p-1"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary via-[#b9c3ff] to-secondary flex items-center justify-center">
                <Sparkles className="lucide lucide-sparkles text-on-primary-fixed w-6 h-6" />
              </div>
            )}
          </div>
          <div>
            <h1 className="font-headline font-bold text-lg text-white leading-tight">Elo Escolar</h1>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">O Curador Digital</p>
          </div>
        </div>

        <nav className="flex-1 flex flex-col gap-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`group relative flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors duration-300 active:scale-[0.98] ${
                  isActive 
                    ? 'text-white' 
                    : 'text-on-surface-variant hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="sidebar-active-pill"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 via-primary/10 to-secondary/5 border border-primary/25 shadow-[0_0_24px_-6px_rgba(168,181,255,0.45)]"
                  />
                )}
                <span className="absolute inset-0 rounded-xl bg-surface-container-highest/0 group-hover:bg-surface-container-highest/60 transition-colors duration-300" />
                <item.icon className={`relative w-[18px] h-[18px] transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-primary' : ''}`} />
                <span className="relative font-medium text-sm">{item.name}</span>
                {isActive && <span className="relative ml-auto w-1.5 h-1.5 rounded-full bg-secondary shadow-[0_0_10px_rgba(126,224,195,0.9)]" />}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-4 flex flex-col gap-1 border-t border-outline-variant/10">
          {isAdmin && (
            <button 
              onClick={() => {
                setIsOpen(false);
                setIsEnrollModalOpen(true);
              }}
              className="w-full py-3 px-4 mb-4 rounded-xl bg-gradient-to-r from-primary via-[#b9c3ff] to-secondary bg-[length:200%_100%] hover:bg-right text-on-primary-fixed font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/10 hover:opacity-90 transition-opacity active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              Nova Matrícula
            </button>
          )}
          <Link href="/support" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-on-surface-variant hover:bg-surface-container-highest transition-all">
            <HelpCircle className="w-5 h-5" />
            <span className="font-medium text-sm">Suporte</span>
          </Link>
          <Link href="/settings" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-on-surface-variant hover:bg-surface-container-highest transition-all">
            <Settings className="w-5 h-5" />
            <span className="font-medium text-sm">Definições</span>
          </Link>
          
          {profile?.uid === 'demo-admin' || profile?.uid?.startsWith('local-') ? (
            <button 
              onClick={() => {
                setIsOpen(false);
                signOut();
              }} 
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-error/70 hover:bg-error/10 hover:text-error transition-all mt-2"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium text-sm">Sair</span>
            </button>
          ) : profile?.uid === 'guest-admin' ? (
            <Link 
              href="/login" 
              onClick={() => setIsOpen(false)} 
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-primary hover:bg-primary/10 transition-all mt-2 border border-primary/20"
            >
              <LogOut className="w-5 h-5 rotate-180" />
              <span className="font-medium text-sm">Entrar (Admin)</span>
            </Link>
          ) : (
            <button 
              onClick={() => {
                setIsOpen(false);
                signOut();
              }} 
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-error/70 hover:bg-error/10 hover:text-error transition-all mt-2"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium text-sm">Sair</span>
            </button>
          )}
          <div className="mt-8 px-4 py-3 bg-surface-container-highest/30 rounded-2xl border border-outline-variant/5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-tertiary/20 to-tertiary flex items-center justify-center text-on-tertiary shadow-lg">
              <span className="font-headline font-black text-xs">VM</span>
            </div>
            <div>
              <p className="text-[9px] text-on-surface-variant uppercase tracking-[0.2em] font-bold">Criado por</p>
              <p className="text-xs font-black text-white whitespace-nowrap">V-Mágica Tech</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
