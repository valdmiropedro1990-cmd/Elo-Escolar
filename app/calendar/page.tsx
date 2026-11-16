'use client'

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Trash2, 
  Edit2, 
  X,
  ChevronDown,
  BookOpen,
  MapPin,
  User,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/context/AuthContext';
import { 
  Turma, 
  Exam, 
  ScheduleItem, 
  SUBJECTS, 
  DAYS_OF_WEEK 
} from '@/lib/academic-utils';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

const CalendarPage = () => {
  const [activeTab, setActiveTab] = useState<'exams' | 'schedule'>('exams');
  const [selectedTurmaId, setSelectedTurmaId] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleItem | null>(null);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuth();

  // Data State
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);

  // Form States
  const [examFormData, setExamFormData] = useState<Partial<Exam>>({
    subject: SUBJECTS[0],
    date: '',
    time: '',
    type: 'Mensal',
    room: ''
  });

  const [scheduleFormData, setScheduleFormData] = useState<Partial<ScheduleItem>>({
    subject: SUBJECTS[0],
    dayOfWeek: 'Segunda',
    startTime: '',
    endTime: '',
    teacher: '',
    room: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [
        { data: turmasData },
        { data: examsData },
        { data: schedulesData }
      ] = await Promise.all([
        supabase.from('classes').select('*'),
        supabase.from('exams').select('*'),
        supabase.from('schedules').select('*')
      ]);

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

      if (examsData) {
        setExams(examsData.map(e => ({
          id: e.id,
          turmaId: e.turma_id,
          subject: e.subject,
          date: e.date,
          time: e.time,
          type: e.type as any,
          room: e.room
        })));
      }

      if (schedulesData) {
        setSchedules(schedulesData.map(s => ({
          id: s.id,
          turmaId: s.turma_id,
          subject: s.subject,
          dayOfWeek: s.day_of_week as any,
          startTime: s.start_time,
          endTime: s.end_time,
          teacher: s.teacher || '',
          room: s.room || ''
        })));
      }
    } catch (error) {
      console.error("Error fetching calendar data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filtering
  const filteredExams = useMemo(() => {
    return exams.filter(exam => {
      const matchesTurma = selectedTurmaId === 'all' || exam.turmaId === selectedTurmaId;
      const matchesSearch = exam.subject.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesTurma && matchesSearch;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [exams, selectedTurmaId, searchTerm]);

  const filteredSchedules = useMemo(() => {
    return schedules.filter(item => {
      const matchesTurma = selectedTurmaId === 'all' || item.turmaId === selectedTurmaId;
      const matchesSearch = item.subject.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           item.teacher.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesTurma && matchesSearch;
    }).sort((a, b) => {
      const dayOrder = DAYS_OF_WEEK.indexOf(a.dayOfWeek) - DAYS_OF_WEEK.indexOf(b.dayOfWeek);
      if (dayOrder !== 0) return dayOrder;
      return a.startTime.localeCompare(b.startTime);
    });
  }, [schedules, selectedTurmaId, searchTerm]);

  // Handlers
  const handleSaveExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!examFormData.turmaId || !examFormData.subject || !examFormData.date) return;

    try {
      if (editingExam) {
        const { error } = await supabase
          .from('exams')
          .update({
            turma_id: examFormData.turmaId,
            subject: examFormData.subject,
            date: examFormData.date,
            time: examFormData.time,
            type: examFormData.type,
            room: examFormData.room
          })
          .eq('id', editingExam.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('exams')
          .insert([{
            turma_id: examFormData.turmaId,
            subject: examFormData.subject,
            date: examFormData.date,
            time: examFormData.time,
            type: examFormData.type,
            room: examFormData.room
          }]);
        
        if (error) throw error;
      }

      await fetchData();
      setIsExamModalOpen(false);
      setEditingExam(null);
      setExamFormData({ subject: SUBJECTS[0], type: 'Mensal' });
    } catch (error) {
      console.error("Error saving exam:", error);
      alert("Erro ao salvar prova.");
    }
  };

  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleFormData.turmaId || !scheduleFormData.subject || !scheduleFormData.dayOfWeek) return;

    try {
      if (editingSchedule) {
        const { error } = await supabase
          .from('schedules')
          .update({
            turma_id: scheduleFormData.turmaId,
            subject: scheduleFormData.subject,
            day_of_week: scheduleFormData.dayOfWeek,
            start_time: scheduleFormData.startTime,
            end_time: scheduleFormData.endTime,
            teacher: scheduleFormData.teacher,
            room: scheduleFormData.room
          })
          .eq('id', editingSchedule.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('schedules')
          .insert([{
            turma_id: scheduleFormData.turmaId,
            subject: scheduleFormData.subject,
            day_of_week: scheduleFormData.dayOfWeek,
            start_time: scheduleFormData.startTime,
            end_time: scheduleFormData.endTime,
            teacher: scheduleFormData.teacher,
            room: scheduleFormData.room
          }]);
        
        if (error) throw error;
      }

      await fetchData();
      setIsScheduleModalOpen(false);
      setEditingSchedule(null);
      setScheduleFormData({ subject: SUBJECTS[0], dayOfWeek: 'Segunda' });
    } catch (error) {
      console.error("Error saving schedule:", error);
      alert("Erro ao salvar horário.");
    }
  };

  const handleDeleteExam = async (id: string) => {
    if (confirm('Tem certeza que deseja eliminar esta prova?')) {
      try {
        const { error } = await supabase.from('exams').delete().eq('id', id);
        if (error) throw error;
        await fetchData();
      } catch (error) {
        console.error("Error deleting exam:", error);
        alert("Erro ao eliminar prova.");
      }
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    if (confirm('Tem certeza que deseja eliminar este horário?')) {
      try {
        const { error } = await supabase.from('schedules').delete().eq('id', id);
        if (error) throw error;
        await fetchData();
      } catch (error) {
        console.error("Error deleting schedule:", error);
        alert("Erro ao eliminar horário.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Calendários Académicos</h1>
            <p className="text-on-surface-variant">Gestão de provas e horários de aulas por turma.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-surface-container-high border border-outline-variant/10 rounded-xl text-sm font-medium text-white hover:bg-surface-container-highest transition-all">
              <Download className="w-4 h-4" />
              Exportar PDF
            </button>
            {isAdmin && (
              <button 
                onClick={() => activeTab === 'exams' ? setIsExamModalOpen(true) : setIsScheduleModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-xl text-sm font-medium hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
              >
                <Plus className="w-4 h-4" />
                {activeTab === 'exams' ? 'Nova Prova' : 'Novo Horário'}
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-surface-container-low rounded-2xl w-fit">
          <button
            onClick={() => setActiveTab('exams')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'exams' 
                ? 'bg-surface-container-highest text-white shadow-sm' 
                : 'text-on-surface-variant hover:text-white'
            }`}
          >
            <CalendarIcon className="w-4 h-4" />
            Calendário de Provas
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'schedule' 
                ? 'bg-surface-container-highest text-white shadow-sm' 
                : 'text-on-surface-variant hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            Horário de Aulas
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
            <input 
              type="text" 
              placeholder="Procurar por disciplina..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:ring-2 focus:ring-primary/20 outline-none"
            />
          </div>
          <div className="relative">
            <select 
              value={selectedTurmaId}
              onChange={(e) => setSelectedTurmaId(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant/10 rounded-xl py-3 pl-4 pr-10 text-sm text-white appearance-none focus:ring-2 focus:ring-primary/20 outline-none"
            >
              <option value="all">Todas as Turmas</option>
              {turmas.map(t => (
                <option key={t.id} value={t.id}>{t.name} - {t.grade}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant pointer-events-none" />
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 gap-6">
          {activeTab === 'exams' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredExams.map((exam) => {
                  const turma = turmas.find(t => t.id === exam.turmaId);
                  return (
                    <motion.div
                      key={exam.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-6 hover:border-primary/30 transition-all group"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          exam.type === 'Exame' ? 'bg-error/10 text-error' :
                          exam.type === 'Trimestral' ? 'bg-primary/10 text-primary' :
                          'bg-secondary/10 text-secondary'
                        }`}>
                          {exam.type}
                        </div>
                        {isAdmin && (
                          <div className="flex gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => {
                                setEditingExam(exam);
                                setExamFormData(exam);
                                setIsExamModalOpen(true);
                              }}
                              className="p-2 hover:bg-surface-container-highest rounded-lg text-on-surface-variant hover:text-white transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteExam(exam.id)}
                              className="p-2 hover:bg-error/10 rounded-lg text-on-surface-variant hover:text-error transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-white mb-1">{exam.subject}</h3>
                      <p className="text-sm text-on-surface-variant mb-6">{turma?.name || 'Turma não encontrada'}</p>
                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm text-on-surface-variant">
                          <CalendarIcon className="w-4 h-4 text-primary" />
                          <span>{new Date(exam.date).toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-on-surface-variant">
                          <Clock className="w-4 h-4 text-primary" />
                          <span>{exam.time}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-on-surface-variant">
                          <MapPin className="w-4 h-4 text-primary" />
                          <span>{exam.room || turma?.room || 'Sala não definida'}</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              {filteredExams.length === 0 && (
                <div className="col-span-full py-20 text-center">
                  <CalendarIcon className="w-12 h-12 text-on-surface-variant/20 mx-auto mb-4" />
                  <p className="text-on-surface-variant">Nenhuma prova agendada para os critérios selecionados.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-surface-container-low border border-outline-variant/10 rounded-3xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-outline-variant/10">
                      <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Dia</th>
                      <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Horário</th>
                      <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Disciplina</th>
                      <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Professor</th>
                      <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Sala</th>
                      <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Turma</th>
                      {isAdmin && <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider text-right">Ações</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/5">
                    {filteredSchedules.map((item) => {
                      const turma = turmas.find(t => t.id === item.turmaId);
                      return (
                        <tr key={item.id} className="hover:bg-surface-container-highest/30 transition-colors group">
                          <td className="px-6 py-4">
                            <span className="text-sm font-medium text-white">{item.dayOfWeek}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                              <Clock className="w-3.5 h-3.5 text-primary" />
                              {item.startTime} - {item.endTime}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <BookOpen className="w-4 h-4 text-primary" />
                              </div>
                              <span className="text-sm font-medium text-white">{item.subject}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                              <User className="w-3.5 h-3.5" />
                              {item.teacher}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-on-surface-variant">{item.room}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-on-surface-variant">{turma?.name}</span>
                          </td>
                          {isAdmin && (
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                <button 
                                  onClick={() => {
                                    setEditingSchedule(item);
                                    setScheduleFormData(item);
                                    setIsScheduleModalOpen(true);
                                  }}
                                  className="p-2 hover:bg-surface-container-highest rounded-lg text-on-surface-variant hover:text-white transition-colors"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteSchedule(item.id)}
                                  className="p-2 hover:bg-error/10 rounded-lg text-on-surface-variant hover:text-error transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {filteredSchedules.length === 0 && (
                  <div className="py-20 text-center">
                    <Clock className="w-12 h-12 text-on-surface-variant/20 mx-auto mb-4" />
                    <p className="text-on-surface-variant">Nenhum horário definido para os critérios selecionados.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Exam Modal */}
      <AnimatePresence>
        {isExamModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsExamModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-surface-container-high border border-outline-variant/10 rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="px-8 py-6 border-b border-outline-variant/10 flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">{editingExam ? 'Editar Prova' : 'Nova Prova'}</h2>
                <button onClick={() => setIsExamModalOpen(false)} className="p-2 hover:bg-surface-container-highest rounded-full transition-colors">
                  <X className="w-5 h-5 text-on-surface-variant" />
                </button>
              </div>
              <form onSubmit={handleSaveExam} className="p-8 space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-on-surface-variant">Turma</label>
                    <select 
                      required
                      value={examFormData.turmaId}
                      onChange={(e) => setExamFormData({ ...examFormData, turmaId: e.target.value })}
                      className="w-full bg-surface-container-low border border-outline-variant/10 rounded-xl py-3 px-4 text-white outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="">Selecionar Turma</option>
                      {turmas.map(t => (
                        <option key={t.id} value={t.id}>{t.name} - {t.grade}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-on-surface-variant">Disciplina</label>
                    <select 
                      required
                      value={examFormData.subject}
                      onChange={(e) => setExamFormData({ ...examFormData, subject: e.target.value })}
                      className="w-full bg-surface-container-low border border-outline-variant/10 rounded-xl py-3 px-4 text-white outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      {SUBJECTS.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-on-surface-variant">Data</label>
                      <input 
                        type="date"
                        required
                        value={examFormData.date}
                        onChange={(e) => setExamFormData({ ...examFormData, date: e.target.value })}
                        className="w-full bg-surface-container-low border border-outline-variant/10 rounded-xl py-3 px-4 text-white outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-on-surface-variant">Hora</label>
                      <input 
                        type="time"
                        required
                        value={examFormData.time}
                        onChange={(e) => setExamFormData({ ...examFormData, time: e.target.value })}
                        className="w-full bg-surface-container-low border border-outline-variant/10 rounded-xl py-3 px-4 text-white outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-on-surface-variant">Tipo</label>
                      <select 
                        value={examFormData.type}
                        onChange={(e) => setExamFormData({ ...examFormData, type: e.target.value as any })}
                        className="w-full bg-surface-container-low border border-outline-variant/10 rounded-xl py-3 px-4 text-white outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="Mensal">Mensal</option>
                        <option value="Trimestral">Trimestral</option>
                        <option value="Exame">Exame</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-on-surface-variant">Sala (Opcional)</label>
                      <input 
                        type="text"
                        placeholder="Ex: Sala 05"
                        value={examFormData.room}
                        onChange={(e) => setExamFormData({ ...examFormData, room: e.target.value })}
                        className="w-full bg-surface-container-low border border-outline-variant/10 rounded-xl py-3 px-4 text-white outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsExamModalOpen(false)}
                    className="flex-1 py-3 bg-surface-container-low text-white rounded-xl font-medium hover:bg-surface-container-highest transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-primary text-on-primary rounded-xl font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                  >
                    {editingExam ? 'Guardar Alterações' : 'Criar Prova'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Schedule Modal */}
      <AnimatePresence>
        {isScheduleModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsScheduleModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-surface-container-high border border-outline-variant/10 rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="px-8 py-6 border-b border-outline-variant/10 flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">{editingSchedule ? 'Editar Horário' : 'Novo Horário'}</h2>
                <button onClick={() => setIsScheduleModalOpen(false)} className="p-2 hover:bg-surface-container-highest rounded-full transition-colors">
                  <X className="w-5 h-5 text-on-surface-variant" />
                </button>
              </div>
              <form onSubmit={handleSaveSchedule} className="p-8 space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-on-surface-variant">Turma</label>
                    <select 
                      required
                      value={scheduleFormData.turmaId}
                      onChange={(e) => setScheduleFormData({ ...scheduleFormData, turmaId: e.target.value })}
                      className="w-full bg-surface-container-low border border-outline-variant/10 rounded-xl py-3 px-4 text-white outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="">Selecionar Turma</option>
                      {turmas.map(t => (
                        <option key={t.id} value={t.id}>{t.name} - {t.grade}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-on-surface-variant">Disciplina</label>
                      <select 
                        required
                        value={scheduleFormData.subject}
                        onChange={(e) => setScheduleFormData({ ...scheduleFormData, subject: e.target.value })}
                        className="w-full bg-surface-container-low border border-outline-variant/10 rounded-xl py-3 px-4 text-white outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        {SUBJECTS.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-on-surface-variant">Dia da Semana</label>
                      <select 
                        required
                        value={scheduleFormData.dayOfWeek}
                        onChange={(e) => setScheduleFormData({ ...scheduleFormData, dayOfWeek: e.target.value as any })}
                        className="w-full bg-surface-container-low border border-outline-variant/10 rounded-xl py-3 px-4 text-white outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        {DAYS_OF_WEEK.map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-on-surface-variant">Hora Início</label>
                      <input 
                        type="time"
                        required
                        value={scheduleFormData.startTime}
                        onChange={(e) => setScheduleFormData({ ...scheduleFormData, startTime: e.target.value })}
                        className="w-full bg-surface-container-low border border-outline-variant/10 rounded-xl py-3 px-4 text-white outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-on-surface-variant">Hora Fim</label>
                      <input 
                        type="time"
                        required
                        value={scheduleFormData.endTime}
                        onChange={(e) => setScheduleFormData({ ...scheduleFormData, endTime: e.target.value })}
                        className="w-full bg-surface-container-low border border-outline-variant/10 rounded-xl py-3 px-4 text-white outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-on-surface-variant">Professor</label>
                      <input 
                        type="text"
                        required
                        placeholder="Nome do professor"
                        value={scheduleFormData.teacher}
                        onChange={(e) => setScheduleFormData({ ...scheduleFormData, teacher: e.target.value })}
                        className="w-full bg-surface-container-low border border-outline-variant/10 rounded-xl py-3 px-4 text-white outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-on-surface-variant">Sala</label>
                      <input 
                        type="text"
                        required
                        placeholder="Ex: Sala 05"
                        value={scheduleFormData.room}
                        onChange={(e) => setScheduleFormData({ ...scheduleFormData, room: e.target.value })}
                        className="w-full bg-surface-container-low border border-outline-variant/10 rounded-xl py-3 px-4 text-white outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsScheduleModalOpen(false)}
                    className="flex-1 py-3 bg-surface-container-low text-white rounded-xl font-medium hover:bg-surface-container-highest transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-primary text-on-primary rounded-xl font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                  >
                    {editingSchedule ? 'Guardar Alterações' : 'Criar Horário'}
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

export default CalendarPage;
