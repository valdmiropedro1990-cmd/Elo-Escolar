'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { 
  MoreHorizontal, 
  Plus, 
  ExternalLink, 
  Calendar,
  CheckCircle2,
  X,
  User,
  Phone,
  Mail,
  DollarSign,
  Trash2,
  Edit2
} from 'lucide-react';
import Image from 'next/image';
import { Lead } from '@/lib/academic-utils';
import { AnimatePresence, motion } from 'motion/react';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

const FunnelPage = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [formData, setFormData] = useState<Partial<Lead>>({
    name: '',
    grade: '10ª Classe',
    status: 'Leads',
    responsible: '',
    value: 0,
    phone: '',
    email: ''
  });

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('sales_leads')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (data) {
        setLeads(data.map(l => ({
          id: l.id,
          name: l.name,
          grade: l.grade || '',
          status: l.status as any || 'Leads',
          responsible: l.responsible || '',
          value: l.value || 0,
          phone: l.phone || '',
          email: l.email || '',
          createdAt: l.created_at,
          avatar: `https://picsum.photos/seed/${l.id}/100/100`
        })));
      }
    } catch (error) {
      console.error("Error fetching leads:", error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { id: 'Leads', title: 'Leads' },
    { id: 'Visita Agendada', title: 'Visita Agendada' },
    { id: 'Documentação', title: 'Documentação' },
    { id: 'Concluído', title: 'Concluído' }
  ];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingLead) {
        const { error } = await supabase
          .from('sales_leads')
          .update({
            name: formData.name,
            grade: formData.grade,
            status: formData.status,
            responsible: formData.responsible,
            value: formData.value,
            phone: formData.phone,
            email: formData.email
          })
          .eq('id', editingLead.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('sales_leads')
          .insert([{
            name: formData.name,
            grade: formData.grade,
            status: formData.status,
            responsible: formData.responsible,
            value: formData.value,
            phone: formData.phone,
            email: formData.email
          }]);
        
        if (error) throw error;
      }

      await fetchLeads();
      setIsModalOpen(false);
      setEditingLead(null);
      setFormData({ name: '', grade: '10ª Classe', status: 'Leads', responsible: '', value: 0, phone: '', email: '' });
    } catch (error) {
      console.error("Error saving lead:", error);
      alert("Erro ao salvar lead.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja eliminar este lead?')) {
      try {
        const { error } = await supabase.from('sales_leads').delete().eq('id', id);
        if (error) throw error;
        await fetchLeads();
      } catch (error) {
        console.error("Error deleting lead:", error);
        alert("Erro ao eliminar lead.");
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 lg:ml-64">
        <TopBar title="Funil de Vendas" />
        
        <div className="pt-24 px-4 lg:px-8 pb-12">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-10 gap-4">
            <div>
              <h2 className="font-headline text-3xl lg:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-container tracking-tight">Funil de Matrículas</h2>
              <p className="text-on-surface-variant mt-2 text-sm max-w-md">Acompanhamento em tempo real das matrículas e pipeline de conversão de novos alunos em Angola.</p>
            </div>
            <div className="bg-surface-container-high rounded-full px-4 py-2 flex items-center gap-2 border border-outline-variant/10">
              <span className="w-2 h-2 rounded-full bg-secondary"></span>
              <span className="text-xs font-bold text-secondary">ATUALIZAÇÕES EM TEMPO REAL</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-start">
            {columns.map((col) => {
              const colLeads = leads.filter(l => l.status === col.id);
              return (
                <div key={col.id} className="flex flex-col gap-4">
                  <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-white uppercase tracking-widest">{col.title}</span>
                      <span className="bg-surface-container-highest px-2 py-0.5 rounded text-[10px] font-bold text-primary">{colLeads.length.toString().padStart(2, '0')}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 min-h-[200px]">
                    {colLeads.map((card) => (
                      <motion.div 
                        key={card.id}
                        layout
                        whileHover={{ scale: 1.02 }}
                        className={`group p-5 rounded-xl border border-transparent transition-all cursor-pointer shadow-sm ${
                          col.id === 'Concluído' ? 'bg-[#2a3548]/30 border-secondary/20 backdrop-blur-sm' : 'bg-surface-container-low hover:border-primary/20 hover:bg-surface-container-high'
                        } relative overflow-hidden`}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${
                            card.status === 'Leads' ? 'bg-secondary/10 text-secondary' : 
                            card.status === 'Visita Agendada' ? 'bg-tertiary/10 text-tertiary' : 
                            'text-secondary flex items-center gap-1'
                          }`}>
                            {card.status === 'Concluído' && <CheckCircle2 className="w-3 h-3 fill-secondary/20" />}
                            {card.status}
                          </span>
                          <div className="flex gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => {
                                setEditingLead(card);
                                setFormData(card);
                                setIsModalOpen(true);
                              }}
                              className="p-1.5 hover:bg-surface-container-highest rounded-lg text-on-surface-variant hover:text-white transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => handleDelete(card.id)}
                              className="p-1.5 hover:bg-error/10 rounded-lg text-on-surface-variant hover:text-error transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <h4 className="font-bold text-white mb-1">{card.name}</h4>
                        <p className="text-xs text-on-surface-variant mb-4">{card.grade}</p>

                        <div className="flex items-center gap-2 mb-4">
                          <div className="relative w-6 h-6 rounded-full overflow-hidden grayscale group-hover:grayscale-0 transition-all">
                            <Image 
                              src={card.avatar} 
                              alt={card.responsible} 
                              fill 
                              className="object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <span className="text-[11px] text-on-surface-variant">Resp: <strong className="text-on-surface">{card.responsible}</strong></span>
                        </div>

                        <div className="pt-4 border-t border-outline-variant/10 flex justify-between items-center">
                          <span className="text-[10px] text-on-surface-variant font-medium uppercase tracking-wider">
                            {col.id === 'Concluído' ? 'Propina Mensal' : 'Valor Previsto'}
                          </span>
                          <span className={`font-headline font-extrabold ${col.id === 'Concluído' ? 'text-secondary' : 'text-primary'}`}>
                            {card.value.toLocaleString()} Kz
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <button 
        onClick={() => {
          setEditingLead(null);
          setFormData({ name: '', grade: '10ª Classe', status: 'Leads', responsible: '', value: 0, phone: '', email: '' });
          setIsModalOpen(true);
        }}
        className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-br from-primary to-primary-container rounded-full shadow-2xl shadow-primary/20 flex items-center justify-center text-on-primary-fixed z-50 hover:scale-110 active:scale-95 transition-all"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Lead Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-surface-container-high border border-outline-variant/10 rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="px-8 py-6 border-b border-outline-variant/10 flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">{editingLead ? 'Editar Lead' : 'Novo Lead'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-surface-container-highest rounded-full transition-colors">
                  <X className="w-5 h-5 text-on-surface-variant" />
                </button>
              </div>
              <form onSubmit={handleSave} className="p-8 space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-on-surface-variant">Nome do Candidato</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                      <input 
                        required
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-surface-container-low border border-outline-variant/10 rounded-xl py-3 pl-11 pr-4 text-white outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="Ex: João Silva"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-on-surface-variant">Classe Pretendida</label>
                      <input 
                        required
                        type="text"
                        value={formData.grade}
                        onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                        className="w-full bg-surface-container-low border border-outline-variant/10 rounded-xl py-3 px-4 text-white outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="Ex: 10ª Classe"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-on-surface-variant">Status</label>
                      <select 
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                        className="w-full bg-surface-container-low border border-outline-variant/10 rounded-xl py-3 px-4 text-white outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        {columns.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-on-surface-variant">Telefone</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                        <input 
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full bg-surface-container-low border border-outline-variant/10 rounded-xl py-3 pl-11 pr-4 text-white outline-none focus:ring-2 focus:ring-primary/20"
                          placeholder="923 000 000"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-on-surface-variant">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                        <input 
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full bg-surface-container-low border border-outline-variant/10 rounded-xl py-3 pl-11 pr-4 text-white outline-none focus:ring-2 focus:ring-primary/20"
                          placeholder="exemplo@email.com"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-on-surface-variant">Responsável</label>
                      <input 
                        required
                        type="text"
                        value={formData.responsible}
                        onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
                        className="w-full bg-surface-container-low border border-outline-variant/10 rounded-xl py-3 px-4 text-white outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="Nome do consultor"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-on-surface-variant">Valor Previsto (Kz)</label>
                      <div className="relative">
                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                        <input 
                          required
                          type="number"
                          value={formData.value}
                          onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                          className="w-full bg-surface-container-low border border-outline-variant/10 rounded-xl py-3 pl-11 pr-4 text-white outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 bg-surface-container-low text-white rounded-xl font-medium hover:bg-surface-container-highest transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-primary text-on-primary rounded-xl font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                  >
                    {editingLead ? 'Guardar Alterações' : 'Criar Lead'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FunnelPage;
