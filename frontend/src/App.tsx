import { useState, useEffect } from "react";
import {
  useAssetPrices,
  useExchangeRates,
  usePostAssetsPrices,
  usePostExchangeRates,
} from "./api";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

interface AssetPrice {
  asset_id: number;
  price_recorded_at: string;
  exchange_rate_recorded_at: string;
  usd_price: number;
  vnd_price: number;
}

interface ExchangeRate {
  recorded_at: string;
  usd_to_vnd: number;
}

const createChartData = (
  labels: string[],
  data: number[],
  label: string,
  color: string
) => ({
  labels,
  datasets: [
    {
      label,
      data,
      fill: false,
      borderColor: color,
      tension: 0.2,
    },
  ],
});

function App() {
  const [priceType, setPriceType] = useState<"usd_price" | "vnd_price">(
    "usd_price"
  );
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Fetch data
  const { data: goldPrices, isLoading: isLoadingGold } = useAssetPrices(1);
  const { data: bitcoinPrices, isLoading: isLoadingBitcoin } =
    useAssetPrices(2);
  const { data: exchangeRates, isLoading: isLoadingExchangeRates } =
    useExchangeRates();

  // Mutations
  const postAssetsPrices = usePostAssetsPrices();
  const postExchangeRates = usePostExchangeRates();

  // Combine loading states
  const isLoading = isLoadingGold || isLoadingBitcoin || isLoadingExchangeRates;

  // Get latest prices
  const latestGoldPrice =
    goldPrices?.[goldPrices.length - 1]?.[priceType] ?? null;
  const latestBitcoinPrice =
    bitcoinPrices?.[bitcoinPrices.length - 1]?.[priceType] ?? null;
  const latestExchangeRate =
    exchangeRates?.[exchangeRates.length - 1]?.usd_to_vnd ?? null;

  // Process Gold Price Data
  const goldLabels = goldPrices?.map(
    (point: AssetPrice) =>
      new Date(point.price_recorded_at).toLocaleString("en-GB", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).replace(",", "")
  );
  const goldData = goldPrices?.map((point: AssetPrice) => point[priceType]);

  // Process Bitcoin Price Data
  const bitcoinLabels = bitcoinPrices?.map(
    (point: AssetPrice) =>
      new Date(point.price_recorded_at).toLocaleString("en-GB", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).replace(",", "")
  );
  const bitcoinData = bitcoinPrices?.map(
    (point: AssetPrice) => point[priceType]
  );

  // Process Exchange Rate Data
  const exchangeLabels = exchangeRates?.map(
    (point: ExchangeRate) =>
      new Date(point.recorded_at).toLocaleString("en-GB", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).replace(",", "")
  );
  const exchangeData = exchangeRates?.map(
    (point: ExchangeRate) => point.usd_to_vnd
  );

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isButtonDisabled) {
      setCountdown(10);
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev === 1) {
            clearInterval(timer);
            setIsButtonDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isButtonDisabled]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Reusable Card component
  const Card = ({ title, value }: { title: string; value: number | null }) => (
    <div className="shadow-lg p-4 rounded text-center">
      <h2 className="text-4xl text-green-600 font-bold">
        {value !== null
          ? `${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${title !== "USD to VND" ? (priceType === "usd_price" ? "USD" : "VND") : "VND"}`
          : "N/A"}
      </h2>
      <p>{title}</p>
    </div>
  );

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Card title="Gold Price" value={latestGoldPrice} />
          <Line
            height={300}
            data={createChartData(goldLabels, goldData, "Gold Price", "gold")}
          />
        </div>
        <div>
          <Card title="Bitcoin Price" value={latestBitcoinPrice} />
          <Line
            height={300}
            data={createChartData(
              bitcoinLabels,
              bitcoinData,
              "Bitcoin Price",
              "blue"
            )}
          />
        </div>
        <div>
          <Card title="USD to VND" value={latestExchangeRate} />
          <Line
            height={300}
            data={createChartData(
              exchangeLabels,
              exchangeData,
              "USD to VND",
              "green"
            )}
          />
        </div>
      </div>
      <div className="flex mt-4">
        <button
          className={`bg-blue-500 text-white p-2 rounded flex items-center ${isButtonDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={() => {
            postAssetsPrices.mutate();
            postExchangeRates.mutate();
            setIsButtonDisabled(true);
          }}
          disabled={isButtonDisabled}
        >
          {isButtonDisabled && (
            <svg
              className="animate-spin h-5 w-5 mr-3"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          )}
          Refresh Prices {isButtonDisabled && `(${countdown}s)`}
        </button>
        <button
          className="bg-gray-500 text-white p-2 rounded ml-4"
          onClick={() =>
            setPriceType(priceType === "usd_price" ? "vnd_price" : "usd_price")
          }
        >
          Switch to {priceType === "usd_price" ? "VND Price" : "USD Price"}
        </button>
      </div>
    </div>
  );
}

export default App;