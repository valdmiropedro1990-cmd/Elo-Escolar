'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { motion } from 'motion/react';
import { Database, Shield, Bell, User, Save, RefreshCw, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

const SettingsPage = () => {
  const { isAdmin } = useAuth();
  const [isSeeding, setIsSeeding] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const clearDatabase = async () => {
    if (!isAdmin) return;
    if (!confirm('Tem a certeza que deseja limpar TODA a base de dados do Supabase? Esta ação é irreversível.')) return;

    setIsClearing(true);
    try {
      // Delete in order to respect foreign keys
      await Promise.all([
        supabase.from('attendance').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        supabase.from('payments').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        supabase.from('grades').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        supabase.from('exams').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        supabase.from('schedules').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        supabase.from('comments').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        supabase.from('chat_messages').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      ]);

      await Promise.all([
        supabase.from('students').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        supabase.from('staff').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        supabase.from('feed_posts').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        supabase.from('sales_leads').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      ]);

      await supabase.from('classes').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      alert('Base de dados limpa com sucesso!');
    } catch (error) {
      console.error('Error clearing database:', error);
      alert('Erro ao limpar base de dados.');
    } finally {
      setIsClearing(false);
    }
  };

  const seedDatabase = async () => {
    if (!isAdmin) return;
    setIsSeeding(true);
    try {
      // For now, we'll keep it simple and just alert that seeding to Supabase should be done via migrations or a dedicated script
      alert('A funcionalidade de povoamento automático para o Supabase está em desenvolvimento. Por favor, utilize as migrações SQL para dados iniciais.');
    } catch (error) {
      console.error('Error seeding database:', error);
      alert('Erro ao povoar base de dados.');
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 lg:ml-64">
        <TopBar title="Definições" />
        
        <div className="pt-24 px-4 lg:px-8 pb-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <h2 className="font-headline text-3xl lg:text-4xl font-extrabold tracking-tight text-white mb-2">Definições</h2>
            <p className="text-on-surface-variant max-w-xl text-sm lg:text-base">Configure as suas preferências institucionais e gira os dados do sistema.</p>
          </motion.div>

          <div className="max-w-4xl space-y-6">
            <section className="bg-surface-container-low p-8 rounded-2xl border border-outline-variant/5">
              <div className="flex items-center gap-3 mb-6">
                <Database className="w-6 h-6 text-primary" />
                <h3 className="text-xl font-bold text-white">Gestão de Dados</h3>
              </div>
              <p className="text-on-surface-variant text-sm mb-6">Povoar o seu CRM com dados de exemplo para testar a interface e a lógica do funil.</p>
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={seedDatabase}
                  disabled={isSeeding}
                  className="flex items-center gap-2 px-6 py-3 bg-primary text-on-primary-fixed hover:opacity-90 rounded-xl font-bold text-sm transition-all disabled:opacity-50 shadow-lg shadow-primary/20"
                >
                  {isSeeding ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
                  {isSeeding ? 'A Povoar...' : 'Povoar Dados Académicos'}
                </button>
                <button 
                  onClick={clearDatabase}
                  disabled={isClearing}
                  className="flex items-center gap-2 px-6 py-3 bg-error/10 text-error hover:bg-error/20 rounded-xl font-bold text-sm transition-all disabled:opacity-50"
                >
                  {isClearing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  {isClearing ? 'A Limpar...' : 'Limpar Dados Locais'}
                </button>
              </div>
            </section>

            <section className="bg-surface-container-low p-8 rounded-2xl border border-outline-variant/5">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="w-6 h-6 text-secondary" />
                <h3 className="text-xl font-bold text-white">Segurança e Privacidade</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-background rounded-xl">
                  <div>
                    <p className="text-sm font-bold text-white">Autenticação de Dois Fatores</p>
                    <p className="text-xs text-on-surface-variant">Adicione uma camada extra de segurança à sua conta.</p>
                  </div>
                  <div className="w-12 h-6 bg-surface-container-highest rounded-full relative cursor-pointer">
                    <div className="absolute left-1 top-1 w-4 h-4 bg-on-surface-variant rounded-full"></div>
                  </div>
                </div>
              </div>
            </section>

            <div className="flex justify-end pt-4">
              <button className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-primary to-primary-container rounded-xl text-sm font-bold text-on-primary-fixed shadow-lg shadow-primary/20">
                <Save className="w-4 h-4" />
                Guardar Alterações
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
