import { showFailureToast } from "@raycast/utils";
import { WatchListItem } from "../types";
import { LocalStorage } from "@raycast/api";
import { useEffect, useState } from "react";

export default function useWatchList() {
  const WATCHLIST_KEY = "watchList";
  // 初始状态设为 null，表示还未加载
  const [watchList, setWatchList] = useState<WatchListItem[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadWatchList = async () => {
      try {
        const rawWatchlist = await LocalStorage.getItem<string>(WATCHLIST_KEY);
        let storedList: WatchListItem[] = [];

        if (rawWatchlist) {
          storedList = JSON.parse(rawWatchlist);
        }

        // 如果存储为空，使用默认值
        if (storedList.length === 0) {
          storedList = [{
            symbol: "BTC",
            iconUrl: "https://cdn.coinglasscdn.com/static/img/coins/bitcoin-BTC.png",
            index: 0,
            price: 0,
            h24PriceChangePercent: 0
          }];
          // 保存默认值到 LocalStorage
          await LocalStorage.setItem(WATCHLIST_KEY, JSON.stringify(storedList));
        }

        setWatchList(storedList);
      } catch {
        showFailureToast("Failed to load watchlist");
        // 出错时使用默认值
        setWatchList([{
          symbol: "BTC",
          iconUrl: "https://cdn.coinglasscdn.com/static/img/coins/bitcoin-BTC.png",
          index: 0,
          price: 0,
          h24PriceChangePercent: 0
        }]);
      } finally {
        setIsLoading(false);
      }
    };

    loadWatchList();
  }, []);

  const isInWatchList = (symbol: string): boolean => {
    if (!watchList) return false;
    return watchList.some((item) => item.symbol === symbol);
  };

  const addTickerToWatchList = async (ticker: WatchListItem): Promise<void> => {
    if (!watchList) return;

    if (isInWatchList(ticker.symbol)) {
      showFailureToast("Ticker already in watchlist");
      return;
    }

    const updatedWatchList = [...watchList, ticker];
    setWatchList(updatedWatchList);
    await LocalStorage.setItem(WATCHLIST_KEY, JSON.stringify(updatedWatchList));
  };

  const removeTickerFromWatchList = async (symbol: string): Promise<void> => {
    if (!watchList) return;

    const updatedWatchList = watchList.filter((item) => item.symbol !== symbol);
    setWatchList(updatedWatchList);
    await LocalStorage.setItem(WATCHLIST_KEY, JSON.stringify(updatedWatchList));
  };

  return {
    watchList: watchList || [], // 返回空数组而不是 null
    isLoading,
    isInWatchList,
    addTickerToWatchList,
    removeTickerFromWatchList
  };
}
