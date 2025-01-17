import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AssetPrice, ExchangeRate } from "./interfaces";
import { formatDate } from "./utils";

const fetchGoldPrices = async (start_date: Date, end_date: Date) => {
  const start_date_formatted = formatDate(start_date);
  const end_date_formatted = formatDate(end_date);
  const { data } = await axios.get<AssetPrice[]>("/api/gold-prices", {
    params: { start_date: start_date_formatted, end_date: end_date_formatted },
  });
  return data;
};

const fetchLatestGoldPrice = async () => {
  const { data } = await axios.get<AssetPrice>("/api/gold-prices/latest");
  return data;
};

const fetchBitcoinPrices = async (start_date: Date, end_date: Date) => {
  const start_date_formatted = formatDate(start_date);
  const end_date_formatted = formatDate(end_date);
  const { data } = await axios.get<AssetPrice[]>("/api/bitcoin-prices", {
    params: { start_date: start_date_formatted, end_date: end_date_formatted },
  });
  return data;
};

const fetchLatestBitcoinPrice = async () => {
  const { data } = await axios.get<AssetPrice>("/api/bitcoin-prices/latest");
  return data;
};

const fetchExchangeRates = async (start_date: Date, end_date: Date) => {
  const start_date_formatted = formatDate(start_date);
  const end_date_formatted = formatDate(end_date);
  const { data } = await axios.get<ExchangeRate[]>("/api/exchange-rates", {
    params: { start_date: start_date_formatted, end_date: end_date_formatted },
  });
  return data;
};

const fetchLatestExchangeRate = async () => {
  const { data } = await axios.get<ExchangeRate>("/api/exchange-rates/latest");
  return data;
};

const postAssetsPrices = async () => {
  const { data } = await axios.post<{ message: string }>("/api/assets-prices");
  return data;
};

const postExchangeRates = async () => {
  const { data } = await axios.post<{ message: string }>("/api/exchange-rates");
  return data;
};

export const useGoldPrices = (start_date: Date, end_date: Date) => {
  return useQuery({
    queryKey: ["goldPrices", start_date, end_date],
    queryFn: () => fetchGoldPrices(start_date, end_date),
  });
};

export const useLatestGoldPrice = () => {
  return useQuery({
    queryKey: ["latestGoldPrice"],
    queryFn: fetchLatestGoldPrice,
  });
};

export const useBitcoinPrices = (start_date: Date, end_date: Date) => {
  return useQuery({
    queryKey: ["bitcoinPrices", start_date, end_date],
    queryFn: () => fetchBitcoinPrices(start_date, end_date),
  });
};

export const useLatestBitcoinPrice = () => {
  return useQuery({
    queryKey: ["latestBitcoinPrice"],
    queryFn: fetchLatestBitcoinPrice,
  });
};

export const useExchangeRates = (start_date: Date, end_date: Date) => {
  return useQuery({
    queryKey: ["exchangeRates", start_date, end_date],
    queryFn: () => fetchExchangeRates(start_date, end_date),
  });
};

export const useLatestExchangeRate = () => {
  return useQuery({
    queryKey: ["latestExchangeRate"],
    queryFn: fetchLatestExchangeRate,
  });
};

export const usePostAssetsPrices = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postAssetsPrices,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goldPrices"] });
      queryClient.invalidateQueries({ queryKey: ["bitcoinPrices"] });
    },
  });
};

export const usePostExchangeRates = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postExchangeRates,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exchangeRates"] });
    },
  });
};
