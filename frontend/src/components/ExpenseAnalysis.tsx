import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useExpenseLog } from "@/hooks/useExpenseLog";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { TrendingUp, RefreshCw } from "lucide-react";
import { useChainId } from "wagmi";
import { getContractAddress } from "@/abi/Addresses";
import {
  saveDecryptedEntries,
  loadDecryptedEntries,
} from "@/lib/decryptionStorage";
import { getCategoryName } from "@/lib/expenseLabels";

// Helper function to format date from YYYYMMDD number
const formatDate = (dateNum: number | undefined): string => {
  if (dateNum === undefined || dateNum === null || isNaN(dateNum)) {
    return 'Invalid Date';
  }
  
  const dateStr = dateNum.toString();
  if (dateStr.length === 8) {
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  }
  // Fallback: try to parse as days since epoch
  try {
    const date = new Date(dateNum * 86400000);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  } catch (e) {
    // Ignore
  }
  return 'Invalid Date';
};

interface ExpenseAnalysisProps {
  timeRange?: string;
}

interface ExpenseEntry {
  date: number;
  category: number;
  level: number;
  emotion: number;
  timestamp: number;
}

const ExpenseAnalysis = ({ timeRange = "30d" }: ExpenseAnalysisProps) => {
  const chainId = useChainId();
  const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || getContractAddress(chainId);

  const { isConnected, address } = useAccount();
  const { getAllEntries, decryptEntry, isLoading } = useExpenseLog(CONTRACT_ADDRESS);
  const [entries, setEntries] = useState<ExpenseEntry[]>([]);
  const [decryptedEntries, setDecryptedEntries] = useState<Map<number, ExpenseEntry>>(new Map());
  const [categoryEmotionData, setCategoryEmotionData] = useState<any[]>([]);
  const [pressureTrendData, setPressureTrendData] = useState<any[]>([]);

  // Load decrypted entries from localStorage on mount
  useEffect(() => {
    if (isConnected && address && CONTRACT_ADDRESS) {
      const loaded = loadDecryptedEntries(address, CONTRACT_ADDRESS);
      if (loaded.size > 0) {
        setDecryptedEntries(loaded);
        console.log(`[ExpenseAnalysis] Restored ${loaded.size} decrypted entries from storage`);
        // Analysis will be triggered by the save effect when decryptedEntries is set
      }
    }
  }, [isConnected, address, CONTRACT_ADDRESS]);

  // Save decrypted entries to localStorage whenever they change
  useEffect(() => {
    if (isConnected && address && CONTRACT_ADDRESS && decryptedEntries.size > 0) {
      saveDecryptedEntries(address, CONTRACT_ADDRESS, decryptedEntries);
      // Re-analyze when decrypted entries change
      analyzeDecryptedData(decryptedEntries);
    }
  }, [decryptedEntries, isConnected, address, CONTRACT_ADDRESS]);

  // Analyze decrypted data and update charts
  const analyzeDecryptedData = (decryptedMap: Map<number, ExpenseEntry>) => {
    const decryptedArray = Array.from(decryptedMap.values());

    // Analyze category-emotion correlation
    const categoryEmotionMap = new Map<number, { total: number; count: number }>();
    decryptedArray.forEach((entry) => {
      if (!categoryEmotionMap.has(entry.category)) {
        categoryEmotionMap.set(entry.category, { total: 0, count: 0 });
      }
      const data = categoryEmotionMap.get(entry.category)!;
      data.total += entry.emotion;
      data.count += 1;
    });

    const categoryData = Array.from(categoryEmotionMap.entries())
      .map(([category, data]) => ({
        category: getCategoryName(category),
        avgEmotion: data.count > 0 ? (data.total / data.count).toFixed(2) : 0,
        count: data.count,
      }))
      .sort((a, b) => parseFloat(String(b.avgEmotion)) - parseFloat(String(a.avgEmotion)));

    setCategoryEmotionData(categoryData);

    // Analyze expense pressure trend (level over time)
    // Filter out entries without valid date
    const validEntries = decryptedArray.filter(entry => entry && entry.date !== undefined && !isNaN(entry.date));
    const trendData = validEntries
      .sort((a, b) => a.date - b.date)
      .map((entry) => ({
        date: formatDate(entry.date),
        level: entry.level,
        emotion: entry.emotion,
      }));

    setPressureTrendData(trendData);

    // Calculate emotion-level correlation coefficient
    if (decryptedArray.length >= 2) {
      const n = decryptedArray.length;
      const sumX = decryptedArray.reduce((sum, entry) => sum + entry.emotion, 0);
      const sumY = decryptedArray.reduce((sum, entry) => sum + entry.level, 0);
      const sumXY = decryptedArray.reduce((sum, entry) => sum + entry.emotion * entry.level, 0);
      const sumX2 = decryptedArray.reduce((sum, entry) => sum + entry.emotion * entry.emotion, 0);
      const sumY2 = decryptedArray.reduce((sum, entry) => sum + entry.level * entry.level, 0);

      const numerator = n * sumXY - sumX * sumY;
      const denominatorX = Math.sqrt(n * sumX2 - sumX * sumX);
      const denominatorY = Math.sqrt(n * sumY2 - sumY * sumY);

      const correlation = denominatorX * denominatorY !== 0
        ? (numerator / (denominatorX * denominatorY)).toFixed(3)
        : "0.000";

      console.log(`Emotion-Level Correlation: ${correlation}`);
    }
  };

  const loadAndAnalyze = async () => {
    if (!isConnected || !CONTRACT_ADDRESS) {
      console.log("Cannot analyze - not connected or no contract address");
      return;
    }

    try {
      console.log("Loading data for analysis...");
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0]?.replace(/-/g, '') || '';
      const todayNum = parseInt(todayStr) || 0;

      // Calculate start date based on time range
      let daysAgo = 30; // default
      if (timeRange === "7d") daysAgo = 7;
      else if (timeRange === "30d") daysAgo = 30;
      else if (timeRange === "3m") daysAgo = 90;
      else if (timeRange === "1y") daysAgo = 365;

      const startDateObj = new Date();
      startDateObj.setDate(today.getDate() - daysAgo);
      const startDateStr = startDateObj.toISOString().split('T')[0]?.replace(/-/g, '') || '';
      const startDate = parseInt(startDateStr) || 0;

      console.log("Analysis date range:", startDate, "to", todayNum);
      const allEntries = await getAllEntries(startDate, todayNum);
      console.log("Loaded entries for analysis:", allEntries.length);
      setEntries(allEntries);

      // Load existing decrypted entries from localStorage first
      let decryptedMap = new Map<number, ExpenseEntry>();
      if (address && CONTRACT_ADDRESS) {
        decryptedMap = loadDecryptedEntries(address, CONTRACT_ADDRESS);
        console.log(`[ExpenseAnalysis] Loaded ${decryptedMap.size} cached decrypted entries`);
      }

      // Decrypt only entries that aren't already decrypted
      const entriesToDecrypt = allEntries.filter(entry => !decryptedMap.has(entry.date));
      console.log(`[ExpenseAnalysis] Need to decrypt ${entriesToDecrypt.length} new entries`);

      for (const entry of entriesToDecrypt) {
        try {
          console.log(`Decrypting entry for date ${entry.date}...`);
          const decrypted = await decryptEntry(entry.date);
          if (decrypted) {
            decryptedMap.set(entry.date, decrypted);
          }
        } catch (error) {
          console.warn(`Failed to decrypt entry for date ${entry.date}:`, error);
          // Continue with other entries
        }
      }

      setDecryptedEntries(decryptedMap);
      console.log(`[ExpenseAnalysis] Total decrypted entries: ${decryptedMap.size}`);

      // Analyze the decrypted data
      analyzeDecryptedData(decryptedMap);
    } catch (error) {
      console.error("Error loading analysis:", error);
    }
  };

  useEffect(() => {
    if (isConnected) {
      loadAndAnalyze();
    }
  }, [isConnected, timeRange]);

  const mostAffectingCategory = categoryEmotionData.length > 0 
    ? categoryEmotionData[0] 
    : null;

  return (
    <Card variant="web3" className="shadow-web3-lg">
      <CardHeader className="space-y-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-web3-orange/10 border border-web3-orange/20">
            <TrendingUp className="h-6 w-6 text-web3-orange" />
          </div>
          <div>
            <CardTitle className="text-3xl text-gradient">
              Expense Analysis
            </CardTitle>
            <CardDescription className="text-base">
              Analyze your encrypted expense data: category-emotion correlation and expense pressure trends
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {!isConnected ? (
          <p className="text-muted-foreground">Please connect your wallet to view analysis</p>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                <p>Found {entries.length} entries, analyzing {decryptedEntries.size} decrypted entries</p>
                {entries.length > decryptedEntries.size && (
                  <p className="text-xs text-orange-500">
                    Some entries couldn't be decrypted for analysis
                  </p>
                )}
              </div>
              <Button onClick={loadAndAnalyze} variant="outline" size="sm" disabled={isLoading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                Refresh Analysis
              </Button>
            </div>

            {entries.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No entries found. Add expense entries to see analysis.
              </p>
            ) : (
              <>
                {/* Category-Satisfaction Correlation */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Category-Satisfaction Correlation</h3>
                  {mostAffectingCategory && (
                    <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-medium">
                            Most Affecting Category: {mostAffectingCategory.category}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Average Satisfaction: {mostAffectingCategory.avgEmotion} (from {mostAffectingCategory.count} entries)
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  {categoryEmotionData.length > 0 && (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={categoryEmotionData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="category" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="avgEmotion" fill="hsl(var(--primary))" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>

                {/* Expense Pressure Trend */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Expense Trend Analysis</h3>
                  {pressureTrendData.length > 0 && (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={pressureTrendData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="level" stroke="hsl(var(--primary))" strokeWidth={2} name="Amount Level" />
                        <Line type="monotone" dataKey="emotion" stroke="hsl(var(--destructive))" strokeWidth={2} name="Satisfaction" />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Blue line: Expense Amount Level (1-10), Red line: Satisfaction (1-5)
                  </p>
                </div>
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ExpenseAnalysis;

