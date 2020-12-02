from django.db import models
from django.contrib.auth.models import AbstractUser
from linguilearn.exceptions import AlreadyExistsError, DoesNotExistForUser

class User(AbstractUser):

	def __str__(self):
		return self.username

	def serialize(self):
		return {
			"id": self.id,
			"name": self.username.capitalize(),
			# "followers": [user.id for user in self.followers.all()],
			# "entries_mastered": [entry.id for entry in self.entries_mastered.all()],
			# "entries": [entry.id for entry in self.entries.all()],
			# "entries_starred": [entry.id for entry in self.entries_starred.all()],
		}

	# def master_entry(self, entry_id):
	# 	''' add entry to mastered entries list if the entry exists for the user '''
	# 	if self.entries.filter(id=entry_id).exists():
	# 		self.entries.remove(entry)
	# 		self.entries_mastered.add(Entry.objects.get(id=entry_id))
	# 		return True
	# 	else:
	# 		raise DoesNotExistForUser("Entry does not exist for this user")


	# def remove_entry(self, entry_id):
	# 	''' Remove an entry from user entries and user's master entries '''
	# 	if self.entries.filter(id=entry_id).exists() or self.entries_mastered.filter(id=entry_id).exists():
	# 		entry = Entry.objects.get(id=entry_id)
	# 		self.entries.remove(entry)
	# 		self.entries_mastered.remove(entry)
	# 		return True
	# 	else:
	# 		raise DoesNotExistForUser("Entry does not exist for this user")



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
	pass
	# def get_words_learning(self, user):
	# 	qs = super(WordManager, self).get_queryset().filter(learning=user)
	# 	return [word.word_id for word in qs]
	# 	# return super(WordManager, self).get_queryset().filter(learning=user)

	# def get_words_learning_count(self, user):
	# 	qs = super(WordManager, self).get_queryset().filter(learning=user)
	# 	return qs.count()

	# def get_words_mastered(self, user):
	# 	qs = super(WordManager, self).get_queryset().filter(mastered=user)
	# 	return [word.word_id for word in qs]

	# def get_words_mastered_count(self, user):
	# 	qs = super(WordManager, self).get_queryset().filter(mastered=user)
	# 	return qs.count()

	# def get_words_liked(self, user):
	# 	qs = super(WordManager, self).get_queryset().filter(liked=user)
	# 	return [word.word_id for word in qs]

	# def get_words_liked_count(self, user):
	# 	qs = super(WordManager, self).get_queryset().filter(liked=user)
	# 	return qs.count()


class Word(models.Model):
	text = models.CharField(max_length=255, unique=True)
	details = models.TextField(blank=True)
	customWord = models.BooleanField(default=False)

	# objects = WordManager()

	def __str__(self):
		return self.text

	def serialize(self):
		return {
			"id": self.id,
			"word": self.text,
			"details": json.load(self.details) if self.details else {},
			"isCustomWord": self.customWord
		}

	def master(self, user):
		self.learning.remove(user)
		self.mastered.add(user)



class EntryManager(models.Manager):
	pass


class Entry(models.Model):
	user = models.ForeignKey("User", on_delete=models.CASCADE, related_name="user_entries")
	word =  models.ForeignKey("Word", on_delete=models.CASCADE, related_name="word_entries")
	# optional entries
	context = models.CharField(max_length=1024, blank=True)
	source = models.CharField(max_length=255, blank=True)
	author = models.CharField(max_length=255, blank=True)
	url = models.TextField(blank=True)
	notes = models.TextField(blank=True)
	created_at = models.DateTimeField(auto_now_add=True)
	starred_by = models.ManyToManyField('User', blank=True, related_name="starred_entries" )
	favourites = models.BooleanField(default=False)

	LIST_CHOICES = [('1', 'Learning'), ('2', 'Mastered'), ('3', 'Archived'), ('0', None)]

	entry_list = models.CharField(max_length=32, choices=LIST_CHOICES, default='0')


	def __self__(self):
		return self.id

	def serialize(self):
		return {
			"id": self.id,
			"word": self.word.text,
			"context": self.context,
			"source": self.source,
			"author": self.author,
			"url": self.url,
			"notes": self.notes,
			"favourites": self.favourites,
			"created": self.created_at,
			"entry_list": self.entry_list,

		}


	def update_entry(self, fields):
		valid_fields = ["context", "source", "author", "url", "notes", "favourite", "entryList", "entry_list"]

		for field in fields:
			if (field in valid_fields):
				setattr(self, field, fields[field])

		self.save()
				

	class Meta:
		ordering= ["-created_at"]


	




