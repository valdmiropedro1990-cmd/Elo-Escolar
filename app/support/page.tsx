'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { motion } from 'motion/react';
import { 
  HelpCircle, 
  MessageSquare, 
  Phone, 
  Mail, 
  FileQuestion, 
  Send, 
  CheckCircle2,
  Clock,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';

export default function SupportPage() {
  const [submitted, setSubmitted] = useState(false);
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Dúvida Pedagógica');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubject('');
      setMessage('');
      setSubmitted(false);
    }, 4000);
  };

  const faqs = [
    {
      q: 'Como gerar e imprimir pautas ou boletins de notas?',
      a: 'Aceda ao módulo "Gestão Académica" ou "Controlo Escolar", selecione a turma desejada e clique em "Emitir Pauta / Boletim". O sistema gera o documento em formato oficial pronto para impressão ou download em PDF.'
    },
    {
      q: 'Como validar o comprovativo de propina de um aluno?',
      a: 'No módulo "Financeiro" ou "Pagamentos", localize o registo com estado "Pendente", clique em "Validar" e confirme o montante recebido via Multicaixa ou transferência.'
    },
    {
      q: 'Como funciona a leitura de QR Code na Portaria?',
      a: 'O módulo "Portaria" utiliza a câmara do computador ou telemóvel para fazer a leitura instantânea do cartão virtual ou físico do estudante, registando automaticamente a hora de entrada e saída.'
    },
    {
      q: 'É possível utilizar a aplicação em modo offline?',
      a: 'Sim. O Elo Escolar possui sincronização e armazenamento local integrado. Todas as operações de consulta, lançamento de notas e gestão funcionam instantaneamente mesmo em caso de falha de ligação.'
    }
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 lg:ml-64 pb-12">
        <TopBar title="Central de Ajuda & Suporte" />

        <div className="pt-24 px-4 lg:px-8 max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-headline text-3xl font-extrabold text-white">Central de Suporte Técnico</h1>
            <p className="text-on-surface-variant text-sm mt-1">
              Atendimento e suporte técnico dedicado para escolas, secretarias e encarregados em Angola.
            </p>
          </div>

          {/* Quick Contact Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/10 flex items-start gap-4">
              <div className="p-3 rounded-xl bg-primary/10 text-primary">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-on-surface-variant uppercase font-bold tracking-wider">Atendimento Telefónico</p>
                <p className="text-base font-bold text-white mt-1">+244 923 000 000</p>
                <p className="text-xs text-on-surface-variant mt-0.5">Seg - Sex: 07:30 às 17:30</p>
              </div>
            </div>

            <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/10 flex items-start gap-4">
              <div className="p-3 rounded-xl bg-secondary/10 text-secondary">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-on-surface-variant uppercase font-bold tracking-wider">Correio Eletrónico</p>
                <p className="text-base font-bold text-white mt-1">suporte@eloescolar.ao</p>
                <p className="text-xs text-on-surface-variant mt-0.5">Resposta em até 2 horas</p>
              </div>
            </div>

            <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/10 flex items-start gap-4">
              <div className="p-3 rounded-xl bg-tertiary/10 text-tertiary">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-on-surface-variant uppercase font-bold tracking-wider">Estado do Sistema</p>
                <p className="text-base font-bold text-white mt-1 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  100% Operacional
                </p>
                <p className="text-xs text-on-surface-variant mt-0.5">Servidor Local & Cloud Activo</p>
              </div>
            </div>
          </div>

          {/* Form & FAQ Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Contact Form */}
            <div className="lg:col-span-7 bg-surface-container-low p-6 lg:p-8 rounded-2xl border border-outline-variant/10">
              <h2 className="text-xl font-bold text-white mb-2">Enviar Mensagem ao Suporte</h2>
              <p className="text-xs text-on-surface-variant mb-6">
                Descreva a sua dúvida técnica ou solicitação de suporte. A nossa equipa responderá diretamente.
              </p>

              {submitted ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center space-y-2"
                >
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                  <p className="text-base font-bold text-white">Mensagem Enviada com Sucesso!</p>
                  <p className="text-xs text-emerald-300">
                    O seu pedido de assistência técnica foi registado. Um técnico responderá brevemente.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-1.5">
                      Categoria do Pedido
                    </label>
                    <select 
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-surface-container-highest border border-outline-variant/10 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-primary/20 outline-none"
                    >
                      <option>Dúvida Pedagógica</option>
                      <option>Problema Financeiro / Propinas</option>
                      <option>Leitor de QR da Portaria</option>
                      <option>Gestão de Utilizadores e Contas</option>
                      <option>Outros Assuntos</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-1.5">
                      Assunto
                    </label>
                    <input 
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      required
                      placeholder="Ex: Dificuldade na emissão de declaração com notas"
                      className="w-full bg-surface-container-highest border border-outline-variant/10 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-1.5">
                      Descrição Detalhada
                    </label>
                    <textarea 
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                      placeholder="Escreva aqui a descrição detalhada..."
                      className="w-full bg-surface-container-highest border border-outline-variant/10 rounded-xl p-4 text-sm text-white focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-primary to-primary-container text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all"
                  >
                    <Send className="w-4 h-4" />
                    Submeter Pedido de Suporte
                  </button>
                </form>
              )}
            </div>

            {/* FAQ Accordion */}
            <div className="lg:col-span-5 space-y-4">
              <h2 className="text-xl font-bold text-white mb-2">Perguntas Frequentes (FAQ)</h2>
              {faqs.map((faq, idx) => (
                <div key={idx} className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/10">
                  <p className="text-sm font-bold text-white flex items-start gap-2">
                    <FileQuestion className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
                    <span>{faq.q}</span>
                  </p>
                  <p className="text-xs text-on-surface-variant mt-2 leading-relaxed pl-6">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
