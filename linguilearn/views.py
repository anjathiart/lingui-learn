# import json

from django.contrib.auth import authenticate, login, logout
# from django.core.paginator import Paginator
from django.db import IntegrityError
from django.http import JsonResponse
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse

from .models import User

from friendship.exceptions import AlreadyExistsError
from friendship.models import Friend, Follow, Block

def index(request):
	return render(request, "linguilearn/index.html")



""" Create a FriendshipRequest """
def friendship_add_friend(request, to_username):
	print(request.method)
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
			return JsonResponse(ctx, status=200)

	# return render(request, template_name, ctx)


# @login_required
def friendship_request_list(
	request
):
	""" View unread and read friendship requests """
	print('xx')
	friendship_requests = Friend.objects.requests(request.user)
	print(frienship_requests)
	# This shows all friendship requests in the database
	# friendship_requests = FriendshipRequest.objects.filter(rejected__isnull=True)
	return JsonResponse({"requests": friendship_requests}, safe=False)
	return render(request, template_name, {"requests": friendship_requests})


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