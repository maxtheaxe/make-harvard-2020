from flask import Flask, request, config_file, json
from datetime import datetime
from ..keygrabber import grab_key

app = Flask(__name__)

@app.route('/verify', methods=['POST'])
def verify():
    patient_data = json.loads(request.form['patient_data'])
    vaccine_signature = patient_data['vaccine_signature']
    patient_clinic_url = patient_data['clinic_url']
    patient_gov_url = patient_data['gov_url']
    gov_public_key, gov_compromised = grab_key(patient_gov_url)
    clinic_public_key, clinic_compromised = grab_key(patient_clinic_url)
    return json.dumps({
        'patient_name': get_patient_name(vaccine_signature),
        'signatures_ok': validate_signatures(vaccine_signature, gov_public_key, clinic_public_key),
        'gov_compromised': gov_compromised,
        'clinic_compromised': clinic_compromised
    })
