from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from deep_translator import GoogleTranslator
from openai import OpenAI
import io
app = FastAPI()

# Allow CORS for all origins
origins = [
    "http://localhost:3000",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Hello World"}

words = [""]
last_words = ""
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    global last_words
    while True:
        data = await websocket.receive_bytes()
        if not data:
            continue
        try:
            response = translate(getText(data))
        except Exception as e:
            response = " "
            print(f"Error: {e}")
        res = response.find(last_words)
        await websocket.send_text(response)
        # await websocket.send_text(response[res+len(last_words):])
        last_words = response
        # Here you can process the received data and send a response


def translate(text):
    if not text:
        return ''
    translated = GoogleTranslator(source='auto', target='en').translate(text)
    return translated

client = OpenAI(api_key="")
def getText(audio_bytes):
    # Wrap the audio bytes in a file-like object
    audio_file = io.BytesIO(audio_bytes)
    audio_file.name = "audio.webm"  # Set a name for the file (required by some APIs)

    # Call the OpenAI Whisper API
    translation = client.audio.translations.create(
        model="whisper-1", 
        file=audio_file,
    )

    return translation.text
