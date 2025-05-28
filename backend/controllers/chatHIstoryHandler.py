from schemas import HistoryCreate, SaveChat
from prisma import Prisma
from prisma.errors import PrismaError
from prisma.enums import Role
import redis
import json
from datetime import datetime

redis_client = redis.Redis(
    host='localhost',
    port=6379,
    db=0,
    decode_responses=True
)

QUEUE_NAME = 'chat_operations'

def serialize_datetime(obj):
    if isinstance(obj, datetime):
        return obj.isoformat()
    raise TypeError(f"Type {type(obj)} not serializable")

async def create_chatHistory(chatHistory: HistoryCreate):
    try:
        async with Prisma() as db:
            user = await db.user.find_unique(where={"id": chatHistory.userId})
            if not user:
                print(f"User with id {chatHistory.userId} not found")
                return [False, f"User not found with id: {chatHistory.userId}"]
            history = await db.history.create(
                data={
                    "userId": chatHistory.userId,
                    "title": chatHistory.title,
                    "timestamp": datetime.utcnow(),
                }
            )
            print("History : ", history)
            return [True, history]
    except PrismaError as e:
        print("Prisma error in create_chatHistory:", str(e))
        return [False, f"Database Error: {str(e)}"]
    except Exception as e:
        print("Unexpected error in create_chatHistory:", str(e))
        return [False, f"Unexpected Error: {str(e)}"]

async def saveChat(chat: SaveChat):
    try:
        async with Prisma() as db:
            history = await db.history.find_unique(where={"id": chat.historyId})
            if not history:
                return [False, f"History not found with id: {chat.historyId}"]

            saved_chat = await db.chat.create(
                data={
                    "role": Role[chat.role],
                    "content": chat.content,
                    "historyId": chat.historyId,
                    "videoUrl" : chat.videoUrl
                }
            )
            print("Saved Chat : ", saved_chat)
            return [True, saved_chat]
    except PrismaError as e:
        print("Prisma error in saveChat:", str(e))
        return [False, f"Database Error: {str(e)}"]
    except Exception as e:
        print("Unexpected error in saveChat:", str(e))
        return [False, f"Unexpected Error: {str(e)}"]

# async def queue_create_history(chatHistory: HistoryCreate):
#     try:
#         data = chatHistory.model_dump()
#         operation = {
#             'type': 'create_history',
#             'data': data
#         }
#         redis_client.lpush(QUEUE_NAME, json.dumps(operation, default=serialize_datetime))
#         return [True, "Operation queued successfully"]
#     except Exception as e:
#         print(f"Redis error in queue_create_history: {e}")
#         return [False, f"Queue Error: {str(e)}"]

# async def queue_save_chat(chat: SaveChat):
#     try:
#         data = chat.model_dump()
#         operation = {
#             'type': 'save_chat',
#             'data': data
#         }
#         redis_client.lpush(QUEUE_NAME, json.dumps(operation, default=serialize_datetime))
#         return [True, "Operation queued successfully"]
#     except Exception as e:
#         print(f"Redis error in queue_save_chat: {e}")
#         return [False, f"Queue Error: {str(e)}"]

async def get_chats(historyId : int):
    try:
        async with Prisma() as db:
            history = await db.history.find_unique(where={"id": historyId})
            if not history:
                return [False, f"History not found with id: {historyId}"]

            chats = await db.chat.find_first(
                where={
                    "historyId" : historyId,
                    "role" : Role.AIAssistant
                }, order={
                    "id" : "desc"
                }
            )
            if not chats:
                return [False,"No chats found in this history"]
            return [True,chats.content]
    except PrismaError as e:
        print(f"Prisma error in get_chats: {e}")
        return [False, f"Database Error: {str(e)}"]
    except Exception as e:
        print(f"Unexpected error in get_chats: {e}")
        return [False, f"Unexpected Error: {str(e)}"]
    

async def getHistoryChat(historyId : int):
    try:
        async with Prisma() as db:
            chats = await db.chat.find_many(where={"historyId" : historyId})
            chat_dicts = [chat.dict() for chat in chats]
            return [True, chat_dicts]
    except PrismaError as e:
        print(f"Prisma error : {e}")
        return [False, f"Database Error : {str(e)}"]
    except Exception as e:
        print(f"Unexpected error in get_chats: {e}")
        return [False, f"Unexpected Error: {str(e)}"]

async def queue_old_chat_operations(chatPayLoadUser : SaveChat, chatPayLoadAI : SaveChat):
    try:
        print(f"Queueing operations for history {chatPayLoadUser.historyId}")
        user_chat_operation = {
            'type': 'save_chat',
            'data': {
                'role': 'User',
                'content': chatPayLoadUser.content,
                'historyId': chatPayLoadUser.historyId
            }
        }
        redis_client.lpush(QUEUE_NAME, json.dumps(user_chat_operation, default=serialize_datetime))

        ai_chat_operation = {
            'type': 'save_chat',
            'data': {
                'role': 'AIAssistant',
                'content': chatPayLoadAI.content,
                'historyId': chatPayLoadAI.historyId,
                'videoUrl' : chatPayLoadAI.videoUrl
            }
        }
        redis_client.lpush(QUEUE_NAME, json.dumps(ai_chat_operation, default=serialize_datetime))
        print("Operations queued successfully")
        return [True, "Operations queued successfully"]
    except Exception as e:
        print(f"Redis error in queue_old_chat_operations: {e}")
        return [False, f"Queue Error: {str(e)}"]