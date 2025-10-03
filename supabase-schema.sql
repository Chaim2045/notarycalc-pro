-- NotaryCalc Pro Database Schema
-- הרץ את הקובץ הזה ב-Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- טבלת פרופילים (profiles)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,

  -- פרטי משרד
  office_name TEXT,
  office_address TEXT,
  office_phone TEXT,
  office_logo_url TEXT,

  -- מנוי ותשלום
  subscription_status TEXT DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'expired', 'cancelled')),
  subscription_start_date TIMESTAMPTZ,
  subscription_end_date TIMESTAMPTZ,
  trial_end_date TIMESTAMPTZ DEFAULT NOW() + INTERVAL '14 days',

  stripe_customer_id TEXT,
  payment_method_id TEXT,

  -- הגדרות תצוגה
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
  accent_color TEXT DEFAULT 'blue' CHECK (accent_color IN ('blue', 'purple', 'green', 'red', 'orange')),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- טבלת לקוחות (clients)
-- ============================================
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  id_number TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- טבלת חישובים (calculations)
-- ============================================
CREATE TABLE IF NOT EXISTS calculations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,

  client_name TEXT,

  -- שירותים בפורמט JSON
  services JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- סכומים
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  vat NUMERIC(10,2) NOT NULL DEFAULT 0,
  total NUMERIC(10,2) NOT NULL DEFAULT 0,

  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- טבלת תבניות (templates)
-- ============================================
CREATE TABLE IF NOT EXISTS templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  description TEXT,
  services JSONB NOT NULL DEFAULT '[]'::jsonb,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- טבלת תשלומים (payments)
-- ============================================
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'ILS',
  status TEXT NOT NULL CHECK (status IN ('pending', 'success', 'failed', 'refunded')),

  stripe_payment_id TEXT,
  payment_method TEXT,

  invoice_url TEXT,
  receipt_url TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- טבלת לוגים (audit_logs)
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

  action TEXT NOT NULL,
  details JSONB,
  ip_address TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- אינדקסים לביצועים
-- ============================================
CREATE INDEX IF NOT EXISTS idx_calculations_user_id ON calculations(user_id);
CREATE INDEX IF NOT EXISTS idx_calculations_created_at ON calculations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_calculations_client_id ON calculations(client_id);

CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(name);

CREATE INDEX IF NOT EXISTS idx_templates_user_id ON templates(user_id);

CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ============================================
-- Row Level Security (RLS) - אבטחה
-- ============================================

-- הפעל RLS על כל הטבלאות
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- פוליסי עבור profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- פוליסי עבור clients
CREATE POLICY "Users can view own clients"
  ON clients FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own clients"
  ON clients FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own clients"
  ON clients FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own clients"
  ON clients FOR DELETE
  USING (auth.uid() = user_id);

-- פוליסי עבור calculations
CREATE POLICY "Users can view own calculations"
  ON calculations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own calculations"
  ON calculations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own calculations"
  ON calculations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own calculations"
  ON calculations FOR DELETE
  USING (auth.uid() = user_id);

-- פוליסי עבור templates
CREATE POLICY "Users can view own templates"
  ON templates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own templates"
  ON templates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own templates"
  ON templates FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own templates"
  ON templates FOR DELETE
  USING (auth.uid() = user_id);

-- פוליסי עבור payments
CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  USING (auth.uid() = user_id);

-- פוליסי עבור audit_logs
CREATE POLICY "Users can view own logs"
  ON audit_logs FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================
-- פונקציות (Functions)
-- ============================================

-- פונקציה ליצירת פרופיל אוטומטית אחרי הרשמה
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- טריגר שיוצר פרופיל כשמשתמש נרשם
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- פונקציה לעדכון updated_at אוטומטית
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- טריגרים לעדכון updated_at
CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at_clients
  BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at_calculations
  BEFORE UPDATE ON calculations
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ============================================
-- נתונים ראשוניים (אופציונלי)
-- ============================================

-- דוגמה לתעריפים (אפשר להוסיף טבלה נפרדת בעתיד)
COMMENT ON TABLE calculations IS 'חישובי תעריפי נוטריון לפי תקנות הנוטריונים (שכר שירותים), תשל"ט-1978';
