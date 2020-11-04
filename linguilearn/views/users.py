# import json

from django.contrib.auth import authenticate, login, logout
# from django.core.paginator import Paginator
from django.db import IntegrityError
from django.db.models import Q
from django.http import JsonResponse
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse
from django.views.decorators.http import require_http_methods

from ..models import User, Word

from friendship.models import Friend

from .my_decorators import *

@http_auth_required
@require_http_methods(['GET'])
def users(request):
	email = request.GET.get('email', '')
	ctx = { "user_id": request.user.id, "email": email }
	try:
		user = User.objects.filter(email=email)
		ctx["result"] = user.serialize()
	except User.DoesNotExist:
		ctx["error"] = "No user matching email entered"

	return JsonResponse(ctx, status=200)


@http_auth_required
@require_http_methods(['GET'])
def user_friends(request):
	"""Returns a list of all the current users friends and pending friend requests"""
	ctx = { "user_id": request.user.id}

	friends = Friend.objects.friends(request.user)
	ctx["friends"] = []
	for friend in friends:
		ctx["friends"].append({ "username": friend.username, "user_id": friend.id })

	friend_requests_pending = Friend.objects.unrejected_requests(request.user)
	ctx["friend_requests_pending"] = []
	for request_pending in friend_requests_pending:
		ctx["friend_requests_pending"].append({ "username": request_pending.from_user.username, "user_id": request_pending.from_user.id, "friend_request_id": request_pending.id })

	return JsonResponse(ctx, status=200)



@http_auth_required
@require_http_methods(['GET'])
def user_profile(request, user_id):

	ctx = { "user_id": user_id }

	if user_id == request.user.id:
		
		friend_requests_pending = Friend.objects.unrejected_requests(request.user)
		ctx["friend_requests_pending"] = []
		for request_pending in friend_requests_pending:
			ctx["friend_requests_pending"].append({ "username": request_pending.from_user.username, "user_id": request_pending.from_user.id, "friend_request_id": request_pending.id })

		user = request.user

	else:
		try:
			user = User.objects.get(id=user_id)
			if not Friend.objects.are_friends(user, request.user):
				ctx["error"] = "Unauthorised - Users are not friends"
				return JsonResponse(ctx, status=405)
		except User.DoesNotExist:
			ctx["error"] = "User does not exist"
			return JsonResponse(ctx, status=404)
	
	friends = Friend.objects.friends(user)
	ctx["friends"] = []
	for friend in friends:
		ctx["friends"].append({ "username": friend.username, "user_id": friend.id })

	ctx["words_learning_count"] = Word.objects.get_words_learning_count(user)
	ctx["words_mastered_count"] = Word.objects.get_words_mastered_count(user)
	ctx["words_liked_count"] = Word.objects.get_words_liked_count(user)

	return JsonResponse(ctx, status=200)

@http_auth_required
@require_http_methods(['GET'])
def user_current(request):

	ctx = { "user_id": request.user.id }

	friends = Friend.objects.friends(request.user)
	ctx["friends"] = []
	for friend in friends:
		ctx["friends"].append({ "username": friend.username, "user_id": friend.id })
	
	friend_requests_pending = Friend.objects.unrejected_requests(request.user)
	ctx["friend_requests_pending"] = []
	for request_pending in friend_requests_pending:
		ctx["friend_requests_pending"].append({ "username": request_pending.from_user.username, "user_id": request_pending.from_user.id, "friend_request_id": request_pending.id })


	ctx["words_learning"] = Word.objects.get_words_learning(request.user)
	ctx["words_mastered"] = Word.objects.get_words_mastered(request.user)
	ctx["words_liked"] = Word.objects.get_words_liked(request.user)

	return JsonResponse(ctx, status=200)

