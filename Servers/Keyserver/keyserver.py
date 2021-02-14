from flask import Flask, json, abort
from datetime import datetime
from functools import cmp_to_key

app = Flask(__name__)

keys = {}
newest_key_id = 0

keyfile_path = 'keys.json'

date_format_string = '%m/%d/%Y'

def compare_date_strings(ds1, ds2):
    date1 = datetime.strptime(ds1, date_format_string)
    date2 = datetime.strptime(ds2, date_format_string)
    return date1 > date2

def get_newest_key(keys):
    return sorted(keys, key=cmp_to_key(lambda k1, k2: compare_date_strings(k1['date'], k2['date'])))[0]

@app.before_first_request
def load_keys():
    global keys
    global newest_key_id
    with open(keyfile_path) as keyfile:
        data = json.load(keyfile)
        keys = data['keys']
        uncompromised = list(filter(lambda key: 'compromised_date' not in key, keys))
        priority_keys = list(filter(lambda key: 'priority' in key and key.priority, uncompromised))
        if len(priority_keys) > 0:
            newest_key_id = get_newest_key(priority_keys)['id']
        elif len(uncompromised) > 0:
            newest_key_id = get_newest_key(uncompromised)['id']
        else:
            newest_key_id = get_newest_key(keys)['id']

@app.route('/key/<key_id>')
def get_key(key_id):
    for key in keys:
        if key['id'] == key_id:
            with open(key['public_keyfile']) as public_keyfile:
                key_data = {'key': public_keyfile.read().strip('\n'), 'date': key['date']}
                if 'compromise_date' in key:
                    key_data['compromise_date'] = key['compromise_date']
                if key['id'] != newest_key_id:
                    key_data['superseded_by'] = newest_key_id
                if 'witness' in key and 'witness_url' in key:
                    with open(key['witness']) as witness_file:
                        key_data['witness'] = witness_file.read().strip('\n')
                        key_data['witness_url'] = key['witness_url']
                return json.jsonify(key_data)
    abort(404)

@app.route('/latest_id')
def get_latest_key():
    return newest_key_id
        

    