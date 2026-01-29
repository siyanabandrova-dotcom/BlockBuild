FROM python:3.10

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY api ./api

EXPOSE 5000

CMD ["sh", "-c", "uvicorn api.index:app --host 0.0.0.0 --port $PORT"]