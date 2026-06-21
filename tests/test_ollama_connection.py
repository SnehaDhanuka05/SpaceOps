#import pytest
#import httpx
#from app.config import settings

#def is_ollama_running() -> bool:
#     try:
#         response = httpx.get(f"{settings.OLLAMA_BASE_URL}/api/tags", timeout=1.0)
#         return response.status_code == 200
#     except Exception:
#         return False

# @pytest.mark.skipif(not is_ollama_running(), reason="Ollama local service is not running")
# def test_ollama_connection():
#     response = httpx.get(f"{settings.OLLAMA_BASE_URL}/api/tags")
#     assert response.status_code == 200
#     data = response.json()
#     assert "models" in data
