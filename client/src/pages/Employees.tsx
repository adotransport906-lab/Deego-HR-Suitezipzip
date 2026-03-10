import { useState } from "react";
import { useEmployees, useCreateEmployee, useDeleteEmployee } from "@/hooks/use-employees";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Plus, Trash2, Search, Briefcase } from "lucide-react";

export default function Employees() {
  const { data: employees, isLoading } = useEmployees();
  const createEmployee = useCreateEmployee();
  const deleteEmployee = useDeleteEmployee();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredEmployees = employees?.filter(e => 
    e.name.toLowerCase().includes(search.toLowerCase()) || 
    e.employeeId.toLowerCase().includes(search.toLowerCase()) ||
    e.department.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    createEmployee.mutate({
      employeeId: fd.get("employeeId") as string,
      name: fd.get("name") as string,
      designation: fd.get("designation") as string,
      department: fd.get("department") as string,
    }, {
      onSuccess: () => setIsAddOpen(false)
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Directory</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage company employees and departments.</p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl transition-all">
              <Plus className="w-4 h-4 mr-2" /> Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-display">New Employee</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Employee ID</label>
                <Input name="employeeId" required placeholder="EMP-001" className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Full Name</label>
                <Input name="name" required placeholder="John Doe" className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Designation</label>
                <Input name="designation" required placeholder="Senior Weaver" className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Department</label>
                <Input name="department" required placeholder="Production" className="rounded-xl" />
              </div>
              <Button type="submit" className="w-full rounded-xl mt-6" disabled={createEmployee.isPending}>
                {createEmployee.isPending ? "Creating..." : "Create Record"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border/50 flex items-center gap-4 bg-muted/20">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name, ID or department..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 rounded-xl bg-background border-border/50 focus-visible:ring-primary/20"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold">Employee ID</TableHead>
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="font-semibold">Designation</TableHead>
                <TableHead className="font-semibold">Department</TableHead>
                <TableHead className="text-right font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">Loading directory...</TableCell>
                </TableRow>
              ) : filteredEmployees?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-muted-foreground flex flex-col items-center justify-center">
                    <Users className="w-12 h-12 mb-4 text-muted" />
                    No employees found matching your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredEmployees?.map((emp) => (
                  <TableRow key={emp.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-mono text-sm font-medium text-slate-500">{emp.employeeId}</TableCell>
                    <TableCell className="font-semibold text-foreground">{emp.name}</TableCell>
                    <TableCell>{emp.designation}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary">
                        <Briefcase className="w-3 h-3" />
                        {emp.department}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors"
                        onClick={() => {
                          if (confirm(`Remove ${emp.name} from directory?`)) {
                            deleteEmployee.mutate(emp.id);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
