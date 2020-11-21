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

from ..models import User, Entry, Word


@require_http_methods(['POST'])
def add_entry(request, word_id):

	ctx = { "userId": request.user.id, "wordId": word_id }

	# load post body
	data = json.loads(request.body)

	context = data.get('context', '')
	source = data.get('source', '')
	author = data.get('author', '')
	url = data.get('url', '')
	notes = data.get('notes', '')
	print('a')
	try:
		word = Word.objects.get(id = word_id)
		print('x')
	except Word.DoesNotExist:
		ctx["error"] = "Word does not exist"
		return JsonResponse(ctx, status=400)

	try:
		print('y')
		print(request.user)
		entry = Entry(word=word, user=request.user, context=context, source=source, author=author, url=url, notes=notes)
		entry.save()
		print('z')
		print(entry)
		ctx["data"] = { "entryId": entry.id }
	except ValueError as e:
		print(e)
		ctx["error"] = "could not create the entry"
		return JsonResponse(ctx, status=500)

	return JsonResponse(ctx, status=200)




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




