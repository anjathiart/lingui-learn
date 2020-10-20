from functools import wraps
from django.http import JsonResponse

# Decorator function to protect views that require a user to be authenticated
def http_auth_required(view_func):
	@wraps(view_func)
	def wrapper(request, *args, **kwargs):
		if request.user.is_authenticated:
			return view_func(request, *args, **kwargs)
		ctx = {}
		ctx["errors"] = ["Unauthorised. User must be authenticated."]
		return JsonResponse(ctx, status=401)
	return wrapper
