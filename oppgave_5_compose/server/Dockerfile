FROM python

WORKDIR /app

COPY requirements.txt requirements.txt
RUN pip install -r requirements.txt

COPY server.py server.py

CMD [ "uvicorn", "--port=8081", "server:app", "--host=0.0.0.0"]
