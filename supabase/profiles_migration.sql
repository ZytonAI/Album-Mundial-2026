-- Ejecuta esto en el SQL Editor de Supabase ANTES de deployar las Edge Functions

-- 1. Tabla de perfiles con estado premium
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  is_premium boolean DEFAULT false NOT NULL,
  paid_at timestamptz,
  updated_at timestamptz DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Solo el usuario puede leer su propio perfil
CREATE POLICY "users read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Solo el service role (Edge Functions) puede escribir
CREATE POLICY "service role all"
  ON profiles FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 2. Trigger para crear perfil automáticamente al registrar usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (new.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
