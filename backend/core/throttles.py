"""
Custom throttle classes for rate limiting authentication endpoints.
"""
from rest_framework.throttling import AnonRateThrottle


class LoginRateThrottle(AnonRateThrottle):
    """Rate limit for login attempts - 5 per minute"""
    scope = 'login'


class RegisterRateThrottle(AnonRateThrottle):
    """Rate limit for registration attempts - 3 per minute"""
    scope = 'register'
