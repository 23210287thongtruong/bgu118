import os
from dotenv import load_dotenv

load_dotenv()

GOLD_API_KEY = os.getenv("GOLD_API_KEY")
BITCOIN_API_KEY = os.getenv("BITCOIN_API_KEY")
