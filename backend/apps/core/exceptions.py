"""
Custom exception handler for DRF.
"""

from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import ValidationError as DjangoValidationError
from django.http import Http404
from rest_framework.exceptions import ValidationError as DRFValidationError


def custom_exception_handler(exc, context):
    """
    Custom exception handler that provides consistent error responses.
    """
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)

    if response is not None:
        # Customize the response data
        custom_response_data = {
            'success': False,
            'error': {
                'message': '',
                'details': {}
            }
        }

        if isinstance(exc, DRFValidationError):
            custom_response_data['error']['message'] = 'Validation Error'
            custom_response_data['error']['details'] = response.data
        elif isinstance(exc, Http404):
            custom_response_data['error']['message'] = 'Resource not found'
        else:
            custom_response_data['error']['message'] = str(exc)
            if hasattr(response, 'data'):
                custom_response_data['error']['details'] = response.data

        response.data = custom_response_data

    elif isinstance(exc, DjangoValidationError):
        # Handle Django validation errors
        custom_response_data = {
            'success': False,
            'error': {
                'message': 'Validation Error',
                'details': exc.message_dict if hasattr(exc, 'message_dict') else {'non_field_errors': exc.messages}
            }
        }
        response = Response(custom_response_data, status=status.HTTP_400_BAD_REQUEST)

    return response


class APIException(Exception):
    """
    Base exception class for API errors.
    """
    status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
    default_message = 'An error occurred'

    def __init__(self, message=None, status_code=None):
        self.message = message or self.default_message
        if status_code:
            self.status_code = status_code
        super().__init__(self.message)


class BadRequestException(APIException):
    """Exception for bad requests."""
    status_code = status.HTTP_400_BAD_REQUEST
    default_message = 'Bad request'


class NotFoundException(APIException):
    """Exception for not found resources."""
    status_code = status.HTTP_404_NOT_FOUND
    default_message = 'Resource not found'


class UnauthorizedException(APIException):
    """Exception for unauthorized access."""
    status_code = status.HTTP_401_UNAUTHORIZED
    default_message = 'Unauthorized access'


class ForbiddenException(APIException):
    """Exception for forbidden access."""
    status_code = status.HTTP_403_FORBIDDEN
    default_message = 'Access forbidden'


class ConflictException(APIException):
    """Exception for resource conflicts."""
    status_code = status.HTTP_409_CONFLICT
    default_message = 'Resource conflict'
