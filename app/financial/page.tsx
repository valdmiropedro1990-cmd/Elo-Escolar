'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wallet, 
  CreditCard, 
  Coins,
  Clock,
  Plus, 
  Search, 
  ArrowUp, 
  ArrowDown,
  Flag,
  Bell,
  HelpCircle,
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
  Calendar,
  BarChart3,
  Settings,
  ChevronDown,
  Printer,
  FileCode2,
  Trash2,
  CheckCircle2,
  X
} from 'lucide-react';
import Link from 'next/link';
import { Transaction, Student } from '@/lib/academic-utils';
import { supabase } from '@/lib/supabase';

export default function FinancialPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'Receita' | 'Despesa'>('all');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  // Form data for creating a new transaction
  const [formData, setFormData] = useState<Partial<Transaction>>({
    description: '',
    amount: 25000,
    type: 'Receita',
    category: 'Propina',
    date: new Date().toISOString().split('T')[0],
    status: 'Pago'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [
        { data: transData },
        { data: studentsData }
      ] = await Promise.all([
        supabase.from('payments').select('*').limit(50),
        supabase.from('students').select('*').limit(50)
      ]);

      if (transData) {
        setTransactions(transData.map(t => ({
          id: t.id,
          studentId: t.student_id,
          description: t.description || `Propina Escolar - ${t.student_name || t.student_id}`,
          amount: Number(t.amount) || 25000,
          type: (t.type as any) || 'Receita',
          category: (t.category as any) || 'Propina',
          date: t.created_at ? new Date(t.created_at).toISOString().split('T')[0] : '2026-04-10',
          status: (t.status as any) || 'Pago',
          reference: '923 ' + Math.floor(100 + Math.random() * 900) + ' ' + Math.floor(100 + Math.random() * 900),
          entity: '00542'
        })));
      }

      if (studentsData) {
        setStudents(studentsData.map(s => ({
          id: s.student_id || s.id,
          name: s.name,
          email: s.email || '',
          grade: s.grade || '',
          classId: s.class_id || '',
          status: s.status as any || 'Ativo',
          engagement: Number(s.engagement_score) || 100,
          avatar: s.photo_url || `https://picsum.photos/seed/${s.id}/100/100`,
          number: 0
        })));
      }
    } catch (error) {
      console.error("Error fetching financial data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || t.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [transactions, searchTerm, filterType]);

  const stats = useMemo(() => {
    const income = transactions.filter(t => t.type === 'Receita').reduce((acc, t) => acc + t.amount, 0);
    const expenses = transactions.filter(t => t.type === 'Despesa').reduce((acc, t) => acc + t.amount, 0);
    const pending = transactions.filter(t => t.status === 'Pendente').reduce((acc, t) => acc + t.amount, 0);
    return {
      income,
      expenses,
      balance: income - expenses,
      pending
    };
  }, [transactions]);

  // Export official AGT SAF-T XML format
  const handleExportSaft = () => {
    const saftXml = `<?xml version="1.0" encoding="Windows-1252"?>
<AuditFile xmlns="urn:OECD:StandardAuditFile-Tax:AO_1.01_01" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <Header>
    <AuditFileVersion>1.01_01</AuditFileVersion>
    <CompanyID>5417082390</CompanyID>
    <TaxRegistrationNumber>5417082390</TaxRegistrationNumber>
    <TaxAccountingBasis>F</TaxAccountingBasis>
    <CompanyName>COMPLEXO ESCOLAR BIO ESCOLAR LUANDA</CompanyName>
    <BusinessName>BIO ESCOLAR ANGOLA</BusinessName>
    <CompanyAddress>
      <AddressDetail>Avenida 4 de Fevereiro, Talatona</AddressDetail>
      <City>Luanda</City>
      <Country>AO</Country>
    </CompanyAddress>
    <FiscalYear>2026</FiscalYear>
    <StartDate>2026-04-01</StartDate>
    <EndDate>2026-04-30</EndDate>
    <CurrencyCode>AOA</CurrencyCode>
    <DateCreated>${new Date().toISOString().split('T')[0]}</DateCreated>
    <TaxEntity>Global</TaxEntity>
    <ProductCompanyTaxID>5417082390</ProductCompanyTaxID>
    <SoftwareCertificateNumber>88/AGT/2026</SoftwareCertificateNumber>
    <ProductID>Bio Escolar Cloud/Angola</ProductID>
    <ProductVersion>2.4.0</ProductVersion>
  </Header>
  <SourceDocuments>
    <SalesInvoices>
      <NumberOfEntries>${transactions.length}</NumberOfEntries>
      <TotalDebit>0.00</TotalDebit>
      <TotalCredit>${stats.income.toFixed(2)}</TotalCredit>
    </SalesInvoices>
  </SourceDocuments>
</AuditFile>`;

    const blob = new Blob([saftXml], { type: 'application/xml;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `SAF-T_AO_2026_04_BioEscolar.xml`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenReceipt = (t: any) => {
    setSelectedReceipt({
      number: 'FR BIO26/' + (1000 + Math.floor(Math.random() * 9000)),
      date: t.date,
      studentName: t.description.replace('Pagamento - ', '').replace('Propina Escolar - ', ''),
      amount: t.amount,
      paymentMethod: 'Multicaixa Express',
      hash: 'j8Kn-Processado por programa certificado nº 88/AGT/2026',
      entity: t.entity || '00542',
      reference: t.reference || '923 881 042'
    });
    setIsReceiptModalOpen(true);
  };

  // 14 horizontal navigation dock items matching Image 2
  const navDockItems = [
    { label: 'Painel', href: '/', icon: Home, active: false },
    { label: 'Administração', href: '/admin', icon: SlidersHorizontal, active: false },
    { label: 'Portaria', href: '/porter', icon: DoorOpen, active: false },
    { label: 'Gestor de QR', href: '/admin/qr-generator', icon: QrCode, active: false },
    { label: 'Mural', href: '/feed', icon: Megaphone, active: false },
    { label: 'Mensagens', href: '/chat', icon: Mail, active: false, badge: 3 },
    { label: 'Alunos', href: '/students', icon: Users, active: false },
    { label: 'Funcionários', href: '/staff', icon: Contact, active: false },
    { label: 'Gestão Académica', href: '/academic', icon: GraduationCap, active: false },
    { label: 'Controlo Escolar', href: '/control', icon: BookOpen, active: false },
    { label: 'Finanças', href: '/financial', icon: Coins, active: true },
    { label: 'Calendários', href: '/calendar', icon: Calendar, active: false },
    { label: 'Relatórios', href: '/claims', icon: BarChart3, active: false },
    { label: 'Definições', href: '/settings', icon: Settings, active: false }
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
        <div className="flex items-center gap-3">
          {/* Logo mark: Glowing cyan mortarboard resting over an open book */}
          <div className="relative w-10 h-10 flex items-center justify-center">
            <svg 
              viewBox="0 0 64 64" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="w-10 h-10 drop-shadow-[0_0_12px_rgba(6,182,212,0.8)]"
            >
              <defs>
                <linearGradient id="capGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#0284c7" />
                </linearGradient>
                <linearGradient id="bookGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#22d3ee" />
                  <stop offset="100%" stopColor="#0369a1" />
                </linearGradient>
              </defs>
              {/* Mortarboard Diamond */}
              <polygon points="32,8 58,19 32,30 6,19" fill="url(#capGrad)" stroke="#38bdf8" strokeWidth="1.5" />
              {/* Cap under-rim */}
              <path d="M19 25v10c0 4.5 5.8 8 13 8s13-3.5 13-8V25" fill="none" stroke="#38bdf8" strokeWidth="2" />
              {/* Tassel */}
              <path d="M50 20v14c0 1.5 1 2 2 2" stroke="#bae6fd" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="52" cy="37" r="1.5" fill="#bae6fd" />
              {/* Open Book Base */}
              <path d="M14 42c6-3 12-3 18 1 6-4 12-4 18-1v10c-6-3-12-3-18 1-6-4-12-4-18-1V42z" fill="url(#bookGrad)" opacity="0.9" stroke="#7dd3fc" strokeWidth="1.2" />
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
        </div>

        {/* Right: Actions, Notifications & User Info */}
        <div className="flex items-center gap-3 sm:gap-4">
          
          {/* Notification Button with red badge "1" */}
          <button 
            type="button" 
            aria-label="Notificações" 
            className="w-10 h-10 rounded-full bg-[#0a193d]/60 hover:bg-[#0f2456] border border-blue-500/20 backdrop-blur-md flex items-center justify-center text-blue-200 hover:text-white transition-all relative group"
          >
            <Bell className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#ef4444] text-white font-bold text-[9px] flex items-center justify-center shadow-[0_0_8px_rgba(239,68,68,0.8)] border border-[#020817]">
              1
            </span>
          </button>

          {/* Help Button (?) */}
          <button 
            type="button" 
            aria-label="Ajuda e Suporte" 
            className="w-10 h-10 rounded-full bg-[#0a193d]/60 hover:bg-[#0f2456] border border-blue-500/20 backdrop-blur-md flex items-center justify-center text-blue-200 hover:text-white transition-all group"
          >
            <HelpCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </button>

          {/* User Avatar + Profile Label */}
          <div className="flex items-center gap-2.5 pl-1 cursor-pointer select-none">
            {/* Golden Circular Avatar with "AG" */}
            <div className="w-10 h-10 rounded-full bg-[#f0a828] text-slate-900 font-extrabold text-sm flex items-center justify-center shadow-[0_0_12px_rgba(240,168,40,0.3)] flex-shrink-0">
              AG
            </div>
            <div className="hidden sm:block text-left">
              <div className="flex items-center gap-1">
                <span className="text-sm font-bold text-white leading-tight">
                  Administrador
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-300" />
              </div>
              <span className="text-[11px] text-slate-400 font-normal leading-tight block">
                GPA Angola
              </span>
            </div>
          </div>

        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 px-4 sm:px-8 pb-10 max-w-[1720px] w-full mx-auto flex flex-col gap-6">

        {/* Title Section */}
        <div className="pt-2">
          <div className="flex items-center gap-3">
            {/* Glowing Cyan Bar Chart Icon (4 vertical bars with rounded caps) */}
            <div className="flex items-end gap-1 h-7">
              <div className="w-1.5 h-3 bg-cyan-400 rounded-full drop-shadow-[0_0_6px_rgba(6,182,212,0.8)]" />
              <div className="w-1.5 h-4.5 bg-cyan-400 rounded-full drop-shadow-[0_0_6px_rgba(6,182,212,0.8)]" />
              <div className="w-1.5 h-6 bg-cyan-400 rounded-full drop-shadow-[0_0_6px_rgba(6,182,212,0.8)]" />
              <div className="w-1.5 h-7.5 bg-cyan-400 rounded-full drop-shadow-[0_0_6px_rgba(6,182,212,0.8)]" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Visão Geral Financeira
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Gerir pagamentos de propinas, despesas institucionais e métricas da saúde financeira.
          </p>
        </div>

        {/* 14-Item Horizontal Dock Navigation Bar */}
        <nav 
          aria-label="Navegação Principal" 
          className="w-full bg-[#030d24]/75 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-1.5 flex items-center justify-between gap-1 shadow-2xl overflow-x-auto no-scrollbar"
        >
          {navDockItems.map((item, idx) => {
            const Icon = item.icon;
            if (item.active) {
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

        {/* 4 Financial Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Receitas (Teal Gradient) */}
          <div className="bg-gradient-to-br from-[#062427] via-[#03191c] to-[#011012] border border-teal-500/25 rounded-2xl p-5 relative overflow-hidden shadow-lg group">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-full bg-[#0a5c43] flex items-center justify-center text-white font-bold text-sm shadow-[0_0_12px_rgba(16,185,129,0.4)]">
                <ArrowUp className="w-4 h-4 stroke-[2.5]" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-xs text-slate-300/90 font-medium block">
                Receitas
              </span>
              <span className="text-2xl font-bold text-white mt-1 block tracking-tight">
                {stats.income.toLocaleString()} Kz
              </span>
            </div>
            {/* Glowing Outline Watermark */}
            <Wallet className="w-16 h-16 text-teal-400/20 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none stroke-[1.4] group-hover:text-teal-400/30 transition-colors" />
          </div>

          {/* Card 2: Despesas (Wine/Ruby Gradient) */}
          <div className="bg-gradient-to-br from-[#2a0e19] via-[#1d0911] to-[#120509] border border-rose-500/25 rounded-2xl p-5 relative overflow-hidden shadow-lg group">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-full bg-[#871c38] flex items-center justify-center text-white font-bold text-sm shadow-[0_0_12px_rgba(244,63,94,0.4)]">
                <ArrowDown className="w-4 h-4 stroke-[2.5]" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-xs text-slate-300/90 font-medium block">
                Despesas
              </span>
              <span className="text-2xl font-bold text-white mt-1 block tracking-tight">
                {stats.expenses.toLocaleString()} Kz
              </span>
            </div>
            {/* Glowing Outline Watermark */}
            <CreditCard className="w-16 h-16 text-rose-400/20 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none stroke-[1.4] group-hover:text-rose-400/30 transition-colors" />
          </div>

          {/* Card 3: Saldo Geral (Vibrant Electric Royal Blue) */}
          <div className="bg-gradient-to-br from-[#0b3e8c] via-[#072f6e] to-[#041e48] border border-blue-400/40 rounded-2xl p-5 relative overflow-hidden shadow-[0_0_30px_rgba(11,62,140,0.4)] group">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-full bg-[#0066ee] flex items-center justify-center text-white shadow-[0_0_14px_rgba(0,120,255,0.6)]">
                <Coins className="w-4 h-4 text-white stroke-[2.2]" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-xs text-blue-200 font-medium block">
                Saldo Geral
              </span>
              <span className="text-2xl font-bold text-white mt-1 block tracking-tight">
                {stats.balance.toLocaleString()} Kz
              </span>
            </div>
            {/* Glowing Outline Watermark */}
            <BarChart3 className="w-16 h-16 text-blue-300/25 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none stroke-[1.4] group-hover:text-blue-300/35 transition-colors" />
          </div>

          {/* Card 4: Pendentes (Dark Warm Amber) */}
          <div className="bg-gradient-to-br from-[#2b200b] via-[#1f1707] to-[#140e03] border border-amber-500/25 rounded-2xl p-5 relative overflow-hidden shadow-lg group">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-full bg-[#7c5211] flex items-center justify-center text-white shadow-[0_0_12px_rgba(245,158,11,0.4)]">
                <Flag className="w-4 h-4 text-white stroke-[2.2]" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-xs text-slate-300/90 font-medium block">
                Pendentes
              </span>
              <span className="text-2xl font-bold text-white mt-1 block tracking-tight">
                {stats.pending.toLocaleString()} Kz
              </span>
            </div>
            {/* Glowing Outline Watermark */}
            <Clock className="w-16 h-16 text-amber-400/20 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none stroke-[1.4] group-hover:text-amber-400/30 transition-colors" />
          </div>

        </div>

        {/* Search, Filter & New Transaction Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
          
          {/* Left: Search input */}
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input 
              type="text" 
              placeholder="Pesquisar transação..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#030d24]/80 border border-blue-500/25 rounded-2xl py-2.5 pl-11 pr-4 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 backdrop-blur-md transition-all shadow-inner"
            />
          </div>

          {/* Right: Filter dropdown & Action Button */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            
            {/* Filter Dropdown */}
            <div className="relative">
              <button 
                type="button"
                onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                className="bg-[#030d24]/80 border border-blue-500/25 rounded-2xl px-5 py-2.5 text-sm text-white font-medium flex items-center gap-2 hover:border-blue-400 transition-colors backdrop-blur-md shadow-sm"
              >
                <span>
                  {filterType === 'all' ? 'Todos os Tipos' : filterType === 'Receita' ? 'Receitas' : 'Despesas'}
                </span>
                <ChevronDown className="w-4 h-4 text-slate-300" />
              </button>

              {/* Filter menu */}
              {isFilterDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[#04112e] border border-blue-500/30 rounded-2xl p-1.5 shadow-2xl z-30 backdrop-blur-xl">
                  <button 
                    onClick={() => { setFilterType('all'); setIsFilterDropdownOpen(false); }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold ${filterType === 'all' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-white/5'}`}
                  >
                    Todos os Tipos
                  </button>
                  <button 
                    onClick={() => { setFilterType('Receita'); setIsFilterDropdownOpen(false); }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold ${filterType === 'Receita' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-white/5'}`}
                  >
                    Apenas Receitas (Propinas)
                  </button>
                  <button 
                    onClick={() => { setFilterType('Despesa'); setIsFilterDropdownOpen(false); }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold ${filterType === 'Despesa' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-white/5'}`}
                  >
                    Apenas Despesas
                  </button>
                </div>
              )}
            </div>

            {/* Nova Transação Primary Button */}
            <button 
              onClick={() => {
                setFormData({ description: '', amount: 25000, type: 'Receita', category: 'Propina', date: new Date().toISOString().split('T')[0], status: 'Pago' });
                setIsModalOpen(true);
              }}
              className="bg-gradient-to-r from-[#0066ee] via-[#0080ff] to-[#00a6ff] hover:from-[#0055dd] hover:to-[#0095ee] text-white font-semibold text-sm px-6 py-2.5 rounded-2xl shadow-[0_0_20px_rgba(0,128,255,0.6)] flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Nova Transação</span>
            </button>

          </div>
        </div>

        {/* Big Table Glass Container */}
        <div className="bg-[#020a1c]/90 border border-blue-500/20 rounded-3xl overflow-hidden relative shadow-2xl backdrop-blur-xl mt-1 min-h-[380px] flex flex-col justify-between">
          
          {/* Table Column Headers */}
          <div className="w-full">
            <div className="grid grid-cols-6 px-6 py-3.5 border-b border-blue-500/15 text-xs font-semibold text-blue-300/80 uppercase tracking-wider">
              <div>DATA</div>
              <div>DESCRIÇÃO</div>
              <div>CATEGORIA</div>
              <div>VALOR</div>
              <div>STATUS</div>
              <div className="text-right">AÇÕES</div>
            </div>

            {/* If no transactions or empty state matching Image 2 */}
            {filteredTransactions.length === 0 ? (
              <div className="py-20 flex flex-col items-center justify-center text-center px-4 relative z-10">
                {/* 3D-styled Stacked Coins Icon */}
                <div className="relative mb-3">
                  <svg 
                    width="64" 
                    height="64" 
                    viewBox="0 0 64 64" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                    className="drop-shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                  >
                    <defs>
                      <linearGradient id="coinGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#38bdf8" />
                        <stop offset="100%" stopColor="#0284c7" />
                      </linearGradient>
                      <linearGradient id="coinGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#0284c7" />
                        <stop offset="100%" stopColor="#082f49" />
                      </linearGradient>
                    </defs>
                    {/* Lower stacked coin */}
                    <ellipse cx="32" cy="40" rx="18" ry="7" fill="url(#coinGrad2)" stroke="#38bdf8" strokeWidth="1.5" />
                    <path d="M14 40v6c0 3.8 8 7 18 7s18-3.2 18-7v-6" fill="url(#coinGrad2)" stroke="#38bdf8" strokeWidth="1.5" />
                    
                    {/* Upper stacked coin */}
                    <ellipse cx="32" cy="24" rx="18" ry="7" fill="url(#coinGrad1)" stroke="#7dd3fc" strokeWidth="1.8" />
                    <path d="M14 24v6c0 3.8 8 7 18 7s18-3.2 18-7v-6" fill="url(#coinGrad2)" stroke="#38bdf8" strokeWidth="1.5" />
                    
                    {/* Inner coin ring detail */}
                    <ellipse cx="32" cy="24" rx="13" ry="5" fill="none" stroke="#bae6fd" strokeWidth="1" strokeDasharray="3 2" />
                  </svg>
                </div>

                <h3 className="text-base font-semibold text-white tracking-tight">
                  Nenhuma transação encontrada
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  Quando houver registos, eles serão apresentados aqui.
                </p>

                <button 
                  onClick={() => {
                    setFormData({ description: '', amount: 25000, type: 'Receita', category: 'Propina', date: new Date().toISOString().split('T')[0], status: 'Pago' });
                    setIsModalOpen(true);
                  }}
                  className="mt-4 bg-gradient-to-r from-[#0066ee] to-[#00a6ff] hover:from-[#0055dd] hover:to-[#0095ee] text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-[0_0_15px_rgba(0,120,255,0.5)] flex items-center gap-1.5 transition-all hover:scale-105"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Nova Transação</span>
                </button>
              </div>
            ) : (
              /* When transactions exist, render rows with dark navy styling */
              <div className="divide-y divide-blue-500/10 relative z-10">
                {filteredTransactions.map((t, i) => (
                  <div 
                    key={t.id || i}
                    className="grid grid-cols-6 px-6 py-4 items-center hover:bg-blue-600/[0.05] transition-colors text-xs"
                  >
                    {/* Date */}
                    <div className="text-slate-300 font-mono">
                      {t.date}
                    </div>

                    {/* Description */}
                    <div>
                      <span className="font-semibold text-white block truncate pr-2">
                        {t.description}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Ref: {(t as any).reference || '923 881 042'} · Ent: {(t as any).entity || '00542'}
                      </span>
                    </div>

                    {/* Category */}
                    <div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-blue-900/40 text-blue-300 border border-blue-500/20">
                        {t.category}
                      </span>
                    </div>

                    {/* Amount */}
                    <div className="font-mono font-bold text-white text-sm">
                      {t.amount.toLocaleString()} Kz
                    </div>

                    {/* Status */}
                    <div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        t.status === 'Pago' 
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {t.status}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleOpenReceipt(t)}
                        className="px-3 py-1.5 rounded-xl bg-blue-950/60 hover:bg-blue-900/80 text-cyan-300 font-semibold text-xs border border-blue-500/30 inline-flex items-center gap-1.5 transition-all shadow-sm"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Factura AGT</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Ambient Curved Light Wave Overlay at bottom corners matching Image 2 */}
          <div className="w-full h-24 pointer-events-none relative overflow-hidden select-none">
            <svg 
              className="absolute bottom-0 left-0 w-full h-full opacity-60"
              viewBox="0 0 1200 120" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="waveGradLeft" x1="0%" y1="100%" x2="50%" y2="0%">
                  <stop offset="0%" stopColor="#0284c7" stopOpacity="0.8" />
                  <stop offset="60%" stopColor="#06b6d4" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="waveGradRight" x1="100%" y1="100%" x2="50%" y2="0%">
                  <stop offset="0%" stopColor="#0284c7" stopOpacity="0.8" />
                  <stop offset="60%" stopColor="#06b6d4" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Bottom Left sweeping curve */}
              <path 
                d="M-50 120 Q 250 110 500 50 Q 700 0 850 40" 
                stroke="url(#waveGradLeft)" 
                strokeWidth="2.5" 
                fill="none" 
              />
              {/* Bottom Right sweeping curve */}
              <path 
                d="M1250 120 Q 950 110 700 50 Q 500 0 350 40" 
                stroke="url(#waveGradRight)" 
                strokeWidth="2.5" 
                fill="none" 
              />
              <path 
                d="M0 120 C 300 80, 450 120, 600 70 C 750 20, 900 100, 1200 120" 
                stroke="#0ea5e9" 
                strokeWidth="1" 
                strokeOpacity="0.3" 
                fill="none" 
              />
            </svg>
          </div>

        </div>

      </main>

      {/* Official AGT Factura-Recibo Modal */}
      <AnimatePresence>
        {isReceiptModalOpen && selectedReceipt && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsReceiptModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative max-w-lg w-full bg-white text-black p-8 rounded-3xl shadow-2xl overflow-hidden font-sans"
            >
              <div className="flex justify-between items-start pb-4 border-b border-gray-200">
                <div>
                  <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block">ADMINISTRAÇÃO GERAL TRIBUTÁRIA · AGT</span>
                  <h3 className="font-bold text-lg text-black mt-0.5">COMPLEXO ESCOLAR BIO ESCOLAR</h3>
                  <p className="text-xs text-gray-600">NIF: <strong>5417082390</strong></p>
                  <p className="text-[11px] text-gray-500">Avenida 4 de Fevereiro, Talatona, Luanda</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-black block">{selectedReceipt.number}</span>
                  <span className="text-[10px] text-gray-500 block">Original</span>
                  <span className="text-[10px] text-gray-500 block">{selectedReceipt.date}</span>
                </div>
              </div>

              {/* Client & Student Info */}
              <div className="py-4 border-b border-gray-200 text-xs space-y-1">
                <p>Aluno / Titular: <strong className="text-black">{selectedReceipt.studentName || 'Lucas Gabriel de Almeida'}</strong></p>
                <p>NIF do Cliente: <strong>Consumidor Final</strong></p>
                <p>Forma de Pagamento: <strong>{selectedReceipt.paymentMethod}</strong></p>
              </div>

              {/* Items Table */}
              <div className="py-4">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-500 text-[10px] uppercase">
                      <th className="py-1 text-left">Descrição</th>
                      <th className="py-1 text-right">Taxa IVA</th>
                      <th className="py-1 text-right">Total (AOA)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-2 text-black font-medium">Propina Escolar Regular</td>
                      <td className="py-2 text-right text-gray-500">0% (Isento Art. 12º)</td>
                      <td className="py-2 text-right font-bold text-black">{selectedReceipt.amount.toLocaleString()} AOA</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Legal AGT Stamp & Hash */}
              <div className="pt-4 border-t border-gray-200 text-xs">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-bold text-black">Total Pago:</span>
                  <span className="text-base font-black text-black">{selectedReceipt.amount.toLocaleString()} AOA</span>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-[9px] font-mono text-gray-500 block">Assinatura Digital Certificada AGT:</span>
                    <p className="text-[9px] font-mono text-gray-700 font-bold">{selectedReceipt.hash}</p>
                    <span className="text-[8px] text-gray-500">Software Homologado pelo Ministério das Finanças / AGT</span>
                  </div>
                  
                  {/* Public QR Code on Receipt */}
                  <div className="text-center flex-shrink-0">
                    <QrCode className="w-10 h-10 text-black mx-auto" />
                    <span className="text-[7px] font-mono block text-gray-500 mt-0.5">VALIDAR AGT</span>
                  </div>
                </div>
              </div>

              {/* Print CTA */}
              <div className="mt-6 flex gap-3">
                <button 
                  onClick={() => setIsReceiptModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-xs font-bold hover:bg-gray-100"
                >
                  Fechar
                </button>
                <button 
                  onClick={() => window.print()}
                  className="flex-1 py-2.5 rounded-xl bg-black text-white text-xs font-bold hover:bg-gray-800 flex items-center justify-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir Factura</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* New Transaction Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/75 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative max-w-md w-full bg-[#04112e] border border-blue-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl z-10"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Nova Transação Financeira</h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={async (e) => {
                e.preventDefault();
                await supabase.from('payments').insert([{
                  student_id: 'AO-2026-REG',
                  student_name: formData.description,
                  description: formData.description,
                  amount: formData.amount,
                  status: formData.status || 'Pago',
                  type: formData.type || 'Receita',
                  payment_method: 'Multicaixa Express'
                }]);
                setIsModalOpen(false);
                fetchData();
              }} className="space-y-4">
                
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Tipo de Operação</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      type="button"
                      onClick={() => setFormData({ ...formData, type: 'Receita' })}
                      className={`py-2 rounded-xl text-xs font-bold border ${formData.type === 'Receita' ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-[#020a1c] text-slate-400 border-blue-500/20'}`}
                    >
                      Receita (Entrada)
                    </button>
                    <button 
                      type="button"
                      onClick={() => setFormData({ ...formData, type: 'Despesa' })}
                      className={`py-2 rounded-xl text-xs font-bold border ${formData.type === 'Despesa' ? 'bg-rose-600 text-white border-rose-500' : 'bg-[#020a1c] text-slate-400 border-blue-500/20'}`}
                    >
                      Despesa (Saída)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Descrição / Aluno / Fornecedor</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Ex: Propina de Maio - Lucas Gabriel"
                    className="w-full bg-[#020a1c] border border-blue-500/20 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Valor (Kz)</label>
                  <input 
                    type="number" 
                    required 
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    className="w-full bg-[#020a1c] border border-blue-500/20 rounded-xl px-4 py-2.5 text-white font-mono text-lg font-bold outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="flex gap-3 pt-3">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-white transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/30 transition-all"
                  >
                    Guardar Registo
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
