from fastapi import FastAPI,Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from controllers.promptHandler import handle_user_query
from prisma import Prisma
from schemas import UserCreate,HistoryCreate


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=[
            "Access-Control-Allow-Origin",
            "Referer",
            "Set-Cookie",
            "Cookie",
            "Content-Length",
            "Content-Type",
            "Access-Control-Allow-Credentials",
            "Access-Control-Allow-Headers",
            "Access-Control-Allow-Methods"
        ],
    allow_credentials=True
)

db = Prisma()

@app.on_event("startup")
async def startup():
    await db.connect()

@app.on_event("shutdown")
async def shutdown():
    await db.disconnect()

@app.post("/api/users/signup")
async def create_user(user: UserCreate):
    pass

@app.post("/api/users/createhistory")
async def add_history(user_id: int, history: HistoryCreate):
    pass

@app.get("/")
def read_root():
    return {"sucess" : True,"message": "running on port 8000"}

@app.post("/api/userprompt")
async def process_user_query (req : Request):
    data = await req.json()
    if data != {}:
        response = handle_user_query(data)
        return JSONResponse(content={"status" : True, "prompt" : response[0], "code" : response[1]})
    return JSONResponse(content={"status" : False , "message" : "Please enter the prompt"})