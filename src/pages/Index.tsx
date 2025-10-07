import { useState, useMemo, useRef, useEffect } from "react";
import { supabase } from "@/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  BarChart3,
  Wallet,
  TrendingUp,
  Download,
} from "lucide-react";
import { ExpenseCard, type Expense } from "@/components/ExpenseCard";
import { ExpenseForm } from "@/components/ExpenseForm";
import { ExpenseStats } from "@/components/ExpenseStats";
import { ExpenseCharts } from "@/components/ExpenseCharts";
import { ExpenseFilters, type FilterOptions } from "@/components/ExpenseFilters";
import { useToast } from "@/hooks/use-toast";
import Logo from "@/assets/logo.png";
import AuthPage from "./Auth";

// ✅ Normalizer function (safe tags handling)
function normalizeExpense(exp: any): Expense {
  return {
    id: exp.id,
    amount: exp.amount,
    description: exp.description,
    category: exp.category || "Other",
    date: exp.date ? exp.date.split("T")[0] : "", // only YYYY-MM-DD
    type: exp.type === "income" ? "income" : "expense",
    tags: Array.isArray(exp.tags)
      ? exp.tags
      : typeof exp.tags === "string" && exp.tags.length > 0
      ? exp.tags.split(",").map((t) => t.trim())
      : [], // ✅ always an array
  };
}

const Index = () => {
  const { toast } = useToast();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [filters, setFilters] = useState<FilterOptions>({
    search: "",
    category: "",
    type: "",
    dateFrom: "",
    dateTo: "",
    minAmount: "",
    maxAmount: "",
    tags: [],
  });

  // auth state
  const [user, setUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Ref for scrolling to form
  const formRef = useRef<HTMLDivElement>(null);

  // Budgets (could later come from DB)
  const budgets = {
    Food: 15000,
    Transport: 5000,
    Entertainment: 3000,
    Utilities: 8000,
  };

  // -----------------------
  // Auth check
  // -----------------------
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoadingUser(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  // -----------------------
  // Fetch expenses for logged-in user
  // -----------------------
  useEffect(() => {
    if (!user) return;
    const fetchExpenses = async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      if (error) {
        console.error("Error fetching:", error.message);
        toast({ title: "Error", description: "Failed to fetch expenses" });
      } else {
        setExpenses((data || []).map(normalizeExpense));
      }
    };

    fetchExpenses();
  }, [user, toast]);

  // -----------------------
  // Filter logic
  // -----------------------
  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      if (
        filters.search &&
        !expense.description
          .toLowerCase()
          .includes(filters.search.toLowerCase())
      ) {
        return false;
      }
      if (filters.category && expense.category !== filters.category) {
        return false;
      }
      if (filters.type && expense.type !== filters.type) {
        return false;
      }
      if (
        filters.dateFrom &&
        new Date(expense.date) < new Date(filters.dateFrom)
      ) {
        return false;
      }
      if (filters.dateTo && new Date(expense.date) > new Date(filters.dateTo)) {
        return false;
      }
      if (
        filters.minAmount &&
        expense.amount < parseFloat(filters.minAmount)
      ) {
        return false;
      }
      if (
        filters.maxAmount &&
        expense.amount > parseFloat(filters.maxAmount)
      ) {
        return false;
      }
      if (
        filters.tags.length > 0 &&
        !filters.tags.some((tag) => expense.tags?.includes(tag))
      ) {
        return false;
      }
      return true;
    });
  }, [expenses, filters]);

  const availableCategories = [...new Set(expenses.map((e) => e.category))];
  const availableTags = [...new Set(expenses.flatMap((e) => e.tags || []))];

  // -----------------------
  // Add new expense
  // -----------------------
  const handleAddExpense = async (expenseData: Omit<Expense, "id">) => {
    if (!user) {
      toast({ title: "Error", description: "Login required" });
      return;
    }

    const { data, error } = await supabase
      .from("transactions")
      .insert([{ ...expenseData, user_id: user.id }])
      .select();

    if (error) {
      toast({ title: "Error", description: error.message });
    } else {
      const inserted = data![0];
      setExpenses((prev) => [normalizeExpense(inserted), ...prev]);
      setShowAddForm(false);
      toast({ title: "Success", description: "Transaction added!" });
    }
  };

  // -----------------------
  // Edit expense
  // -----------------------
  const handleEditExpense = async (expenseData: Omit<Expense, "id">) => {
    if (!editingExpense) return;

    const { data, error } = await supabase
      .from("transactions")
      .update(expenseData)
      .eq("id", editingExpense.id)
      .select();

    if (error) {
      toast({ title: "Error", description: error.message });
    } else {
      const updated = data![0];
      setExpenses((prev) =>
        prev.map((exp) =>
          exp.id === editingExpense.id ? normalizeExpense(updated) : exp
        )
      );
      setEditingExpense(null);
      toast({ title: "Updated", description: "Transaction updated!" });
    }
  };

  // -----------------------
  // Delete expense
  // -----------------------
  const handleDeleteExpense = async (id: string) => {
    const { error } = await supabase.from("transactions").delete().eq("id", id);

    if (error) {
      toast({ title: "Error", description: error.message });
    } else {
      setExpenses((prev) => prev.filter((exp) => exp.id !== id));
      toast({ title: "Deleted", description: "Transaction deleted!" });
    }
  };

  // -----------------------
  // Export to CSV
  // -----------------------
  const exportToCsv = () => {
    const headers = [
      "Date",
      "Type",
      "Category",
      "Description",
      "Amount",
      "Tags",
    ];
    const csvData = [
      headers,
      ...filteredExpenses.map((expense) => [
        expense.date,
        expense.type,
        expense.category,
        expense.description,
        expense.amount.toString(),
        Array.isArray(expense.tags) ? expense.tags.join(";") : "",// ✅ Safe join
      ]),
    ];

    const csvContent = csvData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "expenses.csv";
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Exported",
      description: "Transactions exported to CSV successfully",
    });
  };

  // -----------------------
  // Scroll for editing
  // -----------------------
  const handleEditClick = (expense: Expense) => {
    setEditingExpense(expense);
    setShowAddForm(false);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  // -----------------------
  // Render
  // -----------------------
  if (loadingUser)
    return <p className="text-center p-6 text-white">Loading...</p>;
  if (!user) return <AuthPage />; // redirect to login if not logged in

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={Logo} alt="App Logo" className="h-8 w-8" />
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
            <Button
              variant="destructive"
              size="sm"
              onClick={async () => await supabase.auth.signOut()}
            >
              Logout
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

        {/* Tabs */}
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

          {/* Overview */}
          <TabsContent value="overview" className="space-y-6">
            <ExpenseStats expenses={expenses} budgets={budgets} />
            <ExpenseCharts expenses={expenses} />

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

          {/* Transactions */}
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
                        : "Try adjusting your filters"}
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

          {/* Analytics */}
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
