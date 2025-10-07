import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Edit, Receipt, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Expense {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  type: "expense" | "income";
  tags?: string[] | string | null; // ✅ allow array, string, or null
}

interface ExpenseCardProps {
  expense: Expense;
  onEdit?: (expense: Expense) => void;
  onDelete?: (id: string) => void;
  onClose?: (id: string) => void; // optional close button
}

const categoryColors: Record<string, string> = {
  food: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  transport: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  entertainment: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  utilities: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  healthcare: "bg-red-500/20 text-red-400 border-red-500/30",
  shopping: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  salary: "bg-green-500/20 text-green-400 border-green-500/30",
  freelance: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  rent: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  other: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

export function ExpenseCard({ expense, onEdit, onDelete, onClose }: ExpenseCardProps) {
  const isIncome = expense.type === "income";

  // ✅ Safe category
  const categoryClass =
    categoryColors[expense.category?.toLowerCase() || "other"] || categoryColors.other;

  // ✅ Safe date
  let formattedDate = "";
  try {
    formattedDate = expense.date ? new Date(expense.date).toLocaleDateString() : "";
  } catch {
    formattedDate = "";
  }

  // ✅ Normalize tags into array
  const tags: string[] = Array.isArray(expense.tags)
    ? expense.tags
    : typeof expense.tags === "string"
    ? expense.tags.split(",").map((t) => t.trim())
    : [];

  return (
    <Card className="group relative hover:shadow-md transition-all duration-200 bg-gradient-to-r from-card to-card/50 border-border/50">
      {/* close button */}
      {onClose && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onClose(expense.id)}
          className="absolute top-2 right-2 h-6 w-6 p-0 text-muted-foreground hover:bg-accent"
        >
          <X className="h-3 w-3" />
        </Button>
      )}

      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {/* Description */}
            <div className="flex items-center gap-2 mb-2">
              <Receipt className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-foreground">{expense.description}</span>
            </div>

            {/* Category + Date */}
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className={cn("text-xs border", categoryClass)}>
                {expense.category || "Other"}
              </Badge>
              <span className="text-sm text-muted-foreground">{formattedDate}</span>
            </div>

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Amount + Actions */}
          <div className="flex items-center gap-2">
            <div className="text-right">
              <div
                className={cn(
                  "text-lg font-bold",
                  isIncome ? "text-success" : "text-expense"
                )}
              >
                {isIncome ? "+" : "-"}₹{expense.amount.toLocaleString()}
              </div>
            </div>

            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit?.(expense)}
                className="h-8 w-8 p-0 hover:bg-accent"
              >
                <Edit className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete?.(expense.id)}
                className="h-8 w-8 p-0 hover:bg-destructive/20 hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
