'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useInView,
  animate,
  useMotionValueEvent,
} from 'motion/react';
import {
  ArrowRight,
  GraduationCap,
  ShieldCheck,
  CreditCard,
  QrCode,
  BookOpen,
  Sparkles,
  Users,
  Star,
  Phone,
  Mail,
  MapPin,
  Bell,
  Sliders,
  Calendar,
  Layers,
  Award,
  Zap,
  ArrowUpRight,
  BadgeCheck,
  Check,
  X,
  Quote,
  ScanLine,
  Wallet,
  TrendingUp,
  Menu,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const ease = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 28, filter: 'blur(6px)' },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.8, ease, delay: i * 0.08 },
  }),
};

function CountUp({ to, suffix = '', decimals = 0 }: { to: number; suffix?: string; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, { duration: 2.2, ease, onUpdate: (v) => setVal(v) });
    return () => controls.stop();
  }, [inView, to]);
  return (
    <span ref={ref}>
      {val.toLocaleString('pt-PT', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
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
    <div
      ref={ref}
      onMouseMove={onMove}
      className={`group relative overflow-hidden glow-border ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"
        style={{
          background:
            'radial-gradient(420px circle at var(--x, 50%) var(--y, 50%), rgba(168,181,255,0.14), transparent 45%)',
        }}
      />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}

const rotatingWords = ['famílias', 'professores', 'alunos', 'escolas'];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'all' | 'academic' | 'financial' | 'security'>('all');
  const [modalService, setModalService] = useState<any | null>(null);
  const [wordIdx, setWordIdx] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [reviewIdx, setReviewIdx] = useState(0);

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollY, scrollYProgress } = useScroll();
  const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroImgY = useTransform(heroProgress, [0, 1], [0, 120]);
  const heroTextY = useTransform(heroProgress, [0, 1], [0, -60]);
  const heroOpacity = useTransform(heroProgress, [0, 0.8], [1, 0]);

  useMotionValueEvent(scrollY, 'change', (v) => setScrolled(v > 24));

  useEffect(() => {
    const t = setInterval(() => setWordIdx((i) => (i + 1) % rotatingWords.length), 2600);
    return () => clearInterval(t);
  }, []);

  const services = [
    {
      id: 'secretaria',
      category: 'academic',
      icon: GraduationCap,
      badge: 'Homologado MED',
      title: 'Secretaria Digital & Matrículas',
      subtitle: 'Admissões, confirmações e arquivo escolar sem papel.',
      description:
        'Automatize todas as rotinas administrativas: matrículas online, transferências, emissão de declarações com QR de autenticidade e arquivo curricular conforme as directrizes do Ministério da Educação de Angola.',
      image: '/images/secretaria.jpg',
      href: '/academic',
      cta: 'Gerir matrículas',
      features: ['Certificados com QR', 'Histórico unificado', 'Vagas por turma'],
    },
    {
      id: 'pedagogico',
      category: 'academic',
      icon: Award,
      badge: 'Avaliação contínua',
      title: 'Notas, Pautas & Boletins',
      subtitle: 'MAC, NPP e NPT calculados automaticamente.',
      description:
        'Professores lançam notas e o sistema calcula médias em segundos. Pautas gerais, termos de exame e boletins individuais prontos para impressão oficial.',
      image: '/images/pautas.jpg',
      href: '/control',
      cta: 'Abrir pautas',
      features: ['Pautas trimestrais', 'Boletins em PDF', 'Aproveitamento'],
    },
    {
      id: 'tesouraria',
      category: 'financial',
      icon: Wallet,
      badge: 'Multicaixa Express',
      title: 'Propinas Digitais',
      subtitle: 'Pagamentos online com validação instantânea.',
      description:
        'Os encarregados pagam por Multicaixa Express, BAI Directo ou referência. O comprovativo é validado de imediato e o recibo electrónico emitido automaticamente.',
      image: '/images/propinas.jpg',
      href: '/financial',
      cta: 'Ver financeiro',
      features: ['Reconciliação bancária', 'Recibos imediatos', 'Lembretes por SMS'],
    },
    {
      id: 'portaria',
      category: 'security',
      icon: ScanLine,
      badge: 'Segurança',
      title: 'Portaria com Passe QR',
      subtitle: 'Entradas e saídas registadas em menos de 1 segundo.',
      description:
        'Cada aluno tem um passe QR único. A portaria lê, regista e notifica a família em tempo real. Tranquilidade total para os pais.',
      image: '/images/portaria.jpg',
      href: '/porter',
      cta: 'Abrir portaria',
      features: ['Leitura por câmara', 'Alerta de faltas', 'Registo de visitas'],
    },
    {
      id: 'mural',
      category: 'academic',
      icon: Bell,
      badge: 'Comunidade',
      title: 'Mural & Comunicados',
      subtitle: 'Avisos de provas, eventos e reuniões.',
      description:
        'Comunicação directa entre a Direcção e os pais: circulares, datas de exames e convites para reuniões com confirmação de leitura.',
      image: '/images/mural.jpg',
      href: '/feed',
      cta: 'Ver mural',
      features: ['Push e SMS', 'Confirmação de leitura', 'Eventos'],
    },
    {
      id: 'ia-curador',
      category: 'academic',
      icon: Sparkles,
      badge: 'Inteligência Artificial',
      title: 'Curador Digital com IA',
      subtitle: 'Apoio tutorial e prevenção de abandono.',
      description:
        'Uma IA alinhada ao currículo nacional que detecta quedas de rendimento cedo e sugere planos de estudo personalizados.',
      image: '/images/ia-tutor.jpg',
      href: '/chat',
      cta: 'Falar com a IA',
      features: ['Análise preditiva', 'Planos de reforço', 'Apoio ao professor'],
    },
  ];

  const modules = [
    { title: 'Painel Geral', path: '/', icon: Layers, desc: 'Visão executiva em tempo real' },
    { title: 'Administração', path: '/admin', icon: ShieldCheck, desc: 'Governança e configurações' },
    { title: 'Gestão Académica', path: '/academic', icon: BookOpen, desc: 'Turmas, cursos e disciplinas' },
    { title: 'Alunos', path: '/students', icon: GraduationCap, desc: 'Fichas, matrículas e histórico' },
    { title: 'Funcionários', path: '/staff', icon: Users, desc: 'Professores e corpo técnico' },
    { title: 'Portaria & QR', path: '/porter', icon: QrCode, desc: 'Leitor e operação offline' },
    { title: 'Passes em Lote', path: '/admin/qr-generator', icon: Sparkles, desc: 'Emissão e folha A4' },
    { title: 'Pautas & MED', path: '/control', icon: Award, desc: 'Boletins e termos oficiais' },
    { title: 'Financeiro & AGT', path: '/financial', icon: CreditCard, desc: 'Facturação e SAF-T (AO)' },
    { title: 'Transporte Escolar', path: '/transport', icon: Layers, desc: 'Rotas de carrinhas em Luanda' },
    { title: 'Cantina Escolar', path: '/canteen', icon: Award, desc: 'Saldo digital e refeições' },
    { title: 'Avisos WhatsApp/SMS', path: '/communications', icon: Zap, desc: 'Disparo em lote aos pais' },
    { title: 'Validação Pública', path: '/verify', icon: ShieldCheck, desc: 'Autenticidade por QR Code' },
    { title: 'Calendários', path: '/calendar', icon: Calendar, desc: 'Horários e provas trimestrais' },
    { title: 'Mural Oficial', path: '/feed', icon: Bell, desc: 'Comunicados institucionais' },
    { title: 'Curador com IA', path: '/chat', icon: Zap, desc: 'Canal directo e tutorial' },
  ];

  const reviews = [
    {
      name: 'Engrácia dos Santos',
      initials: 'ES',
      role: 'Encarregada de Educação · Maianga',
      comment:
        'Recebo uma notificação no segundo exacto em que os meus filhos entram e saem do colégio. É uma paz de espírito que não tem preço.',
    },
    {
      name: 'Prof. Mateus Afonso',
      initials: 'MA',
      role: 'Director Pedagógico · Talatona',
      comment:
        'Acabou o caos do final do trimestre. As pautas são calculadas em segundos e os boletins saem conforme as normas do Ministério.',
    },
    {
      name: 'Carlos Benguela',
      initials: 'CB',
      role: 'Tesoureiro · Viana',
      comment:
        'Com o Multicaixa Express acabaram as filas na secretaria. Os pais enviam o comprovativo pelo telemóvel e a validação é imediata.',
    },
  ];

  useEffect(() => {
    const t = setInterval(() => setReviewIdx((i) => (i + 1) % reviews.length), 6000);
    return () => clearInterval(t);
  }, [reviews.length]);

  const filteredServices = activeTab === 'all' ? services : services.filter((s) => s.category === activeTab);

  const navLinks = [
    { label: 'Serviços', href: '#servicos' },
    { label: 'Como funciona', href: '#como-funciona' },
    { label: 'Módulos', href: '#modulos' },
    { label: 'Depoimentos', href: '#depoimentos' },
  ];

  return (
    <div className="relative min-h-screen bg-background text-on-surface overflow-x-hidden">
      {/* Scroll progress */}
      <motion.div
        style={{ scaleX: scrollYProgress }}
        className="fixed top-0 left-0 right-0 h-[2px] origin-left z-[70] bg-gradient-to-r from-primary via-secondary to-tertiary"
      />

      {/* ============================== NAVBAR ============================== */}
      <motion.header
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease }}
        className="fixed top-0 inset-x-0 z-50 flex justify-center px-4 pt-4"
      >
        <nav
          className={`w-full max-w-6xl flex items-center justify-between rounded-2xl px-4 sm:px-6 transition-all duration-500 ${
            scrolled ? 'glass h-14 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)]' : 'h-16 bg-transparent border border-transparent'
          }`}
        >
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-primary via-[#b9c3ff] to-secondary flex items-center justify-center shadow-[0_0_24px_-4px_rgba(168,181,255,0.6)] transition-transform duration-500 group-hover:rotate-[10deg] group-hover:scale-105">
              <Sparkles className="w-4.5 h-4.5 text-on-primary" />
            </span>
            <span className="leading-none">
              <span className="block font-headline font-semibold text-[17px] tracking-tight text-white">Elo Escolar</span>
              <span className="block text-[9px] uppercase tracking-[0.28em] text-on-surface-variant mt-1">Angola</span>
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="relative px-4 py-2 text-[13px] font-medium text-on-surface-variant hover:text-white rounded-full hover:bg-white/5"
              >
                {l.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden sm:inline-flex px-4 py-2 text-[13px] font-medium text-on-surface-variant hover:text-white rounded-full"
            >
              Entrar
            </Link>
            <Link
              href="/admin"
              className="group relative inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full text-[13px] font-semibold text-on-primary bg-primary overflow-hidden shadow-[0_8px_30px_-8px_rgba(168,181,255,0.7)] hover:shadow-[0_8px_40px_-6px_rgba(168,181,255,0.9)]"
            >
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/50 to-transparent" />
              <span className="relative">Abrir Painel</span>
              <ArrowUpRight className="relative w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
            <button
              onClick={() => setMobileOpen((o) => !o)}
              className="lg:hidden p-2 rounded-full text-on-surface-variant hover:text-white hover:bg-white/5"
              aria-label="Menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-20 inset-x-4 z-50 glass rounded-2xl p-3 lg:hidden"
          >
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 rounded-xl text-sm text-on-surface hover:bg-white/5"
              >
                {l.label}
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================== HERO (FULL-BLEED COVER) ============================== */}
      <section ref={heroRef} className="relative w-full min-h-[100svh] flex items-center overflow-hidden noise">
        {/* Full-width cover image spanning left to right edge-to-edge */}
        <motion.div style={{ y: heroImgY }} className="absolute inset-0 -top-[6%] h-[112%] w-full">
          <motion.div
            initial={{ scale: 1.12, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 2, ease }}
            className="absolute inset-0"
          >
            <Image
              src="/images/hero-cover.jpg"
              alt="Estudantes angolanos e professora em frente à escola"
              fill
              priority
              sizes="100vw"
              className="object-cover object-center"
            />
          </motion.div>
        </motion.div>

        {/* Overlays for crisp text legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b1020]/90 via-[#0b1020]/55 to-[#0b1020]/15" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-[#0b1020]/50" />
        <div className="pointer-events-none absolute -top-40 -left-32 w-[520px] h-[520px] rounded-full bg-primary/20 blur-[120px] animate-aurora" />

        <div className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 pt-32 pb-24 grid lg:grid-cols-12 gap-10 items-center">
          {/* Text */}
          <motion.div style={{ y: heroTextY, opacity: heroOpacity }} className="lg:col-span-7">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={0}
              className="inline-flex items-center gap-2 pl-1.5 pr-4 py-1.5 rounded-full glass text-[12px] text-on-surface"
            >
              <span className="px-2 py-0.5 rounded-full bg-secondary/20 text-secondary text-[10px] font-semibold uppercase tracking-wider">
                Novo
              </span>
              Ano lectivo 2026/2027 · matrículas abertas
            </motion.div>

            <h1 className="mt-7 font-headline font-light text-[44px] leading-[1.05] sm:text-6xl lg:text-[74px] tracking-[-0.035em] text-white drop-shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
              {['O', 'elo', 'que', 'une'].map((w, i) => (
                <motion.span
                  key={w + i}
                  initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ duration: 0.9, ease, delay: 0.35 + i * 0.08 }}
                  className="inline-block mr-[0.22em]"
                >
                  {w}
                </motion.span>
              ))}
              <br />
              <span className="relative inline-flex h-[1.15em] overflow-hidden align-bottom min-w-[5.5ch]">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={rotatingWords[wordIdx]}
                    initial={{ y: '100%', opacity: 0, filter: 'blur(8px)' }}
                    animate={{ y: '0%', opacity: 1, filter: 'blur(0px)' }}
                    exit={{ y: '-100%', opacity: 0, filter: 'blur(8px)' }}
                    transition={{ duration: 0.65, ease }}
                    className="font-serif italic font-normal text-gradient pr-2"
                  >
                    {rotatingWords[wordIdx]}
                  </motion.span>
                </AnimatePresence>
              </span>
              <motion.span
                initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.9, ease, delay: 0.75 }}
                className="inline-block"
              >
                em Angola.
              </motion.span>
            </h1>

            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={8}
              className="mt-6 max-w-xl text-[16px] sm:text-[18px] leading-relaxed text-white/85"
            >
              Matrículas, pautas, propinas, portaria com QR e comunicação com os pais — tudo numa plataforma
              suave, segura e feita para a realidade das escolas angolanas.
            </motion.p>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={10}
              className="mt-9 flex flex-col sm:flex-row gap-3"
            >
              <a
                href="#servicos"
                className="group relative inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-white text-[#0b1020] text-sm font-semibold overflow-hidden shadow-[0_10px_40px_-10px_rgba(255,255,255,0.5)] hover:-translate-y-0.5"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-primary via-[#c7cfff] to-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <span className="relative">Explorar serviços</span>
                <ArrowRight className="relative w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </a>
              <Link
                href="/admin"
                className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full glass text-sm font-semibold text-white hover:bg-white/10 hover:-translate-y-0.5"
              >
                Aceder ao painel
                <ArrowUpRight className="w-4 h-4 text-primary transition-transform duration-300 group-hover:rotate-45" />
              </Link>
            </motion.div>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={12}
              className="mt-10 flex items-center gap-4"
            >
              <div className="flex -space-x-2.5">
                {['AK', 'NM', 'JP', 'LS'].map((ini, i) => (
                  <span
                    key={ini}
                    className="w-9 h-9 rounded-full border-2 border-[#0b1020] flex items-center justify-center text-[11px] font-bold text-[#0b1020]"
                    style={{ background: ['#a8b5ff', '#7ee0c3', '#ffb89a', '#d6c8ff'][i] }}
                  >
                    {ini}
                  </span>
                ))}
              </div>
              <div className="text-[13px] leading-tight">
                <div className="flex items-center gap-0.5 text-tertiary">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <span className="text-white/80">
                  Confiado por <span className="text-white font-semibold">18 escolas</span> em Luanda
                </span>
              </div>
            </motion.div>
          </motion.div>

          {/* Floating glass cards over the cover */}
          <div className="hidden lg:flex lg:col-span-5 flex-col items-end gap-5">
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, ease, delay: 1.0 }}
              className="animate-float"
            >
              <div className="glass rounded-2xl p-3.5 pr-5 flex items-center gap-3 shadow-2xl">
                <span className="w-10 h-10 rounded-xl bg-secondary/15 flex items-center justify-center">
                  <ScanLine className="w-5 h-5 text-secondary" />
                </span>
                <div>
                  <p className="text-[12px] font-semibold text-white">Kiala entrou no colégio</p>
                  <p className="text-[11px] text-on-surface-variant">Portaria · 07:42</p>
                </div>
                <span className="ml-1 w-2 h-2 rounded-full bg-secondary animate-pulse" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, ease, delay: 1.2 }}
              className="animate-float [animation-delay:-3s] mr-14"
            >
              <div className="glass rounded-2xl p-4 w-[220px] shadow-2xl">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] uppercase tracking-wider text-on-surface-variant">Média trimestral</p>
                  <TrendingUp className="w-4 h-4 text-secondary" />
                </div>
                <p className="mt-1 font-headline text-3xl font-light text-white">
                  16,4<span className="text-sm text-on-surface-variant"> / 20</span>
                </p>
                <div className="mt-3 h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '82%' }}
                    transition={{ duration: 1.6, ease, delay: 1.5 }}
                    className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                  />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, ease, delay: 1.4 }}
              className="animate-float [animation-delay:-1.5s]"
            >
              <div className="glass rounded-full pl-2 pr-4 py-2 flex items-center gap-2 shadow-2xl">
                <span className="w-7 h-7 rounded-full bg-tertiary/20 flex items-center justify-center">
                  <Check className="w-4 h-4 text-tertiary" />
                </span>
                <p className="text-[12px] text-white">Propina paga · Multicaixa Express</p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.a
          href="#servicos"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-white/60 hover:text-white"
        >
          Descobrir
          <span className="w-6 h-10 rounded-full border border-white/30 flex justify-center pt-2">
            <motion.span
              animate={{ y: [0, 12, 0], opacity: [1, 0.2, 1] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              className="w-1 h-2 rounded-full bg-white"
            />
          </span>
        </motion.a>
      </section>

      {/* ============================== COMMUNITY GALLERY ============================== */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { src: '/images/sala-aula.jpg', t: 'Salas de aula conectadas' },
          { src: '/images/professora.jpg', t: 'Professores com mais tempo para ensinar' },
          { src: '/images/propinas.jpg', t: 'Famílias tranquilas e informadas' },
        ].map((g, i) => (
          <motion.div
            key={g.src}
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
            custom={i}
            className="group relative aspect-[4/3] rounded-3xl overflow-hidden border border-white/[0.06]"
          >
            <Image
              src={g.src}
              alt={g.t}
              fill
              sizes="(max-width: 640px) 100vw, 33vw"
              className="object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b1020]/85 via-transparent to-transparent" />
            <p className="absolute bottom-4 left-5 right-5 font-headline text-[15px] font-medium text-white">{g.t}</p>
          </motion.div>
        ))}
      </section>

      {/* ============================== MARQUEE ============================== */}
      <section className="relative py-6 border-y border-white/[0.06] bg-white/[0.015] overflow-hidden">
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent z-10" />
        <div className="animate-marquee gap-14 items-center text-[13px] text-on-surface-variant whitespace-nowrap">
          {[...Array(2)].flatMap((_, k) =>
            [
              'Homologado pelo MED',
              'Pautas em tempo real',
              'Portaria com QR Code',
              'Multicaixa Express',
              'BAI Directo',
              'Boletins em PDF',
              'Notificações SMS',
              'Curador com IA',
            ].map((t) => (
              <span key={`${k}-${t}`} className="inline-flex items-center gap-3">
                <Sparkles className="w-3.5 h-3.5 text-primary/70" />
                {t}
              </span>
            ))
          )}
        </div>
      </section>

      {/* ============================== STATS ============================== */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { v: 4890, s: '+', l: 'Alunos conectados', c: 'from-primary/20' },
            { v: 18, s: '', l: 'Escolas e colégios', c: 'from-secondary/20' },
            { v: 99.4, s: '%', l: 'Assiduidade registada', c: 'from-tertiary/20', d: 1 },
            { v: 0, s: ' filas', l: 'Nas matrículas', c: 'from-[#d6c8ff]/20' },
          ].map((st, i) => (
            <motion.div
              key={st.l}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-60px' }}
              custom={i}
            >
              <SpotlightCard className="rounded-3xl bg-surface-container/60 border border-white/[0.06] p-6 sm:p-7 h-full">
                <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br ${st.c} to-transparent blur-2xl`} />
                <p className="font-headline text-4xl sm:text-5xl font-extralight tracking-tight text-white">
                  <CountUp to={st.v} suffix={st.s} decimals={st.d || 0} />
                </p>
                <p className="mt-2 text-[13px] text-on-surface-variant">{st.l}</p>
              </SpotlightCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ============================== SERVICES ============================== */}
      <section id="servicos" className="max-w-6xl mx-auto px-4 sm:px-6 py-16 scroll-mt-24">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <p className="text-[12px] uppercase tracking-[0.28em] text-primary font-medium">Serviços</p>
            <h2 className="mt-3 font-headline text-4xl sm:text-5xl font-light tracking-[-0.03em] text-white max-w-xl">
              Tudo o que a sua escola precisa,{' '}
              <span className="font-serif italic text-gradient">num só lugar.</span>
            </h2>
          </motion.div>

          <div className="inline-flex p-1 rounded-full glass self-start lg:self-auto overflow-x-auto max-w-full">
            {[
              { id: 'all', label: 'Todos' },
              { id: 'academic', label: 'Académico' },
              { id: 'financial', label: 'Financeiro' },
              { id: 'security', label: 'Segurança' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative px-4 sm:px-5 py-2 rounded-full text-[13px] font-medium whitespace-nowrap ${
                  activeTab === tab.id ? 'text-[#0b1020]' : 'text-on-surface-variant hover:text-white'
                }`}
              >
                {activeTab === tab.id && (
                  <motion.span
                    layoutId="service-tab"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    className="absolute inset-0 rounded-full bg-primary"
                  />
                )}
                <span className="relative">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence mode="popLayout">
            {filteredServices.map((service, idx) => (
              <motion.div
                layout
                key={service.id}
                initial={{ opacity: 0, y: 24, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.55, ease, delay: idx * 0.05 }}
              >
                <SpotlightCard className="rounded-[28px] bg-surface-container/70 border border-white/[0.06] h-full hover:-translate-y-1 transition-transform duration-500">
                  <div className="flex flex-col h-full">
                    <div className="relative aspect-[16/10] m-2 rounded-[22px] overflow-hidden">
                      <Image
                        src={service.image}
                        alt={service.title}
                        fill
                        className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0b1020]/80 via-[#0b1020]/10 to-transparent" />
                      <span className="absolute top-3 left-3 px-3 py-1 rounded-full glass text-[11px] text-white">
                        {service.badge}
                      </span>
                      <span className="absolute bottom-3 left-3 w-10 h-10 rounded-xl bg-white/90 flex items-center justify-center shadow-lg transition-transform duration-500 group-hover:rotate-[-8deg] group-hover:scale-110">
                        <service.icon className="w-5 h-5 text-[#0b1020]" />
                      </span>
                    </div>

                    <div className="p-6 pt-4 flex flex-col flex-1">
                      <h3 className="font-headline text-xl font-medium text-white tracking-tight">{service.title}</h3>
                      <p className="mt-1.5 text-[14px] text-on-surface-variant leading-relaxed">{service.subtitle}</p>

                      <ul className="mt-5 space-y-2">
                        {service.features.map((f) => (
                          <li key={f} className="flex items-center gap-2.5 text-[13px] text-on-surface/85">
                            <span className="w-4 h-4 rounded-full bg-secondary/15 flex items-center justify-center">
                              <Check className="w-2.5 h-2.5 text-secondary" />
                            </span>
                            {f}
                          </li>
                        ))}
                      </ul>

                      <div className="mt-auto pt-6 flex items-center justify-between">
                        <Link
                          href={service.href}
                          className="inline-flex items-center gap-2 text-[13px] font-semibold text-primary hover:text-white"
                        >
                          {service.cta}
                          <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                        </Link>
                        <button
                          onClick={() => setModalService(service)}
                          className="text-[12px] text-on-surface-variant hover:text-white px-3 py-1.5 rounded-full hover:bg-white/5"
                        >
                          Detalhes
                        </button>
                      </div>
                    </div>
                  </div>
                </SpotlightCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </section>

      {/* ============================== HOW IT WORKS ============================== */}
      <section id="como-funciona" className="relative py-24 scroll-mt-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-14 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 1, ease }}
            className="relative aspect-[4/5] max-h-[560px] rounded-[32px] overflow-hidden border border-white/10"
          >
            <Image
              src="/images/finalista.jpg"
              alt="Estudante angolana finalista"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b1020] via-[#0b1020]/20 to-transparent" />
            <div className="absolute bottom-0 p-8">
              <Quote className="w-8 h-8 text-primary/80" />
              <p className="mt-3 font-serif italic text-2xl sm:text-3xl text-white leading-snug">
                O sucesso do estudante é a maior vitória da família angolana.
              </p>
            </div>
          </motion.div>

          <div>
            <motion.p variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-[12px] uppercase tracking-[0.28em] text-secondary font-medium">
              Como funciona
            </motion.p>
            <motion.h2 variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={1} className="mt-3 font-headline text-4xl sm:text-5xl font-light tracking-[-0.03em] text-white">
              Simples para a escola, <span className="font-serif italic text-gradient">tranquilo</span> para os pais.
            </motion.h2>

            <div className="mt-10 relative">
              <div className="absolute left-[19px] top-2 bottom-2 w-px bg-gradient-to-b from-primary via-secondary to-tertiary opacity-40" />
              {[
                { t: 'Matricule e organize', d: 'Crie turmas, registe alunos e professores e importe dados em minutos.', icon: GraduationCap },
                { t: 'Acompanhe tudo ao vivo', d: 'Notas, presenças na portaria e pagamentos actualizados em tempo real.', icon: TrendingUp },
                { t: 'Comunique sem esforço', d: 'Avisos, boletins e recibos chegam directamente ao telemóvel das famílias.', icon: Bell },
              ].map((s, i) => (
                <motion.div
                  key={s.t}
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.8, ease, delay: i * 0.15 }}
                  className="relative flex gap-5 pb-9 last:pb-0 group"
                >
                  <span className="relative z-10 w-10 h-10 shrink-0 rounded-full glass flex items-center justify-center transition-all duration-500 group-hover:bg-primary group-hover:scale-110">
                    <s.icon className="w-4.5 h-4.5 text-primary group-hover:text-[#0b1020] transition-colors" />
                  </span>
                  <div className="pt-1">
                    <p className="text-[11px] text-on-surface-variant font-mono">0{i + 1}</p>
                    <h3 className="font-headline text-lg font-medium text-white">{s.t}</h3>
                    <p className="mt-1 text-[14px] text-on-surface-variant leading-relaxed max-w-md">{s.d}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================== MODULES ============================== */}
      <section id="modulos" className="max-w-6xl mx-auto px-4 sm:px-6 py-20 scroll-mt-24">
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-[12px] uppercase tracking-[0.28em] text-tertiary font-medium">16 módulos integrados</p>
          <h2 className="mt-3 font-headline text-4xl sm:text-5xl font-light tracking-[-0.03em] text-white">
            Aceda a qualquer área <span className="font-serif italic text-gradient">num clique.</span>
          </h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"
        >
          {modules.map((mod) => (
            <motion.div
              key={mod.path}
              variants={{
                hidden: { opacity: 0, y: 20, scale: 0.96 },
                show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease } },
              }}
            >
              <Link href={mod.path} className="block h-full">
                <SpotlightCard className="rounded-2xl bg-surface-container/50 border border-white/[0.06] p-5 h-full hover:bg-surface-container-high/70 transition-colors duration-300">
                  <div className="flex items-start justify-between">
                    <span className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.06] flex items-center justify-center transition-all duration-500 group-hover:bg-gradient-to-br group-hover:from-primary group-hover:to-secondary group-hover:border-transparent">
                      <mod.icon className="w-[18px] h-[18px] text-primary group-hover:text-[#0b1020] transition-colors duration-300" />
                    </span>
                    <ArrowUpRight className="w-4 h-4 text-on-surface-variant/50 opacity-0 -translate-x-1 translate-y-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-300" />
                  </div>
                  <h4 className="mt-4 text-[14px] font-semibold text-white">{mod.title}</h4>
                  <p className="mt-1 text-[12px] text-on-surface-variant leading-snug">{mod.desc}</p>
                </SpotlightCard>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ============================== TESTIMONIALS ============================== */}
      <section id="depoimentos" className="max-w-4xl mx-auto px-4 sm:px-6 py-24 text-center scroll-mt-24">
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <div className="flex justify-center gap-1 text-tertiary">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-current" />
            ))}
          </div>
          <p className="mt-3 text-[12px] uppercase tracking-[0.28em] text-on-surface-variant">O que diz a comunidade</p>
        </motion.div>

        <div className="relative mt-10 min-h-[220px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={reviewIdx}
              initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -20, filter: 'blur(8px)' }}
              transition={{ duration: 0.7, ease }}
            >
              <p className="font-serif italic text-2xl sm:text-[32px] leading-snug text-white">
                &ldquo;{reviews[reviewIdx].comment}&rdquo;
              </p>
              <div className="mt-8 flex items-center justify-center gap-3">
                <span className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-[13px] font-bold text-[#0b1020]">
                  {reviews[reviewIdx].initials}
                </span>
                <div className="text-left">
                  <p className="text-[14px] font-semibold text-white">{reviews[reviewIdx].name}</p>
                  <p className="text-[12px] text-on-surface-variant">{reviews[reviewIdx].role}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-8 flex justify-center gap-2">
          {reviews.map((_, i) => (
            <button
              key={i}
              onClick={() => setReviewIdx(i)}
              aria-label={`Depoimento ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-500 ${i === reviewIdx ? 'w-8 bg-primary' : 'w-1.5 bg-white/20 hover:bg-white/40'}`}
            />
          ))}
        </div>
      </section>

      {/* ============================== CTA ============================== */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 1, ease }}
          className="relative overflow-hidden rounded-[36px] p-10 sm:p-16 text-center border border-white/10"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-surface-container to-secondary/20 bg-[length:200%_200%] animate-gradient" />
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-primary/30 blur-[100px]" />
          <div className="relative">
            <h2 className="font-headline text-4xl sm:text-6xl font-light tracking-[-0.035em] text-white">
              Pronto para <span className="font-serif italic text-gradient">transformar</span>
              <br className="hidden sm:block" /> a sua escola?
            </h2>
            <p className="mt-5 text-on-surface-variant max-w-lg mx-auto">
              Comece hoje e tenha toda a gestão escolar organizada, segura e acessível em qualquer lugar.
            </p>
            <div className="mt-9 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/admin"
                className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white text-[#0b1020] text-sm font-semibold overflow-hidden hover:-translate-y-0.5 shadow-[0_10px_40px_-10px_rgba(255,255,255,0.6)]"
              >
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
                <span className="relative">Começar agora</span>
                <ArrowRight className="relative w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/support"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full glass text-sm font-semibold text-white hover:bg-white/10"
              >
                Falar com a equipa
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ============================== FOOTER ============================== */}
      <footer className="border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 grid grid-cols-2 lg:grid-cols-12 gap-10">
          <div className="col-span-2 lg:col-span-5">
            <div className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary via-[#b9c3ff] to-secondary flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-on-primary" />
              </span>
              <span className="font-headline font-semibold text-lg text-white">Elo Escolar</span>
            </div>
            <p className="mt-4 text-[14px] text-on-surface-variant leading-relaxed max-w-sm">
              A plataforma de gestão escolar pensada para Angola — do Ensino Primário ao II Ciclo.
            </p>
            <div className="mt-6 space-y-2.5 text-[13px] text-on-surface-variant">
              <p className="flex items-center gap-2.5"><MapPin className="w-4 h-4 text-primary" /> Avenida 4 de Fevereiro, Luanda</p>
              <p className="flex items-center gap-2.5"><Phone className="w-4 h-4 text-primary" /> +244 923 000 000</p>
              <p className="flex items-center gap-2.5"><Mail className="w-4 h-4 text-primary" /> contacto@eloescolar.ao</p>
            </div>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-[12px] uppercase tracking-[0.2em] text-white font-semibold">Serviços</h4>
            <ul className="mt-4 space-y-2.5 text-[13px] text-on-surface-variant">
              {[
                ['Matrículas', '/academic'],
                ['Pautas', '/control'],
                ['Propinas', '/financial'],
                ['Portaria QR', '/porter'],
                ['Curador IA', '/chat'],
              ].map(([l, h]) => (
                <li key={h}><Link href={h} className="hover:text-white inline-block hover:translate-x-1 transition-transform">{l}</Link></li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-[12px] uppercase tracking-[0.2em] text-white font-semibold">Sistema</h4>
            <ul className="mt-4 space-y-2.5 text-[13px] text-on-surface-variant">
              {[
                ['Administração', '/admin'],
                ['Alunos', '/students'],
                ['Funcionários', '/staff'],
                ['Calendário', '/calendar'],
                ['Suporte', '/support'],
              ].map(([l, h]) => (
                <li key={h}><Link href={h} className="hover:text-white inline-block hover:translate-x-1 transition-transform">{l}</Link></li>
              ))}
            </ul>
          </div>

          <div className="col-span-2 lg:col-span-3">
            <h4 className="text-[12px] uppercase tracking-[0.2em] text-white font-semibold">Novidades</h4>
            <p className="mt-4 text-[13px] text-on-surface-variant">Receba avisos e novidades no seu e-mail.</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert('Subscrito com sucesso!');
              }}
              className="mt-4 flex items-center gap-1 p-1 rounded-full glass focus-within:border-primary/50"
            >
              <input
                type="email"
                required
                placeholder="o-seu@email.ao"
                className="flex-1 min-w-0 bg-transparent px-4 py-2 text-[13px] text-white placeholder:text-on-surface-variant/60 outline-none focus-visible:outline-none"
              />
              <button type="submit" className="w-9 h-9 shrink-0 rounded-full bg-primary flex items-center justify-center hover:scale-105">
                <ArrowRight className="w-4 h-4 text-[#0b1020]" />
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-white/[0.06]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px] text-on-surface-variant">
            <p>© 2026 Elo Escolar · Angola. Todos os direitos reservados.</p>
            <div className="flex items-center gap-4">
              {['Multicaixa', 'BAI', 'BFA', 'EMIS'].map((b) => (
                <span key={b} className="px-2.5 py-1 rounded-md border border-white/[0.08] text-[11px]">{b}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* ============================== MODAL ============================== */}
      <AnimatePresence>
        {modalService && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-[#05070f]/70 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setModalService(null)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-lg w-full rounded-[28px] bg-surface-container border border-white/10 overflow-hidden shadow-2xl"
            >
              <div className="relative aspect-[16/9]">
                <Image src={modalService.image} alt={modalService.title} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-container to-transparent" />
                <button
                  onClick={() => setModalService(null)}
                  className="absolute top-3 right-3 w-9 h-9 rounded-full glass flex items-center justify-center hover:rotate-90"
                  aria-label="Fechar"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
              <div className="p-7 pt-2">
                <span className="text-[11px] uppercase tracking-[0.2em] text-secondary">{modalService.badge}</span>
                <h3 className="mt-1 font-headline text-2xl font-medium text-white">{modalService.title}</h3>
                <p className="mt-3 text-[14px] text-on-surface-variant leading-relaxed">{modalService.description}</p>
                <Link
                  href={modalService.href}
                  className="group mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-[#0b1020] text-sm font-semibold hover:shadow-[0_8px_30px_-6px_rgba(168,181,255,0.8)]"
                >
                  {modalService.cta}
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
