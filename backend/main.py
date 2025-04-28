from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from deep_translator import GoogleTranslator
from openai import OpenAI
import io
import json

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


message_handlers = {
    'text': 'text',
    'audio': 'audio',
    'video': 'video',
}
def get_message_handler(message_type):
    if message_type == 'text':
        return handle_audio_websocket
    elif message_type == 'audio':
        return handle_audio_websocket
    elif message_type == 'video':
        return handle_audio_websocket
    else:
        raise ValueError(f"Unknown message type: {message_type}")

async def handle_websocket_message(ws_conn: WebSocket):
    while True:
        data = await ws_conn.receive_bytes()
        if not data:
            break
        message_type = message_type.get('type')
        handler = get_message_handler(message_type)
        if handler:
            await handler(ws_conn)

async def handle_audio_websocket(ws_conn):
    while True:
        data = await ws_conn.receive_bytes()
        if not data:
            continue

        try:
            # Extract metadata and audio bytes
            metadata_end_index = data.find(b'\n')  # Assume metadata ends with a newline
            if metadata_end_index == -1:
                raise ValueError("Invalid data format: Metadata not found")

            metadata_bytes = data[:metadata_end_index]
            audio_bytes = data[metadata_end_index + 1:]

            # Parse metadata
            metadata = json.loads(metadata_bytes.decode("utf-8"))
            print("Received metadata:", metadata)

            # Process audio bytes
            response = translate(getText(audio_bytes))
        except Exception as e:
            response = "Error processing data"
            print(f"Error: {e}")

        await ws_conn.send_text(response) 



@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    await handle_websocket_message(websocket)
    


def translate(text, lang = 'en'):
    if not text:
        return ''
    translated = GoogleTranslator(source='auto', target=lang).translate(text)
    return translated

client = OpenAI(api_key="")
def getText(audio_bytes):
    audio_file = io.BytesIO(audio_bytes)
    audio_file.name = "audio.webm" 

    translation = client.audio.translations.create(
        model="whisper-1", 
        file=audio_file,
    )

    return translation.text
