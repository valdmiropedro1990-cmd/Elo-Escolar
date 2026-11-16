'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { motion } from 'motion/react';
import { useAuth } from '@/context/AuthContext';
import { Camera, User, Mail, Lock, Save, CheckCircle2, AlertCircle, Loader2, CalendarDays } from 'lucide-react';
import Image from 'next/image';
import { uploadImage } from '@/lib/storage';

const ProfilePage = () => {
  const { profile, updateProfile } = useAuth();
  const [name, setName] = useState(profile?.name || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [password, setPassword] = useState(profile?.password || '');
  const [photoURL, setPhotoURL] = useState(profile?.photoURL || '');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage(null);
    try {
      const url = await uploadImage(file);
      setPhotoURL(url);
      setMessage({ text: 'Imagem carregada com sucesso! Não se esqueça de guardar as alterações.', type: 'success' });
    } catch (error) {
      console.error(error);
      setMessage({ text: 'Erro ao carregar imagem. Verifique se o bucket "avatars" existe no Supabase.', type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await updateProfile({
        name,
        email,
        password,
        photoURL,
      });
      setMessage({ text: 'Perfil atualizado com sucesso!', type: 'success' });
    } catch (error) {
      setMessage({ text: 'Erro ao atualizar perfil.', type: 'error' });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 lg:ml-64">
        <TopBar title="O Meu Perfil" />
        
        <div className="pt-24 px-4 lg:px-8 pb-12 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface-container-low rounded-3xl border border-outline-variant/10 overflow-hidden shadow-2xl"
          >
            {/* Header/Banner */}
            <div className="h-32 bg-gradient-to-r from-primary/20 to-secondary/20 relative">
              <div className="absolute -bottom-12 left-8">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-2xl bg-surface-container-highest border-4 border-surface-container-low overflow-hidden shadow-xl relative group">
                    <Image 
                       src={photoURL || `https://ui-avatars.com/api/?name=${name || 'User'}&background=random`}
                       alt="Profile"
                       fill
                       className="object-cover"
                       referrerPolicy="no-referrer"
                    />
                    
                    {/* Hover Overlay for Desktop */}
                    <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer">
                      {uploading ? (
                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                      ) : (
                        <>
                          <Camera className="w-6 h-6 text-white mb-1" />
                          <span className="text-[10px] text-white font-bold uppercase">Mudar</span>
                        </>
                      )}
                      <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={uploading} />
                    </label>
                  </div>
                  
                  {/* Mobile Camera Button - Always visible on small screens */}
                  <label className="lg:hidden absolute bottom-0 right-0 p-2 bg-primary text-on-primary-fixed rounded-xl shadow-lg border-2 border-surface-container-low cursor-pointer active:scale-95 transition-all">
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={uploading} />
                  </label>
                </div>
              </div>
            </div>

            <div className="pt-16 p-8">
              <div className="mb-8">
                <h2 className="text-2xl font-headline font-bold text-white">{profile?.name || 'Utilizador'}</h2>
                <p className="text-on-surface-variant text-sm uppercase tracking-widest font-bold mt-1">
                  {profile?.role === 'primary_admin' ? 'Administrador Primário' : 
                   profile?.role === 'secondary_admin' ? 'Administrador Secundário' : 'Encarregado de Educação'}
                </p>
              </div>

              {message && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`mb-6 p-4 rounded-xl flex items-center gap-3 border ${
                    message.type === 'success' ? 'bg-secondary/10 border-secondary/20 text-secondary' : 'bg-error/10 border-error/20 text-error'
                  }`}
                >
                  {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                  <span className="text-sm font-bold">{message.text}</span>
                </motion.div>
              )}

              <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-1">Nome Completo</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant group-focus-within:text-primary transition-colors" />
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-surface-container-highest border border-outline-variant/10 rounded-2xl py-3 pl-12 pr-4 text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-1">ID / E-mail</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant group-focus-within:text-primary transition-colors" />
                    <input 
                      type="text" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-surface-container-highest border border-outline-variant/10 rounded-2xl py-3 pl-12 pr-4 text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-1">Palavra-passe</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant group-focus-within:text-primary transition-colors" />
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Deixe em branco para não alterar"
                      className="w-full bg-surface-container-highest border border-outline-variant/10 rounded-2xl py-3 pl-12 pr-4 text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-1">Ano Letivo Ativo</label>
                  <div className="relative group">
                    <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant group-focus-within:text-primary transition-colors" />
                    <select 
                      className="w-full bg-surface-container-highest border border-outline-variant/10 rounded-2xl py-3 pl-12 pr-4 text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none cursor-pointer"
                    >
                      <option>Ano Letivo 2024</option>
                      <option>Ano Letivo 2025</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-1">Cargo / Nível de Acesso</label>
                  <div className="w-full bg-surface-container-highest/50 border border-outline-variant/5 rounded-2xl py-3 px-4 text-on-surface-variant text-sm font-medium">
                    {profile?.role === 'primary_admin' ? 'Administrador Primário' : 
                     profile?.role === 'secondary_admin' ? 'Administrador Secundário' : 'Encarregado de Educação'}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-1">Permissões Ativas</label>
                  <div className="w-full bg-surface-container-highest/50 border border-outline-variant/5 rounded-2xl py-3 px-4 text-on-surface-variant text-sm font-medium">
                    {profile?.permissions?.join(', ') || 'Acesso Padrão'}
                  </div>
                </div>

                <div className="md:col-span-2 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full md:w-max px-8 py-4 bg-primary text-on-primary-fixed rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    {loading ? 'A guardar...' : 'Guardar Alterações'}
                    <Save className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
