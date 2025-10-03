import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar, Plus, X } from "lucide-react";
import { Expense } from "./ExpenseCard";
import { useToast } from "@/hooks/use-toast";

interface ExpenseFormProps {
  onSubmit: (expense: Omit<Expense, "id">) => void;
  editingExpense?: Expense | null;
  onCancel?: () => void;
}

const categories = [
  "Food", "Transport", "Entertainment", "Utilities",
  "Healthcare", "Shopping", "Salary", "Freelance", "Other"
];

export function ExpenseForm({ onSubmit, editingExpense, onCancel }: ExpenseFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    amount: editingExpense?.amount.toString() || "",
    description: editingExpense?.description || "",
    category: editingExpense?.category || "",
    date: editingExpense?.date || new Date().toISOString().split("T")[0],
    type: (editingExpense?.type || "expense") as "expense" | "income",
    tags: editingExpense?.tags || []
  });
  const [newTag, setNewTag] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.amount || !formData.description || !formData.category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive"
      });
      return;
    }

    onSubmit({
      amount,
      description: formData.description,
      category: formData.category,
      date: formData.date,
      type: formData.type,
      tags: formData.tags
    });

    if (!editingExpense) {
      setFormData({
        amount: "",
        description: "",
        category: "",
        date: new Date().toISOString().split("T")[0],
        type: "expense",
        tags: []
      });
    }

    toast({
      title: "Success",
      description: `${formData.type === "expense" ? "Expense" : "Income"} ${editingExpense ? "updated" : "added"} successfully`
    });
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  return (
    <Card className="relative w-full max-w-2xl mx-auto bg-gradient-to-br from-card to-card/50">
      {/* Close button on top-right */}
      {onCancel && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="absolute top-2 right-2 h-7 w-7 p-0 hover:bg-destructive/20 hover:text-destructive"
        >
          <X className="h-4 w-4" />
        </Button>
      )}

      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          {editingExpense ? "Edit Transaction" : "Add New Transaction"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* transaction type + amount */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Transaction Type</Label>
              <RadioGroup
                value={formData.type}
                onValueChange={(value: "expense" | "income") =>
                  setFormData(prev => ({ ...prev, type: value }))
                }
                className="flex gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="expense" id="expense" />
                  <Label htmlFor="expense" className="text-expense font-medium">Expense</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="income" id="income" />
                  <Label htmlFor="income" className="text-success font-medium">Income</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                className="text-lg font-medium"
                required
              />
            </div>
          </div>

          {/* description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="What was this transaction for?"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="resize-none"
              rows={2}
              required
            />
          </div>

          {/* category + date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                required
              />
            </div>
          </div>

          {/* tags */}
          <div className="space-y-2">
            <Label>Tags (Optional)</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add a tag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag} variant="outline" size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    #{tag}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 ml-1"
                      onClick={() => removeTag(tag)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* actions */}
          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1 bg-gradient-to-r from-primary to-primary/80">
              {editingExpense ? "Update Transaction" : "Add Transaction"}
            </Button>
            {editingExpense && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
