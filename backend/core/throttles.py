"""
Custom throttle classes for rate limiting API requests.

Provides protection against:
- Brute force login attempts
- Registration abuse
- API abuse
"""

from rest_framework.throttling import AnonRateThrottle, UserRateThrottle


class LoginRateThrottle(AnonRateThrottle):
    """
    Throttle for login attempts.
    Limits to 5 requests per minute for unauthenticated users.
    """
    scope = 'login'


class RegisterRateThrottle(AnonRateThrottle):
    """
    Throttle for registration attempts.
    Limits to 3 requests per minute for unauthenticated users.
    """
    scope = 'register'


class BurstRateThrottle(UserRateThrottle):
    """
    Throttle for burst requests from authenticated users.
    Allows more requests but with shorter time window.
    """
    scope = 'burst'


class SustainedRateThrottle(UserRateThrottle):
    """
    Throttle for sustained requests from authenticated users.
    Fewer requests allowed but over a longer period.
    """
    scope = 'sustained'
