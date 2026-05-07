-- ============================================================
-- ADO Logistics Portal — Supabase Schema
-- Run this in the Supabase SQL Editor to set up all tables.
-- ============================================================

-- ─── Employees ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS employees (
  id              serial PRIMARY KEY,
  employee_id     text NOT NULL UNIQUE,
  name            text NOT NULL,
  designation     text NOT NULL,
  department      text NOT NULL DEFAULT '',
  contact_number  text,
  date_of_birth   text,
  address         text,
  date_of_joining text,
  bank_account_number text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- ─── Leaves ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS leaves (
  id            serial PRIMARY KEY,
  employee_id   integer NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  nepali_year   integer NOT NULL,
  nepali_month  integer NOT NULL,
  day           integer NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- ─── Meals ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS meals (
  id            serial PRIMARY KEY,
  employee_id   integer NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  nepali_year   integer NOT NULL,
  nepali_month  integer NOT NULL,
  day           integer NOT NULL,
  meal_status   text NOT NULL DEFAULT 'none',
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (employee_id, nepali_year, nepali_month, day)
);

-- ─── Attendance ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS attendance (
  id              serial PRIMARY KEY,
  employee_id     integer NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  nepali_year     integer NOT NULL,
  nepali_month    integer NOT NULL,
  day             integer NOT NULL,
  status          text NOT NULL DEFAULT 'present',
  check_in_time   text,
  check_out_time  text,
  remarks         text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (employee_id, nepali_year, nepali_month, day)
);

-- ─── Overtime ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS overtime (
  id              serial PRIMARY KEY,
  employee_id     integer NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  nepali_year     integer NOT NULL,
  nepali_month    integer NOT NULL,
  day             integer NOT NULL,
  overtime_hours  text NOT NULL,
  check_in_time   text,
  check_out_time  text,
  remarks         text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- ─── Kitchen Expenses ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS kitchen_expenses (
  id            serial PRIMARY KEY,
  nepali_year   integer NOT NULL,
  nepali_month  integer NOT NULL,
  day           integer NOT NULL,
  item_name     text NOT NULL,
  quantity      text,
  amount        integer NOT NULL,
  remarks       text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- ─── Office Expenses ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS office_expenses (
  id            serial PRIMARY KEY,
  nepali_year   integer NOT NULL,
  nepali_month  integer NOT NULL,
  day           integer NOT NULL,
  item_name     text NOT NULL,
  quantity      text,
  amount        integer NOT NULL,
  remarks       text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- ─── updated_at trigger function ──────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER employees_updated_at
  BEFORE UPDATE ON employees
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER meals_updated_at
  BEFORE UPDATE ON meals
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER attendance_updated_at
  BEFORE UPDATE ON attendance
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER overtime_updated_at
  BEFORE UPDATE ON overtime
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER kitchen_expenses_updated_at
  BEFORE UPDATE ON kitchen_expenses
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER office_expenses_updated_at
  BEFORE UPDATE ON office_expenses
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── Row Level Security ───────────────────────────────────────
ALTER TABLE employees       ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaves          ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals           ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance      ENABLE ROW LEVEL SECURITY;
ALTER TABLE overtime        ENABLE ROW LEVEL SECURITY;
ALTER TABLE kitchen_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE office_expenses  ENABLE ROW LEVEL SECURITY;

-- Allow anon/authenticated to read all data (writes go through server with service_role)
CREATE POLICY "allow_read_employees"        ON employees        FOR SELECT USING (true);
CREATE POLICY "allow_read_leaves"           ON leaves           FOR SELECT USING (true);
CREATE POLICY "allow_read_meals"            ON meals            FOR SELECT USING (true);
CREATE POLICY "allow_read_attendance"       ON attendance       FOR SELECT USING (true);
CREATE POLICY "allow_read_overtime"         ON overtime         FOR SELECT USING (true);
CREATE POLICY "allow_read_kitchen_expenses" ON kitchen_expenses FOR SELECT USING (true);
CREATE POLICY "allow_read_office_expenses"  ON office_expenses  FOR SELECT USING (true);

-- ─── Enable Realtime ──────────────────────────────────────────
-- Run these in the Supabase dashboard: Database → Replication → add these tables
-- or execute:
ALTER PUBLICATION supabase_realtime ADD TABLE employees;
ALTER PUBLICATION supabase_realtime ADD TABLE leaves;
ALTER PUBLICATION supabase_realtime ADD TABLE meals;
ALTER PUBLICATION supabase_realtime ADD TABLE attendance;
ALTER PUBLICATION supabase_realtime ADD TABLE overtime;
ALTER PUBLICATION supabase_realtime ADD TABLE kitchen_expenses;
ALTER PUBLICATION supabase_realtime ADD TABLE office_expenses;
