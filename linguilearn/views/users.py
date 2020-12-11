from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from ..models import User, Entry
from .my_decorators import *

@http_auth_required
@require_http_methods(['GET'])
def user_current(request):
	ctx = { "userId": request.user.id, "userName": request.user.username }
	ctx["listCountSummary"] = Entry.objects.count_summary(user_id=request.user.id)
	return JsonResponse(ctx, status=200)


@http_auth_required
@require_http_methods(['GET'])
def library(request):
	ctx = { "userId": request.user.id }

	listFilter = request.GET.get('filter', 'all')
	page = request.GET.get('page', 1)
	limit = request.GET.get('limit', 2)
	order = request.GET.get('order', '-created_at')
	print(order)
	order = '?' if order == '-?' else order

	# TODO: validate the query string
	ctx['filter'] =  listFilter

	library = Entry.objects.library(request.user.id, listFilter, page, limit, order)
	if not library:
		ctx["error"] = "The library could not be found or is empty"
		return JsonResponse(ctx, status=404)

	ctx["data"] = library
	return JsonResponse(ctx, status=200)