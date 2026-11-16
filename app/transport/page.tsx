'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bus, 
  MapPin, 
  Phone, 
  Users, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Search, 
  Send, 
  MessageSquare,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';

interface Route {
  id: string;
  name: string;
  zones: string[];
  driverName: string;
  driverPhone: string;
  vehiclePlate: string;
  capacity: number;
  studentsCount: number;
  status: 'Em Trânsito' | 'No Colégio' | 'Concluída';
  departureTime: string;
}

export default function TransportPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [routes, setRoutes] = useState<Route[]>([
    {
      id: 'r1',
      name: 'Rota Sul: Talatona · Camama · Kilamba',
      zones: ['Talatona (Condomínio Rosalinda)', 'Camama (Hospital Geral)', 'Centralidade do Kilamba (Quarteirões B, D, G)'],
      driverName: 'Sr. Mateus Domingos',
      driverPhone: '+244 923 445 566',
      vehiclePlate: 'LD-44-89-HT',
      capacity: 22,
      studentsCount: 18,
      status: 'Em Trânsito',
      departureTime: '15:30'
    },
    {
      id: 'r2',
      name: 'Rota Leste: Viana · Zango · Estalagem',
      zones: ['Ponte Amarela (Viana)', 'Zango 0 (Paragem da Paz)', 'Zango 3 (Rotunda dos Candeeiros)'],
      driverName: 'Sr. Jacinto Kiala',
      driverPhone: '+244 931 778 899',
      vehiclePlate: 'LD-12-34-FA',
      capacity: 22,
      studentsCount: 20,
      status: 'Em Trânsito',
      departureTime: '15:30'
    },
    {
      id: 'r3',
      name: 'Rota Central: Maianga · Alvalade · Miramar',
      zones: ['Largo da Maianga', 'Bairro Azul', 'Alvalade', 'Miramar (Embaixadas)'],
      driverName: 'Sr. Carlos Ndala',
      driverPhone: '+244 944 112 233',
      vehiclePlate: 'LD-99-01-EE',
      capacity: 18,
      studentsCount: 15,
      status: 'No Colégio',
      departureTime: '16:00'
    },
    {
      id: 'r4',
      name: 'Rota Norte: Benfica · Belas · Morro Bento',
      zones: ['Kifica (Benfica)', 'Belas Shopping', 'Morro Bento (Sede Unitel)'],
      driverName: 'Sr. Alberto Cambamba',
      driverPhone: '+244 928 667 788',
      vehiclePlate: 'LD-77-22-KJ',
      capacity: 22,
      studentsCount: 19,
      status: 'Concluída',
      departureTime: '13:00'
    }
  ]);

  const sendWhatsAppAlert = (route: Route) => {
    const text = encodeURIComponent(
      `Olá estimado(a) Encarregado(a). Informamos que a carrinha escolar da ${route.name} (Viatura ${route.vehiclePlate}) iniciou o percurso com destino às residências. Em caso de necessidade contacte o motorista ${route.driverName} através do ${route.driverPhone}.`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
    setToastMessage(`Mensagem de aviso gerada para os encarregados da ${route.name}!`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredRoutes = routes.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.zones.some(z => z.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex min-h-screen bg-background text-on-surface">
      <Sidebar />
      <main className="flex-1 lg:ml-64">
        <TopBar title="Transporte Escolar & Rotas" />
        
        <div className="pt-24 px-4 lg:px-8 pb-12">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
            <div>
              <span className="text-[10px] uppercase tracking-[0.25em] text-secondary font-bold">
                LOGÍSTICA & SEGURANÇA NO TRANSPORTE DE ALUNOS
              </span>
              <h2 className="font-headline text-3xl lg:text-4xl font-extrabold text-white tracking-tight mt-1">
                Transporte Escolar
              </h2>
              <p className="text-on-surface-variant max-w-xl text-sm">
                Gestão de carrinhas escolares, motoristas, lista de alunos por rota e avisos automáticos aos pais em Luanda.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={() => {
                  alert('Nova rota adicionada com sucesso ao sistema!');
                }}
                className="px-5 py-2.5 bg-primary text-on-primary rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-105 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Rota</span>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant/5">
              <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Viaturas Activas</span>
              <h3 className="text-2xl font-black text-white mt-2">4 Carrinhas</h3>
              <span className="text-[10px] text-secondary font-semibold">100% Inspecionadas</span>
            </div>
            <div className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant/5">
              <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Alunos no Transporte</span>
              <h3 className="text-2xl font-black text-secondary mt-2">72 Alunos</h3>
              <span className="text-[10px] text-on-surface-variant">Lotação média: 85%</span>
            </div>
            <div className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant/5">
              <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Carrinhas em Circulação</span>
              <h3 className="text-2xl font-black text-primary mt-2">2 Em Trânsito</h3>
              <span className="text-[10px] text-primary font-bold">Monitorização em Directo</span>
            </div>
            <div className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant/5">
              <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Pontualidade Média</span>
              <h3 className="text-2xl font-black text-white mt-2">98.4%</h3>
              <span className="text-[10px] text-secondary font-bold">Excelente</span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-6 max-w-md">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Pesquisar rota, zona ou condomínio..." 
                className="w-full bg-surface-container-low border border-outline-variant/10 rounded-2xl py-3 pl-11 pr-4 text-xs sm:text-sm text-white outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Routes Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredRoutes.map((route) => (
              <div 
                key={route.id}
                className="bg-surface-container-low rounded-3xl p-6 sm:p-8 border border-outline-variant/10 hover:border-primary/30 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start gap-4 mb-4">
                    <div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-block mb-2 ${
                        route.status === 'Em Trânsito' ? 'bg-primary/20 text-primary animate-pulse' :
                        route.status === 'No Colégio' ? 'bg-secondary/20 text-secondary' : 'bg-surface-container-high text-on-surface-variant'
                      }`}>
                        ● {route.status}
                      </span>
                      <h3 className="text-lg sm:text-xl font-bold text-white leading-snug">
                        {route.name}
                      </h3>
                    </div>

                    <div className="text-right font-mono text-xs text-on-surface-variant">
                      <span className="block font-bold text-white text-sm">{route.vehiclePlate}</span>
                      <span>Partida: {route.departureTime}</span>
                    </div>
                  </div>

                  {/* Zones */}
                  <div className="space-y-1.5 my-4 pt-3 border-t border-white/5">
                    <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider block">
                      Paragens e Zonas Abrangidas:
                    </span>
                    {route.zones.map((zone, zidx) => (
                      <div key={zidx} className="flex items-center gap-2 text-xs text-white/90">
                        <MapPin className="w-3.5 h-3.5 text-secondary flex-shrink-0" />
                        <span>{zone}</span>
                      </div>
                    ))}
                  </div>

                  {/* Driver Details */}
                  <div className="p-3.5 rounded-2xl bg-surface-container-high/40 flex items-center justify-between text-xs my-4">
                    <div>
                      <span className="text-[10px] text-on-surface-variant block uppercase">Motorista Responsável</span>
                      <strong className="text-white">{route.driverName}</strong>
                    </div>
                    <a 
                      href={`tel:${route.driverPhone}`} 
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/20 text-primary font-bold hover:bg-primary/30"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{route.driverPhone}</span>
                    </a>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-3">
                  <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                    <Users className="w-4 h-4 text-primary" />
                    <span>Lotação: <strong className="text-white">{route.studentsCount} / {route.capacity}</strong> Alunos</span>
                  </div>

                  <button 
                    onClick={() => sendWhatsAppAlert(route)}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-secondary/15 hover:bg-secondary/25 text-secondary border border-secondary/30 text-xs font-bold flex items-center justify-center gap-2 transition-all"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Avisar Pais via WhatsApp</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </main>
    </div>
  );
}
