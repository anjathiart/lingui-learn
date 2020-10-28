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

from .config import services_setup

api_services = services_setup()




# # Oxford Api details
# oxford = {
# 	"headers": {"app_id": "4a7b8083", "app_key": "09fd090f4447176a113d44ca173d445b"},
# 	"language_code": "en-gb"
# }


def wordsAPI_search(word):
	url = api_services["words_api"]["base_url"] + word
	headers = api_services["words_api"]["headers"]
	r = requests.request("GET", url, headers=headers)
	print(r.text)


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
			return {
				"word": entry["word"],
				"definition": entry["results"][0]["lexicalEntries"][0]["entries"][0]["senses"][0]["definitions"][0],
			}
	return None



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




