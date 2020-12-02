# # import json

# from django.db import IntegrityError
# from django.http import JsonResponse
# from django.views.decorators.http import require_http_methods

# from ..models import User

# from friendship.exceptions import AlreadyExistsError
# from friendship.models import Friend, Follow, Block, FriendshipRequest

# from .my_decorators import *

# @http_auth_required
# @require_http_methods(['POST'])
# def friendship_add_friend(request, to_user_email):
# 	""" Create a FriendshipRequest """

# 	ctx = { "to_user_email": to_user_email }
		
# 	try:
# 		to_user = User.objects.get(email__iexact=to_user_email)
# 	except User.DoesNotExist:
# 		ctx["error"] = "No user matching this email address"
# 		return JsonResponse(ctx, status=404)
	
# 	from_user = request.user

# 	try:
# 		Friend.objects.add_friend(from_user, to_user)
# 	except AlreadyExistsError as e:
# 		ctx["error"]= "%s" % e
# 		return JsonResponse(ctx, status=400)
# 	except Exception as e:
# 		ctx["error"] = "%s" % e
# 		return JsonResponse(ctx, status=400)
# 		# friendship_requests_sent = Friend.objects.sent_requests(request.user)
# 		# ctx["friendship_requests_sent"] = [friendship_request.id for friendship_request in friendship_requests_sent]
# 	return JsonResponse(ctx, status=200)


# @http_auth_required
# @require_http_methods(['POST'])
# def friendship_cancel(request, friendship_request_id):
# 	""" Cancel a previously created friendship_request_id """

# 	ctx = { "friend_cancelled": friendship_request_id}
# 	try:
# 		f_request = request.user.friendship_requests_sent.get(id=friendship_request_id)
# 	except FriendshipRequest.DoesNotExist:
# 		ctx["error"] = "Frienship request does not exist"
# 		return JsonResponse(ctx, status=404)
# 	f_request.cancel()
# 	return JsonResponse(ctx, status=200)


# @http_auth_required
# @require_http_methods(['POST'])
# def friendship_accept(request, friendship_request_id):
# 	""" Accept a friendship request """
# 	ctx = { "friend_accept": friendship_request_id }

# 	try:
# 		f_request = request.user.friendship_requests_received.get(id=friendship_request_id)
# 	except FriendshipRequest.DoesNotExist:
# 		ctx["error"] = "Frienship request does not exist"
# 		return JsonResponse(ctx, status=404)
# 	f_request.accept()
# 	return JsonResponse(ctx, status=200)


# @http_auth_required
# @require_http_methods(['POST'])
# def friendship_reject(request, friendship_request_id):
# 	""" Reject a friendship request """
# 	ctx = { "friend_accept": friendship_request_id }

# 	try:
# 		f_request = request.user.friendship_requests_received.get(id=friendship_request_id)
# 	except FriendshipRequest.DoesNotExist:
# 		ctx["error"] = "Frienship request does not exist"
# 		return JsonResponse(ctx, status=404)
# 	f_request.reject()
# 	return JsonResponse(ctx, status=200)


# @http_auth_required
# @require_http_methods(['GET'])
# def friendship_requests_sent_list(request):
# 	""" View frienship requests sent by the request user"""
# 	ctx = {}
# 	friendship_requests_sent = Friend.objects.sent_requests(request.user)
# 	ctx["friendship_requests_sent"] = [friendship_request.id for friendship_request in friendship_requests_sent]
# 	return JsonResponse(ctx, status=200)


# @http_auth_required
# @require_http_methods(['GET'])
# def friendship_requests_received_list(request):
# 	""" View frienship requests received by the request user"""
# 	ctx = {}
# 	friendship_requests_sent = Friend.objects.sent_requests(request.user)
# 	ctx["friendship_requests_sent"] = [friendship_request.id for friendship_request in friendship_requests_sent]
# 	return JsonResponse(ctx, status=200)


# def friendships(request):
# 	"""Returns a list of all the current users friends, pending requests, and requests received"""
# 	ctx = {}

# 	friends = Friend.objects.friends(request.user)
# 	ctx["friends"] = []
# 	for friend in friends:
# 		ctx["friends"].append({ "username": friend.username, "user_id": friend.id })

# 	friend_requests_received = Friend.objects.requests(request.user)
# 	ctx["friend_requests_received"] = []
# 	for request_received in friend_requests_received:
# 		ctx["friend_requests_received"].append({"username": request_received.from_user.username, "user_id": request_received.from_user.id, "request_id": request_received.id })

# 	friend_requests_pending = Friend.objects.unrejected_requests(request.user)
# 	ctx["friend_requests_pending"] = []
# 	for request_pending in friend_requests_pending:
# 		ctx["friend_requests_pending"].append({ "username": request_pending.from_user.username, "user_id": request_pending.from_user.id, "request_id": request_pending.id })

# 	friend_requests_sent = Friend.objects.sent_requests(request.user)
# 	ctx["friend_requests_sent"] = []
# 	for request_sent in friend_requests_sent:
# 		ctx["friend_requests_sent"].append({ "username": request_sent.to_user.username, "user_id": request_sent.to_user.id, "request_id": request_sent.id })

# 	return JsonResponse(ctx, status=200)




