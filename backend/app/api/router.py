from fastapi import APIRouter
from app.api import general, auth

api_router = APIRouter()
api_router.include_router(general.router, prefix="")
api_router.include_router(auth.router, prefix="/auth")
#api_router.include_router(logs.router, prefix="/")
