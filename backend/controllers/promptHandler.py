from agents.promptingAgent import user_proxy,prompting_agent
from agents.manimCodeGeneratingAgent import manim_code_generating_agent
import os,re,subprocess

def handle_user_query(data):
    prompt = data["prompt"]
    
    user_proxy.send(
        recipient=prompting_agent,
        message=f"""
        userprompt: {prompt}
        Give me the improvised prompt to get a good manim code.
        """
    )
    manim_prompt = prompting_agent.generate_reply(sender=user_proxy)
    user_proxy.receive(sender=prompting_agent, message=manim_prompt)

    user_proxy.send(
        recipient=manim_code_generating_agent,
        message=f"""
        prompt to get manim code : {manim_prompt}
        Give me the proper manim code to generate the video as per in the prompt.
        """
    )

    manim_code = manim_code_generating_agent.generate_reply(sender=user_proxy)
    user_proxy.receive(sender=manim_code_generating_agent, message=manim_code)
    
    cleaned_string = re.sub(r"```python\n|\n```", "", manim_code).strip()

    if not manim_code:
        return [None, None]

    class_name_match = re.search(r"class (\S+)\(Scene\):", cleaned_string)
    
    if class_name_match:
        class_name = class_name_match.group(1)
        cleaned_string = re.sub(r"manim -pql \S+\.py \S+", "", cleaned_string).strip()
        
        fileDirectory = "C:\\Documents\\Projects\\Video Generator\\Backend\\manimcode"
        filePath = os.path.join(fileDirectory, f"{class_name}.py")
        
        with open(filePath, "w") as manim_file:
            manim_file.write(cleaned_string)
        command = f"manim -pql manimcode\{class_name}.py {class_name}"
        subprocess.run(command,shell=True)

        return [manim_prompt, cleaned_string]
    else:
        return [None, "Class name extraction failed."]