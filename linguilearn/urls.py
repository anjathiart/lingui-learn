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
]
