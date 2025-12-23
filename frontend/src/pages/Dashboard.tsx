import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAccount, useChainId } from "wagmi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus,
  TrendingUp,
  Shield,
  Activity,
  BarChart3,
  History,
  Lock,
  ArrowRight,
  Zap,
  PieChart,
  Calendar,
  DollarSign,
  RefreshCw
} from "lucide-react";
import { useExpenseLog } from "@/hooks/useExpenseLog";
import { getContractAddress } from "@/abi/Addresses";
import { loadDecryptedEntries } from "@/lib/decryptionStorage";
import { getLevelLabel } from "@/lib/expenseLabels";

interface ExpenseEntry {
  date: number;
  category: number;
  level: number;
  emotion: number;
  timestamp: number;
}

// Helper function to get amount from level (approximate)
const getAmountFromLevel = (level: number): number => {
  const ranges: Record<number, number> = {
    1: 5,    // Very Low (<$10) -> $5
    2: 20,   // Low ($10-$30) -> $20
    3: 40,   // Moderate Low ($30-$50) -> $40
    4: 75,   // Moderate ($50-$100) -> $75
    5: 150,  // Medium ($100-$200) -> $150
    6: 250,  // Moderate High ($200-$300) -> $250
    7: 400,  // High ($300-$500) -> $400
    8: 750,  // Very High ($500-$1000) -> $750
    9: 1500, // Extremely High ($1000-$2000) -> $1500
    10: 2500, // Maximum (>$2000) -> $2500
  };
  return ranges[level] || 0;
};

