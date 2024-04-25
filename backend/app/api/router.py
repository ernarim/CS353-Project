from fastapi import APIRouter
from app.api import general, auth, user

api_router = APIRouter()
api_router.include_router(general.router, prefix="")
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(user.router, prefix="/user", tags=["user"])
#api_router.include_router(logs.router, prefix="/")
