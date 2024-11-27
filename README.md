# BGU118

A Python web application to track the prices of Bitcoin, gold, and USD.

## Project Structure

```
project/
├── app/                          # FastAPI application package
│   ├── main.py                   # Entry point for the application
│   ├── routers/                  # Routers for API endpoints
│   │   ├── gold_router.py        # Routes for gold price API
│   │   ├── bitcoin_router.py     # Routes for Bitcoin price API
│   │   ├── usd_router.py         # Routes for USD rate API
│   ├── services/                 # Business logic or external API handlers
│   │   ├── gold_service.py       # Fetch gold prices
│   │   ├── bitcoin_service.py    # Fetch Bitcoin prices
│   │   ├── usd_service.py        # Fetch USD rates
│   ├── utils/                    # Helper functions (optional)
│   │   ├── data_formatter.py     # Format data for display
│   ├── dependencies.py           # Dependency injection for services (optional)
├── tests/                        # Unit and integration tests
│   ├── test_gold.py              # Test cases for gold routes/services
│   ├── test_bitcoin.py           # Test cases for Bitcoin routes/services
│   ├── test_usd.py               # Test cases for USD routes/services
├── pyproject.toml                # Dependencies list
├── .env                          # Environment variables
└── README.md    
```

## Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/23210287thongtruong/bgu118
    ```
2. Navigate to the project directory:
    ```sh
    cd bgu118
    ```
3. Install the dependencies:
    ```sh
    uv sync
    ```

## Usage

Run the FastAPI application in local environment with:

```sh
uv run fastapi dev
```

To test the API, access the documentation at [http://localhost:8000/docs](http://localhost:8000/docs).

## Running Tests

To run the tests, use the following command:

```sh
pytest
```
