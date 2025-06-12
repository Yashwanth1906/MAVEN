from schemas import UserCreate,UserLogin,GetHistory
from prisma import Prisma
from prisma.errors import PrismaError
from datetime import datetime

async def createUser(user : UserCreate):
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
            async with Prisma() as db:
                newUser = await db.user.create(
                    data = {
                        "email" : user.email,
                        "name" : user.name,
                        "isGoogleUser" : user.isGoogleUser,
                    }
                )
            return [True, {"userId" : newUser.id, "name" : user.name, "email" : newUser.email}]
        else:
            async with Prisma() as db:
                loginUser = await db.user.update(
                    where={
                        "email": user.email
                    },
                    data={
                        "lastLogin": datetime.now()
                    }
                )
            return [True, {"userId" : loginUser.id, "name" : loginUser.name, "email" : loginUser.email}]
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