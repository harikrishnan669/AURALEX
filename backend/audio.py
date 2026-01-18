from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from faster_whisper import WhisperModel
import tempfile
import shutil
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
model = WhisperModel(
    "small",
    device="cpu",
    compute_type="int8"
)
@app.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):
    # Save uploaded audio temporarily
    with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp:
        shutil.copyfileobj(file.file, tmp)
        temp_path = tmp.name
    try:
        # Transcription happens and is translated to english
        segments, info = model.transcribe(
            temp_path,
            task="translate",   # Translate malayalam to english
            language=None,      # Auto detect Malayalam and English Language
            beam_size=5
        )

        text = " ".join(segment.text for segment in segments)

        return {
            "language": info.language,
            "text": text
        }

    finally:
        os.remove(temp_path)

@app.get("/")
def root():
    return {"status": "Fast-Whisper backend running"}
