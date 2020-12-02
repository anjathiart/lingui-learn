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

from .my_decorators import *

from ..models import User, Entry, Word

@http_auth_required
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
	try:
		word = Word.objects.get(id = word_id)
		print(word)
	except Word.DoesNotExist:
		ctx["error"] = "Word does not exist"
		return JsonResponse(ctx, status=400)

	try:
		entry = Entry(word=word, user=request.user, context=context, source=source, author=author, url=url, notes=notes)
		entry.save()
		ctx["data"] = { "entryId": entry.id }
		return JsonResponse(ctx, status=200)
	except ValueError as e:
		ctx["error"] = "Something went wrong... please try again later"
		return JsonResponse(ctx, status=500)

@http_auth_required
@require_http_methods(['POST'])
def add_custom_entry(request, text):

	ctx = { "userId": request.user.id, "word": text }

	# load post body
	data = json.loads(request.body)

	context = data.get('context', '')
	source = data.get('source', '')
	author = data.get('author', '')
	url = data.get('url', '')
	notes = data.get('notes', '')

	try:
		word = Word.objects.get(text=text.split()[0].strip().lower())
	except Word.DoesNotExist:
		try:
			word = Word(text=text.split()[0].strip().lower(), customWord=True)
			word.save()
		except ValueError as e:
			ctx["error"] = "Something went wrong... please try again later"
			return JsonResponse(ctx, status=500)

	try:
		entry = Entry(word=word, user=request.user, context=context, source=source, author=author, url=url, notes=notes)
		entry.save()
		ctx["data"] = { "entryId": entry.id }
		return JsonResponse(ctx, status=200)
	except ValueError as e:
		ctx["error"] = "Something went wrong... please try again later"
		return JsonResponse(ctx, status=500)

@http_auth_required
@require_http_methods(['POST'])
def update_entry(request, entry_id):

	ctx = { "userId": request.user.id, "entryId": entry_id }

	entry = Entry.objects.get(id=entry_id)
	if request.user.id != entry.user.id:
		ctx["error"] = "Not authorized!"
		return JsonResponse(ctx, status=403)

	# load post body
	data = json.loads(request.body)

	try:
		Entry.objects.get(id = entry_id).update_entry(data)
		return JsonResponse(ctx, status=200)
	except Entry.DoesNotExist:
		ctx["error"] = "Entry does not exist"
		return JsonResponse(ctx, status=404)


@http_auth_required
@require_http_methods(['GET'])
def library(request, user_id):
	ctx = { "userId": user_id }

	listFilter = request.GET.get('filter', 'all')


	# TODO: validate the query string
	if listFilter == 'learning':
		listFilter = '1'
	elif listFilter == 'mastered':
		listFilter = '2'
	elif listFilter == 'archived':
		listFilter = '3'

	ctx['filter'] =  listFilter

	try:
		if listFilter == 'favourites':
			entry_objects = Entry.objects.filter(user_id=user_id, favourites=True).all()
		elif listFilter == 'all':
			entry_objects = Entry.objects.filter(user_id=user_id).all()
		else:
			entry_objects = Entry.objects.filter(user_id=user_id, entry_list=listFilter).all()
	except Entry.DoesNotExist as e:
		ctx["error"] = "Library does not exist for this user"
		return JsonResponse(ctx, status=404)

	entries_serialized = [entry.serialize() for entry in entry_objects]
	ctx["data"] =  {
		"list": entries_serialized
	}

	return JsonResponse(ctx, status=200)

@http_auth_required
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


@http_auth_required
@require_http_methods(['POST'])
def update_entry_list(request, entry_id):
	ctx = { "userId": request.user.id, "entryId": entry_id }

	# load post body
	data = json.loads(request.body)
	entry_list = data.get('entryList', '')

	# validate entry_list field

	try:
		Entry.objects.filter(id=entry_id).update(entry_list=entry_list)
		ctx['success'] = True
		return JsonResponse(ctx, status=200)
	except Entry.DoesNotExist:
		ctx["error"] = "Entry does not exist"
		return JsonResponse(ctx, status=404)


@http_auth_required
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


@http_auth_required
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




