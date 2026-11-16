'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, 
  Send, 
  Phone, 
  Users, 
  CheckCircle2, 
  Sparkles, 
  Copy, 
  Check, 
  Share2, 
  Calendar,
  AlertCircle,
  Clock,
  Smartphone
} from 'lucide-react';
import Link from 'next/link';

export default function CommunicationsPage() {
  const [channel, setChannel] = useState<'whatsapp' | 'sms'>('whatsapp');
  const [recipientGroup, setRecipientGroup] = useState('all');
  const [template, setTemplate] = useState('propinas');
  const [customMessage, setCustomMessage] = useState(
    'Estimado(a) Encarregado(a) de Educação. Lembramos que a propina do mês corrente tem vencimento no dia 10. Pode efectuar o pagamento por Multicaixa Express usando a Entidade: 00542 e Referência: 923 881 042. Complexo Escolar Elo Escolar.'
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const templates = [
    {
      id: 'propinas',
      title: 'Lembrete Amigável de Propina',
      text: 'Estimado(a) Encarregado(a) de Educação. Lembramos que a propina do mês corrente tem vencimento no dia 10. Pode efectuar o pagamento por Multicaixa Express usando a Entidade: 00542 e Referência: 923 881 042. Complexo Escolar Elo Escolar.'
    },
    {
      id: 'reuniao',
      title: 'Convocatória para Reunião de Pais',
      text: 'Caros Encarregados de Educação. A Direcção Pedagógica convida-vos para a Assembleia Geral de Pais e Encarregados, a realizar-se no próximo Sábado às 09h00 no anfiteatro do Colégio. A sua presença é indispensável para o sucesso dos nossos educandos.'
    },
    {
      id: 'provas',
      title: 'Divulgação do Calendário de Provas',
      text: 'Informamos a todos os Encarregados que o calendário oficial de provas do II Trimestre já se encontra publicado no portal Elo Escolar. Solicitamos especial acompanhamento aos planos de estudo diários.'
    },
    {
      id: 'portaria',
      title: 'Aviso de Segurança / Portaria',
      text: 'Informamos que o seu educando acaba de passar na portaria do colégio e já se encontra em segurança no recinto escolar. Elo Escolar Luanda.'
    }
  ];

  const handleSelectTemplate = (tpl: any) => {
    setTemplate(tpl.id);
    setCustomMessage(tpl.text);
  };

  const handleSend = () => {
    if (channel === 'whatsapp') {
      const text = encodeURIComponent(customMessage);
      window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
      setToastMessage('Janela do WhatsApp aberta com a mensagem oficial formatada!');
    } else {
      setToastMessage('Disparo de 142 mensagens SMS enviado com sucesso através do Gateway Angolano (Unitel/Africell)!');
    }
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="flex min-h-screen bg-background text-on-surface">
      <Sidebar />
      <main className="flex-1 lg:ml-64">
        <TopBar title="Central de Comunicação & Alertas aos Pais" />
        
        <div className="pt-24 px-4 lg:px-8 pb-12">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
            <div>
              <span className="text-[10px] uppercase tracking-[0.25em] text-secondary font-bold">
                CANAL DIRECTO COM AS FAMÍLIAS · WHATSAPP & SMS EM MASSA
              </span>
              <h2 className="font-headline text-3xl lg:text-4xl font-extrabold text-white tracking-tight mt-1">
                Central de Comunicação
              </h2>
              <p className="text-on-surface-variant max-w-xl text-sm">
                Envie comunicados, avisos de provas, cobranças de propinas e alertas de segurança instantaneamente aos telemóveis dos pais.
              </p>
            </div>

            <div className="flex items-center gap-2 p-1 rounded-full glass border border-white/10">
              <button 
                onClick={() => setChannel('whatsapp')}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  channel === 'whatsapp' ? 'bg-[#25D366] text-black shadow-md' : 'text-on-surface-variant hover:text-white'
                }`}
              >
                WhatsApp Oficial
              </button>
              <button 
                onClick={() => setChannel('sms')}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  channel === 'sms' ? 'bg-primary text-on-primary shadow-md' : 'text-on-surface-variant hover:text-white'
                }`}
              >
                SMS Angolano (Unitel/Africell)
              </button>
            </div>
          </div>

          {/* Toast Notification */}
          <AnimatePresence>
            {toastMessage && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 bg-secondary/20 border border-secondary/40 text-secondary text-xs font-bold rounded-2xl text-center shadow-lg"
              >
                {toastMessage}
              </motion.div>
            )}
          </AnimatePresence>

          {/* KPI Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant/5">
              <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Famílias Conectadas</span>
              <h3 className="text-2xl font-black text-white mt-1">312 Encarregados</h3>
              <span className="text-[10px] text-secondary font-bold">99% Com Número Móvel Válido</span>
            </div>
            <div className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant/5">
              <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Taxa de Abertura / Leitura</span>
              <h3 className="text-2xl font-black text-secondary mt-1">96.8%</h3>
              <span className="text-[10px] text-on-surface-variant">Lido em menos de 15 minutos</span>
            </div>
            <div className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant/5">
              <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Gateway SMS Angola</span>
              <h3 className="text-2xl font-black text-primary mt-1">Saldo: 4.850 SMS</h3>
              <span className="text-[10px] text-primary font-bold">Operadoras Unitel / Africell</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left: Pre-defined Templates */}
            <div className="lg:col-span-5 space-y-4">
              <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-secondary" />
                <span>Modelos Oficiais Rápidos</span>
              </h3>

              {templates.map(t => (
                <button
                  key={t.id}
                  onClick={() => handleSelectTemplate(t)}
                  className={`w-full p-4 rounded-2xl text-left border transition-all ${
                    template === t.id 
                      ? 'bg-surface-container-high border-secondary/50 shadow-md' 
                      : 'bg-surface-container-low border-white/5 hover:border-white/20'
                  }`}
                >
                  <strong className="text-sm font-bold text-white block">{t.title}</strong>
                  <p className="text-xs text-on-surface-variant mt-1 line-clamp-2 leading-relaxed">
                    {t.text}
                  </p>
                </button>
              ))}
            </div>

            {/* Right: Message Editor & Dispatcher */}
            <div className="lg:col-span-7 bg-surface-container-low p-6 sm:p-8 rounded-3xl border border-outline-variant/10 shadow-xl space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-on-surface-variant font-bold uppercase tracking-wider block mb-1.5">
                    Grupo de Destinatários
                  </label>
                  <select 
                    value={recipientGroup}
                    onChange={(e) => setRecipientGroup(e.target.value)}
                    className="w-full bg-surface-container-high border border-outline-variant/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none"
                  >
                    <option value="all">Todos os Encarregados (Toda a Escola)</option>
                    <option value="c1">10ª Classe A (32 Encarregados)</option>
                    <option value="c2">11ª Classe B (28 Encarregados)</option>
                    <option value="c3">12ª Classe A (30 Encarregados)</option>
                    <option value="debtors">Apenas Encarregados com Propinas em Atraso</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-on-surface-variant font-bold uppercase tracking-wider block mb-1.5">
                    Canal Seleccionado
                  </label>
                  <div className="px-4 py-2.5 rounded-xl bg-surface-container-high border border-outline-variant/10 text-xs font-bold text-white flex items-center justify-between">
                    <span>{channel === 'whatsapp' ? 'WhatsApp Oficial' : 'SMS Angola Gateway'}</span>
                    <span className="text-[10px] text-secondary">● Conectado</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs text-on-surface-variant font-bold uppercase tracking-wider block mb-1.5">
                  Conteúdo da Mensagem
                </label>
                <textarea 
                  rows={6}
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  className="w-full bg-surface-container-high border border-outline-variant/10 rounded-2xl p-4 text-xs sm:text-sm text-white leading-relaxed outline-none focus:ring-2 focus:ring-secondary/20"
                />
                <div className="flex justify-between items-center text-[11px] text-on-surface-variant mt-1.5">
                  <span>Tamanho: {customMessage.length} caracteres ({Math.ceil(customMessage.length / 160)} SMS)</span>
                  <span className="text-secondary font-semibold">Suporta emojis e links de pagamento</span>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
                <span className="text-xs text-on-surface-variant">
                  Destinatários estimados: <strong className="text-white">142 telemóveis</strong>
                </span>

                <button 
                  onClick={handleSend}
                  className={`w-full sm:w-auto px-8 py-3.5 rounded-full font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all ${
                    channel === 'whatsapp' 
                      ? 'bg-[#25D366] text-black hover:brightness-110 shadow-[#25D366]/20' 
                      : 'bg-primary text-on-primary hover:opacity-90 shadow-primary/20'
                  }`}
                >
                  <Send className="w-4 h-4" />
                  <span>{channel === 'whatsapp' ? 'Disparar via WhatsApp' : 'Disparar SMS em Lote'}</span>
                </button>
              </div>

            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
