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


def fetch_word_entry(word):
	word = fetch_valid_word(word)
	url = api_services["words_api"]["base_url"] + word
	headers = api_services["words_api"]["headers"]
	r = requests.request("GET", url, headers=headers)
	if r.status_code == 200:
		return parse_word_entry(r.json())
	else:
		raise ValueError(r.status_code)
		

# NB --> TOD --> I'm getting confused with my python foo_bar vs camelCase. Surely JSON response should be camelCase when served to the frontend, but then
# ... I lose consitency within my python code. UGH!
def parse_word_entry(entry):
	# TODO -> return "" if result does not contain the thingy
	entry_parsed = {
		"word": entry["word"],
		"numResults": len(entry["results"]),
		"syllables": {
			"count": entry["syllables"]["count"],
			"list": entry["syllables"]["list"]
		},
		"frequency": entry["frequency"],
		"list": [],
	}

	singularKeys = ["derivation", "synonym", "antonym", "example"]

	# TODO -> return "" if result does not contain the thingy
	# TODO -> Add more info later
	for result in entry["results"]:
		# update key to plural if wordAPI returns it in singular

		for key in singularKeys:
			if key in result:
				result[key + "s"] = result.pop(key)

		entry_parsed["list"].append({
			"definition": result["definition"],
			"partOfSpeech": result["partOfSpeech"] if "partOfSpeech" in result else "",
			"examples": result["examples"] if "examples" in result else [],
			"derivations": result["derivations"] if "derivations" in result else [],
			"similarTo": result["similarTo"] if "similarTo" in result else [],
			"synonyms": result["synonyms"] if "synonyms" in result else [],
			"usageOf": result["usageOf"] if "usageOf" in result else [],

		})
		entry_parsed["list"].reverse()

	return entry_parsed



def wordsAPI_random():
	url = api_services["words_api"]["base_url"]
	headers = api_services["words_api"]["headers"]
	params = { "random": "true" }
	r = requests.request("GET", url, headers=headers, params=params)
	if r.status_code == 200:
		return {}
	else:
		return None


def fetch_valid_word(word):
	url = api_services["oxford_api"]["base_url_lemmas"] + word
	headers = api_services["oxford_api"]["headers"]
	r = requests.get(url, headers = headers)
	if r.status_code == 200:
		lex_result = r.json()
		head_word = lex_result["results"][0]["lexicalEntries"][0]["inflectionOf"][0]["text"]
		return head_word
	else:
		raise ValueError(r.status_code)


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
	try:
		valid_word = fetch_valid_word(search.split()[0].strip().lower())
	except Exception as e:
		# convert ValueError to a integer
		e = int("%s" % e)
		# TODO-> log this to ther terminal nicely for debug
		ctx["allow"] = e == 404
		if e == 404:
			ctx["warning"] = "No word was found for this search, check the spelling, or add it as a custom entry"
			return JsonResponse(ctx, status=404)
		else:
			ctx["error"] = "Server error. Please try again later"
			return JsonResponse(ctx, status=500)

	try:
		result = fetch_word_entry(valid_word)
		ctx["data"] = result
		return JsonResponse(ctx, status=200)
	except Exception as e:
		# cconvert ValueError to integer
		e = int("%s" % e)
		ctx["allow"] = e == 404
		if e == 404:
			ctx["warning"] = "No word entry was found for this word. You can add it as a custom entry"
			return JsonResponse(ctx, status=404)
		else:
			ctx["error"] = "Server error. Please try again later"
			return JsonResponse(ctx, status=500)

		

# @require_http_methods(['POST'])
# def add_entry(request, entry_id):

# 	ctx = { "entry_id": entry_id }

# 	try:
# 		entry = Entry.objects.get(id=entry_id)
# 	except Entry.DoesNotExist:
# 		ctx["error"] = "Word does not exist"
# 		return JsonResponse(ctx, status=404)

# 	request.user.entries.add(entry)
# 	return JsonResponse(ctx, status=200)


# @require_http_methods(['POST'])
# def remove_entry(request, entry_id):

# 	ctx = { "entry_id": entry_id }

# 	try:
# 		request.user.remove_entry(entry_id)
# 	except Entry.DoesNotExist:
# 		ctx["error"] = "Word does not exist"
# 		return JsonResponse(ctx, status=404)

# 	# request.user.learning_words.add(entry)
# 	return JsonResponse(ctx, status=200)


# @require_http_methods(['POST'])
# def master_entry(request, entry_id):

# 	ctx = { "entry_id": entry_id }

# 	try:
# 		request.user.master_entry(entry_id)
# 	except DoesNotExistForUser as e:
# 		ctx["error"] = "%s" % e
# 		return JsonResponse(ctx, status=404)

# 	# request.user.learning_words.add(entry)
# 	return JsonResponse(ctx, status=200)


# @require_http_methods(['POST'])
# def star_entry(request, entry_id):

# 	ctx = { "entry_id": entry_id }

# 	try:
# 		entry = Entry.objects.get(id=entry_id)
# 	except Entry.DoesNotExist:
# 		ctx["error"] = "Word does not exist"
# 		return JsonResponse(ctx, status=404)

# 	request.user.entries_starred.add(entry)
# 	return JsonResponse(ctx, status=200)




