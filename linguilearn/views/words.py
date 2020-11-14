import json
import requests

from django.contrib.auth import authenticate, login, logout
from django.core.paginator import Paginator
from django.db import IntegrityError
from django.http import JsonResponse
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import redirect, render
from django.views.decorators.http import require_http_methods

from linguilearn.exceptions import AlreadyExistsError, DoesNotExistForUser

from ..models import User, Entry

# import and get api service settings
from .config import services_setup
api_services = services_setup()

'''
# REMOVE -> Replaced with fetch_word_entry
def wordsAPI_search(word):
	url = api_services["words_api"]["base_url"] + word
	headers = api_services["words_api"]["headers"]
	r = requests.request("GET", url, headers=headers)
	if r.status_code == 200:
		return {

		}

	return None
	'''
	

def fetch_word_details(word):
	url = api_services["words_api"]["base_url"] + word
	headers = api_services["words_api"]["headers"]
	r = requests.request("GET", url, headers=headers)
	if r.status_code == 200:
		print('details fetched')
		return parse_word_details(r.json())
	return None

# NB --> TOD --> I'm getting confused with my python foo_bar vs camelCase. Surely JSON response should be camelCase when served to the frontend, but then
# ... I lose consitency within my python code. UGH!
def parse_word_details(details):
	# print(details["syllables"])
	# TODO -> return "" if result does not contain the thingy
	details_parsed = {
		"word": details["word"],
		"numResults": len(details["results"]),
		"syllables": {
			"count": details["syllables"]["count"],
			"list": details["syllables"]["list"]
		},
		"pronunciation": None,
		"frequency": details["frequency"],
		"list": [],
	}

	# TODO -> return "" if result does not contain the thingy
	# TODO -> Add more info later
	for result in details["results"]:
		details_parsed["list"].append({
			"definition": result["definition"],
			"partOfSpeech": result["partOfSpeech"],
			"example": None
		})

	return details_parsed









def wordsAPI_random():
	url = api_services["words_api"]["base_url"]
	headers = api_services["words_api"]["headers"]
	params = { "random": "true" }
	r = requests.request("GET", url, headers=headers, params=params)
	if r.status_code == 200:
		return {


		}
	else:
		return None

"""
# REMOVE -> Replaced with fetch_valid_word()
def oxford_search(word):
	url = api_services["oxford_api"]["base_url_lemmas"] + word
	headers = api_services["oxford_api"]["headers"]
	r = requests.get(url, headers = headers)
	if r.status_code == 200:
		lex_result = r.json()
		head_word = lex_result["results"][0]["lexicalEntries"][0]["inflectionOf"][0]["text"]
		url = api_services["oxford_api"]["base_url_entries"] + head_word
		r = requests.get(url, headers = headers)
		if r.status_code == 200:
			entry = r.json()
			return entry["word"]
			'''
			return {
				"word": entry["word"],
				"definition": entry["results"][0]["lexicalEntries"][0]["entries"][0]["senses"][0]["definitions"][0],
			}
			'''
	return None
	"""


def fetch_valid_word(word):
	url = api_services["oxford_api"]["base_url_lemmas"] + word
	headers = api_services["oxford_api"]["headers"]
	r = requests.get(url, headers = headers)
	if r.status_code == 200:
		lex_result = r.json()
		head_word = lex_result["results"][0]["lexicalEntries"][0]["inflectionOf"][0]["text"]
		return head_word	
	return None


@require_http_methods(["GET"])
def word_search(request):
	search = request.GET.get("q", "")
	ctx = { "search": search }

	# Validation
	if search == "":
		ctx["error"] = "Search input is empty!"
		return JsonResponse(ctx, status=400)
	
	# Sanitize the query string to get a target for the word search
	# TODO -> what if the word must be uppercase?
	# TODO -> Rather do try ... catch with search() function throwing a DoesNotExist
	valid_word = fetch_valid_word(search.split()[0].strip().lower())

	if valid_word:
		# TODO -> Factor all the logic above to do with valid words that can be into the the helper `fetch` functions
		result = fetch_word_details(valid_word)
		ctx["data"] = result
		return JsonResponse(ctx, status=200)

	else:
		ctx["allow"] = True # flag to bypass error and do something (for example allow this word to be added as a made up word)
		ctx["error"] = "No match was found for the search query"
		return JsonResponse(ctx, status=404)
		


# REMOVE -> def word_search replaces:
'''
@require_http_methods(['GET'])
def search_entry(request):
	wordsAPI_search("apple")
	word_searched = request.GET.get('word', "")
	ctx = { "word_searched": word_searched }

	try:
		entry = Entry.objects.get(word=word_searched.lower())
		ctx["result"] = entry.serialize()
		return JsonResponse(ctx, status=200)
	except Entry.DoesNotExist:
		entry = oxford_search(word_searched.lower())
		if entry:
			entry = Entry(word=entry["word"], definition=entry["definition"])
			entry.save()
			ctx["result"] = entry.serialize()
			return JsonResponse(ctx, status=200)
		ctx["error"] = "No match was found for the search query"
		return JsonResponse(ctx, status=404)
'''

@require_http_methods(['POST'])
def add_entry(request, entry_id):

	ctx = { "entry_id": entry_id }

	try:
		entry = Entry.objects.get(id=entry_id)
	except Entry.DoesNotExist:
		ctx["error"] = "Word does not exist"
		return JsonResponse(ctx, status=404)

	request.user.entries.add(entry)
	return JsonResponse(ctx, status=200)
	

	# print("text \n" + r.text)
	# print(oxfordEntryToLinguiEntry(r.json()))
	# print("code {}\n".format(r.status_code))
	# print("text \n" + r.text)
	# print("json \n" + json.dumps(r.json()))


	# return JsonResponse(result, status=result["status_code"])

@require_http_methods(['POST'])
def remove_entry(request, entry_id):

	ctx = { "entry_id": entry_id }

	try:
		request.user.remove_entry(entry_id)
	except Entry.DoesNotExist:
		ctx["error"] = "Word does not exist"
		return JsonResponse(ctx, status=404)

	# request.user.learning_words.add(entry)
	return JsonResponse(ctx, status=200)


@require_http_methods(['POST'])
def master_entry(request, entry_id):

	ctx = { "entry_id": entry_id }

	try:
		request.user.master_entry(entry_id)
	except DoesNotExistForUser as e:
		ctx["error"] = "%s" % e
		return JsonResponse(ctx, status=404)

	# request.user.learning_words.add(entry)
	return JsonResponse(ctx, status=200)


@require_http_methods(['POST'])
def star_entry(request, entry_id):

	ctx = { "entry_id": entry_id }

	try:
		entry = Entry.objects.get(id=entry_id)
	except Entry.DoesNotExist:
		ctx["error"] = "Word does not exist"
		return JsonResponse(ctx, status=404)

	request.user.entries_starred.add(entry)
	return JsonResponse(ctx, status=200)




