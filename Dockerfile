FROM python:3.10

WORKDIR /app

COPY requirements.txt .

# 1. Ъпдейт на pip
RUN pip install --upgrade pip

# 2. Инсталираме CPU версия на torch (БЕЗ CUDA)
RUN pip install torch==2.1.0+cpu -f https://download.pytorch.org/whl/torch_stable.html

# 3. Инсталираме останалите зависимости
RUN pip install --no-cache-dir -r requirements.txt

COPY api ./api

EXPOSE 5000

CMD ["sh", "-c", "uvicorn api.index:app --host 0.0.0.0 --port $PORT"]
