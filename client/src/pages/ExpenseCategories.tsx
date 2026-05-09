import { useState } from "react";
import { useLocation } from "wouter";
import { useExpenseCategories, useCreateExpenseCategory, useDeleteExpenseCategory, useAllCategoryExpenses } from "@/hooks/use-expense-categories";
import { useKitchenExpenses } from "@/hooks/use-kitchen";
import { useOfficeExpenses } from "@/hooks/use-office";
import { useSalaries } from "@/hooks/use-salary";
import { useActiveDate } from "@/hooks/use-active-date";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { cn } from "@/lib/utils";
import { NEPALI_MONTHS } from "@/lib/constants";
import {
  Plus, Search, ChefHat, Briefcase, Wallet, FolderOpen,
  Trash2, ArrowRight, Tag, TrendingUp, Layers
} from "lucide-react";

const COLORS = [
  { label: "Blue",   value: "blue",   bg: "bg-blue-500",   light: "bg-blue-50",   border: "border-blue-200",   text: "text-blue-700",   ring: "ring-blue-500" },
  { label: "Green",  value: "green",  bg: "bg-emerald-500", light: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", ring: "ring-emerald-500" },
  { label: "Purple", value: "purple", bg: "bg-purple-500", light: "bg-purple-50",  border: "border-purple-200",  text: "text-purple-700",  ring: "ring-purple-500" },
  { label: "Orange", value: "orange", bg: "bg-orange-500", light: "bg-orange-50",  border: "border-orange-200",  text: "text-orange-700",  ring: "ring-orange-500" },
  { label: "Red",    value: "red",    bg: "bg-red-500",    light: "bg-red-50",     border: "border-red-200",     text: "text-red-700",     ring: "ring-red-500" },
  { label: "Teal",   value: "teal",   bg: "bg-teal-500",   light: "bg-teal-50",    border: "border-teal-200",    text: "text-teal-700",    ring: "ring-teal-500" },
  { label: "Pink",   value: "pink",   bg: "bg-pink-500",   light: "bg-pink-50",    border: "border-pink-200",    text: "text-pink-700",    ring: "ring-pink-500" },
  { label: "Indigo", value: "indigo", bg: "bg-indigo-500", light: "bg-indigo-50",  border: "border-indigo-200",  text: "text-indigo-700",  ring: "ring-indigo-500" },
];

const ICONS = ["📦", "🚗", "⚡", "🏗️", "📋", "🎯", "💡", "🔧", "📊", "🛒", "🏥", "✈️", "🎓", "💻", "🌿", "🔑"];

function getColorSet(color: string) {
  return COLORS.find(c => c.value === color) ?? COLORS[0];
}

const BUILTIN = [
  {
    id: "kitchen",
    name: "Meal / Kitchen Expenses",
    description: "Daily meal and food-related expenses",
    icon: "🍽️",
    color: "orange",
    href: "/kitchen",
  },
  {
    id: "office",
    name: "Office Expenses",
    description: "Stationery, utilities, and office supplies",
    icon: "🏢",
    color: "blue",
    href: "/office",
  },
  {
    id: "salary",
    name: "Salary",
    description: "Employee salary payments and records",
    icon: "💰",
    color: "green",
    href: "/salary",
  },
];

export default function ExpenseCategories() {
  const today = useActiveDate();
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);

  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newColor, setNewColor] = useState("blue");
  const [newIcon, setNewIcon] = useState("📦");

  const { data: categories = [] } = useExpenseCategories();
  const createCat = useCreateExpenseCategory();
  const deleteCat = useDeleteExpenseCategory();

  const { data: kitchenExpenses = [] } = useKitchenExpenses();
  const { data: officeExpenses = [] } = useOfficeExpenses();
  const { data: salaries = [] } = useSalaries();
  const { data: allCategoryExpenses = [] } = useAllCategoryExpenses();

  const monthName = NEPALI_MONTHS.find(m => m.value === today.month)?.label ?? "";

  function kitchenTotal() {
    return kitchenExpenses.filter((e: any) => e.nepaliYear === today.year && e.nepaliMonth === today.month)
      .reduce((s: number, e: any) => s + (e.amount ?? 0), 0);
  }
  function officeTotal() {
    return officeExpenses.filter((e: any) => e.nepaliYear === today.year && e.nepaliMonth === today.month)
      .reduce((s: number, e: any) => s + (e.amount ?? 0), 0);
  }
  function salaryTotal() {
    return salaries.filter((s: any) => s.nepaliYear === today.year && s.nepaliMonth === today.month)
      .reduce((s: number, e: any) => s + (e.providedSalary ?? 0), 0);
  }
  function customCategoryTotal(catId?: number) {
    const filtered = allCategoryExpenses.filter((e: any) =>
      e.nepaliYear === today.year && e.nepaliMonth === today.month &&
      (catId === undefined || e.categoryId === catId)
    );
    return filtered.reduce((s: number, e: any) => s + (e.amount ?? 0), 0);
  }

  const builtinTotals: Record<string, number> = {
    kitchen: kitchenTotal(),
    office: officeTotal(),
    salary: salaryTotal(),
  };

  const filteredBuiltin = BUILTIN.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.description.toLowerCase().includes(search.toLowerCase())
  );
  const filteredCustom = categories.filter((c: any) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.description ?? "").toLowerCase().includes(search.toLowerCase())
  );

  function handleCreate() {
    if (!newName.trim()) return;
    createCat.mutate({ name: newName.trim(), description: newDesc.trim(), color: newColor, icon: newIcon }, {
      onSuccess: () => {
        setNewName(""); setNewDesc(""); setNewColor("blue"); setNewIcon("📦");
        setAddOpen(false);
      }
    });
  }

  function askDelete(id: number) {
    setConfirmAction(() => () => deleteCat.mutate(id));
    setConfirmOpen(true);
  }

  const customTotal = customCategoryTotal();
  const totalExpenses = builtinTotals.kitchen + builtinTotals.office + builtinTotals.salary + customTotal;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 p-6 text-white shadow-lg">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Layers className="w-5 h-5 opacity-80" />
              <span className="text-sm font-medium opacity-80">Expense Management</span>
            </div>
            <h1 className="text-3xl font-display font-bold">Overall Expense Category</h1>
            <p className="text-sm opacity-75 mt-1">{today.dayOfWeek}, {today.day} {monthName} {today.year} B.S.</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="text-right">
              <p className="text-xs opacity-70">Total This Month</p>
              <p className="text-2xl font-bold">Rs. {totalExpenses.toLocaleString()}</p>
            </div>
            <Button onClick={() => setAddOpen(true)} className="bg-white text-primary hover:bg-white/90 font-semibold shadow-md" size="sm">
              <Plus className="w-4 h-4 mr-1.5" /> Add Category
            </Button>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card border border-border/50 rounded-xl p-3 text-center">
          <p className="text-xs text-muted-foreground">Total Categories</p>
          <p className="text-2xl font-bold text-foreground">{BUILTIN.length + categories.length}</p>
        </div>
        <div className="bg-card border border-border/50 rounded-xl p-3 text-center">
          <p className="text-xs text-muted-foreground">Built-in</p>
          <p className="text-2xl font-bold text-foreground">{BUILTIN.length}</p>
        </div>
        <div className="bg-card border border-border/50 rounded-xl p-3 text-center">
          <p className="text-xs text-muted-foreground">Custom</p>
          <p className="text-2xl font-bold text-foreground">{categories.length}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search categories..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9 rounded-xl"
          data-testid="input-search-categories"
        />
      </div>

      {/* Built-in Categories */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Built-in Categories</span>
          <div className="flex-1 h-px bg-border/40" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBuiltin.map(cat => {
            const c = getColorSet(cat.color);
            const total = builtinTotals[cat.id] ?? 0;
            return (
              <button
                key={cat.id}
                onClick={() => setLocation(cat.href)}
                data-testid={`card-builtin-${cat.id}`}
                className={cn(
                  "group relative text-left rounded-2xl border-2 p-5 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer",
                  c.light, c.border
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm", c.bg, "bg-opacity-20 border", c.border)}>
                    {cat.icon}
                  </div>
                  <span className={cn("text-xs font-semibold px-2 py-1 rounded-full", c.light, c.text, "border", c.border)}>Built-in</span>
                </div>
                <h3 className={cn("font-bold text-base leading-tight mb-1", c.text)}>{cat.name}</h3>
                <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{cat.description}</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">This Month</p>
                    <p className={cn("text-lg font-bold", c.text)}>Rs. {total.toLocaleString()}</p>
                  </div>
                  <div className={cn("w-8 h-8 rounded-full flex items-center justify-center transition-transform group-hover:translate-x-1", c.bg, "bg-opacity-15")}>
                    <ArrowRight className={cn("w-4 h-4", c.text)} />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Categories */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Custom Categories</span>
          <div className="flex-1 h-px bg-border/40" />
        </div>
        {filteredCustom.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 rounded-2xl border-2 border-dashed border-border/50 bg-muted/10">
            <div className="w-14 h-14 rounded-2xl bg-muted/40 flex items-center justify-center mb-3">
              <FolderOpen className="w-7 h-7 text-muted-foreground/40" />
            </div>
            <p className="font-semibold text-muted-foreground">No custom categories yet</p>
            <p className="text-sm text-muted-foreground/60 mt-1">Click "Add Category" to create your first one</p>
            <Button onClick={() => setAddOpen(true)} variant="outline" className="mt-4 rounded-xl" size="sm">
              <Plus className="w-4 h-4 mr-1.5" /> Add Category
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCustom.map((cat: any) => {
              const c = getColorSet(cat.color);
              return (
                <div
                  key={cat.id}
                  className={cn("group relative rounded-2xl border-2 p-5 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5", c.light, c.border)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm", c.light, "border", c.border)}>
                      {cat.icon ?? "📦"}
                    </div>
                    <button
                      onClick={() => askDelete(cat.id)}
                      data-testid={`btn-delete-cat-${cat.id}`}
                      className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center text-red-500 hover:bg-red-100 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <h3 className={cn("font-bold text-base leading-tight mb-1", c.text)}>{cat.name}</h3>
                  <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{cat.description || "Custom expense category"}</p>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">This Month</p>
                      <p className={cn("text-lg font-bold", c.text)}>Rs. {customCategoryTotal(cat.id).toLocaleString()}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setLocation(`/expenses/${cat.id}`)}
                    data-testid={`btn-open-cat-${cat.id}`}
                    className={cn("w-full rounded-xl text-xs font-semibold", c.bg, "text-white hover:opacity-90")}
                  >
                    Open Category <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Category Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tag className="w-5 h-5 text-primary" /> New Expense Category
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Category Name *</label>
              <Input
                placeholder="e.g. Vehicle Expenses"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="rounded-xl"
                data-testid="input-new-cat-name"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Description</label>
              <Input
                placeholder="Brief description (optional)"
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
                className="rounded-xl"
                data-testid="input-new-cat-desc"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-2 block">Icon</label>
              <div className="grid grid-cols-8 gap-1.5">
                {ICONS.map(icon => (
                  <button
                    key={icon}
                    onClick={() => setNewIcon(icon)}
                    className={cn("w-9 h-9 rounded-lg text-lg flex items-center justify-center border-2 transition-all",
                      newIcon === icon ? "border-primary bg-primary/10 scale-110" : "border-border/30 hover:border-primary/40")}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-2 block">Color Theme</label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map(col => (
                  <button
                    key={col.value}
                    onClick={() => setNewColor(col.value)}
                    className={cn("w-8 h-8 rounded-full border-4 transition-all", col.bg,
                      newColor === col.value ? "border-foreground scale-110" : "border-transparent hover:scale-105")}
                    title={col.label}
                  />
                ))}
              </div>
            </div>
            {/* Preview */}
            <div className={cn("rounded-xl p-3 border", getColorSet(newColor).light, getColorSet(newColor).border)}>
              <div className="flex items-center gap-2">
                <span className="text-xl">{newIcon}</span>
                <div>
                  <p className={cn("font-bold text-sm", getColorSet(newColor).text)}>{newName || "Category Name"}</p>
                  <p className="text-xs text-muted-foreground">{newDesc || "Description"}</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <Button variant="outline" onClick={() => setAddOpen(false)} className="flex-1 rounded-xl">Cancel</Button>
              <Button onClick={handleCreate} disabled={!newName.trim() || createCat.isPending} className="flex-1 rounded-xl" data-testid="btn-create-category">
                {createCat.isPending ? "Creating..." : "Create Category"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={() => { confirmAction?.(); setConfirmOpen(false); }}
        title="Delete Category?"
        description="This will permanently delete this category and all its expenses and fields."
      />
    </div>
  );
}
