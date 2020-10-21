import json
import requests

from django.contrib.auth import authenticate, login, logout
from django.core.paginator import Paginator
from django.db import IntegrityError
from django.http import JsonResponse
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import redirect, render

from ..models import User

def oxfordEntryToLinguiEntry(entry):
	return {
		"word": entry["word"],
		"definition": entry["results"][0]["lexicalEntries"][0]["entries"][0]["senses"][0]["definitions"][0]
	}

def search_for_word(request, word):
	app_id: "4a7b8083"
	app_key: "09fd090f4447176a113d44ca173d445b"

	language_code = "en-gb"
	endpoint = "entries"
	url = "https://od-api.oxforddictionaries.com/api/v2/" + endpoint + "/" + language_code + "/" + word.lower()
	url = url + "?"
	url = url + "fields=definitions,examples"
	# r = requests.get(url, headers = {"app_id": app_id, "app_key": app_key})
	r = requests.get(url, headers = {"app_id": "4a7b8083", "app_key": "09fd090f4447176a113d44ca173d445b"})
	
	# print(oxfordEntryToLinguiEntry(r.json()))
	# print("code {}\n".format(r.status_code))
	# print("text \n" + r.text)
	# print("json \n" + json.dumps(r.json()))
	return JsonResponse(oxfordEntryToLinguiEntry(r.json()), status=200)