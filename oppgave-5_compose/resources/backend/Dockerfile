FROM python

WORKDIR /app

COPY requirements.txt ./
RUN pip install -r requirements.txt

COPY server.py ./

CMD [ "uvicorn", "--port=8080", "--host=0.0.0.0", "server:app"]
