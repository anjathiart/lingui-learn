from django.urls import path

from . import views

urlpatterns = [
	path("", views.index, name="index"),
	path("login", views.login_view, name="login"),
	path("logout", views.logout_view, name="logout"),
	path("register", views.register, name="register"),

	# API
	path('friendship/<str:to_username>/add', views.friendship_add_friend, name="add_friend"),
	path("friendship/requests_sent_list", views.friendship_requests_sent_list, name="friendship_requests_list"),
	path('friendship/<int:friendship_request_id>/cancel', views.friendship_cancel, name="friendship_cancel"),
	path('friendship/<int:friendship_request_id>/accept', views.friendship_accept, name="friendship_accept"),
	path('friendship/<int:friendship_request_id>/accept', views.friendship_reject, name="friendship_reject"),

	path('users/friends', views.user_friends, name="user_friends")
]
