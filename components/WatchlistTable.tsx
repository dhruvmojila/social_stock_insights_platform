"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { WATCHLIST_TABLE_HEADER } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { removeFromWatchlist } from "@/lib/actions/watchlist.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { formatTimeAgo } from "@/lib/utils";

interface WatchlistTableProps {
  watchlist: any[];
}

const WatchlistTable = ({ watchlist }: WatchlistTableProps) => {
  const router = useRouter();

  const handleRemove = async (symbol: string) => {
    try {
      const result = await removeFromWatchlist(symbol);
      if (result.success) {
        toast.success(`${symbol} removed from watchlist`);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to remove");
      }
    } catch (error) {
      toast.error("Failed to remove from watchlist");
    }
  };

  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow>
            {WATCHLIST_TABLE_HEADER.map((header) => (
              <TableHead key={header} className="text-left">
                {header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {watchlist.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={WATCHLIST_TABLE_HEADER.length}
                className="text-center py-8 text-muted-foreground"
              >
                Your watchlist is empty. Add stocks using the search command
                (Cmd+K).
              </TableCell>
            </TableRow>
          ) : (
            watchlist.map((row) => (
              <TableRow key={row.symbol}>
                <TableCell className="text-left font-medium">
                  {row.company}
                </TableCell>
                <TableCell className="text-left">{row.symbol}</TableCell>
                <TableCell className="text-left">-</TableCell>
                <TableCell className="text-left">-</TableCell>
                <TableCell className="text-left">-</TableCell>
                <TableCell className="text-left">-</TableCell>
                <TableCell className="text-left">
                  {row.addedAt
                    ? formatTimeAgo(new Date(row.addedAt).getTime() / 1000)
                    : "-"}
                </TableCell>
                <TableCell className="text-left">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemove(row.symbol)}
                    className="hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default WatchlistTable;
