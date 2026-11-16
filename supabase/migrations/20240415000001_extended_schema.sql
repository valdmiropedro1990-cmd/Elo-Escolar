-- Create chat_rooms table
CREATE TABLE chat_rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('direct', 'group')) DEFAULT 'direct',
  participants UUID[], -- Array of profile IDs
  avatar TEXT,
  last_message TEXT,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Update chat_messages to use room_id
ALTER TABLE chat_messages ADD COLUMN room_id UUID REFERENCES chat_rooms(id);
ALTER TABLE chat_messages ADD COLUMN sender_name TEXT;
ALTER TABLE chat_messages ADD COLUMN author_avatar TEXT;
ALTER TABLE chat_messages ADD COLUMN type TEXT DEFAULT 'text';

-- Create comments table
CREATE TABLE comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES feed_posts(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id),
  author_name TEXT,
  author_avatar TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create exams table
CREATE TABLE exams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  turma_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  type TEXT CHECK (type IN ('Mensal', 'Trimestral', 'Exame')) DEFAULT 'Mensal',
  room TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create schedules table
CREATE TABLE schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  turma_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  day_of_week TEXT CHECK (day_of_week IN ('Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo')),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  teacher TEXT,
  room TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add missing columns to classes
ALTER TABLE classes ADD COLUMN level TEXT;
ALTER TABLE classes ADD COLUMN grade TEXT;
ALTER TABLE classes ADD COLUMN shift TEXT;
ALTER TABLE classes ADD COLUMN coordinator TEXT;
ALTER TABLE classes ADD COLUMN course TEXT;

-- Add missing columns to feed_posts
ALTER TABLE feed_posts ADD COLUMN author_name TEXT;
ALTER TABLE feed_posts ADD COLUMN author_avatar TEXT;
ALTER TABLE feed_posts ADD COLUMN media_type TEXT;
ALTER TABLE feed_posts ADD COLUMN likes UUID[]; -- Array of profile IDs

-- Add missing columns to sales_leads
ALTER TABLE sales_leads ADD COLUMN grade TEXT;
ALTER TABLE sales_leads ADD COLUMN responsible TEXT;
ALTER TABLE sales_leads ADD COLUMN value NUMERIC DEFAULT 0;

-- Enable RLS for new tables
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;

-- Basic policies for new tables
CREATE POLICY "Everyone can view chat rooms they are part of" ON chat_rooms FOR SELECT USING (auth.uid() = ANY(participants));
CREATE POLICY "Everyone can view comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Everyone can view exams" ON exams FOR SELECT USING (true);
CREATE POLICY "Everyone can view schedules" ON schedules FOR SELECT USING (true);

-- Admin policies for new tables
CREATE POLICY "Admins have full access to exams" ON exams FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('primary_admin', 'secondary_admin'))
);

CREATE POLICY "Admins have full access to schedules" ON schedules FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('primary_admin', 'secondary_admin'))
);
