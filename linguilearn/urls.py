from django.urls import path

from . import views

urlpatterns = [
	path("", views.index, name="index"),
	path("login", views.login_view, name="login"),
	path("logout", views.logout_view, name="logout"),
	path("register", views.register, name="register"),

	# API

	path('v1/users', views.users),
	path('v1/users/<int:user_id>/profile', views.user_profile),
	path('v1/users/current', views.user_current),
	path('v1/users/<int:user_id>/library', views.library),

	# path('v1/entries/search', views.search_entry),
	# path('v1/entries/<int:word_id>/add', views.add_entry),
	path('v1/entries/<int:word_id>/remove', views.remove_entry,),
	path('v1/entries/<int:word_id>/star', views.star_entry),
	path('v1/entries/<int:word_id>/master', views.master_entry),
	path('v1/entries/<int:word_id>/add', views.add_entry),
	path('v1/entries/<str:text>/addcustom', views.add_custom_entry),
	path('v1/entries/<int:entry_id>/update', views.update_entry),
	# path('v1/entries/<int:user_id')

	# path('v1/lib')

	# WIP -> Splitting word endpoints and entry endpoints up
	path('v1/words/search', views.word_search)
]
