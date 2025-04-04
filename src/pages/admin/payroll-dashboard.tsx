import { useEffect, useState } from "react";
import { format } from "date-fns";
import { DatePicker } from "@/components/ui/datepicker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable } from "@/components/ui/datatable";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ColumnDef } from "@tanstack/react-table";

interface PayrollData {
  id: string;
  name: string;
  staffType: string;
  baseSalary: number;
  commission: number;
  totalAmount: number;
}

const PayrollDashboard = () => {
  const [month, setMonth] = useState(format(new Date(), "yyyy-MM"));
  const [staffTypeFilter, setStaffTypeFilter] = useState("all");
  const [payrolls, setPayrolls] = useState<PayrollData[]>([]);
  const [editEntry, setEditEntry] = useState<PayrollData | null>(null);
  const [editedAmount, setEditedAmount] = useState<number | null>(null);

  useEffect(() => {
    async function fetchPayrolls() {
      const res = await fetch(`/api/payrolls?month=${month}`);
      const data = await res.json();
      setPayrolls(data);
    }
    fetchPayrolls();
  }, [month]);

  const filteredPayrolls = payrolls.filter((p) => {
    return staffTypeFilter === "all" || p.staffType === staffTypeFilter;
  });

  const columns: ColumnDef<PayrollData>[] = [
    { header: "Name", accessorKey: "name" },
    { header: "Staff Type", accessorKey: "staffType" },
    {
      header: "Base Salary",
      accessorKey: "baseSalary",
      cell: ({ row }) => `฿${(row.getValue("baseSalary") as number).toLocaleString()}`
    },
    {
      header: "Commission",
      accessorKey: "commission",
      cell: ({ row }) => `฿${(row.getValue("commission") as number).toLocaleString()}`
    },
    {
      header: "Total",
      accessorKey: "totalAmount",
      cell: ({ row }) => `฿${(row.getValue("totalAmount") as number).toLocaleString()}`
    },
    {
      header: "Actions",
      cell: (row) => (
        <div className="flex gap-2">
          <button
            className="text-blue-600 underline"
            onClick={() => {
              setEditEntry(row.row.original);
              setEditedAmount(row.row.original.totalAmount);
            }}
          >
            Edit
          </button>
          <button
            className="text-green-600 underline"
            onClick={() => alert(`Approved payroll for ${row.row.original.name}`)}
          >
            Approve
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Payroll Summary - {month}</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4 items-center flex-wrap">
          <DatePicker
            date={new Date(month)}
            setDate={(date: Date | undefined) => {
              if (date) {
                setMonth(format(date, "yyyy-MM"));
              }
            }}
          />
          <Select value={staffTypeFilter} onValueChange={setStaffTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Staff Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="full-time">Full-time</SelectItem>
              <SelectItem value="part-time">Part-time</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
        <div className="flex gap-2 mt-4">
          <button
            className="bg-green-600 text-white px-4 py-2 rounded"
            onClick={() => {
              const csvContent = [
                ["Name", "Staff Type", "Base Salary", "Commission", "Total"],
                ...filteredPayrolls.map((p) => [
                  p.name,
                  p.staffType,
                  p.baseSalary,
                  p.commission,
                  p.totalAmount,
                ]),
              ]
                .map((row) => row.join(","))
                .join("\n");

              const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
              const link = document.createElement("a");
              link.href = URL.createObjectURL(blob);
              link.setAttribute("download", `payroll-${month}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
          >
            Export CSV
          </button>

          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={() => window.print()}
          >
            Print Summary
          </button>
        </div>
      </Card>

      <DataTable columns={columns} data={filteredPayrolls} />

      <Dialog open={!!editEntry} onOpenChange={() => setEditEntry(null)}>
        <DialogContent>
          <h3 className="text-lg font-semibold mb-2">แก้ไขค่าตอบแทน</h3>
          <p>{editEntry?.name}</p>

          <div className="space-y-2 mt-2">
            <div>
              <label className="text-sm">Base Salary</label>
              <Input
                type="number"
                value={editEntry?.baseSalary ?? ""}
                onChange={(e) =>
                  setEditEntry((prev) =>
                    prev ? { ...prev, baseSalary: Number(e.target.value) } : null
                  )
                }
              />
            </div>
            <div>
              <label className="text-sm">Commission</label>
              <Input
                type="number"
                value={editEntry?.commission ?? ""}
                onChange={(e) =>
                  setEditEntry((prev) =>
                    prev ? { ...prev, commission: Number(e.target.value) } : null
                  )
                }
              />
            </div>
            <div>
              <label className="text-sm">Total Amount</label>
              <Input
                type="number"
                value={editedAmount ?? ""}
                onChange={(e) => setEditedAmount(Number(e.target.value))}
              />
            </div>
          </div>

          <button
            className="bg-green-600 text-white px-4 py-2 rounded mt-4"
            onClick={async () => {
              if (!editEntry || editedAmount === null) return;
              await fetch(`/api/payrolls/${editEntry.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  baseSalary: editEntry.baseSalary,
                  commission: editEntry.commission,
                  totalAmount: editedAmount,
                }),
              });
              setEditEntry(null);
              location.reload(); // Refresh to see updates
            }}
          >
            Save Changes
          </button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PayrollDashboard; 