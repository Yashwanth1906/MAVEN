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
import boto3
from botocore.exceptions import ClientError
import glob
from dotenv import load_dotenv
from pathlib import Path

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent
MANIM_CODE_DIR = os.getenv('MANIM_CODE_DIR', os.path.join(BASE_DIR, 'manimcode'))
MEDIA_DIR = os.getenv('MEDIA_DIR', os.path.join(BASE_DIR, 'media', 'videos'))

s3_client = boto3.client(
    's3',
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
    region_name=os.getenv('AWS_REGION')
)

BUCKET_NAME = 'maven-video-repo'

async def upload_to_s3(class_name: str) -> tuple[bool, str]:
    try:
        media_dir = os.path.join(MEDIA_DIR, class_name, "480p15")
        video_file = os.path.join(media_dir, f"{class_name}.mp4")
        
        if not os.path.exists(video_file):
            return False, "No video file found"
            
        s3_key = f"videos/{class_name}/{os.path.basename(video_file)}"
        s3_client.upload_file(video_file, BUCKET_NAME, s3_key)
        
        url = f"https://{BUCKET_NAME}.s3.amazonaws.com/{s3_key}"
        return True, url
    except ClientError as e:
        return False, f"S3 upload error: {str(e)}"
    except Exception as e:
        return False, f"Error: {str(e)}"


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
    
    os.makedirs(MANIM_CODE_DIR, exist_ok=True)
    file_path = os.path.join(MANIM_CODE_DIR, f"{class_name}.py")
    
    success = False
    max_retries = 5
    retries = 0

    while not success and retries < max_retries:
        with open(file_path, "w") as manim_file:
            manim_file.write(cleaned_code)
        command = f"manim -pql {os.path.relpath(file_path)} {class_name}"
        try:
            result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
            print("Video generated successfully.")
            await emit_agent_log(user_id, "System", "Video generated successfully.")
            
            upload_success, upload_result = await upload_to_s3(class_name)
            print("This is the upload result ", upload_result)
            if not upload_success:
                await emit_agent_log(user_id, "System", f"Failed to upload video: {upload_result}")
                return [False, upload_result]
                
            video_url = upload_result
            await emit_agent_log(user_id, "System", f"Video uploaded successfully to S3")
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
    response = await create_chatHistory(HistoryCreate(**newHistoryPayload))
    if response[0] == False:
        return response
    historyId = response[1].id
    
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
        "historyId" : historyId,
        "videoUrl" : video_url
    }
    chat = await saveChat(SaveChat(**chatPayload))
    if chat[0] == False:
        return chat

    newHistory = {
        "id" : response[1].id,
        "title" : response[1].title,
        "timestamp" : response[1].timestamp.isoformat()
    }

    return [True, cleaned_code, newHistory, video_url]


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
    
    os.makedirs(MANIM_CODE_DIR, exist_ok=True)
    file_path = os.path.join(MANIM_CODE_DIR, f"{class_name}.py")
    
    success = False
    max_retries = 5
    retries = 0

    while not success and retries < max_retries:
        with open(file_path, "w") as manim_file:
            manim_file.write(cleaned_code)
        command = f"manim -pql {os.path.relpath(file_path)} {class_name}"
        try:
            result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
            print("Video generated successfully.")
            await emit_agent_log(user_id, "System", "Video generated successfully.")

            upload_success, upload_result = await upload_to_s3(class_name)
            if not upload_success:
                await emit_agent_log(user_id, "System", f"Failed to upload video: {upload_result}")
                return [False, upload_result]
                
            video_url = upload_result
            await emit_agent_log(user_id, "System", f"Video uploaded successfully to S3")
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
            
    chatPayloadUser = {
        "role" : "User",
        "content" : prompt,
        "historyId" : data.historyId
    }

    chatPayloadAI = {
        "role" : "AIAssistant",
        "content" : cleaned_code,
        "historyId" : data.historyId,
        "videoUrl" : video_url
    }

    queue_response = await queue_old_chat_operations(SaveChat(**chatPayloadUser), SaveChat(**chatPayloadAI))
    if queue_response[0] == False:
        return queue_response
    
    return [True, cleaned_code, video_url]