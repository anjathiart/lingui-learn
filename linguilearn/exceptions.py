from django.db import IntegrityError


class AlreadyExistsError(IntegrityError):
    pass


class DoesNotExistForUser(IntegrityError):
    pass