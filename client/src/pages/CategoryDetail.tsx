import { useState, useMemo } from "react";
import { useParams, useLocation } from "wouter";
import {
  useExpenseCategories, useCategoryFields, useCategoryExpenses,
  useCreateCategoryField, useDeleteCategoryField,
  useCreateCategoryExpense, useDeleteCategoryExpense
} from "@/hooks/use-expense-categories";
import { useActiveDate } from "@/hooks/use-active-date";
import { NEPALI_MONTHS } from "@/lib/constants";
import { getDaysInNepaliMonth } from "@/lib/nepaliDate";
import { getMonthCalendar } from "@/lib/calendarUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { cn } from "@/lib/utils";
import { ArrowLeft, Plus, Trash2, CalendarDays, Settings2, TrendingUp, Receipt, Search } from "lucide-react";

const COLORS: Record<string, { bg: string; light: string; border: string; text: string; badge: string }> = {
  blue:   { bg: "bg-blue-500",    light: "bg-blue-50",    border: "border-blue-200",   text: "text-blue-700",   badge: "bg-blue-100 text-blue-700" },
  green:  { bg: "bg-emerald-500", light: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", badge: "bg-emerald-100 text-emerald-700" },
  purple: { bg: "bg-purple-500",  light: "bg-purple-50",  border: "border-purple-200",  text: "text-purple-700",  badge: "bg-purple-100 text-purple-700" },
  orange: { bg: "bg-orange-500",  light: "bg-orange-50",  border: "border-orange-200",  text: "text-orange-700",  badge: "bg-orange-100 text-orange-700" },
  red:    { bg: "bg-red-500",     light: "bg-red-50",     border: "border-red-200",     text: "text-red-700",     badge: "bg-red-100 text-red-700" },
  teal:   { bg: "bg-teal-500",    light: "bg-teal-50",    border: "border-teal-200",    text: "text-teal-700",    badge: "bg-teal-100 text-teal-700" },
  pink:   { bg: "bg-pink-500",    light: "bg-pink-50",    border: "border-pink-200",    text: "text-pink-700",    badge: "bg-pink-100 text-pink-700" },
  indigo: { bg: "bg-indigo-500",  light: "bg-indigo-50",  border: "border-indigo-200",  text: "text-indigo-700",  badge: "bg-indigo-100 text-indigo-700" },
};

function getC(color: string) { return COLORS[color] ?? COLORS.blue; }

export default function CategoryDetail() {
  const { id } = useParams<{ id: string }>();
  const catId = Number(id);
  const [, setLocation] = useLocation();
  const today = useActiveDate();

  const [selectedYear, setSelectedYear] = useState(today.year);
  const [selectedMonth, setSelectedMonth] = useState(today.month);
  const [selectedDay, setSelectedDay] = useState<string>("all");
  const [filterItem, setFilterItem] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [fieldsOpen, setFieldsOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarDetailDay, setCalendarDetailDay] = useState<number | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);

  // Add field form
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldType, setNewFieldType] = useState("text");
  const [newFieldRequired, setNewFieldRequired] = useState(false);

  // Add expense form
  const [formAmount, setFormAmount] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formDay, setFormDay] = useState(String(today.day));
  const [formFieldValues, setFormFieldValues] = useState<Record<string, string>>({});

  const { data: categories = [] } = useExpenseCategories();
  const { data: fields = [] } = useCategoryFields(catId);
  const { data: expenses = [] } = useCategoryExpenses(catId);

  const createField = useCreateCategoryField();
  const deleteField = useDeleteCategoryField();
  const createExpense = useCreateCategoryExpense();
  const deleteExpense = useDeleteCategoryExpense();

  const category = categories.find((c: any) => c.id === catId);
  const c = getC(category?.color ?? "blue");
  const monthName = NEPALI_MONTHS.find(m => m.value === selectedMonth)?.label ?? "";
  const daysInMonth = getDaysInNepaliMonth(selectedYear, selectedMonth);
  const calendarDays = getMonthCalendar(selectedYear, selectedMonth);

  const monthExpenses = useMemo(() =>
    expenses.filter((e: any) => e.nepaliYear === selectedYear && e.nepaliMonth === selectedMonth),
    [expenses, selectedYear, selectedMonth]
  );

  const displayExpenses = useMemo(() => {
    let list = monthExpenses;
    if (selectedDay !== "all") list = list.filter((e: any) => e.day === Number(selectedDay));
    if (filterItem) list = list.filter((e: any) =>
      (e.description ?? "").toLowerCase().includes(filterItem.toLowerCase()) ||
      Object.values(JSON.parse(e.fieldValues || "{}") as Record<string, string>)
        .some(v => v.toLowerCase().includes(filterItem.toLowerCase()))
    );
    return list;
  }, [monthExpenses, selectedDay, filterItem]);

  const totalMonth = monthExpenses.reduce((s: number, e: any) => s + (e.amount ?? 0), 0);
  const totalByDay = useMemo(() => {
    const m = new Map<number, number>();
    monthExpenses.forEach((e: any) => m.set(e.day, (m.get(e.day) ?? 0) + e.amount));
    return m;
  }, [monthExpenses]);
  const calendarDetailExpenses = calendarDetailDay ? monthExpenses.filter((e: any) => e.day === calendarDetailDay) : [];

  function askDelete(fn: () => void) { setConfirmAction(() => fn); setConfirmOpen(true); }

  function handleAddField() {
    if (!newFieldName.trim()) return;
    createField.mutate({
      categoryId: catId,
      fieldName: newFieldName.trim(),
      fieldType: newFieldType,
      isRequired: newFieldRequired,
      sortOrder: fields.length,
    }, {
      onSuccess: () => { setNewFieldName(""); setNewFieldType("text"); setNewFieldRequired(false); }
    });
  }

  function handleAddExpense() {
    const amount = Number(formAmount);
    if (!amount || amount <= 0) return;
    createExpense.mutate({
      categoryId: catId,
      nepaliYear: selectedYear,
      nepaliMonth: selectedMonth,
      day: Number(formDay) || today.day,
      amount,
      description: formDesc.trim(),
      fieldValues: JSON.stringify(formFieldValues),
    }, {
      onSuccess: () => {
        setFormAmount(""); setFormDesc(""); setFormDay(String(today.day));
        setFormFieldValues({});
        setAddOpen(false);
      }
    });
  }

  function getFieldValues(expense: any): Record<string, string> {
    try { return JSON.parse(expense.fieldValues || "{}"); } catch { return {}; }
  }

  if (!category && categories.length > 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <p className="text-muted-foreground text-lg">Category not found</p>
        <Button onClick={() => setLocation("/expenses")} variant="outline" className="mt-4 rounded-xl">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Categories
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/expenses")} className="rounded-xl shrink-0">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{category?.icon ?? "📦"}</span>
              <h1 className="text-2xl font-display font-bold text-foreground">{category?.name ?? "Loading..."}</h1>
            </div>
            <p className="text-muted-foreground text-sm mt-0.5 flex items-center gap-1.5 pl-1">
              <CalendarDays className="w-3.5 h-3.5" />
              {today.dayOfWeek}, {today.day} {NEPALI_MONTHS.find(m => m.value === today.month)?.label} {today.year} B.S.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setFieldsOpen(true)} data-testid="btn-manage-fields">
            <Settings2 className="w-4 h-4 mr-1.5" /> Expense Fields
          </Button>
          <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setCalendarOpen(true)} data-testid="btn-calendar">
            <CalendarDays className="w-4 h-4 mr-1.5 text-primary" />
            <span className="text-primary">Monthly Calendar</span>
          </Button>
          <Button size="sm" className="rounded-xl" onClick={() => setAddOpen(true)} data-testid="btn-add-expense">
            <Plus className="w-4 h-4 mr-1.5" /> Add Expense
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground">Year</label>
          <Select value={selectedYear.toString()} onValueChange={v => setSelectedYear(Number(v))}>
            <SelectTrigger className="w-28 rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent>{Array.from({ length: 23 }, (_, i) => 2078 + i).map(y => <SelectItem key={y} value={y.toString()}>{y} B.S.</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground">Month</label>
          <Select value={selectedMonth.toString()} onValueChange={v => setSelectedMonth(Number(v))}>
            <SelectTrigger className="w-36 rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent>{NEPALI_MONTHS.map(m => <SelectItem key={m.value} value={m.value.toString()}>{m.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground">Day</label>
          <Select value={selectedDay} onValueChange={setSelectedDay}>
            <SelectTrigger className="w-28 rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Days</SelectItem>
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => <SelectItem key={d} value={d.toString()}>Day {d}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1 flex-1 min-w-[160px]">
          <label className="text-xs font-semibold text-muted-foreground">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input placeholder="Search..." value={filterItem} onChange={e => setFilterItem(e.target.value)} className="pl-8 rounded-xl" />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className={cn("rounded-xl p-4 border", c.light, c.border)}>
          <p className={cn("text-xs font-medium mb-1", c.text)}>Total This Month</p>
          <p className={cn("text-2xl font-bold", c.text)}>Rs. {totalMonth.toLocaleString()}</p>
        </div>
        <div className="bg-card border border-border/50 rounded-xl p-4">
          <p className="text-xs text-muted-foreground font-medium mb-1">Records</p>
          <p className="text-2xl font-bold text-foreground">{monthExpenses.length}</p>
        </div>
        <div className="bg-card border border-border/50 rounded-xl p-4">
          <p className="text-xs text-muted-foreground font-medium mb-1">Showing</p>
          <p className="text-2xl font-bold text-foreground">{displayExpenses.length}</p>
        </div>
      </div>

      {/* Expense Table */}
      <div className="bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-3 border-b border-border/30 flex items-center gap-2">
          <Receipt className="w-4 h-4 text-primary" />
          <span className="font-semibold text-sm">Expenses — {monthName} {selectedYear} B.S.</span>
          <span className={cn("ml-auto text-xs font-semibold px-2 py-0.5 rounded-full", c.badge)}>{displayExpenses.length} records</span>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="font-bold">Day</TableHead>
                <TableHead className="font-bold">Description</TableHead>
                {fields.map((f: any) => <TableHead key={f.id} className="font-bold">{f.fieldName}</TableHead>)}
                <TableHead className="font-bold text-right">Amount</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayExpenses.length === 0 ? (
                <TableRow><TableCell colSpan={4 + fields.length} className="text-center py-12 text-muted-foreground">No expenses found.</TableCell></TableRow>
              ) : displayExpenses.map((exp: any) => {
                const fv = getFieldValues(exp);
                return (
                  <TableRow key={exp.id} className="hover:bg-muted/10">
                    <TableCell className="font-semibold">{exp.day}</TableCell>
                    <TableCell>{exp.description || "—"}</TableCell>
                    {fields.map((f: any) => <TableCell key={f.id}>{fv[f.fieldName] || "—"}</TableCell>)}
                    <TableCell className="text-right font-bold text-primary">Rs. {exp.amount?.toLocaleString()}</TableCell>
                    <TableCell>
                      <button
                        onClick={() => askDelete(() => deleteExpense.mutate({ id: exp.id, categoryId: catId }))}
                        data-testid={`btn-del-exp-${exp.id}`}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Add Expense Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-primary" /> Add Expense
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-1">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Day *</label>
                <Select value={formDay} onValueChange={setFormDay}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>{Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => <SelectItem key={d} value={d.toString()}>Day {d}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Amount (Rs.) *</label>
                <Input type="number" placeholder="0" value={formAmount} onChange={e => setFormAmount(e.target.value)} className="rounded-xl" data-testid="input-expense-amount" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Description</label>
              <Input placeholder="Description..." value={formDesc} onChange={e => setFormDesc(e.target.value)} className="rounded-xl" data-testid="input-expense-desc" />
            </div>
            {fields.map((f: any) => (
              <div key={f.id}>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                  {f.fieldName} {f.isRequired && <span className="text-red-500">*</span>}
                </label>
                <Input
                  type={f.fieldType === "number" ? "number" : "text"}
                  placeholder={f.fieldName}
                  value={formFieldValues[f.fieldName] ?? ""}
                  onChange={e => setFormFieldValues(prev => ({ ...prev, [f.fieldName]: e.target.value }))}
                  className="rounded-xl"
                  data-testid={`input-field-${f.fieldName}`}
                />
              </div>
            ))}
            <div className="flex gap-2 pt-1">
              <Button variant="outline" onClick={() => setAddOpen(false)} className="flex-1 rounded-xl">Cancel</Button>
              <Button onClick={handleAddExpense} disabled={!formAmount || createExpense.isPending} className="flex-1 rounded-xl" data-testid="btn-save-expense">
                {createExpense.isPending ? "Saving..." : "Save Expense"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Manage Fields Dialog */}
      <Dialog open={fieldsOpen} onOpenChange={setFieldsOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-primary" /> Expense Fields
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            <p className="text-xs text-muted-foreground">Define custom fields that appear in the Add Expense form for this category.</p>

            {/* Existing fields */}
            {fields.length > 0 && (
              <div className="space-y-2">
                {fields.map((f: any) => (
                  <div key={f.id} className="flex items-center justify-between bg-muted/30 rounded-xl px-3 py-2.5 border border-border/30">
                    <div>
                      <span className="font-semibold text-sm text-foreground">{f.fieldName}</span>
                      <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground uppercase">{f.fieldType}</span>
                      {f.isRequired && <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-red-50 text-red-500">Required</span>}
                    </div>
                    <button
                      onClick={() => askDelete(() => deleteField.mutate({ id: f.id, categoryId: catId }))}
                      data-testid={`btn-del-field-${f.id}`}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add new field */}
            <div className="border border-dashed border-border/50 rounded-xl p-3 space-y-3">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Add Expense Field</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Field Name *</label>
                  <Input placeholder="e.g. Vendor" value={newFieldName} onChange={e => setNewFieldName(e.target.value)} className="rounded-xl text-sm" data-testid="input-field-name" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Type</label>
                  <Select value={newFieldType} onValueChange={setNewFieldType}>
                    <SelectTrigger className="rounded-xl text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="req" checked={newFieldRequired} onChange={e => setNewFieldRequired(e.target.checked)} className="rounded" />
                <label htmlFor="req" className="text-sm text-muted-foreground">Required field</label>
              </div>
              <Button onClick={handleAddField} disabled={!newFieldName.trim() || createField.isPending} size="sm" className="w-full rounded-xl" data-testid="btn-add-field">
                <Plus className="w-4 h-4 mr-1.5" /> Add Expense Field
              </Button>
            </div>

            <Button variant="outline" onClick={() => setFieldsOpen(false)} className="w-full rounded-xl">Done</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Monthly Calendar Dialog */}
      <Dialog open={calendarOpen} onOpenChange={v => { setCalendarOpen(v); if (!v) setCalendarDetailDay(null); }}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-primary" /> Monthly Expense Calendar
            </DialogTitle>
          </DialogHeader>
          <div className="pt-2">
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
                <div key={d} className="text-center text-[10px] font-bold text-muted-foreground py-1">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {calendarDays.map((dayInfo, idx) => {
                if (!dayInfo.isCurrentMonth) return <div key={`e-${idx}`} className="aspect-square rounded-xl bg-muted/15" />;
                const dayTotal = totalByDay.get(dayInfo.day) ?? 0;
                const hasExp = dayTotal > 0;
                const isSat = dayInfo.dayOfWeek === "Sat";
                const isToday = selectedYear === today.year && selectedMonth === today.month && dayInfo.day === today.day;
                return (
                  <button key={dayInfo.day} onClick={() => setCalendarDetailDay(dayInfo.day)}
                    className={cn("aspect-square rounded-xl flex flex-col items-center justify-center transition-all text-center p-1 border",
                      isToday ? "bg-emerald-500 border-emerald-600 text-white shadow-md"
                        : hasExp ? cn(c.light, c.border, "hover:opacity-80")
                        : isSat ? "bg-red-50/50 border-red-100"
                        : "bg-card border-border/30 hover:bg-muted/40"
                    )}>
                    <span className={cn("text-sm font-bold", isToday ? "text-white" : hasExp ? c.text : isSat ? "text-red-500" : "text-foreground")}>{dayInfo.day}</span>
                    {hasExp && <span className={cn("text-[8px] font-bold mt-0.5", isToday ? "text-white/80" : c.text)}>
                      {dayTotal >= 1000 ? `${(dayTotal/1000).toFixed(1)}k` : dayTotal}
                    </span>}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-4 pt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" />Today</span>
              <span className="flex items-center gap-1.5"><span className={cn("w-3 h-3 rounded-sm inline-block", c.light, "border", c.border)} />Has expenses</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-red-50 border border-red-100 inline-block" />Saturday</span>
              <span className={cn("ml-auto font-semibold", c.text)}>Rs. {totalMonth.toLocaleString()}</span>
            </div>

            {calendarDetailDay && (
              <div className={cn("mt-4 rounded-xl border p-4", c.light, c.border)}>
                <p className={cn("font-bold mb-2 text-sm", c.text)}>Day {calendarDetailDay} — {calendarDetailExpenses.length} expense{calendarDetailExpenses.length !== 1 ? "s" : ""}</p>
                {calendarDetailExpenses.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No expenses on this day.</p>
                ) : (
                  <div className="space-y-1.5">
                    {calendarDetailExpenses.map((e: any) => (
                      <div key={e.id} className="flex justify-between text-sm bg-white/60 rounded-lg px-3 py-1.5">
                        <span className="text-foreground">{e.description || "Expense"}</span>
                        <span className={cn("font-bold", c.text)}>Rs. {e.amount?.toLocaleString()}</span>
                      </div>
                    ))}
                    <div className={cn("flex justify-between font-bold text-sm pt-1 border-t mt-2", c.border)}>
                      <span className={c.text}>Total</span>
                      <span className={c.text}>Rs. {calendarDetailExpenses.reduce((s: number, e: any) => s + e.amount, 0).toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={() => { confirmAction?.(); setConfirmOpen(false); }}
        title="Delete?"
        description="This will be permanently removed."
      />
    </div>
  );
}
