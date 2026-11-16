'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, useInView, animate } from 'motion/react';
import {
  Users,
  ShieldCheck,
  Settings,
  Database,
  Activity,
  Lock,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  HardDrive,
  Sparkles,
  GraduationCap,
  BookOpen,
  QrCode,
  Award,
  CreditCard,
  Calendar,
  Bell,
  Zap,
  Sliders,
  BadgeCheck,
  Phone,
  LogOut,
  Globe,
  ScanLine,
  Plus,
  Check,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

const ease = [0.22, 1, 0.36, 1] as const;

function CountUp({ to, suffix = '' }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, { duration: 1.4, ease, onUpdate: (v) => setVal(Math.round(v)) });
    return () => controls.stop();
  }, [inView, to]);
  return (
    <span ref={ref}>
      {val.toLocaleString('pt-PT')}
      {suffix}
    </span>
  );
}

function SpotlightCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--x', `${e.clientX - r.left}px`);
    el.style.setProperty('--y', `${e.clientY - r.top}px`);
  };
  return (
    <div ref={ref} onMouseMove={onMove} className={`group relative overflow-hidden glow-border ${className}`}>
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"
        style={{
          background:
            'radial-gradient(380px circle at var(--x, 50%) var(--y, 50%), rgba(168,181,255,0.14), transparent 45%)',
        }}
      />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}

