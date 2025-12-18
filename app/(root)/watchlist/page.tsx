import WatchlistTable from "@/components/WatchlistTable";
import { getWatchlist } from "@/lib/actions/watchlist.actions";

const Watchlist = async () => {
  const watchlistData = await getWatchlist();

  return (
    <div className="flex min-h-screen p-4 md:p-6 lg:p-8">
      <WatchlistTable watchlist={watchlistData} />
    </div>
  );
};

export default Watchlist;
