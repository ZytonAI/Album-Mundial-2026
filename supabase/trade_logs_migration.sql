-- Ejecuta esto en el SQL Editor de Supabase para habilitar sync de intercambios

CREATE TABLE IF NOT EXISTS trade_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  gave jsonb NOT NULL,
  received jsonb NOT NULL,
  partner text,
  date text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE trade_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Solo mis intercambios"
  ON trade_logs FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
