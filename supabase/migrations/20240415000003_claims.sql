-- Create claims table
CREATE TABLE claims (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  user_name TEXT,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT CHECK (status IN ('Pendente', 'Em Análise', 'Resolvido')) DEFAULT 'Pendente',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own claims" ON claims FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own claims" ON claims FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all claims" ON claims FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('primary_admin', 'secondary_admin'))
);
CREATE POLICY "Admins can update all claims" ON claims FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('primary_admin', 'secondary_admin'))
);
