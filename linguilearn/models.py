from django.db import models
from django.contrib.auth.models import AbstractUser

class Word(models.Model):
	word = models.CharField(max_length=255)
	definition = models.CharField(max_length=1028)
	example = models.CharField(max_length=1028)
	phrase = models.CharField(max_length=1028)
	word_of_the_day = models.BooleanField(default=False)
	word_of_the_day_date = models.DateTimeField(auto_now_add=False)
	def serialize(self):
		return {
			"id": self.id,
			"word": self.sender.email,
			"definition": [user.email for user in self.recipients.all()],
			"example": self.subject,
			"phrase": self.body,
		}

class User(AbstractUser):
	# followers = models.ManyToManyField("User", related_name="users_following")
	mastered_words = models.ManyToManyField("Word", related_name="users_mastered")
	learning_words = models.ManyToManyField("Word", related_name="users_learning")
	favourite_words = models.ManyToManyField("Word", related_name="users_favourite")
	def serialize(self):
		return {
			"id": self.id,
			"name": self.username.capitalize(),
			"followers": [user.id for user in self.followers.all()],
			"mastered_words": [word.id for word in self.mastered_words.all()],
			"learning_words": [word.id for word in self.learning_words.all()],
			"favourite_words": [word.id for word in self.favourite_words.all()],
		}


