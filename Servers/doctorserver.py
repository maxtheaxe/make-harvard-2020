from flask import Flask, request, json
from datetime import datetime
from keygrabber import grab_key

from verifier import get_vaccination_qr

import smtplib
import email
from email.mime.base import MIMEBase
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import os

app = Flask(__name__)

config_path = 'config.json'
config = {}
private_key = ''

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
    date = datetime.now().strftime(config['date_format_string'])
    qr_data = json.dumps({
        'vaccine_signature': get_vaccination_qr (patient_name, config['clinic_name'], date, private_key),
        'clinic_url': f"{config['key_server']}{config['key_id']}"
    })
    if 'email' in request.form:
        send_email(request.form['email'], qr_data)
    return qr_data

def send_email(email, qr_data):
    with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server_ssl:
        server_ssl.ehlo()
        server_ssl.login('vaxportqr@gmail.com', 'BeatsHackHarvard')
        message = MIMEMultipart()
        message['From'] = 'vaxportqr@gmail.com'
        message['To'] = email
        message['Subject'] = 'Your COVID-19 vaccination verification'
        message.attach(MIMEText('Please find attached your COVID-19 vaccination verification QR code.', 'plain'))
        pyqrcode.create(qr_data).png('code.png', scale=2)
        with open('code.png', 'rb') as qr_attachment:
            part = MIMEBase('application', 'octet-stream')
            part.set_payload(qr_attachment.read())
            encoders.encode_base64(part)
            part.add_header('Content-Disposition', 'attachment; filename=code.png')
            message.attach(part)
        server_ssl.sendmail('vaxportqr@gmail.com', email, message.as_string())
        os.remove('code.png')


