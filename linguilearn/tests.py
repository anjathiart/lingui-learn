import json
import requests
from django.contrib.auth.models import AnonymousUser
from django.test import RequestFactory, TestCase
from .models import User, Word
from friendship.models import Friend, Follow, Block, FriendshipRequest

from .views import friendship_add_friend, friendship_cancel, friendship_requests_sent_list, friendship_accept, friendship_reject, user_friends, search_for_word, add_word

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
		'''
		Authenticated user trying to cancel an existing friend request
		Success: 200
		'''
		Friend.objects.add_friend(self.user_jani, self.user_anja)
		request = self.factory.post('/friendship/1/cancel')
		request.user = self.user_jani
		response = friendship_cancel(request, 1)
		self.assertEqual(response.status_code, 200)


	def test_accept_friend_request(self):
		'''
		User accepting existing frienship request
		Success: 200
		'''
		Friend.objects.add_friend(self.user_jani, self.user_anja)
		request = self.factory.post('/friendship/1/accept')
		request.user = self.user_anja
		response = friendship_accept(request, 1)
		self.assertEqual(response.status_code, 200)

	def test_reject_friend_request_fail(self):
		'''
		User rejecting existing frienship request in wrong 'relationship-direction'
		Force Error: 404
		'''
		Friend.objects.add_friend(self.user_anja, self.user_jani)
		request = self.factory.post('/friendship/1/reject')
		request.user = self.user_anja
		response = friendship_reject(request, 1)
		self.assertEqual(response.status_code, 404)

	def test_reject_friend_request(self):
		'''
		User rejecting existing frienship request'
		Success: 200
		'''
		Friend.objects.add_friend(self.user_jani, self.user_anja)
		request = self.factory.post('/friendship/1/reject')
		request.user = self.user_anja
		# request.user = AnonymousUser()
		response = friendship_reject(request, 1)
		self.assertEqual(response.status_code, 200)


	def test_view_users_friends(self):
		'''
		Accept a friend request then view the users friends
		Success: 200
		'''
		Friend.objects.add_friend(self.user_anja, self.user_jani)
		f_request = self.user_jani.friendship_requests_received.get(id=1)
		f_request.accept()
		request = self.factory.get('/users/friends')
		request.user = self.user_anja
		response = user_friends(request)
		self.assertEqual(response.status_code, 200)


class WordsApi(TestCase):
	def setUp(self):
		self.factory = RequestFactory()
		self.user_anja = User.objects.create_user(
			username='anja', email='anja@anja.com', password='anja')

	def test_entry_search(self):
		'''
		Search for a word that is not in the DB, and is a lemma
		success: 200
		'''
		request = self.factory.get('/words/apples')
		request.user = self.user_anja
		response = search_for_word(request, 'apples')
		print(response.content)
		self.assertEqual(response.status_code, 200)

	def  test_entry_search_in_db(self):
		'''
		Search for a word that is in the DB already
		success: 200
		'''
		word = Word(word="dog", definition="woof woof ...")
		word.save()
		request = self.factory.get('/words/Dog')
		request.user = self.user_anja
		response = search_for_word(request, 'Dog')
		print(response.content)
		self.assertEqual(response.status_code, 200)

	def test_user_add_new_word(self):
		'''
		User adds new word that they don't already have in their listt
		success: 200
		'''
		word = Word(word="dog", definition="woof woof ...")
		word.save()
		request = self.factory.get('/words/1')
		request.user = self.user_anja
		response = add_word(request, 1)
		print(response.content)
		self.assertEqual(response.status_code, 200)























