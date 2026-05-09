import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const CATS_KEY = "/api/expense-categories";
const FIELDS_KEY = "/api/category-fields";
const EXPENSES_KEY = "/api/category-expenses";

async function safeJson(res: Response) {
  const text = await res.text();
  try { return JSON.parse(text); }
  catch { throw new Error(`Server error: ${res.status} ${res.statusText}`); }
}

// ── Categories ──────────────────────────────────────────────────

export function useExpenseCategories() {
  return useQuery<any[]>({
    queryKey: [CATS_KEY],
    queryFn: async () => {
      const res = await fetch(CATS_KEY, { credentials: "include" });
      if (!res.ok) return [];
      return safeJson(res);
    }
  });
}

export function useCreateExpenseCategory() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data: { name: string; description?: string; color: string; icon: string }) => {
      const res = await apiRequest("POST", CATS_KEY, data);
      return safeJson(res);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: [CATS_KEY] }); toast({ title: "Category created" }); },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" })
  });
}

export function useDeleteExpenseCategory() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: number) => { await apiRequest("DELETE", `${CATS_KEY}/${id}`); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: [CATS_KEY] }); toast({ title: "Category deleted" }); },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" })
  });
}

// ── Category Fields ─────────────────────────────────────────────

export function useCategoryFields(categoryId: number) {
  return useQuery<any[]>({
    queryKey: [FIELDS_KEY, categoryId],
    queryFn: async () => {
      const res = await fetch(`${FIELDS_KEY}?categoryId=${categoryId}`, { credentials: "include" });
      if (!res.ok) return [];
      return safeJson(res);
    },
    enabled: !!categoryId
  });
}

export function useCreateCategoryField() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data: { categoryId: number; fieldName: string; fieldType: string; isRequired: boolean; sortOrder: number }) => {
      const res = await apiRequest("POST", FIELDS_KEY, data);
      return safeJson(res);
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
      await apiRequest("DELETE", `${FIELDS_KEY}/${id}`);
      return categoryId;
    },
    onSuccess: (categoryId) => { qc.invalidateQueries({ queryKey: [FIELDS_KEY, categoryId] }); toast({ title: "Field removed" }); },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" })
  });
}

// ── All Category Expenses (for hub totals) ──────────────────────

export function useAllCategoryExpenses() {
  return useQuery<any[]>({
    queryKey: [EXPENSES_KEY, "all"],
    queryFn: async () => {
      const res = await fetch(`${EXPENSES_KEY}/all`, { credentials: "include" });
      if (!res.ok) return [];
      return safeJson(res);
    }
  });
}

// ── Category Expenses ───────────────────────────────────────────

export function useCategoryExpenses(categoryId: number) {
  return useQuery<any[]>({
    queryKey: [EXPENSES_KEY, categoryId],
    queryFn: async () => {
      const res = await fetch(`${EXPENSES_KEY}?categoryId=${categoryId}`, { credentials: "include" });
      if (!res.ok) return [];
      return safeJson(res);
    },
    enabled: !!categoryId
  });
}

export function useCreateCategoryExpense() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data: { categoryId: number; nepaliYear: number; nepaliMonth: number; day: number; amount: number; description?: string; fieldValues?: string }) => {
      const res = await apiRequest("POST", EXPENSES_KEY, data);
      return safeJson(res);
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
      await apiRequest("DELETE", `${EXPENSES_KEY}/${id}`);
      return categoryId;
    },
    onSuccess: (categoryId) => { qc.invalidateQueries({ queryKey: [EXPENSES_KEY, categoryId] }); toast({ title: "Deleted" }); },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" })
  });
}
