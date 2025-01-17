export interface AssetPrice {
  asset_id: number;
  price_recorded_at: string;
  exchange_rate_recorded_at: string;
  usd_price: number;
  vnd_price: number;
}

export interface ExchangeRate {
  recorded_at: string;
  usd_to_vnd: number;
}
