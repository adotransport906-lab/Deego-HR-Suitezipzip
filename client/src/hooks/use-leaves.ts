import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import type { Leave, InsertLeave } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useLeaves() {
  return useQuery({
    queryKey: [api.leaves.list.path],
    queryFn: async () => {
      const res = await fetch(api.leaves.list.path);
      if (!res.ok) throw new Error("Failed to fetch leaves");
      return res.json() as Promise<Leave[]>;
    }
  });
}

export function useCreateLeave() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: Omit<InsertLeave, "id">) => {
      const res = await fetch(api.leaves.create.path, {
        method: api.leaves.create.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: "Failed to log leave" }));
        throw new Error(error.message);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.leaves.list.path] });
      toast({ title: "Leave Added", description: "Employee leave registered successfully." });
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  });
}

export function useDeleteLeave() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.leaves.delete.path, { id });
      const res = await fetch(url, { method: api.leaves.delete.method });
      if (!res.ok) throw new Error("Failed to delete leave");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.leaves.list.path] });
      toast({ title: "Leave Removed", description: "Leave record deleted." });
    }
  });
}
