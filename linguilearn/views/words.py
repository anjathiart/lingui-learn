import json
import requests

from django.contrib.auth import authenticate, login, logout
from django.core.paginator import Paginator
from django.db import IntegrityError
from django.http import JsonResponse
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import redirect, render
from django.views.decorators.http import require_http_methods

from ..models import User, Entry

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

def oxford_search(word):
	# result = { "word": word }

	endpoint = "lemmas"
	url = "https://od-api.oxforddictionaries.com/api/v2/" + endpoint + "/" + "en" + "/" + word.lower()
	r = requests.get(url, headers = oxford_api_headers)
	if r.status_code == 200:
		lex_result = r.json() 
		head_word = lex_result["results"][0]["lexicalEntries"][0]["inflectionOf"][0]["text"]
		entry = oxford_get_entry(head_word)
		entry["head_word"] = head_word
		return entry
	# elif r.status_code == 500:
	# 	return { "error": 500 }
	else:
		return None



@require_http_methods(['GET'])
def search_entry(request):
	word_searched = request.GET.get('word', "")
	ctx = { "word_searched": word_searched }

	try:
		entry = Entry.objects.get(word=word_searched.lower())
		ctx["result"] = entry.serialize()
		return JsonResponse(ctx, status=200)
	except Entry.DoesNotExist:
		entry = oxford_search(word_searched.lower())
		if entry:
			# save entry to db
			entry = Entry(word=entry["head_word"], definition=entry["definition"])
			entry.save()
			ctx["result"] = entry.serialize()
			return JsonResponse(ctx, status=200)
		return JsonResponse(ctx, status=404)


@require_http_methods(['POST'])
def add_entry(request, entry_id):

	ctx = { "entry_id": entry_id }

	try:
		entry = Entry.objects.get(id=entry_id)
	except Entry.DoesNotExist:
		ctx["errors"] = ["Word does not exist"]
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
		ctx["errors"] = ["Word does not exist"]
		return JsonResponse(ctx, status=404)

	# request.user.learning_words.add(entry)
	return JsonResponse(ctx, status=200)


@require_http_methods(['POST'])
def master_entry(request, entry_id):

	ctx = { "entry_id": entry_id }

	try:
		request.user.master_entry(entry_id)
	except Entry.DoesNotExist:
		ctx["error"] = "No entry matching request entry id"
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




