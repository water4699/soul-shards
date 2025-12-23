import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useExpenseLog } from "@/hooks/useExpenseLog";
import { Lock, Unlock, RefreshCw, FileText } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { useChainId } from "wagmi";
import { getContractAddress } from "@/abi/Addresses";
import {
  saveDecryptedEntries,
  loadDecryptedEntries,
  removeDecryptedEntry,
} from "@/lib/decryptionStorage";
import {
  getCategoryLabel,
  getLevelLabel,
  getSatisfactionLabel,
} from "@/lib/expenseLabels";

interface ExpenseEntry {
  date: number;
  category: number;
  level: number;
  emotion: number;
  timestamp: number;
}

const ExpenseHistory = () => {
  const chainId = useChainId();
  const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || getContractAddress(chainId);

  const { isConnected, address } = useAccount();
  const { entryCount, getAllEntries, decryptEntry, isLoading, message } = useExpenseLog(CONTRACT_ADDRESS);
  const [entries, setEntries] = useState<ExpenseEntry[]>([]);
  const [decryptedEntries, setDecryptedEntries] = useState<Map<number, ExpenseEntry>>(new Map());
  const [loadingDecrypt, setLoadingDecrypt] = useState<Set<number>>(new Set());

  // Load decrypted entries from localStorage on mount and when address/contract changes
  useEffect(() => {
    if (isConnected && address && CONTRACT_ADDRESS) {
      const loaded = loadDecryptedEntries(address, CONTRACT_ADDRESS);
      if (loaded.size > 0) {
        setDecryptedEntries(loaded);
        console.log(`[ExpenseHistory] Restored ${loaded.size} decrypted entries from storage`);
      }
    }
  }, [isConnected, address, CONTRACT_ADDRESS]);

  // Save decrypted entries to localStorage whenever they change
  useEffect(() => {
    if (isConnected && address && CONTRACT_ADDRESS && decryptedEntries.size > 0) {
      saveDecryptedEntries(address, CONTRACT_ADDRESS, decryptedEntries);
    }
  }, [decryptedEntries, isConnected, address, CONTRACT_ADDRESS]);

  const loadEntries = async () => {
    if (!isConnected || !CONTRACT_ADDRESS) {
      console.log("Cannot load entries - not connected or no contract address");
      return;
    }

    try {
      console.log("Loading entries for last 30 days...");
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0]?.replace(/-/g, '') || '';
      const todayNum = parseInt(todayStr) || 0;

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);
      const startDateStr = thirtyDaysAgo.toISOString().split('T')[0]?.replace(/-/g, '') || '';
      const startDate = parseInt(startDateStr) || 0;

      console.log("Date range:", startDate, "to", todayNum);

      if (startDate >= todayNum) {
        console.warn("Invalid date range for entry loading");
        return;
      }

      const allEntries = await getAllEntries(startDate, todayNum);
      console.log("Loaded entries:", allEntries.length);
      setEntries(allEntries);
    } catch (error: any) {
      console.error("Error loading entries:", error);
      // Don't show error to user if it's just missing data
      if (!error.message?.includes("Missing requirements")) {
        // Could show a user-friendly message here
      }
    }
  };

  useEffect(() => {
    if (isConnected) {
      loadEntries();
    }
  }, [isConnected, entryCount]);

  const handleDecrypt = async (date: number) => {
    if (decryptedEntries.has(date)) {
      // Already decrypted, remove it
      const newMap = new Map(decryptedEntries);
      newMap.delete(date);
      setDecryptedEntries(newMap);
      // Also remove from localStorage
      if (address && CONTRACT_ADDRESS) {
        removeDecryptedEntry(address, CONTRACT_ADDRESS, date);
      }
      return;
    }

    setLoadingDecrypt(new Set([...loadingDecrypt, date]));
    try {
      const entry = await decryptEntry(date);
      if (entry) {
        const newMap = new Map(decryptedEntries);
        newMap.set(date, entry);
        setDecryptedEntries(newMap);
        // Save to localStorage is handled by useEffect
      }
    } catch (error) {
      console.error("Error decrypting entry:", error);
    } finally {
      const newSet = new Set(loadingDecrypt);
      newSet.delete(date);
      setLoadingDecrypt(newSet);
    }
  };

  // Helper function to format date from YYYYMMDD number
  const formatDate = (dateNum: number): string => {
    const dateStr = dateNum.toString();
    if (dateStr.length === 8) {
      const year = dateStr.substring(0, 4);
      const month = dateStr.substring(4, 6);
      const day = dateStr.substring(6, 8);
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
      }
    }
    // Fallback: try to parse as days since epoch
    try {
      const date = new Date(dateNum * 86400000);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
      }
    } catch (e) {
      // Ignore
    }
    return 'Invalid Date';
  };

  return (
    <Card variant="glass" className="shadow-web3-lg">
      <CardHeader className="space-y-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-web3-blue/10 border border-web3-blue/20">
            <RefreshCw className="h-6 w-6 text-web3-blue" />
          </div>
          <div>
            <CardTitle className="text-3xl text-gradient">
              Expense History
            </CardTitle>
            <CardDescription className="text-base">
              View and decrypt your encrypted expense entries
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isConnected ? (
          <p className="text-muted-foreground">Please connect your wallet to view entries</p>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Total entries: {entryCount}
              </p>
              <Button
                onClick={loadEntries}
                variant="glass"
                size="sm"
                disabled={isLoading}
                className="hover:bg-primary/10"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>

            {message && (
              <div className={`rounded-lg p-4 ${
                message.includes("Error")
                  ? "bg-destructive/10 border border-destructive/20"
                  : "bg-muted/50"
              }`}>
                <p className={`text-sm ${
                  message.includes("Error")
                    ? "text-destructive"
                    : "text-foreground"
                }`}>{message}</p>
              </div>
            )}

            {entries.length === 0 ? (
              <EmptyState
                icon={<FileText className="h-8 w-8 text-muted-foreground" />}
                title="No expense entries yet"
                description="Your encrypted expense history will appear here once you add your first entry."
                action={
                  <Button
                    variant="web3"
                    onClick={() => document.querySelector('[data-testid="expense-form"]')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    Add Your First Entry
                  </Button>
                }
              />
            ) : (
              <div className="space-y-2">
                {entries.map((entry, index) => {
                  const decrypted = decryptedEntries.get(entry.date);
                  const isDecrypting = loadingDecrypt.has(entry.date);

                  return (
                    <div
                      key={entry.date}
                      className="glass-effect rounded-xl p-4 space-y-3 hover:bg-white/5 transition-colors animate-fade-in-up"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Date: {formatDate(entry.date)}</p>
                          <p className="text-xs text-muted-foreground">
                            Timestamp: {new Date(entry.timestamp * 1000).toLocaleString()}
                          </p>
                        </div>
                        <Button
                          onClick={() => handleDecrypt(entry.date)}
                          variant="glass"
                          size="sm"
                          disabled={isDecrypting}
                          className="hover:bg-web3-green/10 hover:border-web3-green/30"
                        >
                          {decrypted ? (
                            <>
                              <Unlock className="w-4 h-4 mr-2" />
                              Hide
                            </>
                          ) : (
                            <>
                              <Lock className="w-4 h-4 mr-2" />
                              {isDecrypting ? "Decrypting..." : "Decrypt"}
                            </>
                          )}
                        </Button>
                      </div>
                      {decrypted && (
                        <div className="mt-2 p-3 bg-muted/50 rounded space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-muted-foreground">Category:</span>
                            <span className="text-sm">{getCategoryLabel(decrypted.category)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-muted-foreground">Amount Level:</span>
                            <span className="text-sm">{getLevelLabel(decrypted.level)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-muted-foreground">Satisfaction:</span>
                            <span className="text-sm">{getSatisfactionLabel(decrypted.emotion)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ExpenseHistory;

