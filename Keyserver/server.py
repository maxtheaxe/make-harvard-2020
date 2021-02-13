from flask import Flask, json
from datetime import datetime

app = Flask(__name__)

keys = {}
newest_key_id = 0

keyfile = 'keys.json'

date_format_string = '%m/%d/%Y'

def compare_date_strings(ds1, ds2):
    date1 = datetime.strptime(ds1, date_format_string)
    date2 = datetime.strptime(ds2, date_format_string)
    return date1 > date2

def get_newest_key(keys):
    return sorted(keys, cmp=lambda k1, k2: compare_date_strings(k1.date, k2.date))[0]

@app.before_first_request
def load_keys():
    data = json.load(keyfile)
    keys = data.keys
    uncompromised = filter(lambda key: not hasattr(key, 'compromised_date'), keys)
    priority_keys = filter(lambda key: hasattr(key, 'priority') and key.priority, uncompromised)
    if len(priority_keys) > 0:
        newest_key_id = get_newest_key(priority_keys).id
    elif len(uncompromised) > 0:
        newest_key_id = get_newest_key(uncompromised).id
    else:
        newest_key_id = get_newest_key(keys).id

@app.route('/key/<key_id>')
def get_key(id):
    for key in keys.values():
        if key.id == id:
            with open(key.public_keyfile) as public_keyfile:
                key_data = {key: public_keyfile.read()}
                if hasattr(key, 'compromised_date'):
                    key_data['compromised_date'] = key.compromised_date
                if key.id != newest_key_id:
                    key_data['superseded_by'] = newest_key_id
                return json.jsonify(key_data)
    abort(404)

@app.route('/latest')
def get_latest_key():
    return get_key(newest_key_id)
        

    