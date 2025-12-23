import React from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Plus,
  History,
  BarChart3,
  Shield,
  FileText,
  Lock
} from "lucide-react";

const Sidebar: React.FC = () => {
  const navigationItems = [
    {
      name: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
      description: "Overview & quick actions"
    },
    {
      name: "Add Entry",
      href: "/add-entry",
      icon: Plus,
      description: "Record new expense"
    },
    {
      name: "History",
      href: "/history",
      icon: History,
      description: "Transaction history"
    },
    {
      name: "Analytics",
      href: "/analytics",
      icon: BarChart3,
      description: "Data analysis & insights"
    }
  ];

  const quickActions = [
    {
      name: "Privacy",
      href: "/privacy",
      icon: Shield,
      description: "Privacy settings"
    },
    {
      name: "Reports",
      href: "/reports",
      icon: FileText,
      description: "Generate reports"
    }
  ];

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-card border-r border-border overflow-y-auto z-10">
      <nav className="p-4 space-y-8">
        {/* Main Navigation */}
        <div>
          <h2 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Navigation
          </h2>
          <div className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    )
                  }
                >
                  <Icon className="mr-3 h-5 w-5" />
                  <div>
                    <div>{item.name}</div>
                    <div className="text-xs opacity-70">{item.description}</div>
                  </div>
                </NavLink>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Quick Actions
          </h2>
          <div className="space-y-1">
            {quickActions.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    )
                  }
                >
                  <Icon className="mr-3 h-5 w-5" />
                  <div>
                    <div>{item.name}</div>
                    <div className="text-xs opacity-70">{item.description}</div>
                  </div>
                </NavLink>
              );
            })}
          </div>
        </div>

        {/* Stats Preview */}
        <div className="px-3">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Quick Stats
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">This Month</span>
              <span className="font-medium">$0.00</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total Entries</span>
              <span className="font-medium">0</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Privacy Score</span>
              <div className="flex items-center">
                <Lock className="h-3 w-3 text-green-500 mr-1" />
                <span className="font-medium text-green-600">High</span>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
