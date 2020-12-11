import json
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from .my_decorators import *
from ..models import User, Entry, Word


@http_auth_required
@require_http_methods(['POST'])
def add_entry(request, word_id):

	ctx = { "userId": request.user.id, "wordId": word_id }

	# load post body
	# data = json.loads(request.body)
	context = ''
	source = ''
	author = ''
	url = ''
	notes = ''

	try:
		word = Word.objects.get(id = word_id)
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
	context = ''
	source = ''
	author = ''
	url = ''
	notes = ''

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
	print('updating')
	print(entry_id)
	ctx = { "userId": request.user.id, "entryId": entry_id }

	entry = Entry.objects.get(id=entry_id)
	if request.user.id != entry.user.id:
		ctx["error"] = "Not authorized!"
		return JsonResponse(ctx, status=403)

	# load post body
	data = json.loads(request.body)

	print(data)

	try:
		Entry.objects.get(id = entry_id).update_entry(data)
		return JsonResponse(ctx, status=200)
	except Entry.DoesNotExist:
		ctx["error"] = "Entry does not exist"
		return JsonResponse(ctx, status=404)


@http_auth_required
@require_http_methods(['GET'])
def get_entry(request, entry_id):
	ctx = { "entryId": entry_id }

	try:
		entry = Entry.objects.get(id=entry_id)
	except Entry.DoesNotExist as e:
		ctx["error"] = "The entry could not be found"
		return JsonResponse(ctx, status=404)

	# entries_serialized = [entry.serialize() for entry in entry_objects]
	ctx["data"] = entry.serialize_long()

	return JsonResponse(ctx, status=200)


@http_auth_required
@require_http_methods(['POST'])
def delete_entry(request, entry_id):

	ctx = { "entry_id": entry_id }

	try:
		Entry.objects.get(id=entry_id).delete();
	except Entry.DoesNotExist:
		ctx["error"] = "Entry does not exist"
		return JsonResponse(ctx, status=404)

	# request.user.learning_words.add(entry)
	return JsonResponse(ctx, status=200)

