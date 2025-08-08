import { useFetch } from "@raycast/utils";
import { CGResponse } from "../types/cg";
import { CG_BASE_URL } from "../config";

export default function useCgAPI<T>(
  endpoint: string
) {
  const BASE_URL = CG_BASE_URL.endsWith("/") ? CG_BASE_URL.slice(0, -1): CG_BASE_URL
  if (!endpoint.startsWith("/")) {
    endpoint = `/${endpoint}`;
  }
  const { data, error, isLoading } = useFetch<T>(`${BASE_URL}${endpoint}`, {
    keepPreviousData: true,
    execute: true,
    parseResponse: async (response) => {
      if (!response.ok) {
        throw new Error(`Error fetching data from ${endpoint}: ${response.statusText}`);
      }
      const data = await response.json() as CGResponse<T>;
      if (!data.success) {
        throw new Error(`Error in API response: ${data.message}`);
      }
      return data.data;
    }
  });
  return {
    data,
    error,
    isLoading
  };

}