'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  DoorOpen, 
  Clock, 
  UserCheck, 
  Plus, 
  MoreVertical, 
  Search,
  Filter,
  ArrowUpRight,
  BookOpen,
  X,
  Trash2,
  Edit2,
  ChevronDown
} from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { Turma, ACADEMIC_LEVELS, SHIFTS, COURSES } from '@/lib/academic-utils';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

const AcademicPage = () => {
  const [activeTab, setActiveTab] = useState('turmas');
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTurma, setEditingTurma] = useState<Turma | null>(null);
  const { isAdmin } = useAuth();

  // Form State
  const [formData, setFormData] = useState<Partial<Turma>>({
    name: '',
    level: ACADEMIC_LEVELS[0],
    grade: '',
    room: '',
    shift: 'Manhã',
    coordinator: '',
    course: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [
        { data: turmasData },
        { data: studentsData }
      ] = await Promise.all([
        supabase.from('classes').select('*'),
        supabase.from('students').select('id, class_id')
      ]);

      if (turmasData) {
        setTurmas((turmasData as any[]).map((t: any) => ({
          id: t.id,
          name: t.name,
          level: t.level || '',
          grade: t.grade || '',
          room: t.room || '',
          shift: t.shift as any || 'Manhã',
          coordinator: t.coordinator || '',
          course: t.course || '',
          studentsCount: 0
        })));
      }

      if (studentsData) {
        setStudents((studentsData as any[]).map((s: any) => ({ id: s.id, classId: s.class_id })));
      }
    } catch (error) {
      console.error("Error fetching academic data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTurmas = useMemo(() => {
    return turmas.filter(t => 
      (t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       t.coordinator.toLowerCase().includes(searchTerm.toLowerCase()) ||
       t.level.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterLevel === 'all' || t.level === filterLevel)
    ).map(t => ({
      ...t,
      studentsCount: students.filter(s => s.classId === t.id).length
    }));
  }, [turmas, students, searchTerm, filterLevel]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTurma) {
        const { error } = await supabase
          .from('classes')
          .update({
            name: formData.name,
            level: formData.level,
            grade: formData.grade,
            room: formData.room,
            shift: formData.shift,
            coordinator: formData.coordinator,
            course: formData.course
          })
          .eq('id', editingTurma.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('classes')
          .insert([{
            name: formData.name,
            level: formData.level,
            grade: formData.grade,
            room: formData.room,
            shift: formData.shift,
            coordinator: formData.coordinator,
            course: formData.course
          }]);
        
        if (error) throw error;
      }

      await fetchData();
      setIsModalOpen(false);
      setEditingTurma(null);
      setFormData({ name: '', level: ACADEMIC_LEVELS[0], grade: '', room: '', shift: 'Manhã', coordinator: '', course: '' });
    } catch (error) {
      console.error("Error saving turma:", error);
      alert("Erro ao salvar turma.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem a certeza que deseja eliminar esta turma?')) {
      try {
        const { error } = await supabase.from('classes').delete().eq('id', id);
        if (error) throw error;
        await fetchData();
      } catch (error) {
        console.error("Error deleting turma:", error);
        alert("Erro ao eliminar turma.");
      }
    }
  };

  const openEditModal = (turma: Turma) => {
    setEditingTurma(turma);
    setFormData(turma);
    setIsModalOpen(true);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 lg:ml-64">
        <TopBar title="Gestão Académica" />
        
        <div className="pt-24 px-4 lg:px-8 pb-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
            <div>
              <h2 className="font-headline text-3xl lg:text-4xl font-extrabold text-white tracking-tight">Gestão Académica</h2>
              <p className="text-on-surface-variant mt-2 text-sm max-w-md">Controlo de turmas, salas, horários e coordenação pedagógica.</p>
            </div>
            {isAdmin && (
              <button 
                onClick={() => {
                  setEditingTurma(null);
                  setFormData({ name: '', level: ACADEMIC_LEVELS[0], grade: '', room: '', shift: 'Manhã', coordinator: '', course: '' });
                  setIsModalOpen(true);
                }}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-on-primary-fixed rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-105 transition-all"
              >
                <Plus className="w-4 h-4" />
                Criar Nova Turma
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-8 border-b border-outline-variant/10 overflow-x-auto pb-px">
            {['turmas', 'salas', 'coordenadores', 'ciclos de ensino'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 px-2 text-sm font-bold uppercase tracking-widest transition-all relative whitespace-nowrap ${
                  activeTab === tab ? 'text-primary' : 'text-on-surface-variant hover:text-white'
                }`}
              >
                {tab}
                {activeTab === tab && (
                   <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />
                )}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Search & Filter */}
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                  <input 
                    type="text" 
                    placeholder={`Procurar ${activeTab}...`} 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
                <div className="relative">
                  <select 
                    value={filterLevel}
                    onChange={(e) => setFilterLevel(e.target.value)}
                    className="bg-surface-container-low border border-outline-variant/10 rounded-xl py-3 pl-4 pr-10 text-sm text-white appearance-none focus:ring-2 focus:ring-primary/20 outline-none"
                  >
                    <option value="all">Todos os Níveis</option>
                    {ACADEMIC_LEVELS.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant pointer-events-none" />
                </div>
                <button className="p-3 bg-surface-container-low border border-outline-variant/10 rounded-xl text-on-surface-variant hover:text-white transition-colors">
                  <Filter className="w-5 h-5" />
                </button>
              </div>

              {/* Turmas List */}
              {activeTab === 'turmas' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredTurmas.map((turma) => (
                    <motion.div 
                      key={turma.id}
                      whileHover={{ y: -4 }}
                      className="bg-surface-container-low p-6 rounded-[2rem] border border-outline-variant/5 hover:border-primary/20 transition-all group"
                    >
                      <div className="flex justify-between items-start mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary-fixed transition-colors">
                          <Users className="w-6 h-6" />
                        </div>
                        <div className="flex gap-2">
                          {isAdmin && (
                            <>
                              <button 
                                onClick={() => openEditModal(turma)}
                                className="p-2 text-on-surface-variant hover:text-primary transition-colors"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDelete(turma.id)}
                                className="p-2 text-on-surface-variant hover:text-error transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button className="text-on-surface-variant hover:text-white">
                            <MoreVertical className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                      
                      <h3 className="text-2xl font-black text-white mb-1">{turma.name}</h3>
                      <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mb-6">{turma.level}</p>

                      <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-3 text-sm">
                          <DoorOpen className="w-4 h-4 text-secondary" />
                          <span className="text-on-surface-variant">Sala: <strong className="text-white">{turma.room}</strong></span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <Clock className="w-4 h-4 text-secondary" />
                          <span className="text-on-surface-variant">Turno: <strong className="text-white">{turma.shift}</strong></span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <UserCheck className="w-4 h-4 text-secondary" />
                          <span className="text-on-surface-variant">Coord: <strong className="text-white">{turma.coordinator}</strong></span>
                        </div>
                        {turma.course && (
                          <div className="flex items-center gap-3 text-sm">
                            <BookOpen className="w-4 h-4 text-secondary" />
                            <span className="text-on-surface-variant">Curso: <strong className="text-white">{turma.course}</strong></span>
                          </div>
                        )}
                      </div>

                      <div className="pt-4 border-t border-outline-variant/10 flex justify-between items-center">
                        <div className="flex -space-x-2">
                          {[1, 2, 3, 4].map(i => (
                            <div key={i} className="w-7 h-7 rounded-full border-2 border-surface-container-low bg-surface-container-highest overflow-hidden relative">
                              <Image 
                                src={`https://picsum.photos/seed/std${i + turma.id}/50/50`} 
                                alt="student" 
                                fill 
                                className="object-cover"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                          ))}
                          <div className="w-7 h-7 rounded-full border-2 border-surface-container-low bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                            +{Math.max(0, (turma.studentsCount || 0) - 4)}
                          </div>
                        </div>
                        <button className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
                          Ver Alunos <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {activeTab === 'salas' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Array.from(new Set(turmas.map(t => t.room))).sort().map((room) => {
                    const roomTurmas = turmas.filter(t => t.room === room);
                    return (
                      <div key={room} className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/5">
                        <div className="flex justify-between items-center mb-4">
                          <div className="p-3 bg-secondary/10 text-secondary rounded-2xl">
                            <DoorOpen className="w-6 h-6" />
                          </div>
                          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Ocupada</span>
                        </div>
                        <h4 className="text-xl font-black text-white mb-1">{room}</h4>
                        <div className="space-y-2 mt-4">
                          {roomTurmas.map(t => (
                            <div key={t.id} className="flex items-center justify-between text-xs">
                              <span className="text-on-surface-variant">{t.shift}:</span>
                              <span className="font-bold text-white">{t.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Sidebar Stats */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-primary/20 to-secondary/20 p-8 rounded-[2.5rem] border border-white/5 backdrop-blur-xl">
                <h3 className="font-headline font-bold text-xl text-white mb-6">Resumo Académico</h3>
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-on-surface-variant">Total de Turmas</span>
                    <span className="text-2xl font-black text-white">{turmas.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-on-surface-variant">Salas Ocupadas</span>
                    <span className="text-2xl font-black text-white">{new Set(turmas.map(t => t.room)).size}/24</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-on-surface-variant">Coordenadores</span>
                    <span className="text-2xl font-black text-white">{new Set(turmas.map(t => t.coordinator)).size}</span>
                  </div>
                </div>
                <button className="w-full mt-8 py-4 bg-white/10 hover:bg-white/20 rounded-2xl text-sm font-bold text-white transition-all border border-white/10">
                  Gerar Relatório de Turmas
                </button>
              </div>

              <div className="bg-surface-container-low p-6 rounded-[2rem] border border-outline-variant/5">
                <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  Coordenação de Cursos
                </h4>
                <div className="space-y-4">
                  {[
                    { name: 'Dr.ª Maria João', role: 'Ciências e Tecnologias' },
                    { name: 'Dr. Paulo Bento', role: 'Línguas e Humanidades' },
                    { name: 'Eng.º Rui Costa', role: 'Artes Visuais' }
                  ].map((coord, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-container-highest transition-colors cursor-pointer">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden">
                        <Image 
                          src={`https://picsum.photos/seed/coord${i}/50/50`} 
                          alt="" 
                          fill 
                          className="object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{coord.name}</p>
                        <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">{coord.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
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
                    {editingTurma ? 'Editar Turma' : 'Criar Nova Turma'}
                  </h2>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-surface-container-highest rounded-full transition-colors">
                    <X className="w-6 h-6 text-on-surface-variant" />
                  </button>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Nome da Turma</label>
                      <input 
                        type="text" 
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Ex: 10ª A"
                        className="w-full bg-surface-container-highest border border-outline-variant/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary/50 outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Sala</label>
                      <input 
                        type="text" 
                        required
                        value={formData.room}
                        onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                        placeholder="Ex: Sala 12"
                        className="w-full bg-surface-container-highest border border-outline-variant/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary/50 outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Nível de Ensino</label>
                    <select 
                      value={formData.level}
                      onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                      className="w-full bg-surface-container-highest border border-outline-variant/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary/50 outline-none"
                    >
                      {ACADEMIC_LEVELS.map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Turno</label>
                      <select 
                        value={formData.shift}
                        onChange={(e) => setFormData({ ...formData, shift: e.target.value as any })}
                        className="w-full bg-surface-container-highest border border-outline-variant/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary/50 outline-none"
                      >
                        {SHIFTS.map(shift => (
                          <option key={shift} value={shift}>{shift}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Classe</label>
                      <input 
                        type="text" 
                        required
                        value={formData.grade}
                        onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                        placeholder="Ex: 10ª Classe"
                        className="w-full bg-surface-container-highest border border-outline-variant/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary/50 outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Coordenador</label>
                    <input 
                      type="text" 
                      required
                      value={formData.coordinator}
                      onChange={(e) => setFormData({ ...formData, coordinator: e.target.value })}
                      placeholder="Nome do Professor"
                      className="w-full bg-surface-container-highest border border-outline-variant/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary/50 outline-none"
                    />
                  </div>

                  {formData.level?.includes('Secundário') && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Curso</label>
                      <select 
                        value={formData.course}
                        onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                        className="w-full bg-surface-container-highest border border-outline-variant/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary/50 outline-none"
                      >
                        <option value="">Nenhum</option>
                        {COURSES.map(course => (
                          <option key={course} value={course}>{course}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <button 
                    type="submit"
                    className="w-full py-4 bg-primary text-on-primary-fixed font-black rounded-2xl shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all mt-4"
                  >
                    {editingTurma ? 'GUARDAR ALTERAÇÕES' : 'CRIAR TURMA'}
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default AcademicPage;
