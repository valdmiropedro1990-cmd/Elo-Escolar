// Banco de Dados Local Integrado (Offline / High Performance)
// Fornece dados instantâneos (0ms) e persistência via localStorage para Elo Escolar - Angola

export interface MockStore {
  classes: any[];
  students: any[];
  staff: any[];
  feed_posts: any[];
  comments: any[];
  payments: any[];
  sales_leads: any[];
  exams: any[];
  schedules: any[];
  grades: any[];
  chat_rooms: any[];
  chat_messages: any[];
  attendance: any[];
  access_logs: any[];
  profiles: any[];
}

const INITIAL_STORE: MockStore = {
  classes: [
    { id: 'c1', name: '10ª Classe A', level: 'II Ciclo Secundário / Médio', grade: '10ª Classe', room: 'Sala 01', shift: 'Manhã', coordinator: 'Prof. Dr. Mateus Afonso', course: 'Informática', studentsCount: 32 },
    { id: 'c2', name: '11ª Classe B', level: 'II Ciclo Secundário / Médio', grade: '11ª Classe', room: 'Sala 04', shift: 'Manhã', coordinator: 'Profª. Teresa Silva', course: 'Ciências Físicas e Biológicas', studentsCount: 28 },
    { id: 'c3', name: '12ª Classe A', level: 'II Ciclo Secundário / Médio', grade: '12ª Classe', room: 'Sala 07', shift: 'Tarde', coordinator: 'Engº. Carlos Benguela', course: 'Informática', studentsCount: 30 },
    { id: 'c4', name: '7ª Classe A', level: 'I Ciclo Secundário', grade: '7ª Classe', room: 'Sala P01', shift: 'Manhã', coordinator: 'Profª. Maria António', course: 'Geral', studentsCount: 35 },
    { id: 'c5', name: '8ª Classe B', level: 'I Ciclo Secundário', grade: '8ª Classe', room: 'Sala P03', shift: 'Tarde', coordinator: 'Prof. Joaquim Paulo', course: 'Geral', studentsCount: 33 },
    { id: 'c6', name: 'Iniciação A', level: 'Iniciação (Pré-escolar)', grade: 'Iniciação', room: 'Sala Inf-1', shift: 'Manhã', coordinator: 'Educadora Ana Bela', course: 'Educação Infantil', studentsCount: 20 },
  ],
  students: [
    { id: 's1', student_id: 'AO-2026-0001', name: 'Lucas Gabriel de Almeida', email: 'lucas.almeida@escola.ao', grade: '10ª Classe', class_id: 'c1', status: 'Ativo', engagement_score: 95, photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', responsible_name: 'Gabriel Almeida' },
    { id: 's2', student_id: 'AO-2026-0002', name: 'Marta Domingas Kiala', email: 'marta.kiala@escola.ao', grade: '10ª Classe', class_id: 'c1', status: 'Ativo', engagement_score: 88, photo_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', responsible_name: 'Domingos Kiala' },
    { id: 's3', student_id: 'AO-2026-0003', name: 'Sebastião Manuel da Costa', email: 'sebastiao.costa@escola.ao', grade: '11ª Classe', class_id: 'c2', status: 'Ativo', engagement_score: 92, photo_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150', responsible_name: 'Manuel da Costa' },
    { id: 's4', student_id: 'AO-2026-0004', name: 'Esperança Beatriz dos Santos', email: 'esperanca.santos@escola.ao', grade: '12ª Classe', class_id: 'c3', status: 'Ativo', engagement_score: 98, photo_url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150', responsible_name: 'António dos Santos' },
    { id: 's5', student_id: 'AO-2026-0005', name: 'Edson Valter Benguela', email: 'edson.benguela@escola.ao', grade: '7ª Classe', class_id: 'c4', status: 'Ativo', engagement_score: 82, photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', responsible_name: 'Valter Benguela' },
    { id: 's6', student_id: 'AO-2026-0006', name: 'Helena Teresa Van-Dúnem', email: 'helena.vandunem@escola.ao', grade: '8ª Classe', class_id: 'c5', status: 'Ativo', engagement_score: 90, photo_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', responsible_name: 'Teresa Van-Dúnem' },
  ],
  staff: [
    { id: 'st1', staff_id: 'ST-001', name: 'Prof. Dr. Mateus Afonso', email: 'mateus.afonso@escola.ao', role: 'Diretor Pedagógico', function: 'Direção', department: 'Coordenação Geral', status: 'Ativo', photo_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', phone: '+244 923 111 222' },
    { id: 'st2', staff_id: 'ST-002', name: 'Engª. Luísa Cambamba', email: 'luisa.cambamba@escola.ao', role: 'Professora Titular', function: 'Docência', department: 'Informática', status: 'Ativo', photo_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', phone: '+244 924 333 444' },
    { id: 'st3', staff_id: 'ST-003', name: 'Dra. Teresa Van-Dúnem', email: 'teresa.vandunem@escola.ao', role: 'Secretária Geral', function: 'Secretaria', department: 'Administração', status: 'Ativo', photo_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150', phone: '+244 925 555 666' },
    { id: 'st4', staff_id: 'ST-004', name: 'Lic. Carlos Benguela', email: 'carlos.benguela@escola.ao', role: 'Tesoureiro Chefe', function: 'Tesouraria', department: 'Financeiro', status: 'Ativo', photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', phone: '+244 926 777 888' },
  ],
  feed_posts: [
    { id: 'f1', title: 'Abertura das Provas do II Trimestre', content: 'Informamos a toda a comunidade escolar que o calendário de provas do II Trimestre já se encontra afixado e disponível no sistema. Solicitamos aos encarregados a regularização das propinas até o dia 10.', author_name: 'Secretaria Geral', author_role: 'Administração', category: 'Comunicado Oficial', created_at: new Date(Date.now() - 3600000).toISOString(), likes_count: 24 },
    { id: 'f2', title: 'Feira das Ciências e Tecnologia 2026', content: 'A nossa escola irá acolher no próximo dia 25 a grande Feira de Inovação Pedagógica e Robótica. Todos os alunos do II Ciclo devem confirmar os seus projetos com os coordenadores de curso.', author_name: 'Prof. Dr. Mateus Afonso', author_role: 'Diretor Pedagógico', category: 'Atividade Cultural', created_at: new Date(Date.now() - 86400000).toISOString(), likes_count: 58 },
  ],
  comments: [],
  payments: [
    { id: 'p1', student_id: 's1', student_name: 'Lucas Gabriel de Almeida', amount: 25000, status: 'Confirmado', payment_method: 'Multicaixa Express', month: 'Abril', due_date: '2026-04-30', created_at: new Date(Date.now() - 7200000).toISOString() },
    { id: 'p2', student_id: 's2', student_name: 'Marta Domingas Kiala', amount: 25000, status: 'Confirmado', payment_method: 'Transferência Bancária (BAI)', month: 'Abril', due_date: '2026-04-30', created_at: new Date(Date.now() - 14400000).toISOString() },
    { id: 'p3', student_id: 's3', student_name: 'Sebastião Manuel da Costa', amount: 25000, status: 'Pendente', payment_method: 'Pendente', month: 'Abril', due_date: '2026-04-30', created_at: new Date().toISOString() },
    { id: 'p4', student_id: 's4', student_name: 'Esperança Beatriz dos Santos', amount: 30000, status: 'Confirmado', payment_method: 'Multicaixa', month: 'Março', due_date: '2026-03-30', created_at: new Date(Date.now() - 86400000).toISOString() },
    { id: 'p5', student_id: 's5', student_name: 'Edson Valter Benguela', amount: 20000, status: 'Atrasado', payment_method: 'Nenhum', month: 'Fevereiro', due_date: '2026-02-28', created_at: new Date(Date.now() - 172800000).toISOString() },
  ],
  sales_leads: [
    { id: 'l1', name: 'Maria Joaquina Manuel', phone: '+244 923 001 002', email: 'maria.joaquina@gmail.com', stage: 'Visita Agendada', interest: '10ª Classe - Informática', value: 75000, created_at: new Date().toISOString() },
    { id: 'l2', name: 'António Kiala Bento', phone: '+244 931 003 004', email: 'antonio.kiala@gmail.com', stage: 'Documentação', interest: '7ª Classe - I Ciclo', value: 50000, created_at: new Date().toISOString() },
    { id: 'l3', name: 'Teresa da Costa Neto', phone: '+244 944 005 006', email: 'teresa.costa@hotmail.com', stage: 'Leads', interest: 'Iniciação', value: 45000, created_at: new Date().toISOString() },
  ],
  exams: [
    { id: 'e1', subject: 'Matemática', class_name: '10ª Classe A', date: '2026-05-18', time: '08:00', room: 'Sala 01', shift: 'Manhã', type: 'Trimestral' },
    { id: 'e2', subject: 'Física', class_name: '10ª Classe A', date: '2026-05-20', time: '10:30', room: 'Sala 01', shift: 'Manhã', type: 'Trimestral' },
    { id: 'e3', subject: 'Língua Portuguesa', class_name: '11ª Classe B', date: '2026-05-19', time: '08:00', room: 'Sala 04', shift: 'Manhã', type: 'Trimestral' },
    { id: 'e4', subject: 'Química', class_name: '12ª Classe A', date: '2026-05-21', time: '14:00', room: 'Sala 07', shift: 'Tarde', type: 'Trimestral' },
  ],
  schedules: [
    { id: 'sc1', class_name: '10ª Classe A', day: 'Segunda', time: '07:30 - 09:00', subject: 'Matemática', teacher: 'Prof. Dr. Mateus Afonso' },
    { id: 'sc2', class_name: '10ª Classe A', day: 'Segunda', time: '09:15 - 10:45', subject: 'Informática', teacher: 'Engª. Luísa Cambamba' },
    { id: 'sc3', class_name: '10ª Classe A', day: 'Terça', time: '07:30 - 09:00', subject: 'Física', teacher: 'Prof. Carlos Mendes' },
    { id: 'sc4', class_name: '10ª Classe A', day: 'Quarta', time: '10:00 - 11:30', subject: 'Língua Portuguesa', teacher: 'Profª. Maria António' },
  ],
  grades: [
    { id: 'g1', student_id: 's1', student_name: 'Lucas Gabriel de Almeida', subject: 'Matemática', trimester: 'I Trimestre', mac: 16, npp: 17, npt: 18, mt: 17 },
    { id: 'g2', student_id: 's1', student_name: 'Lucas Gabriel de Almeida', subject: 'Física', trimester: 'I Trimestre', mac: 15, npp: 16, npt: 15, mt: 15 },
    { id: 'g3', student_id: 's2', student_name: 'Marta Domingas Kiala', subject: 'Matemática', trimester: 'I Trimestre', mac: 18, npp: 19, npt: 18, mt: 18 },
    { id: 'g4', student_id: 's3', student_name: 'Sebastião Manuel da Costa', subject: 'Química', trimester: 'I Trimestre', mac: 14, npp: 15, npt: 16, mt: 15 },
  ],
  chat_rooms: [
    { id: 'cr1', name: 'Coordenação Pedagógica', type: 'group', last_message: 'Pautas do I Trimestre devidamente consolidadas.', last_message_at: 'há 15 min', unread_count: 2 },
    { id: 'cr2', name: 'Secretaria Geral & Matrículas', type: 'group', last_message: 'Mais 5 comprovativos validados hoje.', last_message_at: 'há 45 min', unread_count: 0 },
    { id: 'cr3', name: 'Encarregado: Gabriel Almeida', type: 'direct', last_message: 'Boa tarde, confirmo a receção do boletim de notas.', last_message_at: 'há 2 horas', unread_count: 1 },
  ],
  chat_messages: [],
  attendance: [
    { id: 'at1', student_id: 's1', date: '2026-05-15', status: 'Presente' },
    { id: 'at2', student_id: 's2', date: '2026-05-15', status: 'Presente' },
    { id: 'at3', student_id: 's3', date: '2026-05-15', status: 'Falta Justificada' },
  ],
  access_logs: [
    { id: 'al1', person_name: 'Lucas Gabriel de Almeida', person_type: 'Aluno', direction: 'Entrada', timestamp: '07:22', status: 'Autorizado', qr_code: 'AO-2026-0001' },
    { id: 'al2', person_name: 'Prof. Dr. Mateus Afonso', person_type: 'Funcionário', direction: 'Entrada', timestamp: '07:28', status: 'Autorizado', qr_code: 'ST-001' },
    { id: 'al3', person_name: 'Marta Domingas Kiala', person_type: 'Aluno', direction: 'Entrada', timestamp: '07:34', status: 'Autorizado', qr_code: 'AO-2026-0002' },
    { id: 'al4', person_name: 'Sebastião Manuel da Costa', person_type: 'Aluno', direction: 'Saída', timestamp: '12:45', status: 'Autorizado', qr_code: 'AO-2026-0003' },
  ],
  profiles: [
    { id: 'demo-admin', email: 'admin@eloescolar.ao', name: 'Administrador Geral', role: 'primary_admin', status: 'active', permissions: ['all'] },
    { id: 'sec-admin', email: 'secretaria@eloescolar.ao', name: 'Secretaria Geral', role: 'secondary_admin', status: 'active', permissions: ['read', 'write'] },
    { id: 'user-demo', email: 'encarregado@eloescolar.ao', name: 'Encarregado de Educação', role: 'user', status: 'active', permissions: ['read'] },
  ],
};

const STORAGE_KEY = 'elo_escolar_mock_store_v1';

export function getMockStore(): MockStore {
  if (typeof window === 'undefined') return INITIAL_STORE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_STORE));
    return INITIAL_STORE;
  } catch (e) {
    return INITIAL_STORE;
  }
}

export function saveMockStore(store: MockStore) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch (e) {}
}
