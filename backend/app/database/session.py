import psycopg2
from fastapi import FastAPI



DATABASE_URL = "postgresql://postgres:admin123@localhost:5432/cs353"
conn = psycopg2.connect(DATABASE_URL)
cursor = conn.cursor()


