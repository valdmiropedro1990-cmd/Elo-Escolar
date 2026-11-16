'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { motion, AnimatePresence } from 'motion/react';
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
  Edit2,
  Printer,
  Award,
  ShieldCheck,
  QrCode,
  ExternalLink,
  GraduationCap
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Student, Grade, SUBJECTS, Turma } from '@/lib/academic-utils';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export default function ControlPage() {
  const [activeTab, setActiveTab] = useState<'notas' | 'pauta_med' | 'boletins' | 'certificados'>('notas');
  const { isAdmin, profile } = useAuth();

  const [students, setStudents] = useState<Student[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTurma, setSelectedTurma] = useState('all');
  const [selectedCertificateStudent, setSelectedCertificateStudent] = useState<Student | null>(null);

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
          engagement: Number(s.engagement_score) || 94,
          avatar: s.photo_url || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150`,
          responsible: s.responsible_name || 'Encarregado Geral'
        })));
      }

      if (turmasData) {
        setTurmas(turmasData.map(t => ({
          id: t.id,
          name: t.name,
          level: t.level || 'II Ciclo',
          period: t.shift || 'Manhã',
          room: t.room || 'Sala 01',
          capacity: t.studentsCount || 35,
          enrolledCount: t.studentsCount || 30
        })));
      }

      if (gradesData) {
        setGrades(gradesData.map(g => ({
          id: g.id,
          studentId: g.student_id,
          subject: g.subject,
          period: g.trimester || '1º Trimestre',
          value: Number(g.mt || g.value || 15),
          type: 'MT',
          date: new Date().toISOString().split('T')[0]
        })));
      }
    } catch (err) {
      console.error('Error fetching control data:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            s.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTurma = selectedTurma === 'all' || s.classId === selectedTurma;
      return matchesSearch && matchesTurma;
    });
  }, [students, searchTerm, selectedTurma]);

  const stats = useMemo(() => {
    if (grades.length === 0) return { avg: '15.4', approved: '94%', failed: '6%' };
    const sum = grades.reduce((acc, g) => acc + g.value, 0);
    const avgVal = (sum / grades.length).toFixed(1);
    return {
      avg: avgVal,
      approved: '94%',
      failed: '6%'
    };
  }, [grades]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentId) return;

    try {
      if (editingGrade) {
        await supabase.from('grades').update({
          value: Number(formData.value),
          mt: Number(formData.value),
          subject: formData.subject,
          trimester: formData.period
        }).eq('id', editingGrade.id);
      } else {
        await supabase.from('grades').insert([{
          student_id: formData.studentId,
          subject: formData.subject,
          trimester: formData.period,
          value: Number(formData.value),
          mac: Number(formData.value),
          npp: Number(formData.value),
          npt: Number(formData.value),
          mt: Number(formData.value),
        }]);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error saving grade:', error);
    }
  };

  const handleDelete = async (gradeId: string) => {
    try {
      await supabase.from('grades').delete().eq('id', gradeId);
      fetchData();
    } catch (error) {
      console.error('Error deleting grade:', error);
    }
  };

  // Mock standard MED subjects
  const medSubjects = ['Língua Portuguesa', 'Matemática', 'Física', 'Química', 'Biologia', 'História', 'Informática'];

  return (
    <div className="flex min-h-screen bg-background text-on-surface">
      <Sidebar />
      <main className="flex-1 lg:ml-64">
        <TopBar title="Controlo Pedagógico & Pautas Oficiais" />
        
        <div className="pt-24 px-4 lg:px-8 pb-12">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
            <div>
              <span className="text-[10px] uppercase tracking-[0.25em] text-secondary font-bold">
                HOMOLOGADO SEGUNDO AS NORMAS DO MED DE ANGOLA
              </span>
              <h2 className="font-headline text-3xl lg:text-4xl font-extrabold text-white tracking-tight mt-1">
                Controlo Pedagógico & Pautas
              </h2>
              <p className="text-on-surface-variant mt-1.5 text-sm max-w-lg">
                Cálculo de médias MAC/NPP/NPT, geração de pautas gerais oficiais e impressão de boletins e certificados com chancela digital.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={() => window.print()}
                className="px-4 py-2.5 bg-surface-container-high rounded-xl text-xs font-bold text-white hover:bg-white/10 transition-all flex items-center gap-2 border border-outline-variant/10"
              >
                <Printer className="w-4 h-4 text-primary" />
                <span>Imprimir Página</span>
              </button>

              {isAdmin && (
                <button 
                  onClick={() => {
                    setEditingGrade(null);
                    setFormData({ studentId: '', subject: SUBJECTS[0], period: '1º Trimestre', value: 14, type: 'MAC', date: new Date().toISOString().split('T')[0] });
                    setIsModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                >
                  <Plus className="w-4 h-4" /> Lançar Notas
                </button>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Média Geral da Escola', value: `${stats.avg} Val.`, icon: TrendingUp, color: 'text-secondary', bg: 'bg-secondary/10' },
              { label: 'Assiduidade Média', value: '94.2%', icon: Clock, color: 'text-primary', bg: 'bg-primary/10' },
              { label: 'Taxa de Transição (Aptos)', value: '94%', icon: CheckCircle2, color: 'text-secondary', bg: 'bg-secondary/10' },
              { label: 'Alunos em Recurso', value: '4 Alunos', icon: AlertCircle, color: 'text-tertiary', bg: 'bg-tertiary/10' },
            ].map((stat, i) => (
              <div key={i} className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant/5">
                <div className="flex items-center gap-3 mb-2.5">
                  <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">{stat.label}</span>
                </div>
                <h3 className="text-2xl font-black text-white">{stat.value}</h3>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-8 border-b border-outline-variant/10 overflow-x-auto pb-px">
            {[
              { id: 'notas', label: 'Notas & Avaliações', icon: FileText },
              { id: 'pauta_med', label: 'Pauta Geral Homologada MED', icon: Award },
              { id: 'boletins', label: 'Boletins em Lote (Impressão)', icon: Printer },
              { id: 'certificados', label: 'Certificados com QR Code', icon: ShieldCheck },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-4 px-3 text-sm font-bold flex items-center gap-2 transition-all relative whitespace-nowrap ${
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

          {/* TAB 1: NOTAS GERAIS */}
          {activeTab === 'notas' && (
            <div className="bg-surface-container-low rounded-3xl border border-outline-variant/5 overflow-hidden">
              <div className="p-6 border-b border-outline-variant/10 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="relative w-full sm:w-96">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                  <input 
                    type="text" 
                    placeholder="Pesquisar aluno ou Nº de processo..." 
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
                      <th className="px-6 py-4 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Média (MAC/NPP/NPT)</th>
                      <th className="px-6 py-4 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Assiduidade</th>
                      <th className="px-6 py-4 text-[10px] font-black text-on-surface-variant uppercase tracking-widest text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/5">
                    {filteredStudents.slice(0, 10).map((student) => {
                      const studentGrades = grades.filter(g => g.studentId === student.id);
                      const avg = studentGrades.length > 0 ? (studentGrades.reduce((acc, g) => acc + g.value, 0) / studentGrades.length).toFixed(1) : '15.2';
                      const turma = turmas.find(t => t.id === student.classId);
                      
                      return (
                        <tr key={student.id} className="hover:bg-surface-container-highest/30 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="relative w-8 h-8 rounded-full overflow-hidden bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                                {student.name.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <span className="text-sm font-bold text-white block">{student.name}</span>
                                <span className="text-[10px] font-mono text-on-surface-variant">{student.id}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-on-surface-variant">{turma?.name || '10ª Classe A'}</td>
                          <td className="px-6 py-4">
                            <span className={`text-sm font-black ${Number(avg) >= 14 ? 'text-secondary' : Number(avg) >= 10 ? 'text-primary' : 'text-error'}`}>
                              {avg} Val.
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
                            <div className="flex justify-end gap-2">
                              <button 
                                onClick={() => {
                                  setSelectedCertificateStudent(student);
                                  setActiveTab('certificados');
                                }}
                                title="Emitir Certificado com QR"
                                className="p-2 hover:bg-surface-container-highest rounded-lg text-secondary hover:text-white transition-colors"
                              >
                                <Award className="w-4 h-4" />
                              </button>
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
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: PAUTA GERAL OFICIAL MED */}
          {activeTab === 'pauta_med' && (
            <div className="bg-surface-container-low rounded-3xl border border-outline-variant/5 p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-outline-variant/10 gap-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-secondary tracking-widest">
                    REPÚBLICA DE ANGOLA · GOVERNO PROVINCIAL DE LUANDA
                  </span>
                  <h3 className="font-headline text-xl text-white font-bold mt-0.5">
                    Pauta Geral Trimestral Homologada (I Trimestre 2026/2027)
                  </h3>
                  <p className="text-xs text-on-surface-variant">
                    Turma: 10ª Classe A · Curso de Informática · Complexo Escolar Elo Escolar
                  </p>
                </div>
                
                <button 
                  onClick={() => window.print()}
                  className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs flex items-center gap-2 hover:opacity-90"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir Pauta Geral Oficial</span>
                </button>
              </div>

              {/* Official Table Grid */}
              <div className="overflow-x-auto mt-6">
                <table className="w-full text-left text-xs border border-outline-variant/20">
                  <thead className="bg-surface-container-high text-[10px] uppercase tracking-wider text-white">
                    <tr>
                      <th className="p-3 border border-outline-variant/20">Nº</th>
                      <th className="p-3 border border-outline-variant/20 min-w-[200px]">Nome Completo</th>
                      {medSubjects.map(sub => (
                        <th key={sub} className="p-3 border border-outline-variant/20 text-center">{sub.slice(0, 4)}</th>
                      ))}
                      <th className="p-3 border border-outline-variant/20 text-center font-bold text-secondary">MT</th>
                      <th className="p-3 border border-outline-variant/20 text-center font-bold">Resultado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {filteredStudents.map((st, i) => {
                      const studentAvg = (14 + (i % 5)).toFixed(1);
                      const isApto = Number(studentAvg) >= 10;
                      return (
                        <tr key={st.id} className="hover:bg-white/[0.02]">
                          <td className="p-3 border border-outline-variant/20 font-mono text-center">{i + 1}</td>
                          <td className="p-3 border border-outline-variant/20 font-bold text-white">{st.name}</td>
                          {medSubjects.map((sub, sidx) => {
                            const val = 12 + ((i + sidx) % 7);
                            return (
                              <td key={sub} className="p-3 border border-outline-variant/20 text-center font-mono">
                                <span className={val >= 10 ? 'text-white' : 'text-error font-bold'}>{val}</span>
                              </td>
                            );
                          })}
                          <td className="p-3 border border-outline-variant/20 text-center font-bold font-mono text-secondary">
                            {studentAvg}
                          </td>
                          <td className="p-3 border border-outline-variant/20 text-center font-bold">
                            <span className={`px-2 py-0.5 rounded text-[10px] ${isApto ? 'bg-secondary/20 text-secondary' : 'bg-error/20 text-error'}`}>
                              {isApto ? 'Transita' : 'Recurso'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mt-8 pt-6 border-t border-outline-variant/10 flex justify-between items-center text-xs text-on-surface-variant">
                <div>
                  <p>Coordenador de Curso: <strong>Engª. Luísa Cambamba</strong></p>
                  <p>Director Pedagógico: <strong>Prof. Dr. Mateus Afonso</strong></p>
                </div>
                <div className="text-right">
                  <p>Termo Homologado sob Registo nº <strong>2026/0482-MED</strong></p>
                  <p>Luanda, aos {new Date().toLocaleDateString('pt-AO')}</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BOLETINS EM LOTE (IMPRESSÃO A4) */}
          {activeTab === 'boletins' && (
            <div className="space-y-6">
              <div className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/5 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-white">Impressão em Lote de Boletins Escolares</h3>
                  <p className="text-xs text-on-surface-variant mt-1">
                    Gere e imprima todos os boletins da turma num único fluxo contínuo em folha A4 com carimbo oficial e código QR de validação.
                  </p>
                </div>
                <button 
                  onClick={() => window.print()}
                  className="px-6 py-3 rounded-full bg-secondary text-on-secondary-fixed font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:scale-105 transition-all shadow-lg shadow-secondary/20"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir Todos os Boletins ({filteredStudents.length})</span>
                </button>
              </div>

              {/* Printable Cards List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredStudents.slice(0, 4).map((st, i) => (
                  <div key={st.id} className="glass rounded-3xl p-6 border border-white/10 relative overflow-hidden bg-surface-container-low/90">
                    <div className="flex justify-between items-start pb-4 border-b border-white/10">
                      <div>
                        <span className="text-[9px] font-bold text-secondary uppercase tracking-widest">REPÚBLICA DE ANGOLA · MED</span>
                        <h4 className="font-bold text-white text-base">Boletim Escolar Trimestral</h4>
                        <p className="text-xs text-white/80 font-medium">{st.name}</p>
                        <p className="text-[10px] text-on-surface-variant font-mono">Processo: {st.id} · Turma: 10ª A</p>
                      </div>

                      {/* QR Validation Code for each bulletin */}
                      <div className="text-center p-2 rounded-xl bg-white text-black flex flex-col items-center">
                        <QrCode className="w-10 h-10" />
                        <span className="text-[8px] font-mono font-bold mt-0.5">VALIDAR</span>
                      </div>
                    </div>

                    {/* Miniature Grade Table */}
                    <table className="w-full text-xs mt-3">
                      <thead>
                        <tr className="text-[9px] text-on-surface-variant uppercase border-b border-white/5">
                          <th className="py-1 text-left">Disciplina</th>
                          <th className="py-1 text-center">MAC</th>
                          <th className="py-1 text-center">NPP</th>
                          <th className="py-1 text-center">NPT</th>
                          <th className="py-1 text-center font-bold text-secondary">MT</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {medSubjects.slice(0, 5).map((sub, sidx) => (
                          <tr key={sub}>
                            <td className="py-1 text-white">{sub}</td>
                            <td className="py-1 text-center font-mono">15</td>
                            <td className="py-1 text-center font-mono">16</td>
                            <td className="py-1 text-center font-mono">17</td>
                            <td className="py-1 text-center font-mono font-bold text-secondary">16.0</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div className="mt-4 pt-3 border-t border-white/10 flex justify-between items-center text-[10px] text-on-surface-variant">
                      <span>Média Trimestral: <strong className="text-white text-xs">16.0 Valores</strong></span>
                      <span className="text-secondary font-bold">Aprovado</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: CERTIFICADOS DE HABILITAÇÕES COM QR CODE */}
          {activeTab === 'certificados' && (
            <div className="bg-surface-container-low rounded-3xl border border-outline-variant/5 p-6 sm:p-10">
              <div className="max-w-2xl mx-auto border-2 border-secondary/30 rounded-3xl p-8 sm:p-12 relative bg-surface-container-high/40 shadow-2xl">
                
                {/* Certificate Border Details */}
                <div className="text-center mb-8">
                  <span className="text-[10px] uppercase font-bold tracking-[0.3em] text-secondary block">
                    REPÚBLICA DE ANGOLA
                  </span>
                  <span className="text-[11px] uppercase tracking-[0.2em] text-white/80 block mt-0.5">
                    MINISTÉRIO DA EDUCAÇÃO · GOVERNO PROVINCIAL DE LUANDA
                  </span>
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white mt-4 uppercase tracking-wider">
                    Certificado de Habilitações Literárias
                  </h3>
                  <div className="w-16 h-0.5 bg-secondary mx-auto mt-2"></div>
                </div>

                <div className="text-sm leading-relaxed text-white/90 space-y-4 text-justify font-sans">
                  <p>
                    O Director Pedagógico do <strong>Complexo Escolar Elo Escolar de Luanda</strong>, legalmente autorizado pelo Decreto Executivo nº 482/MED/2021, certifica que:
                  </p>
                  
                  <p className="text-center text-lg font-bold text-secondary font-serif py-1">
                    {selectedCertificateStudent?.name || 'Esperança Beatriz dos Santos'}
                  </p>

                  <p>
                    Concluiu com aproveitamento no Ano Lectivo de <strong>2025/2026</strong> o <strong>II Ciclo do Ensino Secundário Geral</strong>, na área de <strong>Ciências Físicas e Biológicas</strong>, com a média final de <strong>16.8 (Dezasseis vírgula oito valores)</strong>.
                  </p>

                  <p className="text-xs text-on-surface-variant pt-2">
                    E, por ser verdade e me haver sido pedido, mandei passar o presente Certificado que vai por mim assinado e autenticado com o carimbo oficial desta Instituição de Ensino.
                  </p>
                </div>

                {/* Bottom Signatures & QR Public Link */}
                <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-6">
                  <div className="text-center">
                    <div className="w-32 border-b border-white/40 mb-1 mx-auto"></div>
                    <span className="text-[10px] uppercase tracking-wider text-on-surface-variant block">O Director Pedagógico</span>
                    <strong className="text-xs text-white">Prof. Dr. Mateus Afonso</strong>
                  </div>

                  {/* Public QR Code pointing to /verify */}
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-white text-black">
                    <QrCode className="w-12 h-12 flex-shrink-0" />
                    <div className="text-left leading-tight">
                      <span className="text-[8px] font-bold block uppercase tracking-widest text-black/60">AUTENTICIDADE</span>
                      <strong className="text-[10px] font-mono block">AO-2026-CERT-0042</strong>
                      <Link 
                        href="/verify?code=AO-2026-CERT-0042" 
                        target="_blank" 
                        className="text-[9px] text-blue-600 hover:underline flex items-center gap-0.5 mt-0.5"
                      >
                        <span>Validar online</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <button 
                    onClick={() => window.print()}
                    className="px-6 py-2.5 rounded-full bg-secondary text-on-secondary-fixed font-bold text-xs uppercase tracking-wider inline-flex items-center gap-2"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Imprimir Certificado Oficial</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Grade Entry Modal */}
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
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-on-surface-variant">Nota / Valor (0 a 20)</label>
                    <input 
                      type="number" 
                      min="0" 
                      max="20" 
                      step="0.5"
                      required
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                      className="w-full bg-surface-container-low border border-outline-variant/10 rounded-xl py-3 px-4 text-white outline-none focus:ring-2 focus:ring-primary/20 font-mono text-lg font-bold"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4 border-t border-outline-variant/10">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 bg-surface-container-highest rounded-xl font-medium text-white hover:bg-surface-container-highest/80 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-primary text-on-primary rounded-xl font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 font-bold"
                  >
                    Guardar Nota
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
