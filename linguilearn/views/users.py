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

from ..models import User

from friendship.models import Friend

from .my_decorators import *


def users(request):
	search_string = request.GET.get('search', '')
	ctx = { "search": search_string }
	users = User.objects.filter(Q(username__icontains=search_string) | Q(email__icontains=search_string)).exclude(id=request.user.id)
	ctx["result"] = [user.serialize() for user in users]
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
