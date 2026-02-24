import requests
import os
from requests.exceptions import HTTPError 

url = os.getenv("HEALTH_URL")

if not url:
    print("Health URL doesn't exist")
else:
    try:
        health = requests.get(url, timeout = (10,10))
        health.raise_for_status()
        print("Status: ", health.json())
    except HTTPError as http_err:
        print(f"HTTP error occurred: {http_err}")
