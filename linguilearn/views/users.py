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
		ctx["data"] = user.serialize()
	except User.DoesNotExist:
		ctx["error"] = "No user matching email entered"

	return JsonResponse(ctx, status=200)


@http_auth_required
@require_http_methods(['GET'])
def user_friends(request):
	"""Returns a list of all the current users friends and pending friend requests"""
	ctx = { "userId": request.user.id}

	friends = Friend.objects.friends(request.user)
	ctx["friends"] = []
	for friend in friends:
		ctx["friends"].append({ "userName": friend.username, "userId": friend.id })

	friend_requests_pending = Friend.objects.unrejected_requests(request.user)
	ctx["friendRequestsPending"] = []
	for request_pending in friend_requests_pending:
		ctx["friendRequestsPending"].append({ "userName": request_pending.from_user.username, "userId": request_pending.from_user.id, "friendRequestId": request_pending.id })

	return JsonResponse(ctx, status=200)



@http_auth_required
@require_http_methods(['GET'])
def user_profile(request, user_id):

	ctx = { "userId": user_id }

	if user_id == request.user.id:
		
		friend_requests_pending = Friend.objects.unrejected_requests(request.user)
		ctx["friendRequestsPending"] = []
		for request_pending in friend_requests_pending:
			ctx["friendRequestsPending"].append({ "userName": request_pending.from_user.username, "userId": request_pending.from_user.id, "friendRequestId": request_pending.id })

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
		ctx["friends"].append({ "username": friend.username, "userId": friend.id })

	ctx["wordsLearningCount"] = []
	ctx["wordsMasteredCount"] = []
	ctx["wordsLikedCount"] = []

	return JsonResponse(ctx, status=200)

@http_auth_required
@require_http_methods(['GET'])
def user_current(request):

	ctx = { "userId": request.user.id, "userName": request.user.username }

	friends = Friend.objects.friends(request.user)
	ctx["friends"] = []
	for friend in friends:
		ctx["friends"].append({ "username": friend.username, "userId": friend.id })
	
	friend_requests_pending = Friend.objects.unrejected_requests(request.user)
	ctx["friend_requests_pending"] = []
	for request_pending in friend_requests_pending:
		ctx["friendRequestsPending"].append({ "userName": request_pending.from_user.username, "userId": request_pending.from_user.id, "friendRequestId": request_pending.id })


	ctx["wordsLearning"] = []
	ctx["wordsMastered"] =[]
	ctx["wordsLiked"] = []

	return JsonResponse(ctx, status=200)

