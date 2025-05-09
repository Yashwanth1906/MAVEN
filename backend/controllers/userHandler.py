from schemas import UserCreate,UserLogin,GetHistory
from prisma import Prisma
from prisma.errors import PrismaError

async def createUser (user : UserCreate):
    try:
        async with Prisma() as db:
            await db.user.create(
                data=user.model_dump()
            )
        return [True,"User created successfully"]
    except PrismaError as e:
        print(f"Prisma error : {e}")
        return [False, f"Database Error : {str(e)}"]
    except Exception as e:
        print(f"Error : {e}")
        return [False,f"Database Error : {str(e)}"]
    
async def userLogin(user : UserLogin):
    try:
        async with Prisma() as db:
            existingUser = await db.user.find_unique(
                where= {
                    "email" : user.email
                }
            )
            if not existingUser:
                return [False,"User with that email Doesn't exists"]
            if existingUser.password == user.password:
                return [True,"User Logged In"]
            else:
                return [False, "Password Doesn't matches"]
    except PrismaError as e:
        print(f"Prisma error : {e}")
        return [False, f"Database Error : {str(e)}"]
    except Exception as e:
        print(f"Error : {e}")
        return [False,f"Database Error : {str(e)}"]

async def getHistory(req : GetHistory):
    try:
        async with Prisma() as db:
            history = await db.history.find_many(
                where= {
                    "userId" : req.userId
                }
            )
        userHistory = []
        for items in history:
            x = {
                "id" : items.id,
                "title" : items.title,
                "timestamp" : items.timestamp.isoformat()
            }
            userHistory.append(x)
        print(userHistory)
        return [True,userHistory]
    except PrismaError as e:
        print(f"Prisma error : {e}")
        return [False, f"Database Error : {str(e)}"]
    except Exception as e:
        print(f"Error : {e}")
        return [False,f"Database Error : {str(e)}"]