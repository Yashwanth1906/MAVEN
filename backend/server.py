from fastapi import FastAPI,Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware



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

@app.get("/")
def read_root():
    return {"sucess" : True,"message": "running on port 8000"}