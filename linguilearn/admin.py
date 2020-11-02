from django.contrib import admin

# Register your models here.
from .models import User, Word, Entry

admin.site.register(User)
admin.site.register(Word)
admin.site.register(Entry)