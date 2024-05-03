from typing import Union, Any
from datetime import datetime
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from .utils import (
    ALGORITHM,
    JWT_SECRET_KEY
)

from jose import jwt
from pydantic import ValidationError
from app.models.user import User
from app.database.session import cursor, conn

reuseable_oauth = OAuth2PasswordBearer(
    tokenUrl="/api/auth/login",
    scheme_name="JWT"
)

async def get_current_user(token: str = Depends(reuseable_oauth)) -> User:
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        print("User ID from token:", user_id)
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Invalid token payload",
                headers={"WWW-Authenticate": "Bearer"},
            )

        cursor.execute("SELECT * FROM users WHERE email = %s", (user_id,))
        user_row = cursor.fetchone()

        if user_row is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Could not find user",
            )

        column_names = [desc[0] for desc in cursor.description]
        print("Column names:", column_names)

        user_dict = dict(zip(column_names, user_row))
        print("User dictionary:", user_dict)

        return user_dict
        
    except (jwt.JWTError, ValidationError) as e:
        print("Error:", e)
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

