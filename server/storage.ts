import { supabaseAdmin } from "./supabase";
import type {
  InsertEmployee, InsertLeave, InsertMeal,
  InsertAttendance, InsertOvertime, InsertKitchenExpense, InsertOfficeExpense
} from "@shared/schema";

// ─── Case converters ──────────────────────────────────────────

function toSnake(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) continue;
    const snakeKey = key.replace(/([A-Z])/g, letter => `_${letter.toLowerCase()}`);
    result[snakeKey] = value;
  }
  return result;
}

function toCamel(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    result[camelKey] = value;
  }
  return result;
}

function mapRows(rows: any[]): any[] {
  return rows.map(toCamel);
}

async function dbSelect(table: string) {
  const { data, error } = await supabaseAdmin.from(table).select("*").order("id");
  if (error) throw new Error(error.message);
  return mapRows(data ?? []);
}

async function dbInsert(table: string, payload: Record<string, any>) {
  const { data, error } = await supabaseAdmin
    .from(table)
    .insert(toSnake(payload))
    .select()
    .single();
  if (error) throw new Error(error.message);
  return toCamel(data);
}

async function dbUpdate(table: string, id: number, payload: Record<string, any>) {
  const { data, error } = await supabaseAdmin
    .from(table)
    .update({ ...toSnake(payload), updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return toCamel(data);
}

async function dbDelete(table: string, id: number) {
  const { error } = await supabaseAdmin.from(table).delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// ─── Interface ────────────────────────────────────────────────

export interface IStorage {
  getEmployees(): Promise<any[]>;
  createEmployee(employee: InsertEmployee): Promise<any>;
  updateEmployee(id: number, employee: Partial<InsertEmployee>): Promise<any>;
  deleteEmployee(id: number): Promise<void>;

  getLeaves(): Promise<any[]>;
  createLeave(leave: InsertLeave): Promise<any>;
  deleteLeave(id: number): Promise<void>;

  getMeals(): Promise<any[]>;
  setMeal(meal: InsertMeal): Promise<any>;

  getAttendance(): Promise<any[]>;
  setAttendance(record: InsertAttendance): Promise<any>;
  deleteAttendance(id: number): Promise<void>;

  getOvertime(): Promise<any[]>;
  createOvertime(record: InsertOvertime): Promise<any>;
  updateOvertime(id: number, record: Partial<InsertOvertime>): Promise<any>;
  deleteOvertime(id: number): Promise<void>;

  getKitchenExpenses(): Promise<any[]>;
  createKitchenExpense(expense: InsertKitchenExpense): Promise<any>;
  updateKitchenExpense(id: number, expense: Partial<InsertKitchenExpense>): Promise<any>;
  deleteKitchenExpense(id: number): Promise<void>;

  getOfficeExpenses(): Promise<any[]>;
  createOfficeExpense(expense: InsertOfficeExpense): Promise<any>;
  updateOfficeExpense(id: number, expense: Partial<InsertOfficeExpense>): Promise<any>;
  deleteOfficeExpense(id: number): Promise<void>;
}

// ─── Supabase implementation ──────────────────────────────────

export class SupabaseStorage implements IStorage {
  // ── Employees ──────────────────────────────────────────────
  async getEmployees() {
    return dbSelect("employees");
  }
  async createEmployee(employee: InsertEmployee) {
    return dbInsert("employees", employee);
  }
  async updateEmployee(id: number, employee: Partial<InsertEmployee>) {
    return dbUpdate("employees", id, employee);
  }
  async deleteEmployee(id: number) {
    return dbDelete("employees", id);
  }

  // ── Leaves ─────────────────────────────────────────────────
  async getLeaves() {
    return dbSelect("leaves");
  }
  async createLeave(leave: InsertLeave) {
    return dbInsert("leaves", leave);
  }
  async deleteLeave(id: number) {
    return dbDelete("leaves", id);
  }

  // ── Meals (upsert by employee + date) ──────────────────────
  async getMeals() {
    return dbSelect("meals");
  }
  async setMeal(meal: InsertMeal) {
    const payload = {
      ...toSnake(meal),
      updated_at: new Date().toISOString(),
    };
    const { data, error } = await supabaseAdmin
      .from("meals")
      .upsert(payload, {
        onConflict: "employee_id,nepali_year,nepali_month,day",
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return toCamel(data);
  }

  // ── Attendance (upsert by employee + date) ─────────────────
  async getAttendance() {
    return dbSelect("attendance");
  }
  async setAttendance(record: InsertAttendance) {
    const payload = {
      ...toSnake(record),
      updated_at: new Date().toISOString(),
    };
    const { data, error } = await supabaseAdmin
      .from("attendance")
      .upsert(payload, {
        onConflict: "employee_id,nepali_year,nepali_month,day",
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return toCamel(data);
  }
  async deleteAttendance(id: number) {
    return dbDelete("attendance", id);
  }

  // ── Overtime ───────────────────────────────────────────────
  async getOvertime() {
    return dbSelect("overtime");
  }
  async createOvertime(record: InsertOvertime) {
    return dbInsert("overtime", record);
  }
  async updateOvertime(id: number, record: Partial<InsertOvertime>) {
    return dbUpdate("overtime", id, record);
  }
  async deleteOvertime(id: number) {
    return dbDelete("overtime", id);
  }

  // ── Kitchen Expenses ───────────────────────────────────────
  async getKitchenExpenses() {
    return dbSelect("kitchen_expenses");
  }
  async createKitchenExpense(expense: InsertKitchenExpense) {
    return dbInsert("kitchen_expenses", expense);
  }
  async updateKitchenExpense(id: number, expense: Partial<InsertKitchenExpense>) {
    return dbUpdate("kitchen_expenses", id, expense);
  }
  async deleteKitchenExpense(id: number) {
    return dbDelete("kitchen_expenses", id);
  }

  // ── Office Expenses ────────────────────────────────────────
  async getOfficeExpenses() {
    return dbSelect("office_expenses");
  }
  async createOfficeExpense(expense: InsertOfficeExpense) {
    return dbInsert("office_expenses", expense);
  }
  async updateOfficeExpense(id: number, expense: Partial<InsertOfficeExpense>) {
    return dbUpdate("office_expenses", id, expense);
  }
  async deleteOfficeExpense(id: number) {
    return dbDelete("office_expenses", id);
  }
}

export const storage = new SupabaseStorage();
