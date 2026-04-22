from fastapi import FastAPI, UploadFile, File
import shutil
import os
from utils.ocr import extraxt_text

app = FastAPI()

UPLOAD_DIR = "temp"

os.makedirs(UPLOAD_DIR,exist_ok=True)




