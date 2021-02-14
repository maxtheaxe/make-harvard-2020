from flask import Flask, request, config_file, json
from datetime import datetime
from ..keygrabber import grab_key

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
    patient_data = json.loads(request.form['patient_data'])
    patient_name = patient_data['name']
    date = datetime.now().strftime(date_format_string)
    return json.dumps({
        'patient_data': get_vaccination_qr (patient_name, clinic_name, date, clinic_private_key),
        'clinic_url' = f'{request.url_root}/key/{config['key_id']}'
    })
