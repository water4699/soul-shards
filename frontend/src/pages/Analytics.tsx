import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ExpenseAnalysis from "@/components/ExpenseAnalysis";
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Activity,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  CheckCircle
} from "lucide-react";
import { useAccount, useChainId } from "wagmi";
import { useExpenseLog } from "@/hooks/useExpenseLog";
import { getContractAddress } from "@/abi/Addresses";
import { loadDecryptedEntries } from "@/lib/decryptionStorage";
import { getCategoryName, EXPENSE_CATEGORIES, getLevelLabel, getSatisfactionLabel } from "@/lib/expenseLabels";

interface ExpenseEntry {
  date: number;
  category: number;
  level: number;
  emotion: number;
  timestamp: number;
}

const Analytics: React.FC = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState("30d");
  const { isConnected, address } = useAccount();
  const chainId = useChainId();
  const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || getContractAddress(chainId);
  const { getAllEntries, entryCount } = useExpenseLog(CONTRACT_ADDRESS);
  const [decryptedEntries, setDecryptedEntries] = useState<Map<number, ExpenseEntry>>(new Map());

  // Load data
  useEffect(() => {
    if (isConnected && address && CONTRACT_ADDRESS) {
      const loadData = async () => {
        try {
          const today = new Date();
          const todayStr = today.toISOString().split('T')[0]?.replace(/-/g, '') || '';
          const todayNum = parseInt(todayStr) || 0;
          
          let daysAgo = 30;
          if (selectedTimeRange === "7d") daysAgo = 7;
          else if (selectedTimeRange === "30d") daysAgo = 30;
          else if (selectedTimeRange === "3m") daysAgo = 90;
          else if (selectedTimeRange === "1y") daysAgo = 365;

          const startDate = parseInt(new Date(today.getTime() - daysAgo * 24 * 60 * 60 * 1000).toISOString().split('T')[0]?.replace(/-/g, '') || '') || 0;
          
          await getAllEntries(startDate, todayNum);

          const loaded = loadDecryptedEntries(address, CONTRACT_ADDRESS);
          setDecryptedEntries(loaded);
        } catch (error) {
          console.error("Error loading analytics data:", error);
        }
      };
      loadData();
    }
  }, [isConnected, address, CONTRACT_ADDRESS, selectedTimeRange, entryCount]);

  // Calculate insights from real data
  const insights = useMemo(() => {
    const decryptedArray = Array.from(decryptedEntries.values());
    
    // Spending Trend
    let spendingTrend = "No Data";
    let trendChange = "N/A";
    let trendDescription = "Add entries to see spending trends";
    if (decryptedArray.length >= 2) {
      const sorted = decryptedArray.sort((a, b) => a.date - b.date);
      const firstHalf = sorted.slice(0, Math.floor(sorted.length / 2));
      const secondHalf = sorted.slice(Math.floor(sorted.length / 2));
      
      const avgFirst = firstHalf.reduce((sum, e) => sum + e.level, 0) / firstHalf.length;
      const avgSecond = secondHalf.reduce((sum, e) => sum + e.level, 0) / secondHalf.length;
      
      const change = ((avgSecond - avgFirst) / avgFirst) * 100;
      if (Math.abs(change) < 5) {
        spendingTrend = "Stable";
        trendChange = `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
        trendDescription = "Your spending has been consistent";
      } else if (change > 0) {
        spendingTrend = "Increasing";
        trendChange = `+${change.toFixed(1)}%`;
        trendDescription = "Your spending is trending upward";
      } else {
        spendingTrend = "Decreasing";
        trendChange = `${change.toFixed(1)}%`;
        trendDescription = "Your spending is trending downward";
      }
    }

    // Top Category
    let topCategory = "No Data";
    let topCategoryChange = "N/A";
    let topCategoryDescription = "Add entries to see category insights";
    if (decryptedArray.length > 0) {
      const categoryCount = new Map<number, number>();
      decryptedArray.forEach(entry => {
        categoryCount.set(entry.category, (categoryCount.get(entry.category) || 0) + 1);
      });
      
      const sortedCategories = Array.from(categoryCount.entries())
        .sort((a, b) => b[1] - a[1]);
      
      if (sortedCategories.length > 0) {
        const topCategoryEntry = sortedCategories[0];
        if (topCategoryEntry) {
          const [topCatId, count] = topCategoryEntry;
          const categoryName = EXPENSE_CATEGORIES[topCatId] || "Unknown";
          const spaceIndex = categoryName.indexOf(' ');
          topCategory = spaceIndex !== -1
            ? categoryName.substring(spaceIndex + 1).trim()
            : categoryName;
          topCategoryChange = `${count} entries`;
          topCategoryDescription = `Most frequent category with ${count} ${count === 1 ? 'entry' : 'entries'}`;
        }
      }
    }

    // Transaction Frequency
    let frequency = "0/week";
    let frequencyChange = "No data";
    let frequencyDescription = "Average transactions per week";
    if (decryptedArray.length > 0) {
      const sorted = decryptedArray.sort((a, b) => a.date - b.date);
      const firstEntry = sorted[0];
      const lastEntry = sorted[sorted.length - 1];
      if (firstEntry && lastEntry) {
        const firstDate = new Date(firstEntry.date * 86400000);
        const lastDate = new Date(lastEntry.date * 86400000);
        const daysDiff = Math.max(1, Math.ceil((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)));
        const weeks = daysDiff / 7;
        const perWeek = weeks > 0 ? (decryptedArray.length / weeks).toFixed(1) : decryptedArray.length.toFixed(1);
        frequency = `${perWeek}/week`;
        frequencyChange = `${decryptedArray.length} total`;
        frequencyDescription = `Average of ${perWeek} transactions per week`;
      }
    }

    return [
      {
        title: "Spending Trend",
        value: spendingTrend,
        change: trendChange,
        description: trendDescription,
        icon: TrendingUp,
        color: spendingTrend === "No Data" ? "text-gray-500" : spendingTrend === "Stable" ? "text-green-500" : spendingTrend === "Increasing" ? "text-orange-500" : "text-blue-500"
      },
      {
        title: "Top Category",
        value: topCategory,
        change: topCategoryChange,
        description: topCategoryDescription,
        icon: PieChart,
        color: "text-blue-500"
      },
      {
        title: "Transaction Frequency",
        value: frequency,
        change: frequencyChange,
        description: frequencyDescription,
        icon: Activity,
        color: "text-purple-500"
      },
      {
        title: "Privacy Score",
        value: "High",
        change: "Encrypted",
        description: "Your data remains fully encrypted",
        icon: CheckCircle,
        color: "text-green-500"
      }
    ];
  }, [decryptedEntries]);

  const timeRanges = [
    { label: "Last 7 days", value: "7d" },
    { label: "Last 30 days", value: "30d" },
    { label: "Last 3 months", value: "3m" },
    { label: "Last year", value: "1y" }
  ];

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Deep insights into your encrypted expense data
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Time Range Selector */}
      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium">Time Range:</span>
              <div className="flex space-x-1">
                {timeRanges.map((range) => (
                  <Button
                    key={range.value}
                    variant={selectedTimeRange === range.value ? "default" : "outline"}
                    size="sm"
                    className="h-8"
                    onClick={() => setSelectedTimeRange(range.value)}
                  >
                    {range.label}
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="mr-2 h-4 w-4" />
              Updated: Just now
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insights Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {insights.map((insight, index) => {
          const Icon = insight.icon;
          return (
            <Card key={insight.title} className="stats-card animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Icon className={`h-8 w-8 ${insight.color}`} />
                  <span className="text-xs text-muted-foreground">{insight.change}</span>
                </div>
                <div>
                  <p className="text-2xl font-bold">{insight.value}</p>
                  <p className="text-sm font-medium text-muted-foreground">{insight.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{insight.description}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Analysis Content */}
      <ExpenseAnalysis timeRange={selectedTimeRange} />

      {/* Additional Analytics Sections */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Category Breakdown */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="mr-2 h-5 w-5" />
              Category Breakdown
            </CardTitle>
            <CardDescription>
              Distribution of expenses by category
            </CardDescription>
          </CardHeader>
          <CardContent>
            {(() => {
              const decryptedArray = Array.from(decryptedEntries.values());
              if (decryptedArray.length === 0) {
                return (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <PieChart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
                      <p className="text-muted-foreground">
                        Add expense entries to see your category breakdown
                      </p>
                    </div>
                  </div>
                );
              }

              const categoryCount = new Map<number, number>();
              decryptedArray.forEach(entry => {
                categoryCount.set(entry.category, (categoryCount.get(entry.category) || 0) + 1);
              });

              const categoryData = Array.from(categoryCount.entries())
                .map(([category, count]) => ({
                  name: getCategoryName(category),
                  value: count,
                  percentage: ((count / decryptedArray.length) * 100).toFixed(1)
                }))
                .sort((a, b) => b.value - a.value);

              return (
                <div className="space-y-4">
                  {categoryData.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{item.name}</span>
                        <span className="text-sm text-muted-foreground">{item.value} entries ({item.percentage}%)</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-500"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </CardContent>
        </Card>

        {/* Spending Trends */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5" />
              Spending Trends
            </CardTitle>
            <CardDescription>
              Track your spending patterns over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            {(() => {
              const decryptedArray = Array.from(decryptedEntries.values());
              if (decryptedArray.length === 0) {
                return (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Trend Data</h3>
                      <p className="text-muted-foreground">
                        Trends will appear as you add more entries
                      </p>
                    </div>
                  </div>
                );
              }

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
                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                  }
                }
                // Fallback: try to parse as days since epoch
                try {
                  const date = new Date(dateNum * 86400000);
                  if (!isNaN(date.getTime())) {
                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                  }
                } catch (e) {
                  // Ignore
                }
                return 'Invalid Date';
              };

              const trendData = decryptedArray
                .sort((a, b) => a.date - b.date)
                .map((entry, index) => ({
                  index: index + 1,
                  date: formatDate(entry.date),
                  level: entry.level,
                  levelLabel: getLevelLabel(entry.level),
                  emotion: entry.emotion,
                  satisfactionLabel: getSatisfactionLabel(entry.emotion)
                }));

              return (
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground mb-4">
                    {trendData.length} entries tracked over time
                  </div>
                  <div className="space-y-3">
                    {trendData.slice(-5).map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 rounded-full bg-primary" />
                          <span className="text-sm font-medium">{item.date}</span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="text-muted-foreground">Level: <span className="font-medium">{item.levelLabel}</span></span>
                          <span className="text-muted-foreground">Satisfaction: <span className="font-medium">{item.satisfactionLabel}</span></span>
                        </div>
                      </div>
                    ))}
                    {trendData.length > 5 && (
                      <p className="text-xs text-muted-foreground text-center">
                        Showing last 5 entries. Total: {trendData.length} entries
                      </p>
                    )}
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      </div>

      {/* Data Quality Indicator */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
            Data Privacy & Quality
          </CardTitle>
          <CardDescription>
            Your encrypted data quality metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="font-medium">Encryption Status</p>
                <p className="text-sm text-muted-foreground">All data encrypted with FHE</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="font-medium">Data Integrity</p>
                <p className="text-sm text-muted-foreground">Blockchain-verified entries</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div>
                <p className="font-medium">Sample Size</p>
                <p className="text-sm text-muted-foreground">More data needed for insights</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;