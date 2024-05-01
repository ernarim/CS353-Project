. .venv/bin/activate
RUN_TYPE=local uvicorn app.main:app --reload --host 0.0.0.0 --port 8000