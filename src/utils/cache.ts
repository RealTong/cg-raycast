import { fetchPriceChange } from "./cg-api";
import { withCache } from "@raycast/utils";


export const cachedPriceChange = withCache(async () => {
  const priceChangeData = await fetchPriceChange();
  if (priceChangeData && priceChangeData.data) {
    return priceChangeData.data;
  }
}, {
  // This function will be called every 15 seconds
  maxAge: 15 * 100,
});