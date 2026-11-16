'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { motion } from 'motion/react';
import { 
  Wallet, 
  TrendingUp, 
  ArrowDownRight, 
  ArrowUpRight, 
  CreditCard, 
  DollarSign,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit2,
  X,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { Transaction, Student } from '@/lib/academic-utils';
import { AnimatePresence } from 'motion/react';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

const FinancialPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'Receita' | 'Despesa'>('all');

  const [formData, setFormData] = useState<Partial<Transaction>>({
    description: '',
    amount: 0,
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
          description: t.description || `Pagamento - ${t.student_id}`,
          amount: t.amount,
          type: (t.type as any) || 'Receita',
          category: (t.category as any) || 'Propina',
          date: t.created_at,
          status: (t.status as any) || 'Pago'
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
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, searchTerm, filterType]);

  const stats = useMemo(() => {
    const income = transactions.filter(t => t.type === 'Receita').reduce((acc, t) => acc + t.amount, 0);
    const expenses = transactions.filter(t => t.type === 'Despesa').reduce((acc, t) => acc + t.amount, 0);
    const pending = transactions.filter(t => t.status === 'Pendente').reduce((acc, t) => acc + t.amount, 0);
    return { income, expenses, pending, balance: income - expenses };
  }, [transactions]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTransaction) {
        const { error } = await supabase
          .from('payments')
          .update({
            description: formData.description,
            amount: formData.amount,
            type: formData.type,
            category: formData.category,
            status: formData.status
          })
          .eq('id', editingTransaction.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('payments')
          .insert([{
            description: formData.description,
            amount: formData.amount,
            type: formData.type,
            category: formData.category,
            status: formData.status,
            student_id: formData.studentId // Assuming studentId is in formData or selected
          }]);
        
        if (error) throw error;
      }
      
      await fetchData();
      setIsModalOpen(false);
      setEditingTransaction(null);
      setFormData({ description: '', amount: 0, type: 'Receita', category: 'Propina', date: new Date().toISOString().split('T')[0], status: 'Pago' });
    } catch (error) {
      console.error("Error saving transaction:", error);
      alert("Erro ao salvar transação.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja eliminar esta transação?')) {
      try {
        const { error } = await supabase.from('payments').delete().eq('id', id);
        if (error) throw error;
        await fetchData();
      } catch (error) {
        console.error("Error deleting transaction:", error);
        alert("Erro ao eliminar transação.");
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 lg:ml-64">
        <TopBar title="Financeiro" />
        
        <div className="pt-24 px-4 lg:px-8 pb-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="font-headline text-3xl lg:text-4xl font-extrabold tracking-tight text-white mb-2">Visão Geral Financeira</h2>
              <p className="text-on-surface-variant max-w-xl text-sm lg:text-base">Gerir pagamentos de propinas, despesas institucionais e métricas de saúde financeira.</p>
            </motion.div>
            <button 
              onClick={() => {
                setEditingTransaction(null);
                setFormData({ description: '', amount: 0, type: 'Receita', category: 'Propina', date: new Date().toISOString().split('T')[0], status: 'Pago' });
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-on-primary-fixed rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-105 transition-all"
            >
              <Plus className="w-4 h-4" /> Nova Transação
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/5">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                  <ArrowUp className="w-5 h-5" />
                </div>
              </div>
              <p className="text-on-surface-variant text-sm font-medium mb-1">Receitas</p>
              <h3 className="text-2xl font-black text-white">{stats.income.toLocaleString()} Kz</h3>
            </div>
            
            <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/5">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center text-error">
                  <ArrowDown className="w-5 h-5" />
                </div>
              </div>
              <p className="text-on-surface-variant text-sm font-medium mb-1">Despesas</p>
              <h3 className="text-2xl font-black text-white">{stats.expenses.toLocaleString()} Kz</h3>
            </div>

            <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/5">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Wallet className="w-5 h-5" />
                </div>
              </div>
              <p className="text-on-surface-variant text-sm font-medium mb-1">Saldo Geral</p>
              <h3 className="text-2xl font-black text-white">{stats.balance.toLocaleString()} Kz</h3>
            </div>

            <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/5">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-full bg-tertiary/10 flex items-center justify-center text-tertiary">
                  <CreditCard className="w-5 h-5" />
                </div>
              </div>
              <p className="text-on-surface-variant text-sm font-medium mb-1">Pendentes</p>
              <h3 className="text-2xl font-black text-white">{stats.pending.toLocaleString()} Kz</h3>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-surface-container-low rounded-3xl border border-outline-variant/5 overflow-hidden">
            <div className="p-6 border-b border-outline-variant/10 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                <input 
                  type="text" 
                  placeholder="Pesquisar transação..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-background/50 border border-outline-variant/10 rounded-xl py-2.5 pl-11 pr-4 text-sm text-white outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <select 
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="bg-surface-container-high border border-outline-variant/10 rounded-xl px-4 py-2 text-xs font-bold text-white outline-none"
                >
                  <option value="all">Todos os Tipos</option>
                  <option value="Receita">Receitas</option>
                  <option value="Despesa">Despesas</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-high/50">
                    <th className="px-6 py-4 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Data</th>
                    <th className="px-6 py-4 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Descrição</th>
                    <th className="px-6 py-4 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Categoria</th>
                    <th className="px-6 py-4 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Valor</th>
                    <th className="px-6 py-4 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-[10px] font-black text-on-surface-variant uppercase tracking-widest text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/5">
                  {filteredTransactions.map((t) => (
                    <tr key={t.id} className="hover:bg-surface-container-highest/30 transition-colors group">
                      <td className="px-6 py-4 text-sm text-on-surface-variant">
                        {new Date(t.date).toLocaleDateString('pt-PT')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${t.type === 'Receita' ? 'bg-secondary/10 text-secondary' : 'bg-error/10 text-error'}`}>
                            {t.type === 'Receita' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                          </div>
                          <span className="text-sm font-bold text-white">{t.description}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-medium text-on-surface-variant bg-surface-container-highest px-2 py-1 rounded-lg">
                          {t.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-black ${t.type === 'Receita' ? 'text-secondary' : 'text-error'}`}>
                          {t.type === 'Receita' ? '+' : '-'}{t.amount.toLocaleString()} Kz
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          t.status === 'Pago' ? 'bg-secondary/10 text-secondary' : 
                          t.status === 'Pendente' ? 'bg-primary/10 text-primary' : 
                          'bg-error/10 text-error'
                        }`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => {
                              setEditingTransaction(t);
                              setFormData(t);
                              setIsModalOpen(true);
                            }}
                            className="p-2 hover:bg-surface-container-highest rounded-lg text-on-surface-variant hover:text-white transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(t.id)}
                            className="p-2 hover:bg-error/10 rounded-lg text-on-surface-variant hover:text-error transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredTransactions.length === 0 && (
                <div className="py-20 text-center">
                  <DollarSign className="w-12 h-12 text-on-surface-variant/20 mx-auto mb-4" />
                  <p className="text-on-surface-variant">Nenhuma transação encontrada.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Transaction Modal */}
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
                <h2 className="text-xl font-bold text-white">{editingTransaction ? 'Editar Transação' : 'Nova Transação'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-surface-container-highest rounded-full transition-colors">
                  <X className="w-5 h-5 text-on-surface-variant" />
                </button>
              </div>
              <form onSubmit={handleSave} className="p-8 space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-on-surface-variant">Descrição</label>
                    <input 
                      required
                      type="text"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full bg-surface-container-low border border-outline-variant/10 rounded-xl py-3 px-4 text-white outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="Ex: Pagamento de Propina - João Silva"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-on-surface-variant">Tipo</label>
                      <select 
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                        className="w-full bg-surface-container-low border border-outline-variant/10 rounded-xl py-3 px-4 text-white outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="Receita">Receita</option>
                        <option value="Despesa">Despesa</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-on-surface-variant">Categoria</label>
                      <select 
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                        className="w-full bg-surface-container-low border border-outline-variant/10 rounded-xl py-3 px-4 text-white outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="Propina">Propina</option>
                        <option value="Matrícula">Matrícula</option>
                        <option value="Salário">Salário</option>
                        <option value="Manutenção">Manutenção</option>
                        <option value="Outros">Outros</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-on-surface-variant">Valor (Kz)</label>
                      <input 
                        required
                        type="number"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                        className="w-full bg-surface-container-low border border-outline-variant/10 rounded-xl py-3 px-4 text-white outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-on-surface-variant">Data</label>
                      <input 
                        required
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full bg-surface-container-low border border-outline-variant/10 rounded-xl py-3 px-4 text-white outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-on-surface-variant">Status</label>
                    <select 
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full bg-surface-container-low border border-outline-variant/10 rounded-xl py-3 px-4 text-white outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="Pago">Pago</option>
                      <option value="Pendente">Pendente</option>
                      <option value="Atrasado">Atrasado</option>
                    </select>
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
                    {editingTransaction ? 'Guardar Alterações' : 'Registar Transação'}
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

export default FinancialPage;
