
export interface Student {
  id: string;
  name: string;
  email: string;
  grade: string;
  classId: string;
  status: 'Ativo' | 'Suspenso' | 'Licença';
  engagement: number;
  avatar: string;
  number: number;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  createdAt: string;
  likes: string[]; // array of userIds
  commentsCount: number;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
}

export interface Message {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'file';
  createdAt: string;
}

export interface ChatRoom {
  id: string;
  name: string;
  type: 'direct' | 'group';
  participants: string[]; // array of userIds
  lastMessage?: string;
  lastMessageAt?: string;
  avatar?: string;
}

export interface UserStatus {
  userId: string;
  status: 'online' | 'offline' | 'away';
  lastSeen: string;
}

export interface Staff {
  id: string;
  name: string;
  email: string;
  role: string;
  function: string;
  department: string;
  avatar: string;
  phone: string;
  status: 'Ativo' | 'Férias' | 'Licença';
  joinedAt: string;
}

export interface Turma {
  id: string;
  name: string;
  level: string;
  grade: string;
  room: string;
  shift: 'Manhã' | 'Tarde' | 'Noite';
  coordinator: string;
  studentsCount: number;
  course?: string;
}

export interface Exam {
  id: string;
  turmaId: string;
  subject: string;
  date: string;
  time: string;
  type: 'Trimestral' | 'Mensal' | 'Exame';
  room: string;
}

export interface ScheduleItem {
  id: string;
  turmaId: string;
  subject: string;
  dayOfWeek: 'Segunda' | 'Terça' | 'Quarta' | 'Quinta' | 'Sexta' | 'Sábado';
  startTime: string;
  endTime: string;
  teacher: string;
  room: string;
}

export interface Grade {
  id: string;
  studentId: string;
  turmaId: string;
  subject: string;
  period: '1º Trimestre' | '2º Trimestre' | '3º Trimestre';
  value: number;
  type: 'MAC' | 'NPP' | 'NPT' | 'Exame';
  date: string;
}

export interface Transaction {
  id: string;
  studentId?: string;
  description: string;
  amount: number;
  type: 'Receita' | 'Despesa';
  category: 'Propina' | 'Matrícula' | 'Salário' | 'Manutenção' | 'Outros';
  date: string;
  status: 'Pago' | 'Pendente' | 'Atrasado';
}

export interface Lead {
  id: string;
  name: string;
  grade: string;
  status: 'Leads' | 'Visita Agendada' | 'Documentação' | 'Concluído';
  responsible: string;
  value: number;
  avatar: string;
  phone: string;
  email: string;
  createdAt: string;
}

export const SUBJECTS = [
  'Língua Portuguesa',
  'Matemática',
  'Física',
  'Química',
  'Biologia',
  'História',
  'Geografia',
  'Educação Visual e Plástica',
  'Educação Física',
  'Inglês',
  'Francês',
  'Informática',
  'Empreendedorismo'
];

export const DAYS_OF_WEEK = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export const ACADEMIC_LEVELS = [
  'Iniciação (Pré-escolar)',
  'Ensino Primário',
  'I Ciclo Secundário',
  'II Ciclo Secundário / Médio'
];

export const COURSES = [
  'Ciências Físicas e Biológicas',
  'Ciências Jurídicas e Económicas',
  'Línguas e Humanidades',
  'Informática'
];

export const SHIFTS = ['Manhã', 'Tarde', 'Noite'];

