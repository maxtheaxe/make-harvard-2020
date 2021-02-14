# verifier.py - built for makeharvard 2021 by maxtheaxe
import pgpy
import json

def validate(pub_key, message):
	'''takes in message, pub key, returns whether message is signed by pub key'''
	# verify that message is actually signed
	if (message.is_signed == False):
		raise ValueError("message is not signed")
	try: # verify that signature was performed by given pub key
		return bool(pub_key.verify(message)) # return verification validity
	except PGPError: # in event that sig was performed by diff key
		return False # still not valid for our purposes

def get_vaccination_qr(patient_name, clinic_name, date, clinic_key):
	'''takes in patient name, clinic name, date, clinic priv key
	signs data and returns message as string'''
	# parse pgp stuff
	parsed_clinic_key, _ = pgpy.PGPKey.from_blob(clinic_key)
	# prepare data for json that will be signed
	qr_data = {
		"patient_name" : patient_name,
		"clinic_name" : clinic_name,
		"date" : date
	}
	# jsonify prepared data
	jsonified_qr_data = json.dumps(qr_data)
	# build new signed pgp message containing json qr data using parsed clinic key
	signed_qr = pgpy.PGPMessage.new(jsonified_qr_data)
	signed_qr |= parsed_clinic_key.sign(signed_qr)
	# return signed data as string
	return str(signed_qr)

def real_vax(signed_vax, clinic_key, witness_data, gov_key):
	'''takes in a signed vax, clinic key, witness, gov key and returns vax validity'''
	# parse signed message, load into dict
	signed_vax = pgpy.PGPMessage.from_blob(signed_vax)
	vax_info = json.loads(signed_vax.message)
	# parse other arguments
	clinic_key, _ = pgpy.PGPKey.from_blob(clinic_key)
	witness_data = pgpy.PGPMessage.from_blob(witness_data)
	gov_key, _ = pgpy.PGPKey.from_blob(gov_key)
	# parse key contained in witness data
	witnessed_key, _ = pgpy.PGPKey.from_blob(witness_data.message)
	# validate witness signature (should be signed by gov key)
	if (not validate(gov_key, witness_data)):
		return False
	# validate witnessed (signed) key matches clinic key
	if (str(clinic_key) != str(witnessed_key)):
		return False
	# verify clinic signature of vax is valid
	if (not validate(clinic_key, signed_vax)):
		return False
	return True

# given stuff from qr code, give patient's name
def get_patient_name(signed_vax):
	'''given a signed vax, return the patient's name'''
	# parse signed message, load into dict
	signed_vax = pgpy.PGPMessage.from_blob(signed_vax)
	vax_info = json.loads(signed_vax.message)
	return vax_info["patient_name"]