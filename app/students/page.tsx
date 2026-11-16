'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileDown, 
  UserPlus, 
  Search, 
  ChevronDown, 
  Eye, 
  Edit2, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  GraduationCap,
  MessageSquare,
  MoreHorizontal,
  X
} from 'lucide-react';
import Image from 'next/image';
import { Student, Turma } from '@/lib/academic-utils';
import { useAuth } from '@/context/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
import { IdCard, Download, Printer, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const StudentsPage = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuth();

  // Form State
  const [formData, setFormData] = useState<Partial<Student>>({
    name: '',
    email: '',
    grade: '',
    classId: '',
    status: 'Ativo',
    engagement: 100
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Turmas
      const { data: turmasData } = await supabase.from('classes').select('*');
      if (turmasData) {
        setTurmas(turmasData.map(t => ({
          id: t.id,
          name: t.name,
          grade: t.grade || '',
          room: t.room || '',
          level: '',
          shift: 'Manhã',
          coordinator: '',
          studentsCount: 0
        })));
      }

      // Fetch Students
      const { data: studentsData } = await supabase.from('students').select('*').limit(50); // Limit initial load
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
          number: 0 // We'll handle this or use a column
        })));
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           s.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGrade = filterGrade === 'all' || s.grade === filterGrade;
      return matchesSearch && matchesGrade;
    });
  }, [students, searchTerm, filterGrade]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingStudent) {
        const { error } = await supabase
          .from('students')
          .update({
            name: formData.name,
            email: formData.email,
            grade: formData.grade,
            class_id: formData.classId,
            status: formData.status,
            engagement_score: formData.engagement
          })
          .eq('student_id', editingStudent.id);
        
        if (error) throw error;
      } else {
        const newId = `ALU-2026-${Math.floor(Math.random() * 9000) + 1000}`;
        const { error } = await supabase
          .from('students')
          .insert([{
            student_id: newId,
            name: formData.name,
            email: formData.email,
            grade: formData.grade,
            class_id: formData.classId,
            status: formData.status,
            engagement_score: formData.engagement,
            photo_url: `https://picsum.photos/seed/${Date.now()}/100/100`
          }]);
        
        if (error) throw error;
      }

      await fetchData();
      setIsModalOpen(false);
      setEditingStudent(null);
      setFormData({ name: '', email: '', grade: '', classId: '', status: 'Ativo', engagement: 100 });
    } catch (error) {
      console.error("Error saving student:", error);
      alert("Erro ao salvar aluno.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem a certeza que deseja eliminar este aluno?')) {
      try {
        const { error } = await supabase.from('students').delete().eq('student_id', id);
        if (error) throw error;
        await fetchData();
      } catch (error) {
        console.error("Error deleting student:", error);
        alert("Erro ao eliminar aluno.");
      }
    }
  };

  const openEditModal = (student: Student) => {
    setEditingStudent(student);
    setFormData(student);
    setIsModalOpen(true);
  };

  const getTurmaName = (classId: string) => {
    return turmas.find(t => t.id === classId)?.name || 'Sem Turma';
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 lg:ml-64">
        <TopBar title="Gestão de Alunos" />
        
        <div className="pt-24 px-4 lg:px-8 pb-12">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
            <div>
              <h2 className="font-headline text-3xl lg:text-4xl font-extrabold tracking-tight text-white mb-2">Gestão de Alunos</h2>
              <p className="text-on-surface-variant max-w-xl text-sm lg:text-base">Monitorize a saúde académica, acompanhe os ciclos de matrícula e faça a curadoria da jornada de aprendizagem da sua comunidade educativa.</p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <button className="flex-1 md:flex-none bg-surface-container-high px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 text-white hover:bg-surface-bright transition-all border border-outline-variant/10">
                <FileDown className="w-4 h-4" />
                Exportar PDF
              </button>
              {isAdmin && (
                <button 
                  onClick={() => {
                    setEditingStudent(null);
                    setFormData({ name: '', email: '', grade: '', classId: '', status: 'Ativo', engagement: 100 });
                    setIsModalOpen(true);
                  }}
                  className="flex-1 md:flex-none bg-gradient-to-r from-primary to-primary-container px-6 py-2.5 rounded-xl text-sm font-bold text-on-primary-fixed shadow-lg shadow-primary/10 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <UserPlus className="w-4 h-4" />
                  Registar Aluno
                </button>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
              <input 
                type="text" 
                placeholder="Pesquisar por nome ou ID..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>
            <div className="md:col-span-1 bg-surface-container-low p-4 rounded-2xl flex flex-col gap-2 border border-outline-variant/5">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest px-1">Classe</label>
              <div className="relative">
                <select 
                  value={filterGrade}
                  onChange={(e) => setFilterGrade(e.target.value)}
                  className="w-full bg-surface-container-highest text-sm rounded-xl py-2.5 px-3 border-none focus:ring-1 focus:ring-secondary/40 appearance-none text-on-surface outline-none"
                >
                  <option value="all">Todas as Classes</option>
                  {Array.from(new Set(students.map(s => s.grade))).map(grade => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant w-4 h-4" />
              </div>
            </div>
            <div className="md:col-span-1 bg-surface-container-low p-4 rounded-2xl flex flex-col gap-2 border border-outline-variant/5">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest px-1">Total</label>
              <div className="flex items-center justify-center h-full">
                <span className="text-xl font-black text-white">{filteredStudents.length}</span>
              </div>
            </div>
          </div>

          {/* Table / Card Layout */}
          <div className="bg-surface-container-low rounded-2xl overflow-hidden border border-outline-variant/5">
            <div className="overflow-x-auto hidden md:block">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-high/50">
                    <th className="px-6 py-5 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Identidade do Aluno</th>
                    <th className="px-6 py-5 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">ID de Matrícula</th>
                    <th className="px-6 py-5 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Turma / Grupo</th>
                    <th className="px-6 py-5 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Estado Académico</th>
                    <th className="px-6 py-5 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Envolvimento</th>
                    <th className="px-6 py-5 text-right text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/5">
                  {filteredStudents.slice(0, 10).map((student) => (
                    <tr key={student.id} className="group hover:bg-surface-container-highest transition-colors duration-200">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
                            <Image 
                              src={student.avatar} 
                              alt={student.name} 
                              fill 
                              className="object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">{student.name}</p>
                            <p className="text-[11px] text-on-surface-variant">{student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-mono text-on-surface-variant">#{student.id}</span>
                          <span className="text-[10px] font-bold text-primary">Nº {student.number}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-highest text-[11px] font-medium text-tertiary">
                          <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                          {getTurmaName(student.classId)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight ${
                          student.status === 'Ativo' ? 'bg-secondary/10 text-secondary' : 
                          student.status === 'Suspenso' ? 'bg-error/10 text-error' : 
                          'bg-outline-variant/20 text-on-surface-variant'
                        }`}>
                          {student.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="w-24 h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                          <div 
                            className={`h-full bg-gradient-to-r ${
                              student.engagement > 80 ? 'from-secondary to-primary' : 
                              student.engagement > 40 ? 'from-error to-secondary' : 
                              'from-error to-error'
                            }`}
                            style={{ width: `${student.engagement}%` }}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => {
                              setSelectedStudent(student);
                              setIsPassModalOpen(true);
                            }}
                            className="p-2 rounded-lg text-on-surface-variant hover:text-white hover:bg-surface-bright transition-all"
                            title="Ver Passe"
                          >
                            <IdCard className="w-4 h-4" />
                          </button>
                          <button className="p-2 rounded-lg text-on-surface-variant hover:text-white hover:bg-surface-bright transition-all">
                            <Eye className="w-4 h-4" />
                          </button>
                          {isAdmin && (
                            <>
                              <button 
                                onClick={() => openEditModal(student)}
                                className="p-2 rounded-lg text-on-surface-variant hover:text-white hover:bg-surface-bright transition-all"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDelete(student.id)}
                                className="p-2 rounded-lg text-on-surface-variant hover:text-error hover:bg-error/10 transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card Layout */}
            <div className="md:hidden divide-y divide-outline-variant/5">
              {filteredStudents.slice(0, 10).map((student) => (
                <div key={student.id} className="p-6 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="relative w-14 h-14 rounded-2xl overflow-hidden shadow-lg">
                      <Image 
                        src={student.avatar} 
                        alt={student.name} 
                        fill 
                        className="object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-base font-bold text-white">{student.name}</p>
                      <p className="text-xs text-on-surface-variant">{student.email}</p>
                      <p className="text-[10px] text-on-surface-variant font-mono mt-1">#{student.id} • Nº {student.number}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Turma</span>
                      <div className="text-xs font-bold text-tertiary">{getTurmaName(student.classId)}</div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Estado</span>
                      <div>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-tight ${
                          student.status === 'Ativo' ? 'bg-secondary/10 text-secondary' : 
                          student.status === 'Suspenso' ? 'bg-error/10 text-error' : 
                          'bg-outline-variant/20 text-on-surface-variant'
                        }`}>
                          {student.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Envolvimento</span>
                      <span className="text-xs font-bold text-secondary">{student.engagement}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${
                          student.engagement > 80 ? 'from-secondary to-primary' : 
                          student.engagement > 40 ? 'from-error to-secondary' : 
                          'from-error to-error'
                        }`}
                        style={{ width: `${student.engagement}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button 
                      onClick={() => {
                        setSelectedStudent(student);
                        setIsPassModalOpen(true);
                      }}
                      className="flex-1 py-2 bg-secondary/10 rounded-xl text-xs font-bold text-secondary flex items-center justify-center gap-2"
                    >
                      <IdCard className="w-4 h-4" /> Passe
                    </button>
                    <button className="flex-1 py-2 bg-surface-container-highest rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2">
                      <Eye className="w-4 h-4" /> Ver
                    </button>
                    {isAdmin && (
                      <>
                        <button 
                          onClick={() => openEditModal(student)}
                          className="flex-1 py-2 bg-surface-container-highest rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2"
                        >
                          <Edit2 className="w-4 h-4" /> Editar
                        </button>
                        <button 
                          onClick={() => handleDelete(student.id)}
                          className="flex-1 py-2 bg-error/10 rounded-xl text-xs font-bold text-error flex items-center justify-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" /> Eliminar
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Pagination */}
            <div className="flex justify-between items-center px-8 py-6 bg-surface-container-low border-t border-outline-variant/5">
              <p className="text-xs text-on-surface-variant">A mostrar <span className="font-bold text-white">{Math.min(filteredStudents.length, 10)}</span> de <span className="font-bold text-white">{filteredStudents.length}</span> alunos</p>
              <div className="flex gap-2">
                <button className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-highest transition-colors disabled:opacity-30" disabled>
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex gap-1">
                  <button className="w-8 h-8 rounded-lg bg-primary text-on-primary-fixed text-xs font-bold">1</button>
                </div>
                <button className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-highest transition-colors disabled:opacity-30" disabled>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Analytics Strip */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
            <AnalyticsCard icon={TrendingUp} label="Índice de Crescimento" value="+12.4%" detail="vs último período" color="secondary" />
            <AnalyticsCard icon={ShieldCheck} label="Conformidade" value="98.2%" detail="docs verificados" color="primary" />
            <AnalyticsCard icon={GraduationCap} label="Nota Média" value="A-" detail="média institucional" color="tertiary" />
          </div>

          {/* CRUD Modal */}
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
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="relative w-full max-w-lg bg-surface-container-low p-8 rounded-[2.5rem] border border-outline-variant/10 shadow-2xl"
                >
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-headline font-bold text-white">
                      {editingStudent ? 'Editar Aluno' : 'Registar Novo Aluno'}
                    </h2>
                    <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-surface-container-highest rounded-full transition-colors">
                      <X className="w-6 h-6 text-on-surface-variant" />
                    </button>
                  </div>

                  <form onSubmit={handleSave} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Nome Completo</label>
                      <input 
                        type="text" 
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Ex: João Manuel"
                        className="w-full bg-surface-container-highest border border-outline-variant/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary/50 outline-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">E-mail</label>
                      <input 
                        type="email" 
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="aluno@escola.ao"
                        className="w-full bg-surface-container-highest border border-outline-variant/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary/50 outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Turma</label>
                        <select 
                          value={formData.classId}
                          onChange={(e) => {
                            const selectedTurma = turmas.find(t => t.id === e.target.value);
                            setFormData({ 
                              ...formData, 
                              classId: e.target.value,
                              grade: selectedTurma?.grade || ''
                            });
                          }}
                          className="w-full bg-surface-container-highest border border-outline-variant/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary/50 outline-none"
                        >
                          <option value="">Selecionar Turma</option>
                          {turmas.map(t => (
                            <option key={t.id} value={t.id}>{t.name} ({t.grade})</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Estado</label>
                        <select 
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                          className="w-full bg-surface-container-highest border border-outline-variant/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary/50 outline-none"
                        >
                          <option value="Ativo">Ativo</option>
                          <option value="Suspenso">Suspenso</option>
                          <option value="Licença">Licença</option>
                        </select>
                      </div>
                    </div>

                    <button 
                      type="submit"
                      className="w-full py-4 bg-primary text-on-primary-fixed font-black rounded-2xl shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all mt-4"
                    >
                      {editingStudent ? 'GUARDAR ALTERAÇÕES' : 'REGISTAR ALUNO'}
                    </button>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Pass Modal (ID Card) */}
          <AnimatePresence>
            {isPassModalOpen && selectedStudent && (
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
                          <GraduationCap className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-black text-white text-sm tracking-tight">ELO ESCOLAR</h3>
                          <p className="text-[8px] text-primary font-bold uppercase tracking-widest">Passe do Aluno</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[8px] text-on-surface-variant font-bold uppercase tracking-widest">Ano Letivo</span>
                        <p className="text-xs font-black text-white">2026/2027</p>
                      </div>
                    </div>

                    <div className="flex gap-8 items-center flex-1">
                      <div className="relative w-32 h-32 rounded-3xl overflow-hidden ring-4 ring-primary/20 shadow-xl">
                        <Image src={selectedStudent.avatar} alt={selectedStudent.name} fill className="object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div className="flex-1 space-y-4">
                        <div>
                          <h2 className="text-xl font-black text-white leading-tight">{selectedStudent.name}</h2>
                          <p className="text-xs text-primary font-bold uppercase tracking-widest mt-1">{selectedStudent.grade}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">Turma / Grupo</p>
                          <p className="text-sm font-bold text-white">{getTurmaName(selectedStudent.classId)}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">ID de Matrícula</p>
                          <p className="text-sm font-mono font-bold text-white">{selectedStudent.id}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-auto flex justify-between items-end">
                      <div className="space-y-1">
                        <p className="text-[8px] text-on-surface-variant font-bold uppercase tracking-widest">Nº de Chamada</p>
                        <p className="text-sm font-black text-white">{selectedStudent.number}</p>
                      </div>
                      <div className="bg-white p-2 rounded-xl shadow-lg">
                        <QRCodeSVG 
                          value={JSON.stringify({
                            id: selectedStudent.id,
                            name: selectedStudent.name,
                            grade: selectedStudent.grade,
                            class: getTurmaName(selectedStudent.classId),
                            type: 'STUDENT'
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
        </div>
      </main>

      {/* FAB */}
      <button className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-br from-secondary to-secondary-container rounded-full shadow-2xl flex items-center justify-center text-on-secondary-fixed hover:scale-110 active:scale-95 transition-all z-50">
        <MessageSquare className="w-6 h-6" />
      </button>
    </div>
  );
};

const AnalyticsCard = ({ icon: Icon, label, value, detail, color }: any) => {
  const colorMap: any = {
    secondary: 'bg-secondary/10 text-secondary',
    primary: 'bg-primary/10 text-primary',
    tertiary: 'bg-tertiary/10 text-tertiary'
  };

  return (
    <div className="bg-surface-container p-6 rounded-2xl flex items-center gap-6 border border-outline-variant/5">
      <div className={`w-12 h-12 rounded-full ${colorMap[color]} flex items-center justify-center`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">{label}</h4>
        <p className="text-2xl font-black text-white">{value} <span className="text-xs font-normal text-on-surface-variant">{detail}</span></p>
      </div>
    </div>
  );
};

export default StudentsPage;
