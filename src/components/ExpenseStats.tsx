import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Wallet, Target, DollarSign, PieChart } from "lucide-react";
import { Expense } from "./ExpenseCard";

interface ExpenseStatsProps {
  expenses: Expense[];
  budgets?: Record<string, number>;
}

export function ExpenseStats({ expenses, budgets = {} }: ExpenseStatsProps) {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const currentMonthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate.getMonth() === currentMonth && 
           expenseDate.getFullYear() === currentYear &&
           expense.type === 'expense';
  });

  const currentMonthIncome = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate.getMonth() === currentMonth && 
           expenseDate.getFullYear() === currentYear &&
           expense.type === 'income';
  });

  const totalExpenses = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalIncome = currentMonthIncome.reduce((sum, income) => sum + income.amount, 0);
  const netAmount = totalIncome - totalExpenses;

  // Category breakdown
  const categoryTotals = currentMonthExpenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const topCategories = Object.entries(categoryTotals)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Income */}
      <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-foreground">
            Monthly Income
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-success" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-success">
            ₹{totalIncome.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {currentMonthIncome.length} transactions
          </p>
        </CardContent>
      </Card>

      {/* Total Expenses */}
      <Card className="bg-gradient-to-br from-expense/10 to-expense/5 border-expense/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-foreground">
            Monthly Expenses
          </CardTitle>
          <TrendingDown className="h-4 w-4 text-expense" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-expense">
            ₹{totalExpenses.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {currentMonthExpenses.length} transactions
          </p>
        </CardContent>
      </Card>

      {/* Net Amount */}
      <Card className={`bg-gradient-to-br ${netAmount >= 0 ? 'from-success/10 to-success/5 border-success/20' : 'from-warning/10 to-warning/5 border-warning/20'}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-foreground">
            Net Amount
          </CardTitle>
          <Wallet className={`h-4 w-4 ${netAmount >= 0 ? 'text-success' : 'text-warning'}`} />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${netAmount >= 0 ? 'text-success' : 'text-warning'}`}>
            {netAmount >= 0 ? '+' : ''}₹{netAmount.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            This month's balance
          </p>
        </CardContent>
      </Card>

      {/* Budget Progress */}
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-foreground">
            Budget Status
          </CardTitle>
          <Target className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          {Object.keys(budgets).length > 0 ? (
            <div className="space-y-2">
              {Object.entries(budgets).slice(0, 2).map(([category, budget]) => {
                const spent = categoryTotals[category] || 0;
                const percentage = (spent / budget) * 100;
                
                return (
                  <div key={category} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="capitalize">{category}</span>
                      <span>{Math.round(percentage)}%</span>
                    </div>
                    <Progress 
                      value={Math.min(percentage, 100)} 
                      className="h-1"
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              No budgets set
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}