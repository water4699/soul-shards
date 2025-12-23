import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { config } from './lib/wagmi';
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import History from "./pages/History";
import Settings from "./pages/SettingsPage";
import AddEntry from "./pages/AddEntry";
import Layout from "./components/Layout";
import SettingsPanel from "./components/SettingsPanel";
import { ThemeProvider } from "./hooks/useTheme";
import { useState } from "react";
import "./App.css";

const queryClient = new QueryClient();

const App = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="soul-shards-theme">
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider
            locale="en"
            modalSize="compact"
            theme={darkTheme({
              accentColor: 'hsl(217.2, 91.2%, 59.8%)',
              accentColorForeground: 'hsl(210, 40%, 98%)',
              borderRadius: 'large',
            })}
          >
            <Router>
              <Routes>
                <Route element={<Layout onSettingsOpen={() => setSettingsOpen(true)} />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/add-entry" element={<AddEntry />} />
                  <Route path="/history" element={<History />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="*" element={<Dashboard />} />
                </Route>
              </Routes>
              <SettingsPanel isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
            </Router>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  );
};

export default App;

