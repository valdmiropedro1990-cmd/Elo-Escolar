'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { motion } from 'motion/react';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  ArrowRight,
  CreditCard
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

const PaymentUploadPage = () => {
  const { profile, isUser, user, isAdmin } = useAuth();
  const [proofs, setProofs] = useState<any[]>([]);
  const [paymentType, setPaymentType] = useState('Propina');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchProofs = React.useCallback(async () => {
    try {
      let query = supabase
        .from('payment_proofs')
        .select('*')
        .order('created_at', { ascending: false });

      if (!isAdmin) {
        query = query.eq('user_id', profile?.uid);
      }

      const { data, error } = await query;
      if (error) throw error;
      setProofs(data || []);
    } catch (error) {
      console.error("Error fetching proofs:", error);
    }
  }, [isAdmin, profile?.uid]);

  useEffect(() => {
    if (!profile) return;
    fetchProofs();
  }, [profile, fetchProofs]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setLoading(true);

    try {
      // 1. Upload File to Supabase Storage
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = fileInput?.files?.[0];
      
      let proofUrl = `https://picsum.photos/seed/${Date.now()}/800/1200`; // Fallback

      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('payment-proofs')
          .upload(filePath, file);

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('payment-proofs')
            .getPublicUrl(filePath);
          proofUrl = publicUrl;
        }
      }
      
      const { error } = await supabase
        .from('payment_proofs')
        .insert([{
          user_id: profile.uid,
          user_name: profile.name || user?.email || 'Utilizador',
          payment_type: paymentType,
          amount: parseFloat(amount),
          proof_url: proofUrl,
          status: 'Pendente'
        }]);
      
      if (error) throw error;

      setAmount('');
      setShowForm(false);
      await fetchProofs();
      alert("Comprovativo enviado com sucesso! A administração irá validar em breve.");
    } catch (error) {
      console.error("Error uploading proof:", error);
      alert("Erro ao enviar comprovativo.");
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async (id: string, status: 'Validado' | 'Rejeitado') => {
    try {
      const { error } = await supabase
        .from('payment_proofs')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
      await fetchProofs();
    } catch (error) {
      console.error("Error validating proof:", error);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 lg:ml-64">
        <TopBar title="Pagamentos Online" />
        
        <div className="pt-24 px-4 lg:px-8 pb-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
            <div>
              <h2 className="font-headline text-3xl lg:text-4xl font-extrabold text-white tracking-tight">Pagamentos</h2>
              <p className="text-on-surface-variant mt-2 text-sm max-w-md">
                {isAdmin ? 'Validar comprovativos de pagamento enviados pelos encarregados.' : 'Envie os seus comprovativos de pagamento de propinas e boletins.'}
              </p>
            </div>
            {isUser && (
              <button 
                onClick={() => setShowForm(!showForm)}
                className="flex items-center gap-2 px-6 py-3 bg-secondary text-on-secondary-fixed rounded-xl font-bold text-sm shadow-lg shadow-secondary/20 hover:scale-105 transition-all"
              >
                <UploadCloud className="w-4 h-4" />
                Enviar Comprovativo
              </button>
            )}
          </div>

          {showForm && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-10 bg-surface-container-low p-8 rounded-[2.5rem] border border-outline-variant/10"
            >
              <h3 className="text-xl font-bold text-white mb-6">Novo Comprovativo</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-1">Tipo de Pagamento</label>
                    <select 
                      value={paymentType}
                      onChange={(e) => setPaymentType(e.target.value)}
                      className="w-full bg-background/50 border border-outline-variant/10 rounded-2xl py-3 px-4 text-white focus:ring-2 focus:ring-primary/20 outline-none"
                    >
                      <option value="Propina">Propina Mensal</option>
                      <option value="Boletim">Boletim de Notas</option>
                      <option value="Matrícula">Matrícula/Confirmação</option>
                      <option value="Uniforme">Uniforme/Material</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-1">Valor (Kz)</label>
                    <input 
                      type="number" 
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Ex: 25000"
                      required
                      className="w-full bg-background/50 border border-outline-variant/10 rounded-2xl py-3 px-4 text-white focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-1">Ficheiro do Comprovativo</label>
                  <label className="border-2 border-dashed border-outline-variant/20 rounded-2xl p-10 flex flex-col items-center justify-center gap-4 hover:border-primary/40 transition-colors cursor-pointer">
                    <UploadCloud className="w-10 h-10 text-on-surface-variant/40" />
                    <p className="text-sm text-on-surface-variant font-medium text-center">
                      Clique para selecionar o ficheiro (PDF, JPG, PNG)
                    </p>
                    <input type="file" className="hidden" accept="image/*,application/pdf" />
                  </label>
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
                    className="flex items-center gap-2 px-8 py-3 bg-secondary text-on-secondary-fixed rounded-xl font-bold text-sm shadow-lg disabled:opacity-50"
                  >
                    {loading ? 'Enviando...' : 'Submeter Comprovativo'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {proofs.length === 0 ? (
              <div className="col-span-full text-center py-20 bg-surface-container-low rounded-[2.5rem] border border-outline-variant/5">
                <CreditCard className="w-12 h-12 text-on-surface-variant/20 mx-auto mb-4" />
                <p className="text-on-surface-variant font-medium">Nenhum comprovativo enviado.</p>
              </div>
            ) : (
              proofs.map((proof) => (
                <motion.div 
                  key={proof.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-surface-container-low p-6 rounded-[2rem] border border-outline-variant/5 hover:border-secondary/20 transition-all group"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      proof.status === 'Pendente' ? 'bg-primary/10 text-primary' : 
                      proof.status === 'Validado' ? 'bg-secondary/10 text-secondary' : 
                      'bg-error/10 text-error'
                    }`}>
                      <FileText className="w-6 h-6" />
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full ${
                      proof.status === 'Pendente' ? 'bg-primary/10 text-primary' : 
                      proof.status === 'Validado' ? 'bg-secondary/10 text-secondary' : 
                      'bg-error/10 text-error'
                    }`}>
                      {proof.status}
                    </span>
                  </div>
                  
                  <h4 className="text-xl font-bold text-white mb-1">{proof.payment_type}</h4>
                  <p className="text-2xl font-black text-secondary mb-4">{proof.amount.toLocaleString()} Kz</p>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                      <Clock className="w-3.5 h-3.5" />
                      Enviado em: {new Date(proof.created_at).toLocaleDateString()}
                    </div>
                    {isAdmin && (
                      <div className="flex items-center gap-2 text-xs text-primary font-bold">
                        <FileText className="w-3.5 h-3.5" />
                        De: {proof.user_name}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <a 
                      href={proof.proof_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full py-3 bg-surface-container-highest rounded-xl text-xs font-bold text-white text-center hover:bg-white/10 transition-colors"
                    >
                      Ver Ficheiro
                    </a>
                    {isAdmin && proof.status === 'Pendente' && (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleValidate(proof.id, 'Validado')}
                          className="flex-1 py-3 bg-secondary text-on-secondary-fixed rounded-xl text-xs font-bold hover:opacity-90 transition-opacity"
                        >
                          Validar
                        </button>
                        <button 
                          onClick={() => handleValidate(proof.id, 'Rejeitado')}
                          className="flex-1 py-3 bg-error/10 text-error rounded-xl text-xs font-bold hover:bg-error/20 transition-colors"
                        >
                          Rejeitar
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PaymentUploadPage;
