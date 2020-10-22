import json
import requests

from django.contrib.auth import authenticate, login, logout
from django.core.paginator import Paginator
from django.db import IntegrityError
from django.http import JsonResponse
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import redirect, render

from ..models import User

# Oxford Api details
oxford = {
	"headers": {"app_id": "4a7b8083", "app_key": "09fd090f4447176a113d44ca173d445b"},
	"language_code": "en-gb"
}
oxford_api_headers = {"app_id": "4a7b8083", "app_key": "09fd090f4447176a113d44ca173d445b"}

def oxfordEntryToLinguiEntry(entry):
	return {
		"word": entry["word"],
		"definition": entry["results"][0]["lexicalEntries"][0]["entries"][0]["senses"][0]["definitions"][0]
	}

def oxford_get_entry(word):
	endpoint = "entries"
	url = "https://od-api.oxforddictionaries.com/api/v2/" + endpoint + "/" + oxford["language_code"]+ "/" + word.lower()
	# url = url + "?fields=definitions"
	r = requests.get(url, headers = oxford_api_headers)
	if r.status_code == 200:
		entry = r.json()
		return {
			"word": entry["word"],
			"definition": entry["results"][0]["lexicalEntries"][0]["entries"][0]["senses"][0]["definitions"][0],
			"status_code": r.status_code
		}
	else:
		return {
			"error": "something went wrong",
			"status_code": r.status_code
		}

def oxford_entry(word):
	result = { "word": word }

	endpoint = "lemmas"
	url = "https://od-api.oxforddictionaries.com/api/v2/" + endpoint + "/" + "en" + "/" + word.lower()
	r = requests.get(url, headers = oxford_api_headers)
	if r.status_code == 200:
		lex_result = r.json() 
		head_word = lex_result["results"][0]["lexicalEntries"][0]["inflectionOf"][0]["text"]
		entry = oxford_get_entry(head_word)
		entry["head_word"] = head_word
		return entry
	else:
		return {
			"word": word,
			"error": "Something went wrong - could not find inflection or word",
			"status_code": r.status_code
		}

def search_for_word(request, word):
	# endpoint = "entries"
	# url = "https://od-api.oxforddictionaries.com/api/v2/" + endpoint + "/" + language_code + "/" + word.lower()
	
	result = oxford_entry(word)
	# print("text \n" + r.text)
	# print(oxfordEntryToLinguiEntry(r.json()))
	# print("code {}\n".format(r.status_code))
	# print("text \n" + r.text)
	# print("json \n" + json.dumps(r.json()))


	return JsonResponse(result, status=result["status_code"])