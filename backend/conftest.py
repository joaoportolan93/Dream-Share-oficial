import pytest


@pytest.fixture(autouse=True)
def disable_throttling(settings):
    """Disable rate throttling during tests to prevent 429 errors."""
    settings.REST_FRAMEWORK = {
        **settings.REST_FRAMEWORK,
        'DEFAULT_THROTTLE_CLASSES': [],
        'DEFAULT_THROTTLE_RATES': {
            'anon': '10000/minute',
            'user': '10000/minute',
            'login': '10000/minute',
            'register': '10000/minute',
        },
    }
