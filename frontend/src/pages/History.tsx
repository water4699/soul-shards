import React from "react";
import ExpenseHistory from "@/components/ExpenseHistory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Download,
  RefreshCw,
  EyeOff,
  Eye,
  History as HistoryIcon
} from "lucide-react";

// Helper function to get amount from level
const getAmountFromLevel = (level: number): number => {
  const ranges: Record<number, number> = {
    1: 5, 2: 20, 3: 40, 4: 75, 5: 150, 6: 250, 7: 400, 8: 750, 9: 1500, 10: 2500,
  };
  return ranges[level] || 0;
};

const HistoryPage: React.FC = () => {

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Transaction History</h1>
          <p className="text-muted-foreground mt-1">
            View and manage all your encrypted expense entries
          </p>
        </div>
        <div className="flex items-center space-x-3">
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


      {/* History Content */}
      <ExpenseHistory />

      {/* Additional Features */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Stats */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Most Active Day</span>
              <span className="text-sm font-medium">No data</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Average Interval</span>
              <span className="text-sm font-medium">No data</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Longest Streak</span>
              <span className="text-sm font-medium">0 days</span>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Info */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Privacy & Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <EyeOff className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">End-to-End Encrypted</p>
                <p className="text-xs text-muted-foreground">FHE protection</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <HistoryIcon className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Immutable Records</p>
                <p className="text-xs text-muted-foreground">Blockchain stored</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Eye className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Owner-Only Access</p>
                <p className="text-xs text-muted-foreground">Private keys required</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <HistoryIcon className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No recent activity</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HistoryPage;