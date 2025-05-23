from agents.promptingAgent import user_proxy,prompting_agent
from agents.manimCodeGeneratingAgent import manim_code_generating_agent
from agents.ErrorRectifyingAgent import Error_Rectifying_Agent
from agents.codeModifyingAgent import CodeModifying_Agent
import os,re,subprocess
from schemas import UserPrompt,HistoryCreate,SaveChat
from controllers.chatHIstoryHandler import create_chatHistory,saveChat,queue_old_chat_operations
from datetime import datetime
from prisma import Prisma
from prisma.errors import PrismaError
from prisma.enums import Role
from websocket_manager import manager

async def emit_agent_log(user_id: int, sender: str, message: str):
    await manager.broadcast_to_user(user_id, {
        "type": "agent_log",
        "sender": sender,
        "message": message,
        "timestamp": datetime.utcnow().isoformat()
    })

async def handle_user_query_new_chat(data : UserPrompt):
    prompt = data.prompt
    user_id = data.userId

    await emit_agent_log(user_id, "User", prompt)

    user_proxy.send(
        recipient=prompting_agent,
        message=f"""
        userprompt: {prompt}
        Give me the improvised prompt to get a good manim code.
        """
    )

    manim_prompt = prompting_agent.generate_reply(sender=user_proxy)
    user_proxy.receive(sender=prompting_agent, message=manim_prompt)
    
    await emit_agent_log(user_id, "Prompting Agent", manim_prompt)

    user_proxy.send(
        recipient=manim_code_generating_agent,
        message=f"""
        prompt to get manim code : {manim_prompt}
        Give me the proper manim code to generate the video as per in the prompt.
        """
    )

    manim_code = manim_code_generating_agent.generate_reply(sender=user_proxy)
    user_proxy.receive(sender=manim_code_generating_agent, message=manim_code)
    
    await emit_agent_log(user_id, "Code Generating Agent", manim_code)

    cleaned_code = re.sub(r"```python\n|\n```", "", manim_code).strip()
    if not cleaned_code:
        return [None, None]

    class_name_match = re.search(r"class (\S+)\(Scene\):", cleaned_code)
    if not class_name_match:
        return [None, None]
    class_name = class_name_match.group(1)
    cleaned_code = re.sub(r"manim -pql \S+\.py \S+", "", cleaned_code).strip()
    file_dir = "C:\\Documents\\Projects\\MAVEN\\Backend\\manimcode"
    os.makedirs(file_dir, exist_ok=True)
    file_path = os.path.join(file_dir, f"{class_name}.py")
    
    success = False
    max_retries = 5
    retries = 0

    while not success and retries < max_retries:
        with open(file_path, "w") as manim_file:
            manim_file.write(cleaned_code)
        command = f"manim -pql manimcode\\{class_name}.py {class_name}"
        try:
            result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
            print("Video generated successfully.")
            await emit_agent_log(user_id, "System", "Video generated successfully.")
            success = True
        except subprocess.CalledProcessError as e:
            print("Error in subprocess:", e.stderr)
            await emit_agent_log(user_id, "System", f"Error: {e.stderr}")
            retries += 1
            user_proxy.send(
                recipient=Error_Rectifying_Agent,
                message=f"""
                Error while running this code:
                {cleaned_code}

                Error message:
                {e.stderr}

                Fix the error and return corrected code and `manim -pql filename.py ClassName` line.
                """
            )
            corrected_response = Error_Rectifying_Agent.generate_reply(sender=user_proxy)
            user_proxy.receive(sender=Error_Rectifying_Agent, message=corrected_response)
            
            await emit_agent_log(user_id, "Error Rectifying Agent", corrected_response)

            cleaned_code = re.sub(r"```python\n|\n```", "", corrected_response).strip()
            cleaned_code = re.sub(r"manim -pql \S+\.py \S+", "", cleaned_code).strip()
        
        
    # DB Interactions...
    userId = data.userId
    newHistoryPayload = {
        "userId" : userId,
        "title" : class_name,
        "timestamp" : datetime.utcnow().isoformat() + 'z'
    }
    response =await create_chatHistory(HistoryCreate(**newHistoryPayload))
    if response[0] == False:
        return response
    historyId= response[1].id
    chatPayload = {
        "role" : "User",
        "content" : prompt,
        "historyId" : historyId
    }
    chat = await saveChat(SaveChat(**chatPayload))
    if chat[0] == False:
        return chat
    chatPayload = {
        "role" : "AIAssistant",
        "content" : cleaned_code,
        "historyId" : historyId
    }
    chat =await saveChat(SaveChat(**chatPayload))
    if chat[0] == False:
        return chat
    # DB Interactions ends..

    newHistory = {
        "id" : response[1].id,
        "title" : response[1].title,
        "timestamp" : response[1].timestamp.isoformat()
    }

    return [True,cleaned_code,newHistory]


