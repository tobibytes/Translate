from deep_translator import GoogleTranslator
import text_pb2
import text_pb2_grpc
from openai import OpenAI
from concurrent import futures
import time
import grpc
import io


def translate(text):
    if not text:
        return ''
    translated = GoogleTranslator(source='auto', target='de').translate(text)
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


class Translate(text_pb2_grpc.TranslationService):
    def streamText(self,  request, context):
        while True:
            yield text_pb2.TextResponse(text=translate(getText(request.audioBytes)))
            time.sleep(0.2)


def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    text_pb2_grpc.add_TranslationServiceServicer_to_server(Translate(), server)
    server.add_insecure_port('[::]:50051')
    print("Server started on 0.0.0.0:50051")
    server.start()
    return server


if __name__ == '__main__':
    # Start the server
    server = serve()

    # Wait for server termination
    server.wait_for_termination()