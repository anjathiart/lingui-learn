import json
import requests
from django.contrib.auth.models import AnonymousUser
from django.test import RequestFactory, TestCase
from .models import User, Entry, Word

from .views import *

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


class WordsAPI(TestCase):
	def setUp(self):
		self.factory = RequestFactory()
		self.user_anja = User.objects.create_user(
			username='anja', email='anja@anja.com', password='anja')


	def test_search_valid_word(self):
		'''
		Search for a word that exists in the english language
		succes: 200
		'''
		request = self.factory.get('v1/words/search?q=animal')
		request.user = self.user_anja
		response = word_search(request)
		self.assertEqual(response.status_code, 200)

	def test_search_unknown_word(self):
		'''
		Search for a word that exists in the english language
		Error: 404
		'''
		request = self.factory.get('v1/words/search?q=shshs')
		request.user = self.user_anja
		response = word_search(request)
		status = response.status_code
		self.assertEqual(status, 404)


class EntriesAPI(TestCase):
	def setUp(self):
		self.factory = RequestFactory()
		self.user_anja = User.objects.create_user(
			username='anja', email='anja@anja.com', password='anja')
		word = Word(text='apple')
		word.save()
		self.wordId = word.id


	def test_add_word_that_exists(self):
		'''
		Add a word that exists in the database
		success 200
		'''
		request = self.factory.post('v1/entries/' + str(self.wordId) + '/add')
		request.user = self.user_anja
		response = add_entry(request, self.wordId)
		self.assertEqual(response.status_code, 200)

	def test_add_word_that_does_not_exist(self):
		'''
		Add a word that does not exists in the database
		error 400
		'''
		request = self.factory.post('v1/entries/' + '300' + '/add', word_id=300)
		request.user = self.user_anja
		response = add_entry(request, 300)
		self.assertEqual(response.status_code, 400)

	def test_add_word_using_get(self):
		'''
		Add a word with incorrect request method
		error 405
		'''
		request = self.factory.get('v1/entries/' + '300' + '/add', word_id=300)
		request.user = self.user_anja
		response = add_entry(request, 300)
		self.assertEqual(response.status_code, 405)

	def test_fetch_library_for_user(self):
		'''
		Fetch the library of the logged in user
		success 200
		'''
		request = self.factory.post('v1/entries/' + str(self.wordId) + '/add')
		request.user = self.user_anja
		response = add_entry(request, self.wordId)
		# self.assertEqual(response.status_code, 200)
		request = self.factory.get('v1/users/library')
		request.user = self.user_anja
		response = library(request)
		self.assertEqual(response.status_code, 200)









