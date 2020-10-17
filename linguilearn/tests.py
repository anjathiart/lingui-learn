import json
import requests
from django.contrib.auth.models import AnonymousUser
from django.test import RequestFactory, TestCase
from .models import User
from friendship.models import Friend, Follow, Block, FriendshipRequest

from .views import friendship_add_friend, friendship_cancel, friendship_requests_sent_list

# SOME NOTES / INFO
'''
Recall that middleware are not supported. You can simulate a
logged-in user by setting request.user manually.
request.user = self.user

Or you can simulate an anonymous user by setting request.user to
an AnonymousUser instance.
request.user = AnonymousUser()

Test my_view() as if it were deployed at /customer/details
Use this syntax for class-based views.
response = MyView.as_view()(request)
'''

class FriendshipRequests(TestCase):
	def setUp(self):
		# Every test needs access to the request factory.
		self.factory = RequestFactory()
		self.user_anja = User.objects.create_user(
			username='anja', email='anja@anja.com', password='anja')
		self.user_jani = User.objects.create_user(
			username='jani', email='jani@jani.com', password='jani')

	def test_send_friend_request_unauthenticated(self):
		'''
		Unauthenticated user attempting to send a friend request
		Force Error: 401 (Unauthorised)
		'''
		request = self.factory.post('/friendship/' + self.user_anja.username + '/add')
		request.user = AnonymousUser()
		response = friendship_add_friend(request, self.user_anja.id)
		self.assertEqual(response.status_code, 401)

	def test_send_friend_request(self):
		'''
		Authenticated user trying to send a friend request to a new friend
		Success: status 200 and friendship_requests_sent array containing request id
		'''
		request = self.factory.post('/friendship/' + self.user_anja.username + '/add')
		request.user = self.user_jani
		response = friendship_add_friend(request, self.user_anja.username)
		self.assertContains(response, '"friendship_requests_sent": [1]')
		self.assertEqual(response.status_code, 200)

	def test_send_friend_request_where_one_already_exists(self):
		'''
		Authenticated user trying to send a friend request to a new friend
		Force Error: Friendship request already exists, status 400
		'''
		Friend.objects.add_friend(self.user_jani, self.user_anja)
		request = self.factory.post('/friendship/' + self.user_anja.username + '/add')
		request.user = self.user_jani
		response = friendship_add_friend(request, self.user_anja.username)
		self.assertEqual(response.status_code, 400)

	def test_cancel_friend_request_sent(self):
		print('hi')
		'''
		Authenticated user trying to cancel an existing friend request
		Success: 200
		'''
		Friend.objects.add_friend(self.user_jani, self.user_anja)
		request = self.factory.post('/friendship/1/cancel')
		request.user = self.user_jani
		response = friendship_cancel(request, 1)
		self.assertEqual(response.status_code, 200)




