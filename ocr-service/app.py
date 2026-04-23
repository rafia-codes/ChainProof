from fastapi import FastAPI, UploadFile, File, Form
import shutil
import os
from utils.ocr import validate_certificate

app = FastAPI()
UPLOAD_DIR = "temp"
os.makedirs(UPLOAD_DIR,exist_ok=True)

@app.post("/validate")
async def validate(
    file: UploadFile = File(...),
    student_name: str = Form(...),
    issue_org: str = Form(...)
):
    file_path = os.path.join(UPLOAD_DIR,file.filename)

    with open(file_path,"wb") as buffer:
        shutil.copyfileobj(file.file,buffer)

    result = validate_certificate(file_path,{
        "name": student_name,
        "issue_org": issue_org
    })

    os.remove(file_path)

    return result
