import logging
import sys
import json
from app.config import settings

class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_entry = {
            "timestamp": self.formatTime(record, self.datefmt),
            "level": record.levelname,
            "module": record.module,
            "message": record.getMessage(),
        }
        if record.exc_info:
            log_entry["exception"] = self.formatException(record.exc_info)
        return json.dumps(log_entry)

def get_logger(name: str) -> logging.Logger:
    logger = logging.getLogger(name)
    if not logger.handlers:
        logger.setLevel(logging.INFO)
        handler = logging.StreamHandler(sys.stdout)
        if settings.APP_ENV == "production":
            formatter = JSONFormatter()
        else:
            formatter = logging.Formatter(
                '[%(asctime)s] %(levelname)s in %(module)s: %(message)s'
            )
        handler.setFormatter(formatter)
        logger.addHandler(handler)
    return logger

