'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth, UserProfile } from '@/context/AuthContext';
import { 
  Users, 
  Shield, 
  ShieldAlert, 
  Ban, 
  CheckCircle, 
  Search, 
  Filter, 
  MoreVertical,
  UserPlus,
  Mail,
  ShieldCheck,
  Trash2
} from 'lucide-react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

const UserManagementPage = () => {
  const { profile, isPrimaryAdmin } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (data) {
        setUsers(data.map(u => ({
          uid: u.id,
          email: u.email,
          name: u.name || '',
          role: u.role as any || 'user',
          status: u.status as any || 'active',
          permissions: u.permissions || [],
          photoURL: u.photo_url
        })));
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (uid: string, updates: Partial<UserProfile>) => {
    try {
      const supabaseUpdates: any = {};
      if (updates.role) supabaseUpdates.role = updates.role;
      if (updates.status) supabaseUpdates.status = updates.status;
      if (updates.permissions) supabaseUpdates.permissions = updates.permissions;
      if (updates.name) supabaseUpdates.name = updates.name;

      const { error } = await supabase
        .from('profiles')
        .update(supabaseUpdates)
        .eq('id', uid);

      if (error) throw error;
      await fetchUsers();
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Erro ao atualizar utilizador.");
    }
  };

  const handleDeleteUser = async (uid: string) => {
    if (uid === profile?.uid) {
      alert('Não é possível eliminar a sua própria conta.');
      return;
    }

    if (!confirm('Tem a certeza que deseja eliminar este utilizador permanentemente?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', uid);

      if (error) throw error;
      await fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Erro ao eliminar utilizador.");
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterRole === 'all' || u.role === filterRole;
    return matchesSearch && matchesFilter;
  });

  if (!isPrimaryAdmin) {
    return (
      <div className="flex min-h-screen bg-background items-center justify-center">
        <div className="text-center">
          <ShieldAlert className="w-16 h-16 text-error mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white">Acesso Negado</h1>
          <p className="text-on-surface-variant mt-2">Apenas o Administrador Primário pode gerir utilizadores.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 lg:ml-64">
        <TopBar title="Gestão de Contas" />
        
        <div className="pt-24 px-4 lg:px-8 pb-12">
          {/* Header Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant font-bold uppercase tracking-widest">Total Utilizadores</p>
                  <p className="text-2xl font-black text-white">{users.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant font-bold uppercase tracking-widest">Administradores</p>
                  <p className="text-2xl font-black text-white">{users.filter(u => u.role.includes('admin')).length}</p>
                </div>
              </div>
            </div>
            <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-error/10 flex items-center justify-center text-error">
                  <Ban className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant font-bold uppercase tracking-widest">Bloqueados</p>
                  <p className="text-2xl font-black text-white">{users.filter(u => u.status === 'blocked').length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
              <input 
                type="text" 
                placeholder="Pesquisar por nome ou e-mail..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/10 rounded-xl py-3 pl-12 pr-4 text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
            </div>
            <div className="flex gap-4">
              <select 
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="bg-surface-container-low border border-outline-variant/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none min-w-[150px]"
              >
                <option value="all">Todos os Cargos</option>
                <option value="primary_admin">Admin Primário</option>
                <option value="secondary_admin">Admin Secundário</option>
                <option value="user">Encarregado</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-surface-container-low rounded-3xl border border-outline-variant/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-highest/50 border-b border-outline-variant/10">
                    <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest">Utilizador</th>
                    <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest">Cargo</th>
                    <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest">Estado</th>
                    <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest">Permissões</th>
                    <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/5">
                  <AnimatePresence>
                    {filteredUsers.map((u) => (
                      <motion.tr 
                        key={u.uid}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-surface-container-highest/30 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-surface-container-highest relative overflow-hidden flex-shrink-0">
                              <Image 
                                src={u.photoURL || `https://ui-avatars.com/api/?name=${u.name || 'User'}&background=random`}
                                alt={u.name || ''}
                                fill
                                className="object-cover"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white">{u.name || 'Sem nome'}</p>
                              <p className="text-xs text-on-surface-variant">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            u.role === 'primary_admin' ? 'bg-primary/20 text-primary' :
                            u.role === 'secondary_admin' ? 'bg-secondary/20 text-secondary' :
                            'bg-surface-container-highest text-on-surface-variant'
                          }`}>
                            {u.role === 'primary_admin' ? 'Primário' : 
                             u.role === 'secondary_admin' ? 'Secundário' : 'Encarregado'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${u.status === 'active' ? 'bg-secondary' : 'bg-error'}`} />
                            <span className={`text-xs font-bold ${u.status === 'active' ? 'text-secondary' : 'text-error'}`}>
                              {u.status === 'active' ? 'Ativo' : 'Bloqueado'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-xs text-on-surface-variant truncate max-w-[150px]">
                            {u.permissions?.join(', ') || 'Nenhuma'}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            {u.role !== 'primary_admin' && (
                              <>
                                <button 
                                  onClick={() => handleUpdateUser(u.uid, { status: u.status === 'active' ? 'blocked' : 'active' })}
                                  title={u.status === 'active' ? 'Bloquear' : 'Desbloquear'}
                                  className={`p-2 rounded-lg transition-colors ${u.status === 'active' ? 'hover:bg-error/10 text-error/60 hover:text-error' : 'hover:bg-secondary/10 text-secondary/60 hover:text-secondary'}`}
                                >
                                  {u.status === 'active' ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                                </button>
                                <button 
                                  onClick={() => handleUpdateUser(u.uid, { role: u.role === 'secondary_admin' ? 'user' : 'secondary_admin' })}
                                  title={u.role === 'secondary_admin' ? 'Remover Admin' : 'Tornar Admin'}
                                  className={`p-2 rounded-lg transition-colors ${u.role === 'secondary_admin' ? 'hover:bg-primary/10 text-primary/60 hover:text-primary' : 'hover:bg-secondary/10 text-secondary/60 hover:text-secondary'}`}
                                >
                                  {u.role === 'secondary_admin' ? <ShieldAlert className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                                </button>
                                <button 
                                  onClick={() => handleDeleteUser(u.uid)}
                                  title="Eliminar Utilizador"
                                  className="p-2 rounded-lg hover:bg-error/10 text-error/60 hover:text-error transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            <button className="p-2 hover:bg-surface-container-highest rounded-lg text-on-surface-variant transition-colors">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
              {filteredUsers.length === 0 && (
                <div className="p-12 text-center">
                  <p className="text-on-surface-variant">Nenhum utilizador encontrado.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserManagementPage;
