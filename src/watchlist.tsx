import { Image, MenuBarExtra } from "@raycast/api";
import useWatchList from "./hooks/useWatchList";
import { IPriceChange } from "./types/cg/priceChange";
import { WatchListItem } from "./types";
import { useCachedPromise, useCachedState } from "@raycast/utils";
import { fetchPriceChange } from "./utils/cg-api";
import { useMemo } from "react";

/**
 * https://developers.raycast.com/information/lifecycle/background-refresh
 * @constructor
 */
export default function Command() {
  const { watchList } = useWatchList();
  const [priceChangeData, setPriceChangeData] = useCachedState<IPriceChange[]>("priceChangeData", []);

  // 获取价格数据
  const { isLoading: priceLoading, error } = useCachedPromise(
    fetchPriceChange,
    [],
    {
      onData(data) {
        if (data?.data) {
          setPriceChangeData(data.data);
        }
      },
      // 每分钟自动刷新
      keepPreviousData: true,
      execute: true,
    }
  );

  // 合并 watchList 和价格数据（使用 useMemo 优化性能）
  const enrichedWatchList = useMemo(() => {
    if (!watchList || watchList.length === 0) {
      return [];
    }

    // 创建价格数据的 Map 以提高查找性能
    const priceMap = new Map(
      priceChangeData.map(item => [item.symbol, item])
    );

    // 返回新的数组，不修改原始数据
    return watchList.map((item): WatchListItem => {
      const priceInfo = priceMap.get(item.symbol);

      return {
        ...item,
        price: priceInfo?.price ?? 0,
        h24PriceChangePercent: priceInfo?.h24PriceChangePercent ?? 0,
        iconUrl: priceInfo?.symbolLogo || item.iconUrl || ""
      };
    });
  }, [watchList, priceChangeData]);

  // 获取当前显示的币种（第一个）
  const currentTicker = enrichedWatchList[0];

  // 格式化价格显示
  const formatPrice = (price: number | undefined): string => {
    if (!price || price === 0) return "0.00";
    // 如果价格小于 1，显示更多小数位
    if (price < 1) return price.toFixed(4);
    if (price < 100) return price.toFixed(3);
    return price.toFixed(2);
  };

  // 格式化百分比
  const formatPercent = (percent: number | undefined): string => {
    if (!percent) return "0.00";
    const formatted = percent.toFixed(2);
    return percent > 0 ? `+${formatted}` : formatted;
  };

  // 生成标题
  const getTitle = (): string => {
    if (!currentTicker) return "No Tickers";

    const price = formatPrice(currentTicker.price);
    const percent = formatPercent(currentTicker.h24PriceChangePercent);

    return `${currentTicker.symbol} $${price} (${percent}%)`;
  };

  // 获取图标
  const getIcon = () => {
    if (!currentTicker?.iconUrl) {
      return { source: "cryptocurrency-icon.png", mask: Image.Mask.Circle };
    }
    return { source: currentTicker.iconUrl, mask: Image.Mask.Circle };
  };

  // 决定加载状态
  const isLoading = (enrichedWatchList.length > 0 && priceLoading);

  // 处理点击事件
  const handleTickerClick = (ticker: WatchListItem) => {
    console.log(`Opening ${ticker.symbol} details...`);
    // 可以添加打开详情页面的逻辑
    // open(`https://www.coingecko.com/en/coins/${ticker.symbol.toLowerCase()}`);
  };

  return (
    <MenuBarExtra
      isLoading={isLoading}
      icon={getIcon()}
      title={getTitle()}
      tooltip={error ? "Failed to load price data" : undefined}
    >
      {/* 错误提示 */}
      {error && (
        <MenuBarExtra.Item
          title="⚠️ Failed to load price data"
          onAction={() => console.log(error)}
        />
      )}

      {/* 空状态处理 */}
      {enrichedWatchList.length === 0 && !isLoading && (
        <MenuBarExtra.Item
          title="No tickers in watchlist"
          subtitle="Add tickers from the main command"
        />
      )}

      {/* 币种列表 */}
      {enrichedWatchList.map((ticker, index) => {
        const price = formatPrice(ticker.price);
        const percent = formatPercent(ticker.h24PriceChangePercent);
        const percentColor = ticker.h24PriceChangePercent ? "🟢" : "🔴";

        return (
          <MenuBarExtra.Item
            key={`${ticker.symbol}-${index}`}
            title={`${ticker.symbol}`}
            subtitle={`$${price} ${percentColor} ${percent}%`}
            icon={{ source: ticker.iconUrl || "cryptocurrency-icon.png", mask: Image.Mask.Circle }}
            onAction={() => handleTickerClick(ticker)}
          />
        );
      })}

      {/* 分隔线 */}
      {enrichedWatchList.length > 0 && <MenuBarExtra.Separator />}

      {/* 刷新按钮 */}
      <MenuBarExtra.Item
        title="Refresh Prices"
        shortcut={{ modifiers: ["cmd"], key: "r" }}
        onAction={() => {
          // 触发重新获取数据
          // window.location.reload();
        }}
      />

      {/* 最后更新时间 */}
      {priceChangeData.length > 0 && (
        <MenuBarExtra.Item
          title={`Last updated: ${new Date().toLocaleTimeString()}`}
          tooltip="Price data update time"
        />
      )}
    </MenuBarExtra>
  );
}