export const generateAcademicStructure = () => {
  const turmas: Turma[] = [];
  const students: Student[] = [];
  let studentCounter = 1;

  // 1. Iniciação
  turmas.push({
    id: 'init-1',
    name: 'Iniciação A',
    level: 'Iniciação (Pré-escolar)',
    grade: 'Iniciação',
    room: 'Sala 01',
    shift: 'Manhã',
    coordinator: 'Prof.ª Ana Silva',
    studentsCount: 20
  });

  // 2. Primário (1ª - 6ª) - 2 rooms per class
  for (let grade = 1; grade <= 6; grade++) {
    for (let roomNum = 1; roomNum <= 2; roomNum++) {
      const turmaId = `prim-${grade}-${roomNum}`;
      const turmaName = `${grade}ª Classe ${roomNum === 1 ? 'A' : 'B'}`;
      turmas.push({
        id: turmaId,
        name: turmaName,
        level: 'Ensino Primário',
        grade: `${grade}ª Classe`,
        room: `Sala P0${(grade - 1) * 2 + roomNum}`,
        shift: roomNum === 1 ? 'Manhã' : 'Tarde',
        coordinator: `Prof. ${['Manuel', 'Joaquim', 'Maria', 'Teresa'][Math.floor(Math.random() * 4)]} ${['Santos', 'Pereira', 'Oliveira'][Math.floor(Math.random() * 3)]}`,
        studentsCount: 30
      });

      // Generate students for this turma
      for (let i = 1; i <= 30; i++) {
        students.push({
          id: `AO-2026-${String(studentCounter).padStart(4, '0')}`,
          name: `Estudante ${studentCounter}`,
          email: `aluno${studentCounter}@escola.ao`,
          grade: `${grade}ª Classe`,
          classId: turmaId,
          status: 'Ativo',
          engagement: Math.floor(Math.random() * 40) + 60,
          avatar: `https://picsum.photos/seed/student${studentCounter}/100/100`,
          number: i
        });
        studentCounter++;
      }
    }
  }

  // 3. I Ciclo (7ª - 9ª) - 2 rooms per class
  for (let grade = 7; grade <= 9; grade++) {
    for (let roomNum = 1; roomNum <= 2; roomNum++) {
      const turmaId = `iciclo-${grade}-${roomNum}`;
      turmas.push({
        id: turmaId,
        name: `${grade}ª Classe ${roomNum === 1 ? 'A' : 'B'}`,
        level: 'I Ciclo Secundário',
        grade: `${grade}ª Classe`,
        room: `Sala S0${(grade - 7) * 2 + roomNum}`,
        shift: roomNum === 1 ? 'Manhã' : 'Tarde',
        coordinator: `Prof. ${['Carlos', 'Beatriz'][Math.floor(Math.random() * 2)]} ${['Mendes', 'Vunge'][Math.floor(Math.random() * 2)]}`,
        studentsCount: 35
      });

      for (let i = 1; i <= 35; i++) {
        students.push({
          id: `AO-2026-${String(studentCounter).padStart(4, '0')}`,
          name: `Estudante ${studentCounter}`,
          email: `aluno${studentCounter}@escola.ao`,
          grade: `${grade}ª Classe`,
          classId: turmaId,
          status: 'Ativo',
          engagement: Math.floor(Math.random() * 50) + 50,
          avatar: `https://picsum.photos/seed/student${studentCounter}/100/100`,
          number: i
        });
        studentCounter++;
      }
    }
  }

  // 4. II Ciclo / Médio (10ª - 12ª/13ª) - 2 rooms per course/class
  for (let grade = 10; grade <= 13; grade++) {
    COURSES.forEach((course, courseIdx) => {
      // Only Informática goes to 13ª
      if (grade === 13 && course !== 'Informática') return;

      for (let roomNum = 1; roomNum <= 2; roomNum++) {
        const turmaId = `iiciclo-${grade}-${courseIdx}-${roomNum}`;
        turmas.push({
          id: turmaId,
          name: `${grade}ª ${course.split(' ')[0]} ${roomNum === 1 ? 'A' : 'B'}`,
          level: 'II Ciclo Secundário / Médio',
          grade: `${grade}ª Classe`,
          course: course,
          room: `Sala M${(grade - 10) * 8 + courseIdx * 2 + roomNum}`,
          shift: roomNum === 1 ? 'Manhã' : 'Tarde',
          coordinator: `Prof. ${['António', 'Helena'][Math.floor(Math.random() * 2)]} ${['Benguela', 'Vunge'][Math.floor(Math.random() * 2)]}`,
          studentsCount: 40
        });

        for (let i = 1; i <= 40; i++) {
          students.push({
            id: `AO-2026-${String(studentCounter).padStart(4, '0')}`,
            name: `Estudante ${studentCounter}`,
            email: `aluno${studentCounter}@escola.ao`,
            grade: `${grade}ª Classe`,
            classId: turmaId,
            status: 'Ativo',
            engagement: Math.floor(Math.random() * 60) + 40,
            avatar: `https://picsum.photos/seed/student${studentCounter}/100/100`,
            number: i
          });
          studentCounter++;
        }
      }
    });
  }

  return { turmas, students };
};

export const generateCalendarData = (turmas: Turma[]) => {
  const exams: Exam[] = [];
  const schedules: ScheduleItem[] = [];

  turmas.forEach(turma => {
    // 1. Generate Schedule (5-6 subjects per week)
    const turmaSubjects = SUBJECTS.slice(0, 8);
    DAYS_OF_WEEK.slice(0, 5).forEach((day, dayIdx) => {
      // 2-3 classes per day
      const classesPerDay = 3;
      for (let i = 0; i < classesPerDay; i++) {
        const subject = turmaSubjects[(dayIdx + i) % turmaSubjects.length];
        const startHour = 8 + i * 2;
        schedules.push({
          id: `sched-${turma.id}-${day}-${i}`,
          turmaId: turma.id,
          subject,
          dayOfWeek: day as any,
          startTime: `${String(startHour).padStart(2, '0')}:00`,
          endTime: `${String(startHour + 1).padStart(2, '0')}:45`,
          teacher: turma.coordinator,
          room: turma.room
        });
      }
    });

    // 2. Generate Exams (2-3 exams in the next month)
    const examSubjects = SUBJECTS.slice(0, 3);
    examSubjects.forEach((subject, idx) => {
      const date = new Date();
      date.setDate(date.getDate() + 7 + idx * 7);
      exams.push({
        id: `exam-${turma.id}-${idx}`,
        turmaId: turma.id,
        subject,
        date: date.toISOString().split('T')[0],
        time: '09:00',
        type: idx === 0 ? 'Mensal' : 'Trimestral',
        room: turma.room
      });
    });
  });

  return { exams, schedules };
};

