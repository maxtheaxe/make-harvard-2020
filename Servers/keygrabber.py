import requests
from Flask import json

def grab_key(key_url):
    key = json.loads(requests.get(key_url).text)
    (return key['key'], 'compromise_date' in key)