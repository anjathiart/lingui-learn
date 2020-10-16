# import json

from django.contrib.auth import authenticate, login, logout
# from django.core.paginator import Paginator
from django.db import IntegrityError
from django.http import JsonResponse
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse

from .models import User

from friendship.exceptions import AlreadyExistsError
from friendship.models import Friend, Follow, Block, FriendshipRequest

def index(request):
	return render(request, "linguilearn/index.html")




def friendship_add_friend(request, to_username):
	""" Create a FriendshipRequest """

	ctx = {"to_username": to_username}

	if request.method == "POST":
		
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
			friendship_requests = Friend.objects.requests(request.user)
			ctx["friendship_requests"] = ["%s" % friendship_requests]
			return JsonResponse(ctx, status=200)

	else:
		return JsonResponse({"error": "Method not allowed!"}, status=405)


def friendship_cancel(request, friendship_request_id):
	""" Cancel a previously created friendship_request_id """

	ctx = { "friend_cancelled": friendship_request_id}

	if request.method == "POST":
		f_request = get_object_or_404(
			request.user.friendship_requests_sent, id=friendship_request_id
		)
		f_request.cancel()
		return JsonResponse(ctx, status=200)

	else:
		ctx["errors"] = ["Method not allowed!"]
		return JsonResponse(ctx, status=405)



def friendship_requests_sent_list(request):
	""" View frienship requests sent by the request user"""
	ctx = {}
	friendship_requests_sent = Friend.objects.sent_requests(request.user)
	ctx["friendship_requests_sent"] = [friendship_request.id for friendship_request in friendship_requests_sent]
	
	return JsonResponse(ctx, status=200)


def friendship_requests_sent_list(request):
	""" View frienship requests sent by the request user"""
	ctx = {}
	friendship_requests_sent = Friend.objects.sent_requests(request.user)
	ctx["friendship_requests_sent"] = [friendship_request.id for friendship_request in friendship_requests_sent]
	
	return JsonResponse(ctx, status=200)

def login_view(request):
	if request.method == "POST":

		# Attempt to sign user in
		username = request.POST["username"]
		password = request.POST["password"]
		user = authenticate(request, username=username, password=password)

		# Check if authentication successful
		if user is not None:
			login(request, user)
			return HttpResponseRedirect(reverse("index"))
		else:
			return render(request, "network/login.html", {
				"message": "Invalid username and/or password."
			})
	else:
		return render(request, "linguilearn/login.html")


def logout_view(request):
	logout(request)
	return HttpResponseRedirect(reverse("index"))


def register(request):
	if request.method == "POST":
		username = request.POST["username"]
		email = request.POST["email"]

		# Ensure password matches confirmation
		password = request.POST["password"]
		confirmation = request.POST["confirmation"]
		if password != confirmation:
			return render(request, "linguilearn/register.html", {
				"message": "Passwords must match."
			})

		# Attempt to create new user
		try:
			user = User.objects.create_user(username, email, password)
			user.save()
		except IntegrityError:
			return render(request, "linguilearn/register.html", {
				"message": "Username already taken."
			})
		login(request, user)
		return HttpResponseRedirect(reverse("index"))
	else:
		return render(request, "linguilearn/register.html")