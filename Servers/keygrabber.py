import requests
from Flask import json

def grab_key(key_url):
    return json.loads(requests.get(key_url).text)
