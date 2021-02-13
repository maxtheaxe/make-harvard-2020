from flask import Flask, request, config_file, json
from datetime import datetime
import requests as download_from_web_requests

app = Flask(__name__)

config_path = 'config.json'
config = {}
private_key = []

@app.before_first_request
def load_config():
    global config
    global private_key
    with open(config_path) as config_file:
        config = json.load(config_file)
    with open(config['private_keyfile']) as private_keyfile:
        private_key = private_keyfile.read()

@app.route('/vaccinate', methods=['POST'])
def vaccinate():
    patient_name_with_signature = request.form['patient_name']
    patient_government_url = request.form['patient_gov_url']
    gov_public_key = download_from_web_requests.get(patient_government_url).text
    date = datetime.now().strftime(date_format_string)
    vaccination_dict = {} # get_vaccination_qr_dict (patient_name_with_signature, clinic_name, date, clinic_private_key, gov_public_key)
    vaccination_dict['clinic_key_url'] = f'{request.url_root}/key/{config['key_id']}'
    vaccination_dict['patient_government_url'] = patient_government_url
    return json.stringify(vaccination_dict)
