import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const fetchAssetPrices = async (asset_id: number) => {
  const { data } = await axios.get("/api/asset-prices", {
    params: { asset_id },
  });
  return data;
};

const fetchExchangeRates = async () => {
  const { data } = await axios.get("/api/exchange-rates");
  return data;
};

const postAssetsPrices = async () => {
  const { data } = await axios.post("/api/assets-prices");
  return data;
};

const postExchangeRates = async () => {
  const { data } = await axios.post("/api/exchange-rates");
  return data;
};

export const useAssetPrices = (asset_id: number) => {
  return useQuery({
    queryKey: ["assetPrices", asset_id],
    queryFn: () => fetchAssetPrices(asset_id),
  });
};

export const useExchangeRates = () => {
  return useQuery({ queryKey: ["exchangeRates"], queryFn: fetchExchangeRates });
};

export const usePostAssetsPrices = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postAssetsPrices,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assetPrices"] });
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
