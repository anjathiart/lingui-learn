from django.urls import path

from . import views

urlpatterns = [
	path("", views.index, name="index"),
	path("login", views.login_view, name="login"),
	path("logout", views.logout_view, name="logout"),
	path("register", views.register, name="register"),

	# API
	path('api/friendship/<str:to_username>/add', views.friendship_add_friend),
	path("api/friendship/requests_sent_list", views.friendship_requests_sent_list),
	path('api/friendship/<int:friendship_request_id>/cancel', views.friendship_cancel),
	path('api/friendship/<int:friendship_request_id>/accept', views.friendship_accept),
	path('api/friendship/<int:friendship_request_id>/accept', views.friendship_reject),

	path('api/users/friends', views.user_friends),

	path('api/entries/search', views.search_entry),
	path('api/entries/<int:word_id>/add', views.add_entry),
	path('api/entries/<int:word_id>/remove', views.remove_entry,),
	path('api/entries/<int:word_id>/star', views.star_entry),
	path('api/entries/<int:word_id>/master', views.master_entry)
]
