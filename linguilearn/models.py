from django.db import models
from django.contrib.auth.models import AbstractUser

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

class User(AbstractUser):
	# followers = models.ManyToManyField("User", related_name="users_following")
	entries_mastered = models.ManyToManyField("Entry", related_name="users_mastered")
	entries = models.ManyToManyField("Entry", related_name="users")
	entries_starred = models.ManyToManyField("Entry", related_name="users_starred")
	
	def serialize(self):
		return {
			"id": self.id,
			"name": self.username.capitalize(),
			"followers": [user.id for user in self.followers.all()],
			"entries_mastered": [entry.id for entry in self.entries_mastered.all()],
			"entries": [entry.id for entry in self.entries.all()],
			"entries_starred": [entry.id for entry in self.entries_starred.all()],
		}

	def master_entry(self, entry_id):
		entry = Entry.objects.get(id=entry_id)
		if self.entries.filter(id=entry_id).exists():
			self.entries.remove(entry)
			self.entries_mastered.add(entry)
			return {
				"success": True
			}
		else:
			# TODO: replace this with a raised exception. Create your own exceptions file with custom exceptions
			return {
				"error": "Entry does not belong to user",
				"status_code": 404
			}


	def remove_entry(self, entry_id):
		entry = Entry.objects.get(id=entry_id)
		self.entries.remove(entry)
		self.entries_starred.remove(entry)
		self.entries_mastered.remove(entry)



