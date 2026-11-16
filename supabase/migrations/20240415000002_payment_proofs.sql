-- Create payment_proofs table
CREATE TABLE payment_proofs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  user_name TEXT,
  payment_type TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  proof_url TEXT NOT NULL,
  status TEXT CHECK (status IN ('Pendente', 'Validado', 'Rejeitado')) DEFAULT 'Pendente',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE payment_proofs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own proofs" ON payment_proofs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own proofs" ON payment_proofs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all proofs" ON payment_proofs FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('primary_admin', 'secondary_admin'))
);
CREATE POLICY "Admins can update all proofs" ON payment_proofs FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('primary_admin', 'secondary_admin'))
);
