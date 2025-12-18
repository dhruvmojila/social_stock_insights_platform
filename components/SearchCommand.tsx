"use client";

import * as React from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Loader2, Star, TrendingUp } from "lucide-react";
import Link from "next/link";
import { searchStocks } from "@/lib/actions/finnhub.actions";
import {
  addToWatchlist,
  removeFromWatchlist,
} from "@/lib/actions/watchlist.actions";
import { useDebounce } from "@/hooks/useDebounce";
import { toast } from "sonner";

export function SearchCommand({
  label = "Add Stock",
  initialStocks,
  renderAs = "button",
}: SearchCommandProps) {
  const [open, setOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [stocks, setStocks] =
    React.useState<StockWithWatchlistStatus[]>(initialStocks);

  const isSearchMode = !!searchTerm.trim();
  const displayStocks = isSearchMode ? stocks : stocks?.slice(0, 10);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSearch = async () => {
    if (!isSearchMode) return setStocks(initialStocks);
    setLoading(true);
    try {
      const response = await searchStocks(searchTerm.trim());
      setStocks(response);
    } catch (error) {
      setStocks([]);
      setLoading(false);
      console.error("Error fetching stocks:", error);
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = useDebounce(handleSearch, 300);

  React.useEffect(() => {
    debouncedSearch();
  }, [searchTerm]);

  const handleSelectStock = () => {
    setOpen(false);
    setSearchTerm("");
    setStocks(initialStocks);
  };

  const toggleWatchlist = async (
    e: React.MouseEvent,
    stock: StockWithWatchlistStatus
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const previousStocks = [...stocks];
    setStocks((prev) =>
      prev.map((s) =>
        s.symbol === stock.symbol
          ? { ...s, isInWatchlist: !s.isInWatchlist }
          : s
      )
    );

    try {
      if (stock.isInWatchlist) {
        const result = await removeFromWatchlist(stock.symbol);
        if (result.success) {
          toast.success(`${stock.symbol} removed from watchlist`);
        } else {
          throw new Error(result.error);
        }
      } else {
        const result = await addToWatchlist(stock.symbol, stock.name);
        if (result.success) {
          toast.success(`${stock.symbol} added to watchlist`);
        } else {
          throw new Error(result.error);
        }
      }
    } catch (error: any) {
      setStocks(previousStocks);
      toast.error(error?.message || "Failed to update watchlist");
      console.error(error);
    }
  };

  return (
    <>
      {renderAs === "text" ? (
        <span onClick={() => setOpen(true)} className="search-text">
          {label}
        </span>
      ) : (
        <Button onClick={() => setOpen(true)} className="search-btn">
          {label}
        </Button>
      )}
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        className="search-dialog"
      >
        <div className="search-field">
          <CommandInput
            placeholder="Search stocks..."
            value={searchTerm}
            onValueChange={setSearchTerm}
            className="search-input"
          />
          {loading && <Loader2 className="search-loader" />}
        </div>
        <CommandList className="search-list">
          {loading ? (
            <CommandEmpty className="search-list-empty">
              Loading...
            </CommandEmpty>
          ) : displayStocks?.length === 0 ? (
            <div className="search-list-indicator">
              {isSearchMode ? "No results found" : "No stocks available"}
            </div>
          ) : (
            <>
              <ul>
                <div className="search-count">
                  {isSearchMode ? "Search results" : "Top stocks"} (
                  {displayStocks?.length || 0})
                </div>
                {displayStocks?.map((stock, i) => (
                  <li key={stock.symbol} className="search-item">
                    <Link
                      onClick={handleSelectStock}
                      href={`/stocks/${stock.symbol}`}
                      className="search-item-link"
                    >
                      <TrendingUp className="h-4 w-4 text-gray-500" />
                      <div className="flex-1">
                        <div className="search-item-name">{stock.name}</div>
                        <div className="text-sm text-gray-500">
                          {stock.symbol} | {stock.exchange} | {stock.type}
                        </div>
                      </div>
                      <div
                        onClick={(e) => toggleWatchlist(e, stock)}
                        className="p-2 cursor-pointer hover:bg-muted rounded-full transition-colors"
                      >
                        <Star
                          className={`h-4 w-4 ${
                            stock.isInWatchlist
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-400"
                          }`}
                        />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
