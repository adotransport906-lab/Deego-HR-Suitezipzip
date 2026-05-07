import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { OfficeExpense, InsertOfficeExpense } from "@shared/schema";

export function useOfficeExpenses() {
  return useQuery<OfficeExpense[]>({ queryKey: ["/api/office-expenses"] });
}

export function useCreateOfficeExpense() {
  return useMutation({
    mutationFn: (data: InsertOfficeExpense) =>
      apiRequest("POST", "/api/office-expenses", data).then(r => r.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/office-expenses"] }),
  });
}

export function useDeleteOfficeExpense() {
  return useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/office-expenses/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/office-expenses"] }),
  });
}
