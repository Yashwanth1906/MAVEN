from pydantic import BaseModel
from typing import Optional,Literal
from datetime import datetime

class HistoryCreate(BaseModel):
    userId : int
    title: str
    timestamp: Optional[datetime] = None

class UserCreate(BaseModel):
    name: str
    email: str
    password: str

class GetHistory(BaseModel):
    userId : int
    historyId : int

class GetUser(BaseModel):
    userId : int

class SaveChat(BaseModel):
    role : Literal["User","AIAssistant"]
    content : str
    historyId : int
    videoUrl : Optional[str] = None

class UserLogin(BaseModel):
    email : str
    name : str
    isGoogleUser : bool = False

class UserPrompt(BaseModel):
    prompt : str
    historyId : Optional[int] = None
    userId : int

class GetHistory(BaseModel):
    userId : int