export const generateSampleData = (turmas: Turma[], students: Student[]) => {
  const grades: Grade[] = [];
  const transactions: Transaction[] = [];
  const leads: Lead[] = [];
  const posts: Post[] = [];
  const comments: Comment[] = [];
  const messages: Message[] = [];
  const staff: Staff[] = [];

  // 1. Generate Grades for some students
  students.slice(0, 50).forEach(student => {
    SUBJECTS.slice(0, 2).forEach(subject => {
      grades.push({
        id: `grade-${student.id}-${subject}`,
        studentId: student.id,
        turmaId: student.classId,
        subject,
        period: '1º Trimestre',
        value: Math.floor(Math.random() * 10) + 10,
        type: 'MAC',
        date: new Date().toISOString()
      });
    });
  });

  // 2. Generate Transactions
  students.slice(0, 20).forEach(student => {
    transactions.push({
      id: `trans-${student.id}`,
      studentId: student.id,
      description: `Propina Mensal - ${student.name}`,
      amount: 15000,
      type: 'Receita',
      category: 'Propina',
      date: new Date().toISOString(),
      status: Math.random() > 0.2 ? 'Pago' : 'Pendente'
    });
  });

  // 3. Generate Leads
  const leadNames = ['Carlos Manuel', 'Ana Sofia', 'Miguel Costa', 'Isabel Santos', 'Ricardo Pereira'];
  leadNames.forEach((name, idx) => {
    leads.push({
      id: `lead-${idx}`,
      name,
      grade: '10ª Classe',
      status: idx === 0 ? 'Leads' : idx === 1 ? 'Visita Agendada' : 'Documentação',
      responsible: 'Secretaria',
      value: 12000,
      avatar: `https://picsum.photos/seed/lead${idx}/100/100`,
      phone: '923000000',
      email: `lead${idx}@email.com`,
      createdAt: new Date().toISOString()
    });
  });

  // 4. Generate Posts
  posts.push({
    id: 'post-1',
    authorId: 'admin',
    authorName: 'Direção Escolar',
    authorAvatar: 'https://picsum.photos/seed/admin/100/100',
    content: 'Bem-vindos ao novo ano letivo! Estamos ansiosos por receber todos os nossos alunos.',
    mediaUrl: 'https://picsum.photos/seed/school-welcome/800/400',
    mediaType: 'image',
    createdAt: new Date().toISOString(),
    likes: ['user-1', 'user-2'],
    commentsCount: 2
  });

  posts.push({
    id: 'post-2',
    authorId: 'admin',
    authorName: 'Coordenação Desportiva',
    authorAvatar: 'https://picsum.photos/seed/sports/100/100',
    content: 'Não percam o torneio inter-turmas na próxima sexta-feira!',
    mediaUrl: 'https://picsum.photos/seed/sports-event/800/400',
    mediaType: 'image',
    createdAt: new Date().toISOString(),
    likes: ['user-3'],
    commentsCount: 1
  });

  // 5. Generate Comments
  comments.push({
    id: 'comment-1',
    postId: 'post-1',
    authorId: 'user-1',
    authorName: 'Maria Silva',
    authorAvatar: 'https://picsum.photos/seed/user1/100/100',
    content: 'Excelente iniciativa!',
    createdAt: new Date().toISOString()
  });

  // 6. Generate Messages
  messages.push({
    id: 'msg-1',
    roomId: 'group-school',
    senderId: 'admin',
    senderName: 'Direção',
    content: 'Olá a todos! Este é o canal oficial de avisos.',
    type: 'text',
    createdAt: new Date().toISOString()
  });

  // 7. Generate Staff
  const staffData = [
    { name: 'Dr. Alberto Vunge', role: 'Diretor Geral', function: 'Gestão Estratégica', dept: 'Direção' },
    { name: 'Dra. Maria Santos', role: 'Coordenadora Pedagógica', function: 'Supervisão de Professores', dept: 'Pedagógico' },
    { name: 'Eng. Carlos Mendes', role: 'Diretor de TI', function: 'Infraestrutura Digital', dept: 'Tecnologia' },
    { name: 'Dra. Helena Benguela', role: 'Secretária Executiva', function: 'Atendimento e Matrículas', dept: 'Secretaria' },
    { name: 'Sr. Joaquim Pereira', role: 'Tesoureiro', function: 'Gestão de Pagamentos', dept: 'Financeiro' }
  ];

  staffData.forEach((s, idx) => {
    staff.push({
      id: `STF-2026-${String(idx + 1).padStart(3, '0')}`,
      name: s.name,
      email: `${s.name.toLowerCase().split(' ').join('.')}@escola.ao`,
      role: s.role,
      function: s.function,
      department: s.dept,
      avatar: `https://picsum.photos/seed/staff${idx}/100/100`,
      phone: '923111222',
      status: 'Ativo',
      joinedAt: new Date().toISOString()
    });
  });

  return { grades, transactions, leads, posts, comments, messages, staff };
};
