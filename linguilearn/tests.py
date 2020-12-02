import json
import requests
from django.contrib.auth.models import AnonymousUser
from django.test import RequestFactory, TestCase
from .models import User, Entry, Word

from .views import search_entry, add_entry, remove_entry, star_entry, master_entry

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





"""
class EntriessApi(TestCase):
	def setUp(self):
		self.factory = RequestFactory()
		self.user_anja = User.objects.create_user(
			username='anja', email='anja@anja.com', password='anja')
		entry = Entry(word="dog", definition="woof woof ...")
		entry.save()
		self.user_anja.entries.add(entry)
		self.entry = entry
		unadded_entry =  Entry(word="test", definition="this entry does not exist in users list")
		unadded_entry.save()
		self.unadded_entry_id = unadded_entry.id

	def test_entry_search(self):
		'''
		Search for a word that is not in the DB, and is a lemma
		success: 200
		'''
		request = self.factory.get('api/entries/search?word=apples')
		request.user = self.user_anja
		response = search_entry(request)
		print(response.content)
		self.assertEqual(response.status_code, 200)

	def test_entry_search_in_db(self):
		'''
		Search for a word that is in the DB already
		success: 200
		'''
		request = self.factory.get('api/entries/search?word=Dog')
		request.user = self.user_anja
		response = search_entry(request)
		print(response.content)
		self.assertEqual(response.status_code, 200)

	def test_user_add_new_word(self):
		'''
		User adds new word that they don't already have in their listt
		success: 200
		'''
		request = self.factory.post('api/entries/1/add')
		request.user = self.user_anja
		response = add_entry(request, 1)
		print(response.content)
		self.assertEqual(response.status_code, 200)


	def test_user_star_word(self):
		'''
		User stars an entry
		success: 200
		'''
		request = self.factory.post('api/entries/1/star')
		request.user = self.user_anja
		response = star_entry(request, 1)
		print(response.content)
		self.assertEqual(response.status_code, 200)

	def test_user_master_nonexisting_user_entry(self):
		'''
		User masters entry that does not exist in their entries
		Force Error: 404
		'''
		request = self.factory.post('api/entries/' + str(self.unadded_entry_id) + '/master')
		request.user = self.user_anja
		response = master_entry(request, self.unadded_entry_id)
		print(response.content)
		self.assertEqual(response.status_code, 404)

	def test_user_master_nonexisting_entry(self):
		'''
		User masters entry that does not exist in their entries
		Force Error: 404
		'''
		request = self.factory.post('api/entries/' + str(33) + '/master')
		request.user = self.user_anja
		response = master_entry(request, 33)
		print(response.content)
		self.assertEqual(response.status_code, 404)


#  NOTE: to run one testcase in file: manage.py test linguilearn.tests:WordsApi.test_test  
class WordsApi(TestCase):
	def setUp(self):
		# self.factory = RequestFactory()
		self.user_anja = User.objects.create_user(
			username='anja', email='anja@anja.com', password='anja')
		word = Word(word_id="dog")
		word.save()
		word.learning.add(self.user_anja)
		# word.master(self.user_anja)
		self.word = word

		# self.user_anja.entries.add(entry)
		# self.entry = entry
		# unadded_entry =  Entry(word="test", definition="this entry does not exist in users list")
		# unadded_entry.save()
		# self.unadded_entry_id = unadded_entry.id
	def test_test(self):
		'''
		testing testing
		'''
		print('hi')
		print(self.word.serialize())
		# words_learning = Word.objects.filter(learning__id=self.user_anja.id).all()
		words_learning = Word.objects.get_words_learning(self.user_anja)
		print(words_learning)
"""


















