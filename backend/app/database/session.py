import psycopg2
from fastapi import FastAPI
import os
from dotenv import dotenv_values
from psycopg2.extras import RealDictCursor
backend_env_path = os.path.join(os.path.dirname(__file__), ".env")
backend_env = dotenv_values(backend_env_path)
DATABASE_URL = backend_env.get("DATABASE_URL")

conn = psycopg2.connect(DATABASE_URL)
cursor = conn.cursor()