export default function AdminDashboard() {
  const { profile, isPrimaryAdmin, isAdmin, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [systemStats, setSystemStats] = useState({
    users: 3,
    students: 12,
    staff: 8,
    turmas: 6,
    storageUsage: '1.2 GB',
  });

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/');
    }
  }, [isAdmin, authLoading, router]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [{ count: usersCount }, { count: studentsCount }, { count: staffCount }, { count: turmasCount }] =
          await Promise.all([
            supabase.from('profiles').select('*', { count: 'exact', head: true }),
            supabase.from('students').select('*', { count: 'exact', head: true }),
            supabase.from('staff').select('*', { count: 'exact', head: true }),
            supabase.from('classes').select('*', { count: 'exact', head: true }),
          ]);

        setSystemStats({
          users: usersCount || 3,
          students: studentsCount || 12,
          staff: staffCount || 8,
          turmas: turmasCount || 6,
          storageUsage: '1.2 GB',
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    if (isAdmin) fetchStats();
  }, [isAdmin]);

  const triggerAction = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  if (authLoading || !isAdmin) return null;

  const featuredAreas = [
    {
      title: 'Gestão Académica & Matrículas',
      desc: 'Turmas, disciplinas, vagas e processos de admissão escolar.',
      image: '/images/secretaria.jpg',
      badge: 'Académico',
      href: '/academic',
      cta: 'Gerir turmas',
    },
    {
      title: 'Controlo Escolar & Pautas',
      desc: 'Lançamento de notas MAC, NPP, NPT e emissão de boletins.',
      image: '/images/pautas.jpg',
      badge: 'Avaliação',
      href: '/control',
      cta: 'Abrir pautas',
    },
    {
      title: 'Tesouraria & Propinas',
      desc: 'Validação Multicaixa Express, receitas e recibos digitais.',
      image: '/images/propinas.jpg',
      badge: 'Financeiro',
      href: '/financial',
      cta: 'Ver finanças',
    },
    {
      title: 'Portaria QR & Acessos',
      desc: 'Controlo em tempo real de entradas e saídas no recinto.',
      image: '/images/portaria.jpg',
      badge: 'Segurança',
      href: '/porter',
      cta: 'Abrir leitor',
    },
    {
      title: 'Mural & Comunicados',
      desc: 'Publicação de circulares, eventos e avisos para as famílias.',
      image: '/images/mural.jpg',
      badge: 'Comunidade',
      href: '/feed',
      cta: 'Publicar aviso',
    },
    {
      title: 'Gestão de Contas & IA',
      desc: 'Permissões de utilizadores, suporte e assistente pedagógico.',
      image: '/images/ia-tutor.jpg',
      badge: 'Administração',
      href: isPrimaryAdmin ? '/admin/users' : '/chat',
      cta: isPrimaryAdmin ? 'Gerir contas' : 'Abrir assistente',
    },
  ];

  const allModules = [
    { title: 'Alunos', path: '/students', icon: GraduationCap, desc: 'Fichas e histórico' },
    { title: 'Funcionários', path: '/staff', icon: Users, desc: 'Corpo docente' },
    { title: 'Gestão Académica', path: '/academic', icon: BookOpen, desc: 'Turmas e cursos' },
    { title: 'Controlo Escolar', path: '/control', icon: Award, desc: 'Notas e pautas' },
    { title: 'Portaria QR', path: '/porter', icon: QrCode, desc: 'Leitor de acessos' },
    { title: 'Gerador de QR', path: '/admin/qr-generator', icon: Sparkles, desc: 'Passes escolares' },
    { title: 'Financeiro', path: '/financial', icon: CreditCard, desc: 'Propinas e caixa' },
    { title: 'Calendários', path: '/calendar', icon: Calendar, desc: 'Provas e horários' },
    { title: 'Mural', path: '/feed', icon: Bell, desc: 'Avisos oficiais' },
    { title: 'Mensagens', path: '/chat', icon: Zap, desc: 'Canal directo' },
    { title: 'Funil de Vendas', path: '/funnel', icon: Sliders, desc: 'Novas admissões' },
    { title: 'Gestão de Contas', path: '/admin/users', icon: ShieldCheck, desc: 'Utilizadores' },
    { title: 'Definições', path: '/settings', icon: Settings, desc: 'Sistema e dados' },
    { title: 'Meu Perfil', path: '/profile', icon: BadgeCheck, desc: 'Minha conta' },
    { title: 'Suporte', path: '/support', icon: Phone, desc: 'Ajuda 24/7' },
    { title: 'Site Público', path: '/', icon: Globe, desc: 'Página inicial' },
  ];

  const topLinks = [
    { label: 'Visão Geral', href: '/admin' },
    { label: 'Alunos', href: '/students' },
    { label: 'Académico', href: '/academic' },
    { label: 'Portaria QR', href: '/porter' },
    { label: 'Financeiro', href: '/financial' },
    { label: 'Mural', href: '/feed' },
  ];

  return (
    <div className="relative min-h-screen bg-background text-on-surface overflow-x-hidden">
      {/* Ambient aurora */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute -top-40 -left-32 w-[540px] h-[540px] rounded-full bg-primary/20 blur-[120px] animate-aurora" />
        <div className="absolute top-1/3 right-[-120px] w-[480px] h-[480px] rounded-full bg-secondary/12 blur-[120px] animate-aurora [animation-delay:-7s]" />
      </div>

      {/* Toast notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-[80] glass rounded-2xl px-5 py-3.5 flex items-center gap-3 shadow-2xl border border-secondary/30"
          >
            <span className="w-7 h-7 rounded-full bg-secondary/20 flex items-center justify-center">
              <Check className="w-4 h-4 text-secondary" />
            </span>
            <p className="text-xs font-medium text-white">{toast}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================== WEBSITE-STYLE NAVBAR ============================== */}
      <header className="sticky top-0 z-50 px-4 pt-4">
        <nav className="max-w-6xl mx-auto glass rounded-2xl px-4 sm:px-6 h-16 flex items-center justify-between shadow-[0_12px_40px_-12px_rgba(0,0,0,0.6)]">
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary via-[#b9c3ff] to-secondary flex items-center justify-center shadow-lg transition-transform duration-500 group-hover:rotate-[10deg]">
              <Sparkles className="w-4 h-4 text-on-primary" />
            </span>
            <span className="leading-none">
              <span className="block font-headline font-semibold text-base text-white">Elo Escolar</span>
              <span className="block text-[9px] uppercase tracking-[0.26em] text-secondary mt-1">Portal Institucional</span>
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {topLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`px-3.5 py-2 rounded-full text-[13px] font-medium transition-colors ${
                  l.href === '/admin'
                    ? 'bg-white/10 text-white'
                    : 'text-on-surface-variant hover:text-white hover:bg-white/5'
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium text-on-surface-variant hover:text-white hover:bg-white/5"
            >
              <Globe className="w-3.5 h-3.5 text-primary" />
              Ver Site
            </Link>
            <Link
              href="/profile"
              className="hidden sm:inline-flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full bg-white/[0.06] border border-white/10 hover:bg-white/10"
            >
              <span className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-[11px] font-bold text-[#0b1020]">
                {(profile?.name || 'AD').slice(0, 2).toUpperCase()}
              </span>
              <span className="text-xs font-medium text-white max-w-[100px] truncate">
                {profile?.name || 'Administrador'}
              </span>
            </Link>
            <button
              onClick={() => signOut()}
              title="Sair"
              className="p-2 rounded-full text-on-surface-variant hover:text-error hover:bg-error/10"
            >
              <LogOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMobileMenu((m) => !m)}
              className="lg:hidden p-2 rounded-full text-on-surface-variant hover:text-white hover:bg-white/5"
              aria-label="Menu"
            >
              {mobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>

        <AnimatePresence>
          {mobileMenu && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="max-w-6xl mx-auto mt-2 glass rounded-2xl p-3 lg:hidden"
            >
              {topLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileMenu(false)}
                  className="block px-4 py-2.5 rounded-xl text-sm text-white hover:bg-white/5"
                >
                  {l.label}
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-20 space-y-16">
        {/* ============================== EDITORIAL HERO BANNER ============================== */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease }}
          className="relative rounded-[32px] overflow-hidden border border-white/10 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)] min-h-[340px] flex items-end"
        >
          <Image
            src="/images/sala-aula.jpg"
            alt="Sala de aula em Angola"
            fill
            priority
            sizes="(max-width: 1200px) 100vw, 1152px"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b1020]/95 via-[#0b1020]/70 to-[#0b1020]/25" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b1020] via-transparent to-transparent" />

          <div className="relative z-10 w-full p-7 sm:p-12 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass text-[11px] font-medium text-secondary mb-4">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Sistema Activo · Ano Lectivo 2026/2027
              </span>
              <h1 className="font-headline font-light text-3xl sm:text-5xl tracking-[-0.03em] text-white leading-[1.08]">
                Centro de Comando{' '}
                <span className="font-serif italic font-normal text-gradient">Institucional</span>
              </h1>
              <p className="mt-3 text-sm sm:text-base text-white/80 leading-relaxed max-w-xl">
                Bem-vindo, {profile?.name || 'Administrador'}. Gere matrículas, pautas oficiais, propinas e
                segurança da portaria num ambiente fluido e elegante.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/academic"
                className="group inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-[#0b1020] text-xs font-semibold shadow-lg hover:-translate-y-0.5"
              >
                <Plus className="w-4 h-4" />
                Nova Matrícula
              </Link>
              <Link
                href="/porter"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full glass text-xs font-semibold text-white hover:bg-white/15"
              >
                <ScanLine className="w-4 h-4 text-secondary" />
                Portaria QR
              </Link>
              <Link
                href="/admin/qr-generator"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full glass text-xs font-semibold text-white hover:bg-white/15"
              >
                <QrCode className="w-4 h-4 text-primary" />
                Passes QR
              </Link>
            </div>
          </div>
        </motion.section>

        {/* ============================== LIVE METRICS ============================== */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Alunos Registados', value: systemStats.students, icon: GraduationCap, accent: 'from-primary/20' },
            { label: 'Docentes & Equipa', value: systemStats.staff, icon: Users, accent: 'from-secondary/20' },
            { label: 'Turmas Activas', value: systemStats.turmas, icon: BookOpen, accent: 'from-tertiary/20' },
            { label: 'Utilizadores', value: systemStats.users, icon: ShieldCheck, accent: 'from-[#d6c8ff]/20' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease, delay: i * 0.07 }}
            >
              <SpotlightCard className="rounded-3xl bg-surface-container/60 border border-white/[0.06] p-6 h-full">
                <div className={`absolute -top-10 -right-10 w-28 h-28 rounded-full bg-gradient-to-br ${stat.accent} to-transparent blur-2xl`} />
                <div className="flex items-center justify-between mb-4">
                  <span className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.06] flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-primary" />
                  </span>
                  <span className="text-[10px] uppercase tracking-widest text-secondary font-semibold">Ao vivo</span>
                </div>
                <p className="font-headline text-3xl sm:text-4xl font-light text-white">
                  <CountUp to={stat.value} />
                </p>
                <p className="mt-1 text-xs text-on-surface-variant">{stat.label}</p>
              </SpotlightCard>
            </motion.div>
          ))}
        </section>

        {/* ============================== FEATURED PORTAL AREAS ============================== */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-primary font-semibold">Áreas Principais</p>
              <h2 className="mt-2 font-headline text-3xl sm:text-4xl font-light tracking-[-0.03em] text-white">
                Gestão integrada num <span className="font-serif italic text-gradient">visual editorial</span>
              </h2>
            </div>
            <Link
              href="/settings"
              className="inline-flex items-center gap-2 text-xs font-semibold text-on-surface-variant hover:text-white"
            >
              <Settings className="w-4 h-4 text-primary" />
              Configurações globais
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredAreas.map((area, idx) => (
              <motion.div
                key={area.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.6, ease, delay: idx * 0.05 }}
              >
                <Link href={area.href} className="block h-full">
                  <SpotlightCard className="rounded-[28px] bg-surface-container/70 border border-white/[0.06] h-full hover:-translate-y-1 transition-transform duration-500">
                    <div className="flex flex-col h-full">
                      <div className="relative aspect-[16/10] m-2 rounded-[22px] overflow-hidden">
                        <Image
                          src={area.image}
                          alt={area.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0b1020]/85 via-[#0b1020]/15 to-transparent" />
                        <span className="absolute top-3 left-3 px-3 py-1 rounded-full glass text-[11px] text-white">
                          {area.badge}
                        </span>
                      </div>
                      <div className="p-6 pt-3 flex flex-col flex-1">
                        <h3 className="font-headline text-lg font-medium text-white">{area.title}</h3>
                        <p className="mt-1.5 text-[13px] text-on-surface-variant leading-relaxed">{area.desc}</p>
                        <span className="mt-auto pt-5 inline-flex items-center gap-2 text-xs font-semibold text-primary group-hover:text-white">
                          {area.cta}
                          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                        </span>
                      </div>
                    </div>
                  </SpotlightCard>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ============================== ALL 16 MODULES DIRECTORY ============================== */}
        <section>
          <div className="mb-8">
            <p className="text-[11px] uppercase tracking-[0.28em] text-secondary font-semibold">Directório Completo</p>
            <h2 className="mt-2 font-headline text-3xl font-light tracking-[-0.03em] text-white">
              Todos os <span className="font-serif italic text-gradient">módulos</span> do portal
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {allModules.map((mod) => (
              <Link key={mod.path + mod.title} href={mod.path} className="block h-full">
                <SpotlightCard className="rounded-2xl bg-surface-container/50 border border-white/[0.06] p-4 sm:p-5 h-full hover:bg-surface-container-high/70 transition-colors">
                  <div className="flex items-start justify-between">
                    <span className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/[0.06] flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-primary group-hover:to-secondary transition-all">
                      <mod.icon className="w-4 h-4 text-primary group-hover:text-[#0b1020] transition-colors" />
                    </span>
                    <ArrowUpRight className="w-4 h-4 text-on-surface-variant/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <h4 className="mt-3.5 text-sm font-semibold text-white">{mod.title}</h4>
                  <p className="mt-0.5 text-[11px] text-on-surface-variant">{mod.desc}</p>
                </SpotlightCard>
              </Link>
            ))}
          </div>
        </section>

        {/* ============================== SYSTEM & SECURITY CONTROLS ============================== */}
        <section className="glass glow-border rounded-[28px] p-7 sm:p-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-semibold text-tertiary uppercase tracking-widest">
                <Lock className="w-4 h-4" />
                Infraestrutura & Segurança
              </span>
              <h3 className="mt-2 font-headline text-2xl font-light text-white">
                Estado do servidor e acções rápidas
              </h3>
            </div>
            <div className="flex items-center gap-5 text-xs text-on-surface-variant">
              <span className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-primary" />
                Armazenamento: <strong className="text-white">{systemStats.storageUsage}</strong>
              </span>
              <span className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-secondary" />
                Estado: <strong className="text-secondary">Operacional</strong>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'Bloquear Novos Registos', msg: 'Registos públicos temporariamente bloqueados.' },
              { label: 'Forçar Logout Geral', msg: 'Sessões externas renovadas com segurança.' },
              { label: 'Backup da Base de Dados', msg: 'Cópia de segurança gerada com sucesso.' },
              { label: 'Limpar Cache de Sistema', msg: 'Cache do portal limpa e optimizada.' },
            ].map((btn, i) => (
              <button
                key={btn.label}
                onClick={() => triggerAction(btn.msg)}
                className={`px-4 py-3.5 rounded-2xl text-xs font-semibold border transition-all text-left flex items-center justify-between ${
                  i === 3
                    ? 'bg-error/10 border-error/20 text-error hover:bg-error/20'
                    : 'bg-white/[0.04] border-white/[0.08] text-white hover:bg-primary/15 hover:border-primary/30'
                }`}
              >
                <span>{btn.label}</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-60" />
              </button>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
