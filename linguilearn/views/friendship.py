# import json

from django.contrib.auth import authenticate, login, logout
# from django.core.paginator import Paginator
from django.db import IntegrityError
from django.http import JsonResponse
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse
from django.views.decorators.http import require_http_methods

from ..models import User

from friendship.exceptions import AlreadyExistsError
from friendship.models import Friend, Follow, Block, FriendshipRequest

from functools import wraps

# Decorator function to protect views that require a user to be authenticated
def http_auth_required(view_func):
	@wraps(view_func)
	def wrapper(request, *args, **kwargs):
		if request.user.is_authenticated:
			return view_func(request, *args, **kwargs)
		ctx = {}
		ctx["errors"] = ["Unauthorised. User must be authenticated."]
		return JsonResponse(ctx, status=401)
	return wrapper

@http_auth_required
@require_http_methods(['POST'])
def friendship_add_friend(request, to_username):
	""" Create a FriendshipRequest """

	ctx = {"to_username": to_username}
		
	try:
		to_user = User.objects.get(username=to_username)
	except User.DoesNotExist:
		ctx["errors"] = ["No such username found."]
		return JsonResponse(ctx, status=404)
	
	from_user = request.user

	try:
		Friend.objects.add_friend(from_user, to_user)
	except AlreadyExistsError as e:
		ctx["errors"] = ["%s" % e]
		return JsonResponse(ctx, status=400)
	except Exception as e:
		ctx["errors"] =["%s" % e]
		return JsonResponse(ctx, status=400)
	else:
		friendship_requests_sent = Friend.objects.sent_requests(request.user)
		ctx["friendship_requests_sent"] = [friendship_request.id for friendship_request in friendship_requests_sent]
		return JsonResponse(ctx, status=200)


@http_auth_required
@require_http_methods(['POST'])
def friendship_cancel(request, friendship_request_id):
	""" Cancel a previously created friendship_request_id """

	ctx = { "friend_cancelled": friendship_request_id}

	f_request = get_object_or_404(
		request.user.friendship_requests_sent, id=friendship_request_id
	)
	f_request.cancel()
	return JsonResponse(ctx, status=200)


@http_auth_required
@require_http_methods(['POST'])
def friendship_accept(request, friendship_request_id):
	""" Accept a friendship request """
	ctx = { "friend_accept": friendship_request_id }

	try:
		f_request = request.user.friendship_requests_received.get(id=friendship_request_id)
	except FriendshipRequest.DoesNotExist:
		ctx["errors"] = ["Frienship request does not exist"]
		return JsonResponse(ctx, status=404)
	f_request.accept()
	return JsonResponse(ctx, status=200)


@http_auth_required
@require_http_methods(['POST'])
def friendship_reject(request, friendship_request_id):
	""" Reject a friendship request """
	ctx = { "friend_accept": friendship_request_id }

	try:
		f_request = request.user.friendship_requests_received.get(id=friendship_request_id)
	except FriendshipRequest.DoesNotExist:
		ctx["errors"] = ["Frienship request does not exist"]
		return JsonResponse(ctx, status=404)
	f_request.reject()
	return JsonResponse(ctx, status=200)


@http_auth_required
@require_http_methods(['GET'])
def friendship_requests_sent_list(request):
	""" View frienship requests sent by the request user"""
	ctx = {}
	friendship_requests_sent = Friend.objects.sent_requests(request.user)
	ctx["friendship_requests_sent"] = [friendship_request.id for friendship_request in friendship_requests_sent]
	return JsonResponse(ctx, status=200)


@http_auth_required
@require_http_methods(['GET'])
def friendship_requests_received_list(request):
	""" View frienship requests received by the request user"""
	ctx = {}
	friendship_requests_sent = Friend.objects.sent_requests(request.user)
	ctx["friendship_requests_sent"] = [friendship_request.id for friendship_request in friendship_requests_sent]
	return JsonResponse(ctx, status=200)



