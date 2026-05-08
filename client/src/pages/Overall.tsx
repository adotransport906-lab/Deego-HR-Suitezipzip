import { useState, useMemo } from "react";
import { useEmployees } from "@/hooks/use-employees";
import { useLeaves } from "@/hooks/use-leaves";
import { useAttendance } from "@/hooks/use-attendance";
import { useSalaries } from "@/hooks/use-salary";
import { NEPALI_MONTHS } from "@/lib/constants";
import { useActiveDate } from "@/hooks/use-active-date";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { BarChart3, User, ChevronRight, Calendar, ClipboardList, Wallet } from "lucide-react";

export default function Overall() {
  const today = useActiveDate();
  const [selectedYear, setSelectedYear] = useState(today.year);
  const [selectedEmpId, setSelectedEmpId] = useState<number | null>(null);

  const { data: employees } = useEmployees();
  const { data: leaves } = useLeaves();
  const { data: attendance } = useAttendance();
  const { data: salaries } = useSalaries();

  const selectedEmp = employees?.find(e => e.id === selectedEmpId) ?? null;

  const getEmpLeavesPerMonth = (empId: number, month: number) =>
    (leaves ?? []).filter(l => l.employeeId === empId && l.nepaliYear === selectedYear && l.nepaliMonth === month).length;

  const getEmpAttendancePerMonth = (empId: number, month: number) => {
    const recs = (attendance ?? []).filter(a => a.employeeId === empId && a.nepaliYear === selectedYear && a.nepaliMonth === month);
    return {
      present: recs.filter(r => r.status === "present").length,
      half_day: recs.filter(r => r.status === "half_day").length,
    };
  };

  const getSalaryRecord = (empId: number, month: number) =>
    (salaries ?? []).find(s => s.employeeId === empId && s.nepaliYear === selectedYear && s.nepaliMonth === month);

  const monthName = NEPALI_MONTHS.find(m => m.value === today.month)?.label ?? "";

  const yearSalaryTotal = useMemo(() => {
    if (!selectedEmp) return 0;
    return NEPALI_MONTHS.reduce((s, m) => {
      const rec = getSalaryRecord(selectedEmp.id, m.value);
      return s + (rec?.totalSalary ?? 0);
    }, 0);
  }, [selectedEmp, salaries, selectedYear]);

  const yearSalaryPaid = useMemo(() => {
    if (!selectedEmp) return 0;
    return NEPALI_MONTHS.reduce((s, m) => {
      const rec = getSalaryRecord(selectedEmp.id, m.value);
      return s + (rec?.providedSalary ?? 0);
    }, 0);
  }, [selectedEmp, salaries, selectedYear]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Overall Report</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {today.dayOfWeek}, {today.day} {monthName} {today.year} B.S. · Select an employee to view their full report.
          </p>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground">Year</label>
          <Select value={selectedYear.toString()} onValueChange={v => setSelectedYear(Number(v))}>
            <SelectTrigger className="w-32 rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent>{Array.from({ length: 103 }, (_, i) => 2080 + i).map(y => <SelectItem key={y} value={y.toString()}>{y} B.S.</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Employee List */}
        <div className="bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border/50 bg-muted/30">
            <h3 className="font-bold text-foreground flex items-center gap-2">
              <User className="w-4 h-4 text-primary" /> Employees ({employees?.length ?? 0})
            </h3>
          </div>
          <div className="overflow-y-auto max-h-[600px]">
            {employees?.map(emp => {
              const isSelected = selectedEmpId === emp.id;
              const totalLeaves = NEPALI_MONTHS.reduce((s, m) => s + getEmpLeavesPerMonth(emp.id, m.value), 0);
              return (
                <button
                  key={emp.id}
                  onClick={() => setSelectedEmpId(emp.id)}
                  className={cn(
                    "w-full text-left px-4 py-3 border-b border-border/30 transition-all flex items-center gap-3",
                    isSelected ? "bg-primary text-primary-foreground" : "hover:bg-muted/30"
                  )}
                >
                  <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                    isSelected ? "bg-primary-foreground/20 text-primary-foreground" : "bg-primary/10 text-primary")}>
                    {emp.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">{emp.name}</div>
                    <div className={cn("text-xs truncate", isSelected ? "text-primary-foreground/70" : "text-muted-foreground")}>
                      {emp.designation}
                    </div>
                  </div>
                  {totalLeaves > 0 && (
                    <span className={cn("text-xs px-1.5 py-0.5 rounded font-bold",
                      isSelected ? "bg-primary-foreground/20 text-primary-foreground" : "bg-amber-100 text-amber-700")}>
                      {totalLeaves}L
                    </span>
                  )}
                  <ChevronRight className={cn("w-4 h-4 shrink-0", isSelected ? "text-primary-foreground/70" : "text-muted-foreground/50")} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Employee Detail Report */}
        <div className="lg:col-span-2">
          {!selectedEmp ? (
            <div className="bg-card border border-border/50 rounded-2xl h-full flex flex-col items-center justify-center py-24 text-muted-foreground">
              <BarChart3 className="w-16 h-16 mb-4 text-muted" />
              <p className="font-semibold text-lg">Select an Employee</p>
              <p className="text-sm mt-1">Click on an employee from the list to view their full report.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Employee Header */}
              <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-5 text-primary-foreground shadow-lg shadow-primary/20">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary-foreground/20 flex items-center justify-center text-2xl font-bold">
                    {selectedEmp.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-display font-bold">{selectedEmp.name}</h2>
                    <p className="text-primary-foreground/80">{selectedEmp.designation}</p>
                    <p className="text-xs text-primary-foreground/60 mt-0.5">ID: {selectedEmp.employeeId} · Year {selectedYear} B.S.</p>
                  </div>
                </div>
              </div>

              {/* Year Totals */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="border rounded-2xl p-4 bg-amber-50 text-amber-700 border-amber-200">
                  <Calendar className="w-5 h-5 mb-2" />
                  <p className="text-xs font-medium opacity-80">Total Leaves</p>
                  <p className="text-xl font-bold mt-0.5">
                    {NEPALI_MONTHS.reduce((s, m) => s + getEmpLeavesPerMonth(selectedEmp.id, m.value), 0)}
                  </p>
                </div>
                <div className="border rounded-2xl p-4 bg-blue-50 text-blue-700 border-blue-200">
                  <ClipboardList className="w-5 h-5 mb-2" />
                  <p className="text-xs font-medium opacity-80">Days Present</p>
                  <p className="text-xl font-bold mt-0.5">
                    {NEPALI_MONTHS.reduce((s, m) => s + getEmpAttendancePerMonth(selectedEmp.id, m.value).present, 0)}
                  </p>
                </div>
                <div className="border rounded-2xl p-4 bg-emerald-50 text-emerald-700 border-emerald-200 col-span-2 sm:col-span-1">
                  <Wallet className="w-5 h-5 mb-2" />
                  <p className="text-xs font-medium opacity-80">Salary Paid (Year)</p>
                  <p className="text-xl font-bold mt-0.5">Rs. {yearSalaryPaid.toLocaleString()}</p>
                  {yearSalaryTotal > 0 && yearSalaryTotal !== yearSalaryPaid && (
                    <p className="text-xs mt-0.5 opacity-70">of Rs. {yearSalaryTotal.toLocaleString()}</p>
                  )}
                </div>
              </div>

              {/* Monthly Detail Table */}
              <div className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/50 bg-muted/30">
                        <th className="px-4 py-3 text-left font-bold">Month</th>
                        <th className="px-4 py-3 text-center font-bold">
                          <span className="flex items-center justify-center gap-1">
                            <ClipboardList className="w-3 h-3" /> P / H
                          </span>
                        </th>
                        <th className="px-4 py-3 text-center font-bold">
                          <span className="flex items-center justify-center gap-1">
                            <Calendar className="w-3 h-3" /> Leaves
                          </span>
                        </th>
                        <th className="px-4 py-3 text-center font-bold">
                          <span className="flex items-center justify-center gap-1">
                            <Wallet className="w-3 h-3" /> Salary
                          </span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {NEPALI_MONTHS.map(month => {
                        const att = getEmpAttendancePerMonth(selectedEmp.id, month.value);
                        const leaveCount = getEmpLeavesPerMonth(selectedEmp.id, month.value);
                        const salRec = getSalaryRecord(selectedEmp.id, month.value);
                        const hasData = att.present + att.half_day + leaveCount > 0 || !!salRec;
                        const isPaid = salRec && salRec.providedSalary >= salRec.totalSalary && salRec.totalSalary > 0;
                        const isPartial = salRec && salRec.providedSalary > 0 && salRec.providedSalary < salRec.totalSalary;
                        return (
                          <tr key={month.value} className={cn("border-b border-border/40 transition-colors", hasData ? "hover:bg-muted/10" : "opacity-50")}>
                            <td className="px-4 py-3 font-medium">{month.label}</td>
                            <td className="px-4 py-3 text-center">
                              {att.present + att.half_day > 0 ? (
                                <span className="text-xs font-mono">
                                  <span className="text-emerald-600 font-bold">{att.present}</span>
                                  <span className="text-muted-foreground"> / </span>
                                  <span className="text-amber-600 font-bold">{att.half_day}</span>
                                </span>
                              ) : <span className="text-muted-foreground">—</span>}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {leaveCount > 0 ? (
                                <span className="inline-block px-2.5 py-0.5 rounded-lg bg-amber-500/15 text-amber-700 font-bold text-xs">{leaveCount}</span>
                              ) : <span className="text-muted-foreground">—</span>}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {!salRec || salRec.totalSalary === 0 ? (
                                <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-600 border border-red-200">Unpaid</span>
                              ) : isPaid ? (
                                <div className="text-xs space-y-0.5">
                                  <div className="text-muted-foreground">Total: <span className="font-semibold text-foreground">Rs.{salRec.totalSalary.toLocaleString()}</span></div>
                                  <div className="text-muted-foreground">Paid: <span className="font-semibold text-emerald-700">Rs.{salRec.providedSalary.toLocaleString()}</span></div>
                                  <div className="text-muted-foreground">Rem: <span className="font-semibold text-emerald-600">Rs.0</span></div>
                                </div>
                              ) : isPartial ? (
                                <div className="text-xs space-y-0.5">
                                  <div className="text-muted-foreground">Total: <span className="font-semibold text-foreground">Rs.{salRec.totalSalary.toLocaleString()}</span></div>
                                  <div className="text-muted-foreground">Paid: <span className="font-semibold text-amber-700">Rs.{salRec.providedSalary.toLocaleString()}</span></div>
                                  <div className="text-muted-foreground">Rem: <span className="font-semibold text-red-600">Rs.{(salRec.totalSalary - salRec.providedSalary).toLocaleString()}</span></div>
                                </div>
                              ) : (
                                <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-600 border border-red-200">Unpaid</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-muted/30 border-t-2 border-border/50">
                      <tr>
                        <td className="px-4 py-3 font-bold">Total</td>
                        <td className="px-4 py-3 text-center text-xs font-mono font-bold">
                          <span className="text-emerald-600">{NEPALI_MONTHS.reduce((s, m) => s + getEmpAttendancePerMonth(selectedEmp.id, m.value).present, 0)}</span>
                          <span className="text-muted-foreground"> / </span>
                          <span className="text-amber-600">{NEPALI_MONTHS.reduce((s, m) => s + getEmpAttendancePerMonth(selectedEmp.id, m.value).half_day, 0)}</span>
                        </td>
                        <td className="px-4 py-3 text-center font-bold">
                          {NEPALI_MONTHS.reduce((s, m) => s + getEmpLeavesPerMonth(selectedEmp.id, m.value), 0)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {yearSalaryTotal > 0 ? (
                            <div className="text-xs space-y-0.5">
                              <div className="font-bold text-foreground">Rs.{yearSalaryTotal.toLocaleString()}</div>
                              <div className="text-emerald-700 font-semibold">Paid: Rs.{yearSalaryPaid.toLocaleString()}</div>
                              {yearSalaryTotal - yearSalaryPaid > 0 && (
                                <div className="text-red-600 font-semibold">Rem: Rs.{(yearSalaryTotal - yearSalaryPaid).toLocaleString()}</div>
                              )}
                            </div>
                          ) : <span className="text-muted-foreground text-xs">—</span>}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
