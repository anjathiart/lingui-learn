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
		}


class WordManager(models.Manager):
	pass


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
	def count_summary(self, user_id):
		qs = super(EntryManager, self).get_queryset().filter(user_id=user_id).all()
		return {
			"totalCount": qs.count(),
			"learningCount": qs.filter(entry_list=1).count(),
			"masteredCount": qs.filter(entry_list=2).count(),
			"archivedCount": qs.filter(entry_list=3).count(),
			"favouritesCount": qs.filter(favourites=True).count()
		}


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

	objects = EntryManager()

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
		valid_fields = ["context", "source", "author", "url", "notes", "favourites", "entryList", "entry_list"]

		for field in fields:
			if (field in valid_fields):
				setattr(self, field, fields[field])

		self.save()
				

	class Meta:
		ordering= ["-created_at"]


	




