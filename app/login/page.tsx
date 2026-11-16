'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Mail,
  Lock,
  ArrowRight,
  ArrowLeft,
  Github,
  UserPlus,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  ScanLine,
  Check,
  KeyRound,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

const ease = [0.22, 1, 0.36, 1] as const;

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDemoLogin = () => {
    localStorage.setItem('elo_escolar_demo', 'true');
    window.location.href = '/admin';
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isRegistering && email.trim().toLowerCase() === 'admin' && password.trim().toLowerCase() === 'admin') {
      localStorage.setItem('elo_escolar_demo', 'true');
      window.location.href = '/admin';
      return;
    }

    setLoading(true);
    try {
      if (isRegistering) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } },
        });
        if (error) throw error;
        if (data.user) {
          const code = Math.floor(1000 + Math.random() * 9000).toString();
          setGeneratedOtp(code);
          setShowOtp(true);
          setLoading(false);
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        window.location.href = '/admin';
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro na autenticação.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    setError('');
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/admin` },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp === generatedOtp || otp === '1234') {
      window.location.href = '/admin';
    } else {
      setError('Código incorreto. Tente novamente.');
    }
  };

  return (
    <div className="relative min-h-screen bg-background text-on-surface grid lg:grid-cols-12 overflow-hidden">
      {/* Ambient aurora */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute -top-40 -left-32 w-[520px] h-[520px] rounded-full bg-primary/20 blur-[120px] animate-aurora" />
        <div className="absolute bottom-[-140px] right-[-100px] w-[520px] h-[520px] rounded-full bg-secondary/15 blur-[130px] animate-aurora [animation-delay:-7s]" />
      </div>

      {/* ============================== LEFT EDITORIAL SHOWCASE ============================== */}
      <div className="hidden lg:flex lg:col-span-6 relative p-8 flex-col justify-between overflow-hidden">
        <div className="absolute inset-4 rounded-[32px] overflow-hidden border border-white/10 shadow-2xl">
          <motion.div
            initial={{ scale: 1.12, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.8, ease }}
            className="absolute inset-0"
          >
            <Image
              src="/images/professora.jpg"
              alt="Professora angolana com alunos"
              fill
              priority
              sizes="50vw"
              className="object-cover"
            />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b1020] via-[#0b1020]/45 to-[#0b1020]/60" />
        </div>

        {/* Top bar on image */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease }}
          className="relative z-10 p-6 flex items-center justify-between"
        >
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary via-[#b9c3ff] to-secondary flex items-center justify-center shadow-lg transition-transform duration-500 group-hover:rotate-[10deg]">
              <Sparkles className="w-4 h-4 text-on-primary" />
            </span>
            <span className="leading-none">
              <span className="block font-headline font-semibold text-base text-white">Elo Escolar</span>
              <span className="block text-[9px] uppercase tracking-[0.28em] text-white/70 mt-1">Angola</span>
            </span>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-xs font-medium text-white hover:bg-white/15"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Voltar ao site
          </Link>
        </motion.div>

        {/* Bottom editorial copy on image */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease, delay: 0.25 }}
          className="relative z-10 p-8"
        >
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass text-[11px] text-secondary font-medium mb-5">
            <ShieldCheck className="w-3.5 h-3.5" />
            Portal Institucional Seguro
          </span>

          <h2 className="font-headline font-light text-4xl xl:text-5xl leading-[1.08] tracking-[-0.03em] text-white">
            Onde a educação <br />
            <span className="font-serif italic font-normal text-gradient">angolana</span> ganha vida.
          </h2>

          <p className="mt-4 text-sm text-white/80 max-w-md leading-relaxed">
            Aceda às pautas trimestrais, portaria biométrica com QR, tesouraria Multicaixa e comunicação directa com as famílias.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <div className="glass rounded-2xl px-4 py-3 flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-secondary/20 flex items-center justify-center">
                <ScanLine className="w-4 h-4 text-secondary" />
              </span>
              <div>
                <p className="text-xs font-semibold text-white">Portaria QR</p>
                <p className="text-[11px] text-white/65">Tempo real</p>
              </div>
            </div>
            <div className="glass rounded-2xl px-4 py-3 flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center">
                <Check className="w-4 h-4 text-primary" />
              </span>
              <div>
                <p className="text-xs font-semibold text-white">Normas MED</p>
                <p className="text-[11px] text-white/65">Pautas oficiais</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ============================== RIGHT LOGIN FORM ============================== */}
      <div className="lg:col-span-6 flex flex-col justify-center items-center px-4 sm:px-8 py-10 relative">
        {/* Mobile top link */}
        <div className="w-full max-w-md flex items-center justify-between mb-6 lg:hidden">
          <Link href="/" className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-on-primary" />
            </span>
            <span className="font-headline font-semibold text-white">Elo Escolar</span>
          </Link>
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-white">
            <ArrowLeft className="w-3.5 h-3.5" />
            Site
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.8, ease }}
          className="w-full max-w-[440px]"
        >
          <div className="mb-7">
            <h1 className="font-headline font-light text-3xl sm:text-4xl tracking-[-0.03em] text-white">
              {showOtp ? (
                <>Verificar <span className="font-serif italic text-gradient">identidade</span></>
              ) : isRegistering ? (
                <>Criar <span className="font-serif italic text-gradient">nova conta</span></>
              ) : (
                <>Bem-vindo de <span className="font-serif italic text-gradient">volta</span></>
              )}
            </h1>
            <p className="mt-2 text-sm text-on-surface-variant">
              {showOtp
                ? 'Introduza o código de 4 dígitos enviado para o seu contacto.'
                : isRegistering
                ? 'Registe-se para aceder ao portal da sua instituição.'
                : 'Entre com as suas credenciais para aceder ao portal escolar.'}
            </p>
          </div>

          <div className="glass glow-border rounded-[28px] p-6 sm:p-8 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)]">
            {!showOtp && (
              <div className="grid grid-cols-2 p-1 rounded-full bg-white/[0.04] border border-white/[0.06] mb-6">
                {[
                  { id: false, label: 'Entrar' },
                  { id: true, label: 'Criar Conta' },
                ].map((tab) => (
                  <button
                    key={tab.label}
                    type="button"
                    onClick={() => {
                      setIsRegistering(tab.id);
                      setError('');
                    }}
                    className={`relative py-2 rounded-full text-xs font-semibold transition-colors ${
                      isRegistering === tab.id ? 'text-[#0b1020]' : 'text-on-surface-variant hover:text-white'
                    }`}
                  >
                    {isRegistering === tab.id && (
                      <motion.span
                        layoutId="login-tab-pill"
                        transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                        className="absolute inset-0 rounded-full bg-primary"
                      />
                    )}
                    <span className="relative">{tab.label}</span>
                  </button>
                ))}
              </div>
            )}

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="mb-5 p-3.5 rounded-2xl bg-error/10 border border-error/25 text-error text-xs font-medium text-center"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {showOtp ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 text-center">
                  <p className="text-xs text-white/90">Código enviado para {email}</p>
                  <p className="text-[11px] text-secondary font-semibold mt-1 uppercase tracking-widest">
                    Código Demo: {generatedOtp}
                  </p>
                </div>

                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant mb-2 text-center">
                      Código de 4 dígitos
                    </label>
                    <input
                      type="text"
                      maxLength={4}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="0000"
                      required
                      className="w-full bg-white/[0.04] border border-white/10 rounded-2xl py-4 text-center text-3xl font-headline font-light tracking-[0.5em] text-white focus:border-primary/60 outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-full bg-gradient-to-r from-primary to-secondary text-[#0b1020] font-semibold text-sm hover:opacity-95 transition-all"
                  >
                    Confirmar e entrar
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowOtp(false)}
                    className="w-full text-xs text-on-surface-variant hover:text-white py-1"
                  >
                    Voltar
                  </button>
                </form>
              </motion.div>
            ) : (
              <>
                <form className="space-y-4" onSubmit={handleAuth}>
                  {isRegistering && (
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5 ml-1">
                        Nome completo
                      </label>
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant group-focus-within:text-primary transition-colors" />
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Ex: Ana Paula Silva"
                          required
                          className="w-full bg-white/[0.04] border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-on-surface-variant/50 focus:border-primary/60 focus:bg-white/[0.06] outline-none"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5 ml-1">
                      ID ou E-mail
                    </label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant group-focus-within:text-primary transition-colors" />
                      <input
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={isRegistering ? 'nome@escola.ao' : 'admin ou e-mail'}
                        required
                        className="w-full bg-white/[0.04] border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-on-surface-variant/50 focus:border-primary/60 focus:bg-white/[0.06] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5 px-1">
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
                        Palavra-passe
                      </label>
                      {!isRegistering && (
                        <button type="button" className="text-[11px] text-primary hover:underline">
                          Esqueceu-se?
                        </button>
                      )}
                    </div>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant group-focus-within:text-primary transition-colors" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full bg-white/[0.04] border border-white/10 rounded-2xl py-3.5 pl-11 pr-11 text-sm text-white placeholder:text-on-surface-variant/50 focus:border-primary/60 focus:bg-white/[0.06] outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-on-surface-variant hover:text-white"
                        aria-label="Mostrar palavra-passe"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative w-full mt-2 py-3.5 rounded-full bg-white text-[#0b1020] font-semibold text-sm flex items-center justify-center gap-2 overflow-hidden shadow-[0_10px_30px_-10px_rgba(255,255,255,0.45)] hover:-translate-y-0.5 disabled:opacity-50"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-primary via-[#c7cfff] to-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <span className="relative">{loading ? 'A entrar...' : isRegistering ? 'Criar Conta' : 'Entrar no Portal'}</span>
                    {!loading &&
                      (isRegistering ? (
                        <UserPlus className="relative w-4 h-4" />
                      ) : (
                        <ArrowRight className="relative w-4 h-4 transition-transform group-hover:translate-x-1" />
                      ))}
                  </button>
                </form>

                {!isRegistering && (
                  <button
                    type="button"
                    onClick={handleDemoLogin}
                    className="mt-3 w-full py-2.5 rounded-full bg-secondary/10 border border-secondary/25 text-secondary text-xs font-semibold flex items-center justify-center gap-2 hover:bg-secondary/20 transition-all"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    Acesso Rápido Demonstração (Admin)
                  </button>
                )}

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/[0.08]" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-[#12192d] px-3 text-[11px] uppercase tracking-widest text-on-surface-variant">
                      Ou continuar com
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleSocialLogin('google')}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.09] text-xs font-semibold text-white disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Google
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSocialLogin('github')}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.09] text-xs font-semibold text-white disabled:opacity-50"
                  >
                    <Github className="w-4 h-4" />
                    GitHub
                  </button>
                </div>
              </>
            )}
          </div>

          <p className="text-center mt-6 text-xs text-on-surface-variant">
            © 2026 Elo Escolar · Angola · <Link href="/support" className="text-primary hover:underline">Precisa de ajuda?</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
