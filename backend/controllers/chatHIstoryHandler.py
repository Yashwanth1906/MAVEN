from schemas import HistoryCreate,SaveChat
from prisma import Prisma
from prisma.errors import PrismaError
from prisma.enums import Role

async def create_chatHistory(chatHistory: HistoryCreate):
    try:
        async with Prisma() as db:
            data = chatHistory.model_dump()
            newHistory = await db.history.create(data=data)
        return [True, newHistory]
    except PrismaError as e:
        print(f"Prisma error : {e}")
        return [False, f"Database Error : {str(e)}"]
    except Exception as e:
        print(f"Error : {e}")
        return [False, f"Database Error : {str(e)}"]


async def saveChat(chat : SaveChat):
    try:
        async with Prisma() as db:
            await db.chat.create(
                data=chat.model_dump()
            )
        return [True,"chat saved successfully"]
    except PrismaError as e:
        print(f"Prisma error : {e}")
        return [False, f"Database Error : {str(e)}"]
    except Exception as e:
        print(f"Error : {e}")
        return [False,f"Database Error : {str(e)}"]
    
async def get_chats(historyId : int):
    try:
        async with Prisma() as db:
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
        print(f"Prisma error : {e}")
        return [False, f"Database Error : {str(e)}"]
    except Exception as e:
        print(f"Error : {e}")
        return [False,f"Database Error : {str(e)}"]