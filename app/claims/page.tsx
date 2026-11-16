'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { motion } from 'motion/react';
import { 
  MessageSquare, 
  Send, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Plus,
  Search
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

const ClaimsPage = () => {
  const { profile, isAdmin, isUser, user } = useAuth();
  const [claims, setClaims] = useState<any[]>([]);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchClaims = React.useCallback(async () => {
    try {
      let query = supabase
        .from('claims')
        .select('*')
        .order('created_at', { ascending: false });

      if (!isAdmin) {
        query = query.eq('user_id', profile?.uid);
      }

      const { data, error } = await query;
      if (error) throw error;
      setClaims(data || []);
    } catch (error) {
      console.error("Error fetching claims:", error);
    }
  }, [isAdmin, profile?.uid]);

  useEffect(() => {
    if (!profile) return;
    fetchClaims();
  }, [profile, fetchClaims]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from('claims')
        .insert([{
          user_id: profile.uid,
          user_name: profile.name || user?.email || 'Utilizador',
          subject,
          description,
          status: 'Pendente'
        }]);
      
      if (error) throw error;

      setSubject('');
      setDescription('');
      setShowForm(false);
      await fetchClaims();
      alert("A sua reclamação foi enviada com sucesso e será analisada pela administração.");
    } catch (error) {
      console.error("Error submitting claim:", error);
      alert("Erro ao enviar reclamação.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('claims')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
      await fetchClaims();
    } catch (error) {
      console.error("Error updating claim status:", error);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 lg:ml-64">
        <TopBar title="Reclamações & Sugestões" />
        
        <div className="pt-24 px-4 lg:px-8 pb-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
            <div>
              <h2 className="font-headline text-3xl lg:text-4xl font-extrabold text-white tracking-tight">Reclamações</h2>
              <p className="text-on-surface-variant mt-2 text-sm max-w-md">
                {isAdmin ? 'Gerir reclamações e sugestões dos encarregados e alunos.' : 'Envie as suas reclamações ou sugestões para a administração.'}
              </p>
            </div>
            {isUser && (
              <button 
                onClick={() => setShowForm(!showForm)}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-on-primary-fixed rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-105 transition-all"
              >
                <Plus className="w-4 h-4" />
                Nova Reclamação
              </button>
            )}
          </div>

          {showForm && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-10 bg-surface-container-low p-8 rounded-[2.5rem] border border-outline-variant/10"
            >
              <h3 className="text-xl font-bold text-white mb-6">Nova Reclamação</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-1">Assunto</label>
                  <input 
                    type="text" 
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Ex: Erro na nota de Matemática"
                    required
                    className="w-full bg-background/50 border border-outline-variant/10 rounded-2xl py-3 px-4 text-white focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-1">Descrição</label>
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Descreva detalhadamente a sua situação..."
                    required
                    rows={4}
                    className="w-full bg-background/50 border border-outline-variant/10 rounded-2xl py-3 px-4 text-white focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button 
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-6 py-3 text-sm font-bold text-on-surface-variant hover:text-white transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-8 py-3 bg-primary text-on-primary-fixed rounded-xl font-bold text-sm shadow-lg disabled:opacity-50"
                  >
                    {loading ? 'Enviando...' : 'Enviar Reclamação'}
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          <div className="space-y-4">
            {claims.length === 0 ? (
              <div className="text-center py-20 bg-surface-container-low rounded-[2.5rem] border border-outline-variant/5">
                <MessageSquare className="w-12 h-12 text-on-surface-variant/20 mx-auto mb-4" />
                <p className="text-on-surface-variant font-medium">Nenhuma reclamação encontrada.</p>
              </div>
            ) : (
              claims.map((claim) => (
                <motion.div 
                  key={claim.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                >
                  <div className="flex gap-4 items-start">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                      claim.status === 'Pendente' ? 'bg-primary/10 text-primary' : 
                      claim.status === 'Em Análise' ? 'bg-secondary/10 text-secondary' : 
                      'bg-tertiary/10 text-tertiary'
                    }`}>
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-white">{claim.subject}</h4>
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          claim.status === 'Pendente' ? 'bg-primary/10 text-primary' : 
                          claim.status === 'Em Análise' ? 'bg-secondary/10 text-secondary' : 
                          'bg-tertiary/10 text-tertiary'
                        }`}>
                          {claim.status}
                        </span>
                      </div>
                      <p className="text-sm text-on-surface-variant line-clamp-2 max-w-2xl">{claim.description}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-[10px] text-on-surface-variant/60 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(claim.created_at).toLocaleDateString()}
                        </span>
                        {isAdmin && (
                          <span className="text-[10px] text-primary font-bold">
                            De: {claim.user_name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {isAdmin && claim.status !== 'Resolvido' && (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleUpdateStatus(claim.id, 'Em Análise')}
                        className="px-4 py-2 bg-secondary/10 text-secondary rounded-xl text-xs font-bold hover:bg-secondary/20 transition-all"
                      >
                        Analisar
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus(claim.id, 'Resolvido')}
                        className="px-4 py-2 bg-tertiary/10 text-tertiary rounded-xl text-xs font-bold hover:bg-tertiary/20 transition-all"
                      >
                        Resolver
                      </button>
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClaimsPage;
