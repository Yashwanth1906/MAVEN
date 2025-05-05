from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class HistoryCreate(BaseModel):
    title: str
    timestamp: Optional[datetime] = None  # Optional, auto-set to now if not provided

class UserCreate(BaseModel):
    name: str
    email: str
    password: str