const Dashboard: React.FC = () => {
  const { isConnected, address } = useAccount();
  const chainId = useChainId();
  const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || getContractAddress(chainId);
  
  const { entryCount, getAllEntries, isLoading } = useExpenseLog(CONTRACT_ADDRESS);
  const [entries, setEntries] = useState<ExpenseEntry[]>([]);
  const [decryptedEntries, setDecryptedEntries] = useState<Map<number, ExpenseEntry>>(new Map());
  const [refreshing, setRefreshing] = useState(false);

  // Load entries and decrypted data
  const loadData = async () => {
    if (!isConnected || !CONTRACT_ADDRESS || !address) return;
    
    setRefreshing(true);
    try {
      // Load entries for last 90 days
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0]?.replace(/-/g, '') || '';
      const todayNum = parseInt(todayStr) || 0;

      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(today.getDate() - 90);
      const startDateStr = ninetyDaysAgo.toISOString().split('T')[0]?.replace(/-/g, '') || '';
      const startDate = parseInt(startDateStr) || 0;

      const allEntries = await getAllEntries(startDate, todayNum);
      setEntries(allEntries);

      // Load decrypted entries from localStorage
      const loaded = loadDecryptedEntries(address, CONTRACT_ADDRESS);
      setDecryptedEntries(loaded);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // Load data on mount and when dependencies change
  useEffect(() => {
    if (isConnected && address && CONTRACT_ADDRESS) {
      loadData();
    }
  }, [isConnected, address, CONTRACT_ADDRESS, entryCount]);

  // Also reload decrypted entries when they change (from other components or localStorage)
  useEffect(() => {
    if (isConnected && address && CONTRACT_ADDRESS) {
      const loaded = loadDecryptedEntries(address, CONTRACT_ADDRESS);
      setDecryptedEntries(loaded);
    }
  }, [isConnected, address, CONTRACT_ADDRESS]);

  // Poll for decrypted entries changes (when user decrypts in other tabs/components)
  useEffect(() => {
    if (!isConnected || !address || !CONTRACT_ADDRESS) return;
    
    let lastDecryptedSize = decryptedEntries.size;
    let lastEntryCount = entryCount;
    
    const interval = setInterval(() => {
      const loaded = loadDecryptedEntries(address, CONTRACT_ADDRESS);
      if (loaded.size !== lastDecryptedSize) {
        lastDecryptedSize = loaded.size;
        setDecryptedEntries(loaded);
      }
      // Also reload entries if count changed
      if (entryCount !== lastEntryCount) {
        lastEntryCount = entryCount;
        loadData();
      }
    }, 2000); // Check every 2 seconds

    return () => clearInterval(interval);
  }, [isConnected, address, CONTRACT_ADDRESS]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalEntries = entryCount;
    
    // Get current month entries
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const thisMonthEntries = entries.filter(entry => {
      const entryDate = new Date(entry.date * 86400000);
      return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
    });

    // Calculate this month's total (using decrypted data)
    let thisMonthTotal = 0;
    let thisMonthDecryptedCount = 0;
    
    thisMonthEntries.forEach(entry => {
      const decrypted = decryptedEntries.get(entry.date);
      if (decrypted) {
        thisMonthTotal += getAmountFromLevel(decrypted.level);
        thisMonthDecryptedCount++;
      }
    });

    // Calculate average per entry (using all decrypted entries)
    let totalAmount = 0;
    let decryptedCount = 0;
    
    entries.forEach(entry => {
      const decrypted = decryptedEntries.get(entry.date);
      if (decrypted) {
        totalAmount += getAmountFromLevel(decrypted.level);
        decryptedCount++;
      }
    });

    const avgPerEntry = decryptedCount > 0 ? totalAmount / decryptedCount : 0;

    return [
      {
        title: "Total Entries",
        value: totalEntries.toString(),
        change: `${entries.length} loaded`,
        icon: Activity,
        color: "text-blue-500"
      },
      {
        title: "This Month",
        value: `$${thisMonthTotal.toFixed(2)}`,
        change: thisMonthDecryptedCount > 0 ? `${thisMonthDecryptedCount} decrypted` : "Decrypt to view",
        icon: DollarSign,
        color: "text-green-500"
      },
      {
        title: "Avg. per Entry",
        value: `$${avgPerEntry.toFixed(2)}`,
        change: decryptedCount > 0 ? `${decryptedCount} decrypted` : "Decrypt to view",
        icon: TrendingUp,
        color: "text-purple-500"
      },
      {
        title: "Privacy Level",
        value: "High",
        change: "Encrypted",
        icon: Shield,
        color: "text-green-500"
      }
    ];
  }, [entryCount, entries, decryptedEntries]);

  const quickActions = [
    {
      title: "Add New Entry",
      description: "Record a new encrypted expense",
      icon: Plus,
      href: "/add-entry",
      color: "bg-blue-500 hover:bg-blue-600"
    },
    {
      title: "View Analytics",
      description: "Analyze your spending patterns",
      icon: BarChart3,
      href: "/analytics",
      color: "bg-purple-500 hover:bg-purple-600"
    },
    {
      title: "Transaction History",
      description: "Browse all your entries",
      icon: History,
      href: "/history",
      color: "bg-green-500 hover:bg-green-600"
    }
  ];

  const features = [
    {
      icon: Lock,
      title: "Fully Homomorphic Encryption",
      description: "Your data is encrypted end-to-end and can be analyzed without decryption."
    },
    {
      icon: Zap,
      title: "Real-time Analysis",
      description: "Get instant insights into your spending patterns with encrypted computation."
    },
    {
      icon: PieChart,
      title: "Category Insights",
      description: "Understand your spending by categories with privacy-preserving analytics."
    },
    {
      icon: Calendar,
      title: "Time-based Trends",
      description: "Track spending trends over time with secure temporal analysis."
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Welcome Section */}
      <div className="hero-gradient rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div className="relative z-10">
            <h1 className="text-4xl font-bold mb-2 drop-shadow-lg">Welcome to Soul Shards</h1>
            <p className="text-xl opacity-90 mb-4 drop-shadow-md">
              Your private expense analysis platform powered by FHE
            </p>
            {isConnected && (
              <p className="text-sm opacity-90 drop-shadow-sm">
                Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
              </p>
            )}
          </div>
          <div className="hidden md:block">
            <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center">
              <Shield className="w-12 h-12" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Statistics</h2>
        <Button
          onClick={loadData}
          variant="outline"
          size="sm"
          disabled={isLoading || refreshing}
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${(isLoading || refreshing) ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="stats-card animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
                  </div>
                  <Icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link key={action.title} to={action.href}>
                <Card className="feature-card cursor-pointer group">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold mb-2">{action.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{action.description}</p>
                    <div className="flex items-center text-sm font-medium text-primary group-hover:text-primary/80">
                      Get started
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Features */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Why Choose Soul Shards?</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="feature-card">
                <CardContent className="p-6">
                  <Icon className="h-8 w-8 text-primary mb-4" />
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="mr-2 h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>Your latest encrypted transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No recent activity</h3>
              <p className="text-muted-foreground mb-4">
                Your encrypted expense entries will appear here once you start adding them.
              </p>
              <Link to="/add-entry">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Entry
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {entries
                .sort((a, b) => b.timestamp - a.timestamp)
                .slice(0, 5)
                .map((entry) => {
                  const decrypted = decryptedEntries.get(entry.date);
                  const entryDate = new Date(entry.timestamp * 1000);
                  
                  return (
                    <div
                      key={entry.date}
                      className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Activity className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {decrypted ? `Entry - ${getLevelLabel(decrypted.level)}` : "Encrypted Entry"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {entryDate.toLocaleDateString()} at {entryDate.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {decrypted ? (
                          <div className="text-sm">
                            <p className="font-medium">${getAmountFromLevel(decrypted.level).toFixed(2)}</p>
                            <p className="text-xs text-muted-foreground">Decrypted</p>
                          </div>
                        ) : (
                          <div className="text-sm">
                            <Lock className="h-4 w-4 text-muted-foreground inline mr-1" />
                            <span className="text-muted-foreground">Encrypted</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              {entries.length > 5 && (
                <div className="text-center pt-4">
                  <Link to="/history">
                    <Button variant="outline" size="sm">
                      View All Entries
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
