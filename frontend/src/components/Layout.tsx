import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { cn } from "@/lib/utils";

interface LayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  onSettingsOpen?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ className, onSettingsOpen, ...props }) => {
  return (
    <div className={cn("min-h-screen bg-background", className)} {...props}>
      <Header onSettingsOpen={onSettingsOpen || (() => {})} />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8" style={{ marginLeft: '256px' }}>
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
