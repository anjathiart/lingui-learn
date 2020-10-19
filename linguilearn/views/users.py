# import json

from django.contrib.auth import authenticate, login, logout
# from django.core.paginator import Paginator
from django.db import IntegrityError
from django.http import JsonResponse
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse

from ..models import User

from friendship.models import Friend


def user_friends(request):
	""" Get a list of all the users' friends """

	ctx = { "user_id": request.user.id }

	if not request.user.is_authenticated:
		ctx["errors"] = ["Unauthorised. User must be authenticated."]
		return JsonResponse(ctx, status=401)


	if request.method == "GET":
		friends = Friend.objects.friends(request.user)
		ctx["friends"] = [friend.id for friend in friends]
		return JsonResponse(ctx, status=200)

	else:
		ctx["errors"] = ["Method not allowed!"]
		return JsonResponse(ctx, status=405)