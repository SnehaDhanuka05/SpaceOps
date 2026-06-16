from fastapi import APIRouter, Depends
from app.models.schemas import AIExplanationRequest, AIExplanationResponse
from app.services.ai_service import AIService

router = APIRouter()

@router.post("/explain/space-weather", response_model=AIExplanationResponse)
async def explain_space_weather(request: AIExplanationRequest):
    explanation, cached = await AIService.get_explanation("space-weather", request.data_id, request.data_summary)
    return AIExplanationResponse(
        event_type="space-weather",
        data_id=request.data_id,
        explanation=explanation,
        cached=cached
    )

@router.post("/explain/neo", response_model=AIExplanationResponse)
async def explain_neo(request: AIExplanationRequest):
    explanation, cached = await AIService.get_explanation("neo", request.data_id, request.data_summary)
    return AIExplanationResponse(
        event_type="neo",
        data_id=request.data_id,
        explanation=explanation,
        cached=cached
    )

@router.post("/explain/launch", response_model=AIExplanationResponse)
async def explain_launch(request: AIExplanationRequest):
    explanation, cached = await AIService.get_explanation("launch", request.data_id, request.data_summary)
    return AIExplanationResponse(
        event_type="launch",
        data_id=request.data_id,
        explanation=explanation,
        cached=cached
    )

