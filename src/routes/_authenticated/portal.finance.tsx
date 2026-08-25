import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { EmptyState, PageHeader } from "@/components/portal/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMe } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { fullName, money } from "@/lib/school";

export const Route = createFileRoute("/_authenticated/portal/finance")({
  head: () => ({
    meta: [
      { title: "Finance | Rahma Junior portal" },
      { name: "description", content: "School fees, invoices and payment receipts." },
      { property: "og:title", content: "Finance | Rahma Junior portal" },
      { property: "og:description", content: "School fees, invoices and payment receipts." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: FinancePage,
});

type InvoiceRow = {
  id: string;
  invoice_no: string;
  amount: number;
  due_date: string | null;
  status: string;
  students: { first_name: string; last_name: string; admission_no: string } | null;
};

type PaymentRow = {
  id: string;
  receipt_no: string;
  amount: number;
  method: string;
  paid_at: string;
  students: { first_name: string; last_name: string } | null;
};

function statusTone(status: string) {
  if (status === "paid") return "bg-primary/10 text-primary";
  if (status === "partial") return "bg-gold/25 text-navy";
  return "bg-destructive/10 text-destructive";
}

function FinancePage() {
  const { isStaff } = useMe();

  const invoices = useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select(
          "id,invoice_no,amount,due_date,status,students:student_id(first_name,last_name,admission_no)",
        )
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data ?? []) as unknown as InvoiceRow[];
    },
  });

  const payments = useQuery({
    queryKey: ["payments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select("id,receipt_no,amount,method,paid_at,students:student_id(first_name,last_name)")
        .order("paid_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data ?? []) as unknown as PaymentRow[];
    },
  });

  const rows = invoices.data ?? [];
  const paid = payments.data ?? [];
  const billed = rows.reduce((sum, r) => sum + Number(r.amount ?? 0), 0);
  const received = paid.reduce((sum, r) => sum + Number(r.amount ?? 0), 0);
  const balance = billed - received;

  return (
    <div>
      <PageHeader
        title="Finance"
        description={
          isStaff
            ? "Invoices raised and payments received across the school."
            : "Fee statements and receipts for your children."
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total billed", value: money(billed) },
          { label: "Total received", value: money(received) },
          { label: "Outstanding balance", value: money(balance) },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-5">
              <p className="text-[11px] uppercase tracking-brand text-muted-foreground">
                {stat.label}
              </p>
              <p className="mt-1 font-display text-xl font-extrabold text-navy">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            {invoices.isLoading ? (
              <EmptyState message="Loading invoices…" />
            ) : rows.length === 0 ? (
              <EmptyState message="No invoices have been raised yet." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Due</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.invoice_no}</TableCell>
                      <TableCell>{fullName(r.students) || "—"}</TableCell>
                      <TableCell>{r.due_date ?? "—"}</TableCell>
                      <TableCell className="text-right">{money(r.amount)}</TableCell>
                      <TableCell>
                        <Badge className={statusTone(r.status)} variant="secondary">
                          {r.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Payments</CardTitle>
          </CardHeader>
          <CardContent>
            {payments.isLoading ? (
              <EmptyState message="Loading payments…" />
            ) : paid.length === 0 ? (
              <EmptyState message="No payments recorded yet." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Receipt</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paid.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.receipt_no}</TableCell>
                      <TableCell>{fullName(p.students) || "—"}</TableCell>
                      <TableCell className="capitalize">{p.method}</TableCell>
                      <TableCell>{new Date(p.paid_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">{money(p.amount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
