'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { motion } from 'motion/react';
import { 
  FileText, 
  CreditCard, 
  UserX, 
  TrendingUp, 
  Search, 
  Filter, 
  Download,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronRight,
  Plus,
  X,
  Trash2,
  Edit2
} from 'lucide-react';
import Image from 'next/image';
import { Student, Grade, SUBJECTS, Turma } from '@/lib/academic-utils';
import { useAuth } from '@/context/AuthContext';
import { AnimatePresence } from 'motion/react';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

const ControlPage = () => {
  const [activeTab, setActiveTab] = useState('notas');
  const { isAdmin, profile } = useAuth();

  const [students, setStudents] = useState<Student[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTurma, setSelectedTurma] = useState('all');

  const [formData, setFormData] = useState<Partial<Grade>>({
    studentId: '',
    subject: SUBJECTS[0],
    period: '1º Trimestre',
    value: 0,
    type: 'MAC',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [
        { data: studentsData },
        { data: turmasData },
        { data: gradesData }
      ] = await Promise.all([
        supabase.from('students').select('*'),
        supabase.from('classes').select('*'),
        supabase.from('grades').select('*')
      ]);

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

      if (turmasData) {
        setTurmas(turmasData.map(t => ({
          id: t.id,
          name: t.name,
          level: t.level || '',
          grade: t.grade || '',
          room: t.room || '',
          shift: t.shift as any || 'Manhã',
          coordinator: t.coordinator || '',
          studentsCount: 0
        })));
      }

      if (gradesData) {
        setGrades(gradesData.map(g => ({
          id: g.id,
          studentId: g.student_id,
          turmaId: g.class_id,
          subject: g.subject,
          period: g.period as any,
          value: g.value,
          type: g.type as any,
          date: g.created_at
        })));
      }
    } catch (error) {
      console.error("Error fetching control data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTurma = selectedTurma === 'all' || s.classId === selectedTurma;
      return matchesSearch && matchesTurma;
    });
  }, [students, searchTerm, selectedTurma]);

  const stats = useMemo(() => {
    const avg = grades.length > 0 ? (grades.reduce((acc, g) => acc + g.value, 0) / grades.length).toFixed(1) : '0';
    return { avg };
  }, [grades]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find(s => s.id === formData.studentId);
    if (!student) return;

    try {
      if (editingGrade) {
        const { error } = await supabase
          .from('grades')
          .update({
            student_id: formData.studentId,
            subject: formData.subject,
            period: formData.period,
            value: formData.value,
            type: formData.type,
            class_id: student.classId
          })
          .eq('id', editingGrade.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('grades')
          .insert([{
            student_id: formData.studentId,
            subject: formData.subject,
            period: formData.period,
            value: formData.value,
            type: formData.type,
            class_id: student.classId
          }]);
        
        if (error) throw error;
      }
      
      await fetchData();
      setIsModalOpen(false);
      setEditingGrade(null);
    } catch (error) {
      console.error("Error saving grade:", error);
      alert("Erro ao salvar nota.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja eliminar esta nota?')) {
      try {
        const { error } = await supabase.from('grades').delete().eq('id', id);
        if (error) throw error;
        await fetchData();
      } catch (error) {
        console.error("Error deleting grade:", error);
        alert("Erro ao eliminar nota.");
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 lg:ml-64">
        <TopBar title="Controlo Escolar" />
        
        <div className="pt-24 px-4 lg:px-8 pb-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
            <div>
              <h2 className="font-headline text-3xl lg:text-4xl font-extrabold text-white tracking-tight">Controlo Escolar</h2>
              <p className="text-on-surface-variant mt-2 text-sm max-w-md">Gestão de notas, assiduidade, propinas e MAP (Mapa de Aproveitamento Pedagógico).</p>
            </div>
            <div className="flex gap-3">
              {isAdmin && (
                <>
                  <button 
                    onClick={() => {
                      setEditingGrade(null);
                      setFormData({ studentId: '', subject: SUBJECTS[0], period: '1º Trimestre', value: 0, type: 'MAC', date: new Date().toISOString().split('T')[0] });
                      setIsModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-secondary text-on-secondary-fixed rounded-xl font-bold text-sm shadow-lg shadow-secondary/20 hover:scale-105 transition-all"
                  >
                    <Plus className="w-4 h-4" /> Lançar Notas
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Média Geral', value: stats.avg, icon: TrendingUp, color: 'text-primary', bg: 'bg-primary/10' },
              { label: 'Assiduidade Média', value: '92%', icon: Clock, color: 'text-secondary', bg: 'bg-secondary/10' },
              { label: 'Pagamentos em Dia', value: '88%', icon: CreditCard, color: 'text-tertiary', bg: 'bg-tertiary/10' },
              { label: 'Faltas Críticas', value: '12', icon: UserX, color: 'text-error', bg: 'bg-error/10' },
            ].map((stat, i) => (
              <div key={i} className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant/5">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{stat.label}</span>
                </div>
                <h3 className="text-2xl font-black text-white">{stat.value}</h3>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-8 border-b border-outline-variant/10 overflow-x-auto pb-px">
            {[
              { id: 'notas', label: 'Notas & Avaliações', icon: FileText },
              { id: 'faltas', label: 'Assiduidade', icon: UserX },
              { id: 'pagamentos', label: 'Propinas', icon: CreditCard },
              { id: 'boletins', label: 'Boletins', icon: FileText },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-4 px-2 text-sm font-bold flex items-center gap-2 transition-all relative whitespace-nowrap ${
                  activeTab === tab.id ? 'text-primary' : 'text-on-surface-variant hover:text-white'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div layoutId="activeTabControl" className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />
                )}
              </button>
            ))}
          </div>

          {/* Main Table Container */}
          <div className="bg-surface-container-low rounded-[2.5rem] border border-outline-variant/5 overflow-hidden">
            <div className="p-6 border-b border-outline-variant/10 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                <input 
                  type="text" 
                  placeholder="Pesquisar aluno..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-background/50 border border-outline-variant/10 rounded-xl py-2.5 pl-11 pr-4 text-sm text-white outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <select 
                  value={selectedTurma}
                  onChange={(e) => setSelectedTurma(e.target.value)}
                  className="bg-surface-container-high border border-outline-variant/10 rounded-xl px-4 py-2 text-xs font-bold text-white outline-none"
                >
                  <option value="all">Todas as Turmas</option>
                  {turmas.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-high/50">
                    <th className="px-6 py-4 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Aluno</th>
                    <th className="px-6 py-4 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Turma</th>
                    <th className="px-6 py-4 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Média</th>
                    <th className="px-6 py-4 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Assiduidade</th>
                    <th className="px-6 py-4 text-[10px] font-black text-on-surface-variant uppercase tracking-widest text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/5">
                  {filteredStudents.slice(0, 10).map((student) => {
                    const studentGrades = grades.filter(g => g.studentId === student.id);
                    const avg = studentGrades.length > 0 ? (studentGrades.reduce((acc, g) => acc + g.value, 0) / studentGrades.length).toFixed(1) : '0';
                    const turma = turmas.find(t => t.id === student.classId);
                    
                    return (
                      <tr key={student.id} className="hover:bg-surface-container-highest/30 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="relative w-8 h-8 rounded-full overflow-hidden">
                              <Image 
                                src={student.avatar} 
                                alt="" 
                                fill 
                                className="object-cover"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            <span className="text-sm font-bold text-white">{student.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-on-surface-variant">{turma?.name}</td>
                        <td className="px-6 py-4">
                          <span className={`text-sm font-black ${Number(avg) >= 14 ? 'text-secondary' : Number(avg) >= 10 ? 'text-primary' : 'text-error'}`}>
                            {avg}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 w-16 bg-surface-container-highest rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${student.engagement >= 90 ? 'bg-secondary' : 'bg-primary'}`} 
                                style={{ width: `${student.engagement}%` }}
                              ></div>
                            </div>
                            <span className="text-xs font-bold text-white">{student.engagement}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => {
                                const lastGrade = studentGrades[studentGrades.length - 1];
                                if (lastGrade) {
                                  setEditingGrade(lastGrade);
                                  setFormData(lastGrade);
                                  setIsModalOpen(true);
                                } else {
                                  setEditingGrade(null);
                                  setFormData({ ...formData, studentId: student.id });
                                  setIsModalOpen(true);
                                }
                              }}
                              className="p-2 hover:bg-surface-container-highest rounded-lg text-on-surface-variant hover:text-white transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            {studentGrades.length > 0 && (
                              <button 
                                onClick={() => handleDelete(studentGrades[studentGrades.length - 1].id)}
                                className="p-2 hover:bg-error/10 rounded-lg text-on-surface-variant hover:text-error transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-6 border-t border-outline-variant/10 flex justify-between items-center bg-surface-container-high/20">
              <span className="text-xs text-on-surface-variant">A mostrar {Math.min(10, filteredStudents.length)} de {filteredStudents.length} alunos</span>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-surface-container-high rounded-xl text-xs font-bold text-on-surface-variant hover:text-white transition-colors">Anterior</button>
                <button className="px-4 py-2 bg-primary text-on-primary-fixed rounded-xl text-xs font-bold">Próximo</button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Grade Modal */}
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
                <h2 className="text-xl font-bold text-white">{editingGrade ? 'Editar Nota' : 'Lançar Nota'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-surface-container-highest rounded-full transition-colors">
                  <X className="w-5 h-5 text-on-surface-variant" />
                </button>
              </div>
              <form onSubmit={handleSave} className="p-8 space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-on-surface-variant">Aluno</label>
                    <select 
                      required
                      value={formData.studentId}
                      onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                      className="w-full bg-surface-container-low border border-outline-variant/10 rounded-xl py-3 px-4 text-white outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="">Selecionar Aluno</option>
                      {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-on-surface-variant">Disciplina</label>
                      <select 
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full bg-surface-container-low border border-outline-variant/10 rounded-xl py-3 px-4 text-white outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-on-surface-variant">Período</label>
                      <select 
                        value={formData.period}
                        onChange={(e) => setFormData({ ...formData, period: e.target.value as any })}
                        className="w-full bg-surface-container-low border border-outline-variant/10 rounded-xl py-3 px-4 text-white outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="1º Trimestre">1º Trimestre</option>
                        <option value="2º Trimestre">2º Trimestre</option>
                        <option value="3º Trimestre">3º Trimestre</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-on-surface-variant">Tipo de Avaliação</label>
                      <select 
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                        className="w-full bg-surface-container-low border border-outline-variant/10 rounded-xl py-3 px-4 text-white outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="MAC">MAC (Média Avaliação Contínua)</option>
                        <option value="NPP">NPP (Prova Parcial)</option>
                        <option value="NPT">NPT (Prova Trimestral)</option>
                        <option value="Exame">Exame</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-on-surface-variant">Nota (0-20)</label>
                      <input 
                        required
                        type="number"
                        min="0"
                        max="20"
                        step="0.1"
                        value={formData.value}
                        onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                        className="w-full bg-surface-container-low border border-outline-variant/10 rounded-xl py-3 px-4 text-white outline-none focus:ring-2 focus:ring-primary/20"
                      />
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
                    {editingGrade ? 'Guardar Alterações' : 'Lançar Nota'}
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

export default ControlPage;
