import { useState } from "react";
import { useEmployees } from "@/hooks/use-employees";
import { useMeals, useToggleMeal } from "@/hooks/use-meals";
import { NEPALI_MONTHS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, X, UtensilsCrossed } from "lucide-react";

export default function MealExpenses() {
  const [selectedMonth, setSelectedMonth] = useState(1);
  const { data: employees, isLoading: loadingEmps } = useEmployees();
  const { data: meals, isLoading: loadingMeals } = useMeals();
  const toggleMeal = useToggleMeal();

  const getMealStatus = (empId: number, day: number) => {
    const meal = meals?.find(m => m.employeeId === empId && m.nepaliMonth === selectedMonth && m.day === day);
    return meal?.hasMeal ?? false;
  };

  const handleToggle = (empId: number, day: number, currentState: boolean) => {
    toggleMeal.mutate({
      employeeId: empId,
      nepaliMonth: selectedMonth,
      day,
      hasMeal: !currentState
    });
  };

  const isLoading = loadingEmps || loadingMeals;

  return (
    <div className="space-y-8 flex flex-col h-[calc(100vh-6rem)]">
      <div className="shrink-0">
        <h1 className="text-3xl font-display font-bold text-foreground">Meal Expenses</h1>
        <p className="text-muted-foreground mt-1 text-sm">Track daily meal consumption for accurate expensing.</p>
      </div>

      <div className="flex flex-wrap gap-2 shrink-0">
        {NEPALI_MONTHS.map(month => (
          <Button
            key={month.value}
            variant={selectedMonth === month.value ? "default" : "outline"}
            className={cn(
              "rounded-xl transition-all",
              selectedMonth === month.value 
                ? "shadow-md shadow-primary/20" 
                : "bg-card hover:bg-muted"
            )}
            onClick={() => setSelectedMonth(month.value)}
          >
            {month.label}
          </Button>
        ))}
      </div>

      <div className="flex-1 bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <UtensilsCrossed className="w-12 h-12 mb-4 text-muted animate-pulse" />
            Loading meal records...
          </div>
        ) : !employees || employees.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <p>No employees found. Add employees in the Directory first.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-auto custom-scrollbar relative">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr>
                  <th className="sticky top-0 left-0 z-30 bg-muted/95 backdrop-blur px-4 py-3 text-left font-bold text-foreground border-b border-r min-w-[200px] shadow-[1px_1px_0_0_hsl(var(--border))]">
                    Employee Name
                  </th>
                  {Array.from({ length: 31 }).map((_, i) => (
                    <th key={i} className="sticky top-0 z-20 bg-muted/95 backdrop-blur py-3 px-1 border-b border-r text-center font-bold text-foreground min-w-[48px] shadow-[0_1px_0_0_hsl(var(--border))]">
                      {i + 1}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-card">
                {employees.map(emp => (
                  <tr key={emp.id} className="group hover:bg-muted/10 transition-colors">
                    <td className="sticky left-0 z-10 bg-card group-hover:bg-muted/50 px-4 py-2 border-b border-r font-semibold text-foreground whitespace-nowrap shadow-[1px_0_0_0_hsl(var(--border))]">
                      <div className="flex flex-col">
                        <span>{emp.name}</span>
                        <span className="text-[10px] font-mono font-normal text-muted-foreground">{emp.employeeId}</span>
                      </div>
                    </td>
                    
                    {Array.from({ length: 31 }).map((_, i) => {
                      const day = i + 1;
                      const hasMeal = getMealStatus(emp.id, day);
                      
                      return (
                        <td 
                          key={day} 
                          onClick={() => handleToggle(emp.id, day, hasMeal)}
                          className="p-0 border-b border-r cursor-pointer relative"
                        >
                          <div className={cn(
                            "w-full h-full min-h-[52px] flex items-center justify-center transition-all group/cell",
                            hasMeal 
                              ? "bg-emerald-500/10 hover:bg-destructive/10 text-emerald-600 hover:text-destructive" 
                              : "bg-transparent text-slate-300 hover:bg-emerald-500/10 hover:text-emerald-500"
                          )}>
                            {hasMeal ? (
                              <>
                                <Check className="w-5 h-5 group-hover/cell:hidden" />
                                <X className="w-5 h-5 hidden group-hover/cell:block" />
                              </>
                            ) : (
                              <>
                                <X className="w-4 h-4 opacity-30 group-hover/cell:hidden" />
                                <Check className="w-5 h-5 hidden group-hover/cell:block" />
                              </>
                            )}
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
