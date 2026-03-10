import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import type { Meal, InsertMeal } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useMeals() {
  return useQuery({
    queryKey: [api.meals.list.path],
    queryFn: async () => {
      const res = await fetch(api.meals.list.path);
      if (!res.ok) throw new Error("Failed to fetch meals");
      return res.json() as Promise<Meal[]>;
    }
  });
}

export function useToggleMeal() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: Omit<InsertMeal, "id">) => {
      const res = await fetch(api.meals.createOrUpdate.path, {
        method: api.meals.createOrUpdate.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Failed to update meal status");
      return res.json() as Promise<Meal>;
    },
    // Optimistic UI updates for a very premium, snappy feel
    onMutate: async (newMeal) => {
      await queryClient.cancelQueries({ queryKey: [api.meals.list.path] });
      const previousMeals = queryClient.getQueryData<Meal[]>([api.meals.list.path]);

      queryClient.setQueryData<Meal[]>([api.meals.list.path], (old) => {
        if (!old) return [{ id: 999999, ...newMeal } as Meal];
        
        const existingIndex = old.findIndex(m => 
          m.employeeId === newMeal.employeeId && 
          m.nepaliMonth === newMeal.nepaliMonth && 
          m.day === newMeal.day
        );

        if (existingIndex >= 0) {
          const updated = [...old];
          updated[existingIndex] = { ...updated[existingIndex], hasMeal: newMeal.hasMeal };
          return updated;
        }
        
        return [...old, { id: Date.now(), ...newMeal } as Meal];
      });

      return { previousMeals };
    },
    onError: (err, newMeal, context) => {
      if (context?.previousMeals) {
        queryClient.setQueryData([api.meals.list.path], context.previousMeals);
      }
      toast({ title: "Sync Error", description: "Failed to update meal on server.", variant: "destructive" });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [api.meals.list.path] });
    }
  });
}
