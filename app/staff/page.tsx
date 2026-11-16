'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  IdCard, 
  X,
  Phone,
  Mail,
  Briefcase,
  Building2,
  Download,
  Printer
} from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { Staff } from '@/lib/academic-utils';
import { QRCodeSVG } from 'qrcode.react';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

const StaffPage = () => {
  const { isAdmin } = useAuth();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);

  const [formData, setFormData] = useState<Partial<Staff>>({
    name: '',
    email: '',
    role: '',
    function: '',
    department: '',
    phone: '',
    status: 'Ativo'
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('staff').select('*');
      if (error) throw error;
      if (data) {
        setStaff(data.map(s => ({
          id: s.staff_id || s.id,
          name: s.name,
          email: s.email || '',
          role: s.role || '',
          function: '', // We can add this to schema if needed
          department: s.department || '',
          avatar: s.photo_url || `https://picsum.photos/seed/${s.id}/100/100`,
          phone: '', // We can add this to schema if needed
          status: s.status as any || 'Ativo',
          joinedAt: s.created_at
        })));
      }
    } catch (error) {
      console.error("Error fetching staff:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStaff = useMemo(() => {
    return staff.filter(s => 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.department.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [staff, searchTerm]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingStaff) {
        const { error } = await supabase
          .from('staff')
          .update({
            name: formData.name,
            email: formData.email,
            role: formData.role,
            department: formData.department,
            status: formData.status
          })
          .eq('staff_id', editingStaff.id);
        
        if (error) throw error;
      } else {
        const newId = `STF-2026-${String(staff.length + 1).padStart(3, '0')}`;
        const { error } = await supabase
          .from('staff')
          .insert([{
            staff_id: newId,
            name: formData.name,
            email: formData.email,
            role: formData.role,
            department: formData.department,
            status: formData.status,
            photo_url: `https://picsum.photos/seed/${Date.now()}/100/100`
          }]);
        
        if (error) throw error;
      }
      
      await fetchStaff();
      setIsModalOpen(false);
      setEditingStaff(null);
      setFormData({ name: '', email: '', role: '', function: '', department: '', phone: '', status: 'Ativo' });
    } catch (error) {
      console.error("Error saving staff:", error);
      alert("Erro ao salvar funcionário.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja eliminar este funcionário?')) {
      try {
        const { error } = await supabase.from('staff').delete().eq('staff_id', id);
        if (error) throw error;
        await fetchStaff();
      } catch (error) {
        console.error("Error deleting staff:", error);
        alert("Erro ao eliminar funcionário.");
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-white">
      <Sidebar />
      <main className="flex-1 lg:ml-64">
        <TopBar title="Gestão de Funcionários" />
        
        <div className="pt-24 px-4 lg:px-8 pb-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
            <div>
              <h2 className="font-headline text-3xl lg:text-4xl font-extrabold tracking-tight">Funcionários</h2>
              <p className="text-on-surface-variant mt-2 text-sm max-w-md">Gerencie o corpo docente e administrativo da instituição.</p>
            </div>
            {isAdmin && (
              <button 
                onClick={() => {
                  setEditingStaff(null);
                  setFormData({ name: '', email: '', role: '', function: '', department: '', phone: '', status: 'Ativo' });
                  setIsModalOpen(true);
                }}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-on-primary-fixed rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all"
              >
                <Plus className="w-5 h-5" />
                Cadastrar Funcionário
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="bg-surface-container-low p-6 rounded-[2.5rem] border border-outline-variant/5 mb-8 flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
              <input 
                type="text" 
                placeholder="Pesquisar por nome, cargo ou departamento..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-background/50 border border-outline-variant/10 rounded-2xl py-3 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <button className="flex items-center gap-2 px-5 py-3 bg-surface-container-high rounded-2xl text-sm font-bold text-on-surface-variant hover:text-white transition-all w-full md:w-auto">
              <Filter className="w-4 h-4" />
              Filtros
            </button>
          </div>

          {/* Staff Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredStaff.map((s) => (
              <motion.div 
                key={s.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-surface-container-low rounded-[2.5rem] border border-outline-variant/5 p-6 hover:border-primary/20 transition-all group"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="relative w-16 h-16 rounded-2xl overflow-hidden ring-4 ring-primary/10">
                    <Image src={s.avatar} alt={s.name} fill className="object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => {
                        setSelectedStaff(s);
                        setIsPassModalOpen(true);
                      }}
                      className="p-2 bg-secondary/10 text-secondary rounded-xl hover:bg-secondary/20 transition-all"
                      title="Ver Passe"
                    >
                      <IdCard className="w-4 h-4" />
                    </button>
                    {isAdmin && (
                      <>
                        <button 
                          onClick={() => {
                            setEditingStaff(s);
                            setFormData(s);
                            setIsModalOpen(true);
                          }}
                          className="p-2 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(s.id)}
                          className="p-2 bg-error/10 text-error rounded-xl hover:bg-error/20 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-black text-white leading-tight">{s.name}</h3>
                    <p className="text-xs text-primary font-bold uppercase tracking-widest mt-1">{s.role}</p>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center gap-3 text-on-surface-variant">
                      <Briefcase className="w-4 h-4" />
                      <span className="text-xs font-medium">{s.function}</span>
                    </div>
                    <div className="flex items-center gap-3 text-on-surface-variant">
                      <Building2 className="w-4 h-4" />
                      <span className="text-xs font-medium">{s.department}</span>
                    </div>
                    <div className="flex items-center gap-3 text-on-surface-variant">
                      <Phone className="w-4 h-4" />
                      <span className="text-xs font-medium">{s.phone}</span>
                    </div>
                    <div className="flex items-center gap-3 text-on-surface-variant">
                      <Mail className="w-4 h-4" />
                      <span className="text-xs font-medium truncate">{s.email}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-outline-variant/5 flex justify-between items-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      s.status === 'Ativo' ? 'bg-secondary/10 text-secondary' : 'bg-on-surface-variant/10 text-on-surface-variant'
                    }`}>
                      {s.status}
                    </span>
                    <span className="text-[10px] text-on-surface-variant font-bold">ID: {s.id}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Staff Modal */}
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
                className="relative w-full max-w-2xl bg-surface-container-high border border-outline-variant/10 rounded-[2.5rem] shadow-2xl overflow-hidden"
              >
                <div className="px-8 py-6 border-b border-outline-variant/10 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-white">{editingStaff ? 'Editar Funcionário' : 'Novo Funcionário'}</h2>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-surface-container-highest rounded-full transition-colors">
                    <X className="w-5 h-5 text-on-surface-variant" />
                  </button>
                </div>
                <form onSubmit={handleSave} className="p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-1">Nome Completo</label>
                      <input 
                        required
                        type="text" 
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-surface-container-low border border-outline-variant/10 rounded-xl py-3 px-4 text-white outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="Ex: Alberto Vunge"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-1">Email</label>
                      <input 
                        required
                        type="email" 
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-surface-container-low border border-outline-variant/10 rounded-xl py-3 px-4 text-white outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="exemplo@escola.ao"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-1">Cargo</label>
                      <input 
                        required
                        type="text" 
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="w-full bg-surface-container-low border border-outline-variant/10 rounded-xl py-3 px-4 text-white outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="Ex: Professor"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-1">Função</label>
                      <input 
                        required
                        type="text" 
                        value={formData.function}
                        onChange={(e) => setFormData({ ...formData, function: e.target.value })}
                        className="w-full bg-surface-container-low border border-outline-variant/10 rounded-xl py-3 px-4 text-white outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="Ex: Lecionar Matemática"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-1">Departamento</label>
                      <select 
                        required
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        className="w-full bg-surface-container-low border border-outline-variant/10 rounded-xl py-3 px-4 text-white outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="">Selecionar...</option>
                        <option value="Direção">Direção</option>
                        <option value="Pedagógico">Pedagógico</option>
                        <option value="Administrativo">Administrativo</option>
                        <option value="Financeiro">Financeiro</option>
                        <option value="Tecnologia">Tecnologia</option>
                        <option value="Serviços Gerais">Serviços Gerais</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-1">Telefone</label>
                      <input 
                        required
                        type="text" 
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full bg-surface-container-low border border-outline-variant/10 rounded-xl py-3 px-4 text-white outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="9XX XXX XXX"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button 
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 py-4 bg-surface-container-low text-white rounded-2xl font-bold hover:bg-surface-container-highest transition-all"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 py-4 bg-primary text-on-primary rounded-2xl font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all"
                    >
                      {editingStaff ? 'Guardar Alterações' : 'Cadastrar Funcionário'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Pass Modal (ID Card) */}
        <AnimatePresence>
          {isPassModalOpen && selectedStaff && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsPassModalOpen(false)}
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, rotateY: -180 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                exit={{ opacity: 0, scale: 0.9, rotateY: 180 }}
                transition={{ type: 'spring', damping: 20 }}
                className="relative w-full max-w-md aspect-[1.586/1] bg-gradient-to-br from-surface-container-high to-surface-container-low border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden"
              >
                {/* ID Card Front */}
                <div className="absolute inset-0 p-8 flex flex-col">
                  <div className="flex justify-between items-start mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                        <Users className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-black text-white text-sm tracking-tight">ELO ESCOLAR</h3>
                        <p className="text-[8px] text-primary font-bold uppercase tracking-widest">Passe Institucional</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[8px] text-on-surface-variant font-bold uppercase tracking-widest">Ano Letivo</span>
                      <p className="text-xs font-black text-white">2026/2027</p>
                    </div>
                  </div>

                  <div className="flex gap-8 items-center flex-1">
                    <div className="relative w-32 h-32 rounded-3xl overflow-hidden ring-4 ring-primary/20 shadow-xl">
                      <Image src={selectedStaff.avatar} alt={selectedStaff.name} fill className="object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex-1 space-y-4">
                      <div>
                        <h2 className="text-xl font-black text-white leading-tight">{selectedStaff.name}</h2>
                        <p className="text-xs text-primary font-bold uppercase tracking-widest mt-1">{selectedStaff.role}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">Departamento</p>
                        <p className="text-sm font-bold text-white">{selectedStaff.department}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">ID de Funcionário</p>
                        <p className="text-sm font-mono font-bold text-white">{selectedStaff.id}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto flex justify-between items-end">
                    <div className="space-y-1">
                      <p className="text-[8px] text-on-surface-variant font-bold uppercase tracking-widest">Validade</p>
                      <p className="text-[10px] font-bold text-white">DEZ 2027</p>
                    </div>
                    <div className="bg-white p-2 rounded-xl shadow-lg">
                      <QRCodeSVG 
                        value={JSON.stringify({
                          id: selectedStaff.id,
                          name: selectedStaff.name,
                          role: selectedStaff.role,
                          dept: selectedStaff.department,
                          type: 'STAFF'
                        })} 
                        size={60}
                        level="H"
                      />
                    </div>
                  </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/5 rounded-full -ml-16 -mb-16 blur-3xl" />
              </motion.div>

              {/* Action Buttons for Card */}
              <div className="absolute bottom-12 flex gap-4">
                <button className="flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-md text-white rounded-2xl font-bold hover:bg-white/20 transition-all">
                  <Download className="w-5 h-5" /> Baixar
                </button>
                <button className="flex items-center gap-2 px-6 py-3 bg-primary text-on-primary-fixed rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                  <Printer className="w-5 h-5" /> Imprimir
                </button>
              </div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default StaffPage;
