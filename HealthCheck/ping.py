import requests
from requests.exceptions import HTTPError 


try:
    health = requests.get("https://playcalling-engine.onrender.com/health", timeout = (10,10))
    health.raise_for_status()
    print("Status: ", health)
except HTTPError as http_err:
    print(f"HTTP error occurred: {http_err}")
