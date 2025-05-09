from fastapi import FastAPI,Request, Body
from fastapi.responses import JSONResponse,FileResponse
from fastapi.middleware.cors import CORSMiddleware
from controllers.promptHandler import handle_user_query_new_chat,handle_user_query_old
from prisma import Prisma
from controllers.chatHIstoryHandler import create_chatHistory,saveChat,get_chats
from controllers.userHandler import createUser,userLogin,getHistory
from schemas import UserCreate,HistoryCreate,SaveChat,UserLogin,UserPrompt,GetHistory
import os

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

@app.get("/")
def read_root():
    return {"sucess" : True,"message": "running on port 8000"}

@app.post("/api/users/signup")
async def create_user(user : UserCreate = Body(...)):
    response = await createUser(user)
    if response[0] == False:
        return JSONResponse(content={"success" : False, "error" : response[1]})
    else:
        return JSONResponse(content={"success" : True, "message" : response[1]})

@app.post("/api/users/createhistory")
async def add_history(chatHistory : HistoryCreate = Body(...)):
    response = await create_chatHistory(chatHistory)
    if response[0] == False:
        return JSONResponse(content={"success" : False, "error" : response[1]})
    else:
        return JSONResponse(content={"success" : True, "message" : response[1]})

@app.post("/api/savechat")
async def save_chat(chat : SaveChat = Body(...)):
    response = await saveChat(chat)
    if response[0] == False:
        return JSONResponse(content={"success" : False, "error" : response[1]})
    else:
        return JSONResponse(content={"success" : True, "message" : response[1]})

@app.post("/api/users/login")
async def user_login(user : UserLogin = Body(...)):
    response = await userLogin(user)
    if response[0] == False:
        return JSONResponse(content={"success" : False, "error" : response[1]})
    else:
        return JSONResponse(content={"success" : True, "message" : response[1]})

@app.post("/api/userprompt")
async def process_user_query (prompt : UserPrompt = Body(...)):
    if not prompt.historyId:
        response = await handle_user_query_new_chat(prompt)
    else:
        response = await handle_user_query_old(prompt)
    if response[0] == False:
        return JSONResponse(content={"success" : False, "error" : response[1]})
    else:
        if len(response) == 3:
            print(response[2])
            return JSONResponse(content={"success" : True,"message" : response[1],"history" : response[2]})
        return JSONResponse(content={"success" : True, "message" : response[1]})
    
@app.post("/api/users/gethistory")
async def get_history(req : GetHistory = Body(...)):
    response =await getHistory(req)
    if response[0] == False:
        return JSONResponse(content={"success" : False, "error" : response[1]})
    else:
        return JSONResponse(content={"success" : True, "message" : response[1]})

@app.get("/preview/{filename}")
def get_video_preview(filename: str):
    file_dir = "C:\\Documents\\Projects\\MAVEN\\Backend\\media\\videos"
    file_path = os.path.join(file_dir,filename,"480p15",f"{filename}.mp4")
    if not os.path.exists(file_path):
        return {"error": "File not found"}
    return FileResponse(file_path, media_type="video/mp4")

@app.get("/api/users/getchat/{historyId}")
def getChatHistory(historyId : int):
    response = get_chats(historyId)
    if response[0] == False:
        return JSONResponse(content={"success" : False, "error" : response[1]})
    else:
        return JSONResponse(content={"success" : True, "chats" : response[1]})