async def handle_user_query_old(data : UserPrompt):
    prompt = data.prompt
    user_id = data.userId
    await emit_agent_log(user_id, "User", prompt)
    try:
        async with Prisma() as db:
            last_code = await db.chat.find_first(
                where={
                    "historyId" : data.historyId,
                    "role" : Role.AIAssistant
                }, order={
                    "id" : "desc"
                }
            )
        if not last_code:
            return [False,"There is no last chat by the AI Assistant"]
    except PrismaError as e:
        return [False,f"Prisma error : {str(e)}"]
    except Exception as e:
        return [False,f"Error : {str(e)}"]
    user_proxy.send(
        recipient=CodeModifying_Agent,
        message=f"""
        The old latest code :
        {last_code.content}

        Now the user wants to modify the code as like :
        {prompt}
        """
    )

    updated_code = CodeModifying_Agent.generate_reply(sender=user_proxy)
    user_proxy.receive(sender=CodeModifying_Agent,message = updated_code)
    
    await emit_agent_log(user_id, "Code Modifying Agent", updated_code)

    cleaned_code = re.sub(r"```python\n|\n```", "", updated_code).strip()
    if not cleaned_code:
        return [None, None]

    class_name_match = re.search(r"class (\S+)\(Scene\):", cleaned_code)
    if not class_name_match:
        return [None, None]
    class_name = class_name_match.group(1)
    cleaned_code = re.sub(r"manim -pql \S+\.py \S+", "", cleaned_code).strip()
    file_dir = "C:\\Documents\\Projects\\MAVEN\\Backend\\manimcode"
    os.makedirs(file_dir, exist_ok=True)
    file_path = os.path.join(file_dir, f"{class_name}.py")
    
    success = False
    max_retries = 5
    retries = 0

    while not success and retries < max_retries:
        with open(file_path, "w") as manim_file:
            manim_file.write(cleaned_code)
        command = f"manim -pql manimcode\\{class_name}.py {class_name}"
        try:
            result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
            print("Video generated successfully.")
            await emit_agent_log(user_id, "System", "Video generated successfully.")
            success = True
        except subprocess.CalledProcessError as e:
            print("Error in subprocess:", e.stderr)
            await emit_agent_log(user_id, "System", f"Error: {e.stderr}")
            retries += 1
            user_proxy.send(
                recipient=Error_Rectifying_Agent,
                message=f"""
                Error while running this code:
                {cleaned_code}

                Error message:
                {e.stderr}

                Fix the error and return corrected code and `manim -pql filename.py ClassName` line.
                """
            )
            corrected_response = Error_Rectifying_Agent.generate_reply(sender=user_proxy)
            user_proxy.receive(sender=Error_Rectifying_Agent, message=corrected_response)
            
            await emit_agent_log(user_id, "Error Rectifying Agent", corrected_response)

            cleaned_code = re.sub(r"```python\n|\n```", "", corrected_response).strip()
            cleaned_code = re.sub(r"manim -pql \S+\.py \S+", "", cleaned_code).strip()
            
    queue_response = await queue_old_chat_operations(data.historyId, prompt, cleaned_code)
    if queue_response[0] == False:
        return queue_response

    return [True, cleaned_code]