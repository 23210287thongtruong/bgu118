import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import { ClipLoader } from "react-spinners";
import {
  useGoldPrices,
  useLatestGoldPrice,
  useBitcoinPrices,
  useLatestBitcoinPrice,
  useExchangeRates,
  useLatestExchangeRate,
  usePostAssetsPrices,
  usePostExchangeRates,
} from "./api";
import { AssetPrice, ExchangeRate } from "./interfaces";
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

const processData = (
  data: AssetPrice[] | ExchangeRate[],
  dateKey: string,
  valueKey: string
) => {
  const labels = data?.map((point) =>
    new Date((point as Record<string, any>)[dateKey])
      .toLocaleString("en-GB", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      })
      .replace(",", "")
  );
  const values = data?.map((point) => (point as Record<string, any>)[valueKey]);
  return { labels, values };
};

function App() {
  const [priceType, setPriceType] = useState<"usd_price" | "vnd_price">(
    "usd_price"
  );
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [goldDateRange, setGoldDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1),
    endDate: new Date(new Date().setDate(new Date().getDate() + 1)),
  });
  const [bitcoinDateRange, setBitcoinDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1),
    endDate: new Date(new Date().setDate(new Date().getDate() + 1)),
  });
  const [exchangeRateDateRange, setExchangeRateDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1),
    endDate: new Date(new Date().setDate(new Date().getDate() + 1)),
  });

  // Fetch data
  const { data: goldPrices, isLoading: isLoadingGold } = useGoldPrices(
    goldDateRange.startDate,
    goldDateRange.endDate
  );
  const { data: latestGoldPrice } = useLatestGoldPrice();

  const { data: bitcoinPrices, isLoading: isLoadingBitcoin } = useBitcoinPrices(
    bitcoinDateRange.startDate,
    bitcoinDateRange.endDate
  );
  const { data: latestBitcoinPrice } = useLatestBitcoinPrice();

  const { data: exchangeRates, isLoading: isLoadingExchangeRates } =
    useExchangeRates(
      exchangeRateDateRange.startDate,
      exchangeRateDateRange.endDate
    );
  const { data: latestExchangeRate } = useLatestExchangeRate();

  // Mutations
  const postAssetsPrices = usePostAssetsPrices();
  const postExchangeRates = usePostExchangeRates();

  // Process data
  const { labels: goldLabels, values: goldData } = processData(
    goldPrices as AssetPrice[],
    "price_recorded_at",
    priceType
  );
  const { labels: bitcoinLabels, values: bitcoinData } = processData(
    bitcoinPrices as AssetPrice[],
    "price_recorded_at",
    priceType
  );
  const { labels: exchangeLabels, values: exchangeData } = processData(
    exchangeRates as ExchangeRate[],
    "recorded_at",
    "usd_to_vnd"
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

  const LatestPrice = ({
    title,
    price,
    priceType,
  }: {
    title: string;
    price: number | undefined;
    priceType: "usd_price" | "vnd_price";
  }) => (
    <div className="text-center">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-2xl text-green-600 font-bold">
        {price !== null
          ? `${price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${priceType === "usd_price" ? "USD" : "VND"}`
          : "N/A"}
      </p>
    </div>
  );

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <LatestPrice
            title="Latest Gold Price"
            price={latestGoldPrice?.[priceType]}
            priceType={priceType}
          />
          <div className="flex justify-between mb-2">
            <div className="flex flex-col">
              <label className="mb-1">From:</label>
              <DatePicker
                selected={goldDateRange.startDate}
                onChange={(date) =>
                  setGoldDateRange((prev) => ({
                    ...prev,
                    startDate: date as Date,
                  }))
                }
                selectsStart
                startDate={goldDateRange.startDate}
                endDate={goldDateRange.endDate}
                className="p-2 border rounded"
              />
            </div>
            <div className="flex flex-col">
              <label className="mb-1">To:</label>
              <DatePicker
                selected={goldDateRange.endDate}
                onChange={(date) =>
                  setGoldDateRange((prev) => ({
                    ...prev,
                    endDate: date as Date,
                  }))
                }
                selectsEnd
                startDate={goldDateRange.startDate}
                endDate={goldDateRange.endDate}
                className="p-2 border rounded"
              />
            </div>
          </div>
          {isLoadingGold ? (
            <div className="flex justify-center items-center h-64">
              <ClipLoader size={50} color={"#123abc"} loading={isLoadingGold} />
            </div>
          ) : (
            <Line
              height={300}
              data={createChartData(
                goldLabels || [],
                goldData || [],
                "Gold Price",
                "gold"
              )}
            />
          )}
        </div>

        <div>
          <LatestPrice
            title="Latest Bitcoin Price"
            price={latestBitcoinPrice?.[priceType]}
            priceType={priceType}
          />
          <div className="flex justify-between mb-2">
            <div className="flex flex-col">
              <label className="mb-1">From:</label>
              <DatePicker
                selected={bitcoinDateRange.startDate}
                onChange={(date) =>
                  setBitcoinDateRange((prev) => ({
                    ...prev,
                    startDate: date as Date,
                  }))
                }
                selectsStart
                startDate={bitcoinDateRange.startDate}
                endDate={bitcoinDateRange.endDate}
                className="p-2 border rounded"
              />
            </div>
            <div className="flex flex-col">
              <label className="mb-1">To:</label>
              <DatePicker
                selected={bitcoinDateRange.endDate}
                onChange={(date) =>
                  setBitcoinDateRange((prev) => ({
                    ...prev,
                    endDate: date as Date,
                  }))
                }
                selectsEnd
                startDate={bitcoinDateRange.startDate}
                endDate={bitcoinDateRange.endDate}
                className="p-2 border rounded"
              />
            </div>
          </div>
          {isLoadingBitcoin ? (
            <div className="flex justify-center items-center h-64">
              <ClipLoader
                size={50}
                color={"#123abc"}
                loading={isLoadingBitcoin}
              />
            </div>
          ) : (
            <Line
              height={300}
              data={createChartData(
                bitcoinLabels || [],
                bitcoinData || [],
                "Bitcoin Price",
                "blue"
              )}
            />
          )}
        </div>

        <div>
          <LatestPrice
            title="Latest Exchange Rate"
            price={latestExchangeRate?.usd_to_vnd}
            priceType="usd_price"
          />
          <div className="flex justify-between mb-2">
            <div className="flex flex-col">
              <label className="mb-1">From:</label>
              <DatePicker
                selected={exchangeRateDateRange.startDate}
                onChange={(date) =>
                  setExchangeRateDateRange((prev) => ({
                    ...prev,
                    startDate: date as Date,
                  }))
                }
                selectsStart
                startDate={exchangeRateDateRange.startDate}
                endDate={exchangeRateDateRange.endDate}
                className="p-2 border rounded"
              />
            </div>
            <div className="flex flex-col">
              <label className="mb-1">To:</label>
              <DatePicker
                selected={exchangeRateDateRange.endDate}
                onChange={(date) =>
                  setExchangeRateDateRange((prev) => ({
                    ...prev,
                    endDate: date as Date,
                  }))
                }
                selectsEnd
                startDate={exchangeRateDateRange.startDate}
                endDate={exchangeRateDateRange.endDate}
                className="p-2 border rounded"
              />
            </div>
          </div>
          {isLoadingExchangeRates ? (
            <div className="flex justify-center items-center h-64">
              <ClipLoader
                size={50}
                color={"#123abc"}
                loading={isLoadingExchangeRates}
              />
            </div>
          ) : (
            <Line
              height={300}
              data={createChartData(
                exchangeLabels || [],
                exchangeData || [],
                "USD to VND",
                "green"
              )}
            />
          )}
        </div>
      </div>
      <div className="flex mt-4">
        <button
          className={`bg-blue-500 text-white p-2 rounded flex items-center ${isButtonDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
          onClick={() => {
            postAssetsPrices.mutate();
            postExchangeRates.mutate();
            setIsButtonDisabled(true);
          }}
          disabled={isButtonDisabled}
        >
          {isButtonDisabled && (
            <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
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
