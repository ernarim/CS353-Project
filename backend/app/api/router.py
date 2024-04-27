from fastapi import APIRouter
from app.api import general, auth, user, event, event_category, venue, restriction

api_router = APIRouter()
api_router.include_router(general.router, prefix="")
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(user.router, prefix="/user", tags=["user"])
api_router.include_router(event.router, prefix="/event", tags=["event"])
api_router.include_router(event_category.router, prefix="/event_category", tags=["event_category"])
api_router.include_router(venue.router, prefix="/venue", tags=["venue"])
api_router.include_router(restriction.router, prefix="/restriction", tags=["restriction"])

#api_router.include_router(logs.router, prefix="/")
