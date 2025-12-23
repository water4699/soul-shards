import { useState } from "react";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useExpenseLog } from "@/hooks/useExpenseLog";
import { Lock, Plus } from "lucide-react";
import { useChainId } from "wagmi";
import { getContractAddress } from "@/abi/Addresses";

const ExpenseEntryForm = () => {
  const chainId = useChainId();
  const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || getContractAddress(chainId);

  const { isConnected } = useAccount();
  const { addEntry, isLoading, message } = useExpenseLog(CONTRACT_ADDRESS);
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0]?.replace(/-/g, '') || '';
  });
  const [category, setCategory] = useState("1");
  const [level, setLevel] = useState("1");
  const [emotion, setEmotion] = useState("1");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      alert("Please connect your wallet first");
      return;
    }

    if (!CONTRACT_ADDRESS) {
      alert("Contract address not configured for this network. Please check your network connection.");
      return;
    }

    const dateNum = parseInt(date);
    const categoryNum = parseInt(category);
    const levelNum = parseInt(level);
    const emotionNum = parseInt(emotion);

    if (!date || !category || !level || !emotion ||
        date.trim() === "" || category.trim() === "" ||
        level.trim() === "" || emotion.trim() === "") {
      alert("All fields are required");
      return;
    }

    if (isNaN(dateNum) || dateNum < 20240101 || dateNum > 20301231) {
      alert("Please enter a valid date in YYYYMMDD format");
      return;
    }

    if (isNaN(categoryNum) || categoryNum < 1 || categoryNum > 5) {
      alert("Category must be a number between 1 and 5");
      return;
    }
    if (isNaN(levelNum) || levelNum < 1 || levelNum > 10) {
      alert("Level must be a number between 1 and 10");
      return;
    }
    if (isNaN(emotionNum) || emotionNum < 1 || emotionNum > 5) {
      alert("Emotion must be a number between 1 and 5");
      return;
    }

    try {
      await addEntry(
        dateNum,
        categoryNum,
        levelNum,
        emotionNum
      );
      // Reset form
      setDate(() => {
        const today = new Date();
        return today.toISOString().split('T')[0]?.replace(/-/g, '') || '';
      });
      setCategory("1");
      setLevel("1");
      setEmotion("1");
    } catch (error: any) {
      console.error("Error adding entry:", error);
      const errorMessage = error?.message?.includes("Entry already exists")
        ? "An entry already exists for today. You can only add one entry per day."
        : error?.message?.includes("Invalid date")
        ? "Invalid date. Please ensure the date is valid."
        : error?.message || error?.reason || "Unknown error occurred";
      alert(`Failed to add entry: ${errorMessage}`);
    }
  };

  return (
    <Card variant="glass" className="shadow-web3-lg">
      <CardHeader className="space-y-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
            <Plus className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-3xl text-gradient">
              Add Expense Entry
            </CardTitle>
            <CardDescription className="text-base">
              Securely encrypt and record your expense data anonymously
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="date" className="text-sm font-semibold text-foreground">
              Date (YYYYMMDD)
            </Label>
            <Input
              id="date"
              type="number"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              placeholder="20241201"
              required
              className="glass-effect border-white/20 focus:border-primary/50 transition-colors"
            />
            <p className="text-xs text-muted-foreground/80">
              Enter the date in YYYYMMDD format (e.g., 20241201)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Expense Category</Label>
            <Select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="1">🍔 Food & Dining</option>
              <option value="2">🚗 Transportation</option>
              <option value="3">🛍️ Shopping & Entertainment</option>
              <option value="4">🏠 Housing & Utilities</option>
              <option value="5">🏥 Healthcare</option>
            </Select>
            <p className="text-xs text-muted-foreground">
              Select the expense category
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="level">Expense Amount Level</Label>
            <Select
              id="level"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              required
            >
              <option value="1">Very Low - Less than $10</option>
              <option value="2">Low - $10 - $30</option>
              <option value="3">Moderate Low - $30 - $50</option>
              <option value="4">Moderate - $50 - $100</option>
              <option value="5">Medium - $100 - $200</option>
              <option value="6">Moderate High - $200 - $300</option>
              <option value="7">High - $300 - $500</option>
              <option value="8">Very High - $500 - $1000</option>
              <option value="9">Extremely High - $1000 - $2000</option>
              <option value="10">Maximum - More than $2000</option>
            </Select>
            <p className="text-xs text-muted-foreground">
              Select the expense amount level
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="emotion">Satisfaction Level</Label>
            <Select
              id="emotion"
              value={emotion}
              onChange={(e) => setEmotion(e.target.value)}
              required
            >
              <option value="1">😊 Very Satisfied - Great Value</option>
              <option value="2">🙂 Satisfied - Met Expectations</option>
              <option value="3">😐 Neutral - Acceptable</option>
              <option value="4">😕 Dissatisfied - Some Regret</option>
              <option value="5">😞 Very Dissatisfied - Strong Regret</option>
            </Select>
            <p className="text-xs text-muted-foreground">
              Select your satisfaction level with this expense
            </p>
          </div>

          {message && (
            <div className={`rounded-lg p-4 ${
              message.includes("Error") || message.includes("Missing")
                ? "bg-destructive/10 border border-destructive/20"
                : "bg-muted/50"
            }`}>
              <p className={`text-sm ${
                message.includes("Error") || message.includes("Missing")
                  ? "text-destructive"
                  : "text-foreground"
              }`}>{message}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading || !isConnected}
            variant="web3"
            className="w-full gap-3 mt-6 shadow-web3 hover:shadow-web3-glow"
            size="lg"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span className="font-semibold">Encrypting & Adding...</span>
              </>
            ) : (
              <>
                <Lock className="w-5 h-5" />
                <span className="font-semibold">
                  {isConnected ? "Add Encrypted Entry" : "Connect Wallet First"}
                </span>
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ExpenseEntryForm;

