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
import React from "react";

const WatchlistTable = () => {
  const sampleData = [
    {
      company: "Apple Inc.",
      symbol: "AAPL",
      price: "$175.00",
      change: "+1.25%",
      marketCap: "$2.8T",
      peRatio: "28.5",
      alert: "Price > $180",
    },
    {
      company: "Microsoft Corp.",
      symbol: "MSFT",
      price: "$320.00",
      change: "-0.50%",
      marketCap: "$2.4T",
      peRatio: "32.1",
      alert: "None",
    },
    {
      company: "Tesla Inc.",
      symbol: "TSLA",
      price: "$240.00",
      change: "+2.10%",
      marketCap: "$750B",
      peRatio: "50.2",
      alert: "Price < $230",
    },
  ];

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
          {sampleData.map((row) => (
            <TableRow key={row.symbol}>
              <TableCell className="text-left font-medium">
                {row.company}
              </TableCell>
              <TableCell className="text-left">{row.symbol}</TableCell>
              <TableCell className="text-left">{row.price}</TableCell>
              <TableCell className="text-left text-green-500">
                {row.change}
              </TableCell>
              <TableCell className="text-left">{row.marketCap}</TableCell>
              <TableCell className="text-left">{row.peRatio}</TableCell>
              <TableCell className="text-left">{row.alert}</TableCell>
              <TableCell className="text-left">...</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default WatchlistTable;
