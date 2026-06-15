"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Database } from "@/types/database.types";

type Expense = Database["public"]["Tables"]["expenses"]["Row"];

interface ExpenseListProps {
  expenses: Expense[];
  loading: boolean;
}

export function ExpenseList({ expenses, loading }: ExpenseListProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton h-14 w-full" />
        ))}
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-secondary mb-4">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-muted-foreground"
          >
            <line x1="12" y1="2" x2="12" y2="22" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </div>
        <h3 className="text-sm font-medium text-primary mb-1">
          No expenses yet
        </h3>
        <p className="text-sm text-muted-foreground">
          Get started by creating a new expense.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Merchant</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.map((expense) => {
            const date = new Date(expense.created_at || "").toLocaleDateString(
              "en-US",
              {
                month: "short",
                day: "numeric",
                year: "numeric",
              },
            );

            return (
              <TableRow key={expense.id}>
                <TableCell className="font-medium">{expense.title}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="font-normal">
                    {expense.category}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{date}</TableCell>
                <TableCell className="text-right font-medium">
                  ${expense.amount.toFixed(2)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
