# main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.router import api_router
from app.database.session import cursor, conn
from fastapi.staticfiles import StaticFiles
from app.api.buyer_profile import router as buyer_profile_router
from app.api.org_profile import router as org_profile_router


app = FastAPI()
app.include_router(api_router, prefix="/api")
app.include_router(buyer_profile_router, prefix="/api")
app.include_router(org_profile_router, prefix="/api")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
    
)
app.mount("/api/static", StaticFiles(directory="app/static"), name="static")


def execute_sql_script(file_path, conn):
    with open(file_path, 'r') as sql_file:
        sql_script = sql_file.read()

    with conn.cursor() as cursor:
        cursor.execute(sql_script)
        conn.commit()

sql_file_path = 'app/database/init.sql'

execute_sql_script(sql_file_path, conn)

