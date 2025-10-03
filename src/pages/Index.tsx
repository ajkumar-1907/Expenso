import { useState, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, BarChart3, Wallet, TrendingUp, Download, Settings } from "lucide-react";
import { ExpenseCard, type Expense } from "@/components/ExpenseCard";
import { ExpenseForm } from "@/components/ExpenseForm";
import { ExpenseStats } from "@/components/ExpenseStats";
import { ExpenseCharts } from "@/components/ExpenseCharts";
import { ExpenseFilters, type FilterOptions } from "@/components/ExpenseFilters";
import { useToast } from "@/hooks/use-toast";
import Logo from "@/assets/logo.png";

// Sample data for demonstration
const sampleExpenses: Expense[] = [
  {
    id: "1",
    amount: 850,
    description: "This is juat a sample input. Grocery shopping at BigBasket",
    category: "Food",
    date: "2024-10-03",
    type: "expense",
    tags: ["essentials", "monthly"]
  },
  // {
  //   id: "2",
  //   amount: 45000,
  //   description: "Freelance project payment",
  //   category: "Freelance",
  //   date: "2024-01-10",
  //   type: "income",
  //   tags: ["work", "client-a"]
  // },
  // {
  //   id: "3",
  //   amount: 1200,
  //   description: "Netflix and Spotify subscriptions",
  //   category: "Entertainment",
  //   date: "2024-01-08",
  //   type: "expense",
  //   tags: ["subscriptions", "monthly"]
  // },
  // {
  //   id: "4",
  //   amount: 2500,
  //   description: "Electricity bill",
  //   category: "Utilities",
  //   date: "2024-01-05",
  //   type: "expense",
  //   tags: ["bills", "monthly"]
  // }
];

const Index = () => {
  const { toast } = useToast();
  const [expenses, setExpenses] = useState<Expense[]>(sampleExpenses);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    category: '',
    type: '',
    dateFrom: '',
    dateTo: '',
    minAmount: '',
    maxAmount: '',
    tags: []
  });

  // Ref for scrolling to form
  const formRef = useRef<HTMLDivElement>(null);

  // Sample budgets
  const budgets = {
    Food: 15000,
    Transport: 5000,
    Entertainment: 3000,
    Utilities: 8000
  };

  // Filter expenses based on current filters
  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      // Search filter
      if (filters.search && !expense.description.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }

      // Category filter
      if (filters.category && expense.category !== filters.category) {
        return false;
      }

      // Type filter
      if (filters.type && expense.type !== filters.type) {
        return false;
      }

      // Date range filter
      if (filters.dateFrom && new Date(expense.date) < new Date(filters.dateFrom)) {
        return false;
      }
      if (filters.dateTo && new Date(expense.date) > new Date(filters.dateTo)) {
        return false;
      }

      // Amount range filter
      if (filters.minAmount && expense.amount < parseFloat(filters.minAmount)) {
        return false;
      }
      if (filters.maxAmount && expense.amount > parseFloat(filters.maxAmount)) {
        return false;
      }

      // Tags filter
      if (filters.tags.length > 0 && !filters.tags.some(tag => expense.tags?.includes(tag))) {
        return false;
      }

      return true;
    });
  }, [expenses, filters]);

  // Get available categories and tags for filters
  const availableCategories = [...new Set(expenses.map(e => e.category))];
  const availableTags = [...new Set(expenses.flatMap(e => e.tags || []))];

  const handleAddExpense = (expenseData: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: Date.now().toString()
    };
    setExpenses(prev => [newExpense, ...prev]);
    setShowAddForm(false);
  };

  const handleEditExpense = (expenseData: Omit<Expense, 'id'>) => {
    if (!editingExpense) return;
    
    setExpenses(prev =>
      prev.map(expense =>
        expense.id === editingExpense.id
          ? { ...expenseData, id: editingExpense.id }
          : expense
      )
    );
    setEditingExpense(null);
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(expense => expense.id !== id));
    toast({
      title: "Deleted",
      description: "Transaction deleted successfully",
    });
  };

  const exportToCsv = () => {
    const headers = ['Date', 'Type', 'Category', 'Description', 'Amount', 'Tags'];
    const csvData = [
      headers,
      ...filteredExpenses.map(expense => [
        expense.date,
        expense.type,
        expense.category,
        expense.description,
        expense.amount.toString(),
        expense.tags?.join(';') || ''
      ])
    ];
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'expenses.csv';
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Exported",
      description: "Transactions exported to CSV successfully",
    });
  };

  // Function to handle scroll when editing
  const handleEditClick = (expense: Expense) => {
    setEditingExpense(expense);
    setShowAddForm(false);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50); // slight delay to ensure form renders
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <img src={Logo} alt="App Logo" className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-xl font-bold">ExpenseTracker</h1>
              <p className="text-sm text-muted-foreground">Manage your finances</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={exportToCsv}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button 
              onClick={() => setShowAddForm(true)}
              className="bg-gradient-to-r from-primary to-primary/80"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Transaction
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-6" ref={formRef}>
        {/* Add/Edit Form */}
        {(showAddForm || editingExpense) && (
          <div className="mb-6">
            <ExpenseForm
              onSubmit={editingExpense ? handleEditExpense : handleAddExpense}
              editingExpense={editingExpense}
              onCancel={() => {
                setShowAddForm(false);
                setEditingExpense(null);
              }}
            />
          </div>
        )}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Transactions
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <ExpenseStats expenses={expenses} budgets={budgets} />
            <ExpenseCharts expenses={expenses} />
            
            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {expenses.slice(0, 5).map((expense) => (
                    <ExpenseCard
                      key={expense.id}
                      expense={expense}
                      onEdit={handleEditClick}
                      onDelete={handleDeleteExpense}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <ExpenseFilters
              filters={filters}
              onFiltersChange={setFilters}
              availableCategories={availableCategories}
              availableTags={availableTags}
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold">Transactions</h2>
                <Badge variant="secondary">
                  {filteredExpenses.length} of {expenses.length}
                </Badge>
              </div>
            </div>

            <div className="space-y-3">
              {filteredExpenses.length > 0 ? (
                filteredExpenses.map((expense) => (
                  <ExpenseCard
                    key={expense.id}
                    expense={expense}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteExpense}
                  />
                ))
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Wallet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No transactions found</h3>
                    <p className="text-muted-foreground mb-4">
                      {expenses.length === 0 
                        ? "Start by adding your first transaction" 
                        : "Try adjusting your filters"
                      }
                    </p>
                    <Button onClick={() => setShowAddForm(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Transaction
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <ExpenseStats expenses={expenses} budgets={budgets} />
            <ExpenseCharts expenses={expenses} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
