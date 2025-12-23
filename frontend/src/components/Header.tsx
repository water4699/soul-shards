import React from "react";
import { Link } from "react-router-dom";
import { useTheme } from "@/hooks/useTheme";
import WalletConnect from "./WalletConnect";
import Logo from "./Logo";
import { Button } from "./ui/button";
import { Settings, Moon, Sun, Monitor } from "lucide-react";

interface HeaderProps {
  onSettingsOpen: () => void;
}

const Header: React.FC<HeaderProps> = ({ onSettingsOpen }) => {
  const { theme, setTheme } = useTheme();

  const themeOptions = [
    { value: "light", icon: Sun, label: "Light" },
    { value: "dark", icon: Moon, label: "Dark" },
    { value: "system", icon: Monitor, label: "System" },
  ];

  return (
    <header className="border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-4">
            <Logo />
          </Link>

          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <div className="flex items-center space-x-1 border border-border rounded-lg p-1">
              {themeOptions.map(({ value, icon: Icon, label }) => (
                <Button
                  key={value}
                  variant={theme === value ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setTheme(value as any)}
                  className="h-8 w-8 p-0"
                  title={label}
                >
                  <Icon className="h-4 w-4" />
                </Button>
              ))}
            </div>

            {/* Settings */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onSettingsOpen}
              className="h-10 w-10"
            >
              <Settings className="h-5 w-5" />
            </Button>

            {/* Wallet */}
            <WalletConnect />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
