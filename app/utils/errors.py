from fastapi import Request
from fastapi.responses import JSONResponse
from app.utils.logger import get_logger
import asyncio
import functools

logger = get_logger(__name__)

def retry_with_backoff(retries: int = 3, initial_delay: float = 1.0, factor: float = 2.0):
    def decorator(func):
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            delay = initial_delay
            for attempt in range(1, retries + 1):
                try:
                    return await func(*args, **kwargs)
                except Exception as e:
                    if attempt == retries:
                        logger.error(f"Failed to execute {func.__name__} after {retries} attempts: {e}")
                        raise e
                    logger.warning(
                        f"Attempt {attempt} for {func.__name__} failed: {e}. "
                        f"Retrying in {delay:.2f} seconds..."
                    )
                    await asyncio.sleep(delay)
                    delay *= factor
        return wrapper
    return decorator

class SpaceOpsException(Exception):
    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(message)

class ExternalAPIException(SpaceOpsException):
    def __init__(self, message: str, status_code: int = 502):
        super().__init__(message, status_code)

class NotFoundException(SpaceOpsException):
    def __init__(self, message: str, status_code: int = 404):
        super().__init__(message, status_code)

async def spaceops_exception_handler(request: Request, exc: SpaceOpsException) -> JSONResponse:
    logger.error(f"SpaceOpsException on {request.url.path}: {exc.message}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.message, "status": "failed"}
    )

