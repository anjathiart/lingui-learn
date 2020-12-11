import json
import random
from markdown2 import Markdown
from django.db import models
from django.contrib.auth.models import AbstractUser
from linguilearn.exceptions import AlreadyExistsError, DoesNotExistForUser
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger


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
			"details": json.loads(self.details) if self.details else {},
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

	def library(self, user_id, listFilter, page, limit, order='-created_at'):

		if order == 'random':
			my_order = '?'
		else:
			my_order = order

		if listFilter == 'learning':
			listFilter = 1
		elif listFilter == 'mastered':
			listFilter = 2

		if listFilter == 'favourites':
			entries = super(EntryManager, self).get_queryset().filter(user_id=user_id, favourites=True).order_by(my_order).all()
		elif listFilter == 'all':
			entries = super(EntryManager, self).get_queryset().filter(user_id=user_id).order_by(my_order).all()
		elif listFilter == 'customWord':
			entries = super(EntryManager, self).get_queryset().filter(user_id=user_id, word_customEntry=True).order_by(my_order).all()
		else:
			entries = super(EntryManager, self).get_queryset().filter(user_id=user_id, entry_list=listFilter).order_by(my_order).all()

		paginator = Paginator(entries, limit)

		try:
			entry_objects = paginator.page(page)
		except PageNotAnInteger:
			entry_objects = paginator.page(1)
			page = 1
		except EmptyPage:
			entry_objects = paginator.page(paginator.num_pages)
			page = paginator.num_pages

		result = {
			"prev": entry_objects.has_previous(),
			"next": entry_objects.has_next(),
			"num_pages": paginator.num_pages,
			"page": page,
			"limit": limit,
			"order": my_order,
			"totalCount": entries.count(),
			"learningCount": entries.filter(entry_list=1).count(),
			"masteredCount": entries.filter(entry_list=2).count(),
			"archivedCount": entries.filter(entry_list=3).count(),
			"favouritesCount": entries.filter(favourites=True).count()
		}

		entries_serialized = [entry.serialize_short() for entry in entry_objects]
		result["list"] = entries_serialized
		return result


class Entry(models.Model):
	user = models.ForeignKey("User", on_delete=models.CASCADE, related_name="user_entries")
	word =  models.ForeignKey("Word", on_delete=models.CASCADE, related_name="word_entries")
	created_at = models.DateTimeField(auto_now_add=True)
	# optional entries
	context = models.CharField(max_length=1024, blank=True)
	source = models.CharField(max_length=255, blank=True)
	author = models.CharField(max_length=255, blank=True)
	url = models.TextField(blank=True)
	notes = models.TextField(blank=True)
	favourites = models.BooleanField(default=False)

	LIST_CHOICES = [('1', 'Learning'), ('2', 'Mastered'), ('3', 'Archived'), ('0', None)]

	entry_list = models.CharField(max_length=32, choices=LIST_CHOICES, default='0')

	objects = EntryManager()

	def __self__(self):
		return self.id

	def serialize_short(self):
		markdowner = Markdown()
		customWord = Word.objects.get(id=self.word_id).customWord
		return {
			"id": self.id,
			"word": self.word.text,
			"context": self.context,
			"source": self.source,
			"author": self.author,
			"url": self.url,
			"notes": self.notes,
			"favourites": self.favourites,
			"isCustomWord": customWord,
			"created": self.created_at,
			"entry_list": self.entry_list,
		}

	def serialize_long(self):
		
		try:
			wordDetails = Word.objects.get(id=self.word_id)
		except Word.DoesNotExist as e:
			raise ValueError(e)
		result = self.serialize_short()
		wordDetails_serialized = wordDetails.serialize()
		result["details"] = wordDetails_serialized['details']
		return result



	def update_entry(self, fields):
		valid_fields = ["context", "source", "author", "url", "notes", "favourites", "entryList", "entry_list", "isCustomWord"]
		markdowner = Markdown()
		for field in fields:
			if (field in valid_fields):
				if field == "notes":
					setattr(self, field, markdowner.convert(fields[field]))
				else:
					setattr(self, field, fields[field])

		self.save()



	




