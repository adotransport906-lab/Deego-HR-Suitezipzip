import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const CATS_KEY = "/api/expense-categories";
const FIELDS_KEY = "/api/category-fields";
const EXPENSES_KEY = "/api/category-expenses";

// ── Categories ──────────────────────────────────────────────────

export function useExpenseCategories() {
  return useQuery<any[]>({
    queryKey: [CATS_KEY],
    queryFn: async () => {
      const res = await fetch(CATS_KEY);
      if (!res.ok) return [];
      return res.json();
    }
  });
}

export function useCreateExpenseCategory() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data: { name: string; description?: string; color: string; icon: string }) => {
      const res = await fetch(CATS_KEY, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error("Failed to create category");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: [CATS_KEY] }); toast({ title: "Category created" }); },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" })
  });
}

export function useDeleteExpenseCategory() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${CATS_KEY}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: [CATS_KEY] }); toast({ title: "Category deleted" }); },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" })
  });
}

// ── Category Fields ─────────────────────────────────────────────

export function useCategoryFields(categoryId: number) {
  return useQuery<any[]>({
    queryKey: [FIELDS_KEY, categoryId],
    queryFn: async () => {
      const res = await fetch(`${FIELDS_KEY}?categoryId=${categoryId}`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!categoryId
  });
}

export function useCreateCategoryField() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data: { categoryId: number; fieldName: string; fieldType: string; isRequired: boolean; sortOrder: number }) => {
      const res = await fetch(FIELDS_KEY, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error("Failed to add field");
      return res.json();
    },
    onSuccess: (_, vars) => { qc.invalidateQueries({ queryKey: [FIELDS_KEY, vars.categoryId] }); toast({ title: "Field added" }); },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" })
  });
}

export function useDeleteCategoryField() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, categoryId }: { id: number; categoryId: number }) => {
      const res = await fetch(`${FIELDS_KEY}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete field");
      return categoryId;
    },
    onSuccess: (categoryId) => { qc.invalidateQueries({ queryKey: [FIELDS_KEY, categoryId] }); toast({ title: "Field removed" }); },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" })
  });
}

// ── Category Expenses ───────────────────────────────────────────

export function useCategoryExpenses(categoryId: number) {
  return useQuery<any[]>({
    queryKey: [EXPENSES_KEY, categoryId],
    queryFn: async () => {
      const res = await fetch(`${EXPENSES_KEY}?categoryId=${categoryId}`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!categoryId
  });
}

export function useCreateCategoryExpense() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data: { categoryId: number; nepaliYear: number; nepaliMonth: number; day: number; amount: number; description?: string; fieldValues?: string }) => {
      const res = await fetch(EXPENSES_KEY, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error("Failed to save expense");
      return res.json();
    },
    onSuccess: (_, vars) => { qc.invalidateQueries({ queryKey: [EXPENSES_KEY, vars.categoryId] }); toast({ title: "Expense recorded" }); },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" })
  });
}

export function useDeleteCategoryExpense() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, categoryId }: { id: number; categoryId: number }) => {
      const res = await fetch(`${EXPENSES_KEY}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      return categoryId;
    },
    onSuccess: (categoryId) => { qc.invalidateQueries({ queryKey: [EXPENSES_KEY, categoryId] }); toast({ title: "Deleted" }); },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" })
  });
}
