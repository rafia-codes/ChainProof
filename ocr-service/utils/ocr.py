import pytesseract
from PIL import Image
import os
from pdf2image import convert_from_path

def extract_text(file_path):
    try:
        ext = os.path.splitext(file_path)[1].lower()

        if ext == ".pdf":
            pages = convert_from_path(file_path)
            text = "" 
            for page in pages:
                text += pytesseract.image_to_string(page)
                return text
        else:
            image = Image.open(file_path)
            return pytesseract.image_to_string(image)
        
    except Exception as e:
        return ""


def validate_certificate(file_path,expected_fields):
    text = extract_text(file_path).lower()

    mismatches = []
    for field,value in expected_fields.items():
        if str(value).lower() not in text:
            mismatches.append(field)

    return {
        "valid": len(mismatches) == 0,
        "mismatches": mismatches
    }
