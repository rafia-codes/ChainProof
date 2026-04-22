import pytesseract
from PIL import Image

def extraxt_text(file_path):
    try:
        image = Image.open(file_path)
        text = pytesseract.text_to_string(image)
        return text
    except Exception as e:
        return ""
