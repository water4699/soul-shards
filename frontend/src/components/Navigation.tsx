import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Home,
  Plus,
  BarChart3,
  Settings,
  ChevronRight,
  Shield
} from "lucide-react";

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  active?: boolean;
}

interface NavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
  onSettingsOpen: () => void;
}

const Navigation: React.FC<NavigationProps> = ({
  currentView,
  onViewChange,
  onSettingsOpen,
}) => {
  const navItems: NavigationItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <Home className="h-5 w-5" />,
      active: currentView === "dashboard",
    },
    {
      id: "add-entry",
      label: "Add Entry",
      icon: <Plus className="h-5 w-5" />,
      active: currentView === "add-entry",
    },
    {
      id: "history",
      label: "History",
      icon: <Shield className="h-5 w-5" />,
      active: currentView === "history",
    },
    {
      id: "analysis",
      label: "Analysis",
      icon: <BarChart3 className="h-5 w-5" />,
      active: currentView === "analysis",
    },
  ];

  return (
    <Card variant="glass" className="p-2 shadow-web3">
      <nav className="flex flex-col space-y-1">
        {navItems.map((item) => (
          <Button
            key={item.id}
            variant={item.active ? "web3" : "ghost"}
            className={`justify-start gap-3 h-12 px-4 ${
              item.active
                ? "shadow-web3"
                : "hover:bg-white/5 hover:border-white/10"
            }`}
            onClick={() => onViewChange(item.id)}
          >
            {item.icon}
            <span className="font-medium">{item.label}</span>
            {item.active && <ChevronRight className="h-4 w-4 ml-auto" />}
          </Button>
        ))}

        <div className="border-t border-white/10 my-2"></div>

        <Button
          variant="ghost"
          className="justify-start gap-3 h-12 px-4 hover:bg-white/5 hover:border-white/10"
          onClick={onSettingsOpen}
        >
          <Settings className="h-5 w-5" />
          <span className="font-medium">Settings</span>
        </Button>
      </nav>
    </Card>
  );
};

export default Navigation;
