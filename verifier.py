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

def real_vax(patient_name, vax_info, gov_key, clinic_key):
	'''takes in gov and clinic pub keys, message, returns validity of vax'''
	# verify gov signature of patient name is valid
	if (not validate(gov_key, patient_name)):
		return False
	# parse vax info into dict
	parsed_vax_info = json.loads(vax_info.message)
	# grab clinic name as signed pgp message
	clinic_name = pgpy.PGPMessage.from_blob(parsed_vax_info["clinic_name"])
	# verify gov signature of clinic name is valid
	if (not validate(gov_key, clinic_name)):
		return False
	# verify clinic signature of vax info is valid
	if (not validate(clinic_key, vax_info)):
		return False
	# confirm given patient name matches name of patient who received vax
	if (patient_name.message != parsed_vax_info["patient_name"]):
		return False
	return True

def qr_info(signed_patient_name, clinic_name, date, clinic_key, gov_key):
	'''takes in signed patient name, clinic name, date, clinic priv key, gov pub key
	validates signatures, signs data and returns message as string'''
	# parse pgp stuff
	parsed_signed_patient_name = pgpy.PGPMessage.from_blob(signed_patient_name)
	parsed_gov_key, _ = pgpy.PGPKey.from_blob(gov_key)
	parsed_clinic_key, _ = pgpy.PGPKey.from_blob(clinic_key)
	# verify gov signature of patient name is valid
	if (not validate(parsed_gov_key, parsed_signed_patient_name)):
		raise RuntimeError("invalid patient name--signature check failed")
	# prepare data for json that will be signed
	qr_data = {
		"signed_patient_name" : signed_patient_name,
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


# given a dict of the type from prev func (and given clinic keys and gov keys)
# return bool