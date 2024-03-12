from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"]
)

db = {"highscore":0, "streak":0}

@app.get("/")
async def score():
    return db

@app.get("/inc")
async def inc():
    db["streak"] += 1
    db["highscore"] = max(db["streak"], db["highscore"])
    return db

@app.get("/reset")
async def reset():
    db["streak"] = 0
    return db