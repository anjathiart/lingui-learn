from django.urls import path

from . import views

urlpatterns = [
	path("", views.index, name="index"),
	path("login", views.login_view, name="login"),
	path("logout", views.logout_view, name="logout"),
	path("register", views.register, name="register"),

	# API
	path('v1/friendships', views.friendships),
	path('v1/friendship/<str:to_user_email>/add', views.friendship_add_friend),
	path("v1/friendship/requests_sent_list", views.friendship_requests_sent_list),
	path('v1/friendship/<int:friendship_request_id>/cancel', views.friendship_cancel),
	path('v1/friendship/<int:friendship_request_id>/accept', views.friendship_accept),
	path('v1/friendship/<int:friendship_request_id>/accept', views.friendship_reject),

	path('v1/users', views.users),
	path('v1/users/friends', views.user_friends),
	path('v1/users/<int:user_id>/profile', views.user_profile),
	path('v1/users/current', views.user_current),

	# path('v1/entries/search', views.search_entry),
	# path('v1/entries/<int:word_id>/add', views.add_entry),
	path('v1/entries/<int:word_id>/remove', views.remove_entry,),
	path('v1/entries/<int:word_id>/star', views.star_entry),
	path('v1/entries/<int:word_id>/master', views.master_entry),
	path('v1/entries/<int:word_id>/add', views.add_entry),

	# WIP -> Splitting word endpoints and entry endpoints up
	path('v1/words/search', views.word_search)
]
