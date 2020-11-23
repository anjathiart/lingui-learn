from django.db import models
from django.contrib.auth.models import AbstractUser
from linguilearn.exceptions import AlreadyExistsError, DoesNotExistForUser

'''
class Entry(models.Model):
	word = models.CharField(max_length=255)
	definition = models.CharField(max_length=1028)
	# example = models.CharField(max_length=1028)
	# phrase = models.CharField(max_length=1028)
	# word_of_the_day = models.BooleanField(default=False)
	# word_of_the_day_date = models.DateTimeField(auto_now_add=False)
	def serialize(self):
		return {
			"id": self.id,
			"word": self.word,
			"definition": self.definition,
			# "example": self.subject,
			# "phrase": self.body,
		}
'''

class User(AbstractUser):

	# Entries mastered by user
	# entries_mastered = models.ManyToManyField("Entry", related_name="users_mastered")
	# Entries added by user but not yet mastered
	# entries = models.ManyToManyField("Entry", related_name="users")
	# Entries starred by user (can be any entry in the Entries Table)
	# entries_starred = models.ManyToManyField("Entry", related_name="users_starred")


	def serialize(self):
		return {
			"id": self.id,
			"name": self.username.capitalize(),
			# "followers": [user.id for user in self.followers.all()],
			# "entries_mastered": [entry.id for entry in self.entries_mastered.all()],
			# "entries": [entry.id for entry in self.entries.all()],
			# "entries_starred": [entry.id for entry in self.entries_starred.all()],
		}

	def master_entry(self, entry_id):
		''' add entry to mastered entries list if the entry exists for the user '''
		if self.entries.filter(id=entry_id).exists():
			self.entries.remove(entry)
			self.entries_mastered.add(Entry.objects.get(id=entry_id))
			return True
		else:
			raise DoesNotExistForUser("Entry does not exist for this user")


	def remove_entry(self, entry_id):
		''' Remove an entry from user entries and user's master entries '''
		if self.entries.filter(id=entry_id).exists() or self.entries_mastered.filter(id=entry_id).exists():
			entry = Entry.objects.get(id=entry_id)
			self.entries.remove(entry)
			self.entries_mastered.remove(entry)
			return True
		else:
			raise DoesNotExistForUser("Entry does not exist for this user")



	'''
	def unstar_entry(self, entry_id):
		# remove entry from starred list if it exists for the user
		if self.entries_starred.filter(id=entry_id).exists():
			self.entries_starred.remove(Entry.objects.get(id=entry_id))
			return True
		else:
			raise DoesNotExistForUser("Entry does not exist for this user")
	'''

class WordManager(models.Manager):
	def get_words_learning(self, user):
		qs = super(WordManager, self).get_queryset().filter(learning=user)
		return [word.word_id for word in qs]
		# return super(WordManager, self).get_queryset().filter(learning=user)

	def get_words_learning_count(self, user):
		qs = super(WordManager, self).get_queryset().filter(learning=user)
		return qs.count()

	def get_words_mastered(self, user):
		qs = super(WordManager, self).get_queryset().filter(mastered=user)
		return [word.word_id for word in qs]

	def get_words_mastered_count(self, user):
		qs = super(WordManager, self).get_queryset().filter(mastered=user)
		return qs.count()

	def get_words_liked(self, user):
		qs = super(WordManager, self).get_queryset().filter(liked=user)
		return [word.word_id for word in qs]

	def get_words_liked_count(self, user):
		qs = super(WordManager, self).get_queryset().filter(liked=user)
		return qs.count()


class Word(models.Model):
	text = models.CharField(max_length=255)
	details = models.TextField(blank=True)
	learning = models.ManyToManyField("User", related_name="users_learning")
	mastered = models.ManyToManyField("User", related_name="users_mastered") 
	liked = models.ManyToManyField("User", related_name="users_liked")

	objects = WordManager()

	def serialize(self):
		return {
			"id": self.id,
			"word": self.text,
			"users_learning": [user.id for user in self.learning.all()],
			"users_mastered": [user.id for user in self.mastered.all()],
			"users_liked": [user.id for user in self.liked.all()],
		}

	def master(self, user):
		self.learning.remove(user)
		self.mastered.add(user)


class Entry(models.Model):
	user = models.ForeignKey("User", on_delete=models.CASCADE, related_name="user_entries")
	word =  models.ForeignKey("Word", on_delete=models.CASCADE, related_name="word_entries")
	# word = models.ForeignKey("Word", on_delete=models.CASCADE, related_name="entries")
	# optional entries
	context = models.CharField(max_length=1024, blank=True)
	source = models.CharField(max_length=255, blank=True)
	author = models.CharField(max_length=255, blank=True)
	url = models.TextField(blank=True)
	notes = models.TextField(blank=True)
	created_at = models.DateTimeField(auto_now_add=True)
	# last_modified = models.DateTimeField(auto_now_add=False)

	def serialize(self):
		return {
			"id": self.id,
			"word": self.word.text,
			"context": self.context,
			"source": self.source,
			"author": self.author,
			"url": self.url,
			"notes": self.notes,
			"created": self.created_at
		}

	class Meta:
		ordering= ["-created_at"]


	




