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

from ..models import User, Word

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
		"list": [],
		"syllables": {
			"count": 0,
			"list": [],
		},
	}

	if "syllables" in entry:
		entry_parsed["syllanbles"] = {
			"count": entry["syllables"]["count"] if "count" in entry["syllables"] else 0,
			"list": entry["syllables"]["list"] if "list" in entry["syllables"] else [],
		}

	singularKeys = ["derivation", "synonym", "antonym", "example"]

	if "results" in entry:
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

			# reverse the order of the results since it seems like the WordsApi returns the most general result last
			entry_parsed["list"].reverse()

	return entry_parsed


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
	# Word.objects.all().delete()
	search = request.GET.get("q", "")
	ctx = { "search": search }

	# Validation
	if search == "":
		ctx["error"] = "Search input is empty!"
		return JsonResponse(ctx, status=400)
	
	try:
		word = Word.objects.get(text=search)
	except Word.DoesNotExist:
		try:
			valid_word = fetch_valid_word(search.split()[0].strip().lower())
			try:
				word = Word.objects.get(text=valid_word)
			except Word.DoesNotExist:
				# Add the word to the database
				word = Word(text=valid_word)
				word.save()
		except Exception as e:
			# convert ValueError to a integer
			# TODO-> log this to ther terminal nicely for debug
			e = int("%s" % e)
			ctx["allow"] = e == 404
			if e == 404:
				ctx["warning"] = "No word was found for this search, check the spelling, or add it as a custom entry"
				return JsonResponse(ctx, status=404)
			else:
				ctx["error"] = "Server error. Please try again later"
				return JsonResponse(ctx, status=500)
		

	ctx["wordId"] = word.id
	if (word.details):
		ctx["data"] = json.loads(word.details)
		return JsonResponse(ctx, status=200)
	else:
		try:
			result = fetch_word_entry(word.text)
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

		Word.objects.filter(id=word.id).update(details=json.dumps(result))
		ctx["data"] = result
		return JsonResponse(ctx, status=200)





