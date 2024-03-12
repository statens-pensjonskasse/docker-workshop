import os.path
import random

from fastapi import FastAPI

app = FastAPI()

high_score_db = "db/high_score"


def read_high_score():
    if os.path.isfile(high_score_db):
        with open(high_score_db, 'r') as file:
            file_content = file.read()
            if file_content.isnumeric():
                return int(file_content)
    return 0


def update_high_score(new_score):
    if not os.path.exists(os.path.dirname(high_score_db)):
        os.makedirs(os.path.dirname(high_score_db))
    with open(high_score_db, 'w') as file:
        file.write(str(new_score))


high_score = read_high_score()
score = 0


@app.get("/play")
async def play():
    global score
    global high_score
    result = random.randint(-1, 1)
    if result > 0:
        score += 1
        if score > high_score:
            high_score = score
            update_high_score(high_score)
    elif result < 0:
        score = 0

    return {"outcome": result}


@app.get("/score")
async def get_score():
    global score
    return {"score": score}


@app.get("/high_score")
async def get_high_score():
    global high_score
    return {"high_score": high_score}
