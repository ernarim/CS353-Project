from fastapi import APIRouter
from app.api import general

api_router = APIRouter()
api_router.include_router(general.router, prefix="")
#api_router.include_router(logs.router, prefix="/")
