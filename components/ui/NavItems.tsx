"use client";

import { NAV_ITEMS } from "@/lib/constants";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SearchCommand } from "@/components/SearchCommand";

const NavItems = ({
  initialStocks,
}: {
  initialStocks: StockWithWatchlistStatus[];
}) => {
  const pathname = usePathname();
  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };
  return (
    <ul className="flex flex-col sm:flex-row gap-3 p-2 sm:gap-10 font-medium">
      {NAV_ITEMS.map((item) => {
        if (item.label === "Search") {
          return (
            <li key={item.href}>
              <SearchCommand
                label="Search"
                initialStocks={initialStocks}
                renderAs="text"
              />
            </li>
          );
        }
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              className={`hover:text-yellow-500 transition-colors ${
                isActive(item.href) ? "text-gray-100" : ""
              }`}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
};

export default NavItems;
