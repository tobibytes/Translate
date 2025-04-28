import { useEffect, useMemo, useRef, useState } from "react";

function StreamAudio() {
    const [translation, setTranslation] = useState<string>("");

    const webSocketRef = useRef<WebSocket | null>(null);

    const connectWebSocket = () => {
        const ws = new WebSocket("ws://localhost:8000/ws");

        ws.onopen = () => {
            console.log("WebSocket connection opened");
        };

        ws.onmessage = (event) => {
            const data = event.data;
            setTranslation(data);
            // setTranslation((prev) => prev.concat(" " + data));
        };

        ws.onclose = () => {
            console.log("WebSocket connection closed. Reconnecting...");
            setTimeout(() => connectWebSocket(), 2000); // Reconnect after 2 seconds
        };

        ws.onerror = (error) => {
            console.error("WebSocket error:", error);
            ws.close(); // Close the WebSocket on error
        };

        webSocketRef.current = ws;
    };

    useEffect(() => {
        connectWebSocket();

        return () => {
            webSocketRef.current?.close();
            console.log("WebSocket connection closed");
        };
    }, []);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const [recording, setRecording] = useState(false);

  const startRecordingAudio = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true})

    const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus'});
    const chunks : Blob[] = [];

    recorder.ondataavailable = async (event) => {
      if (event.data.size > 0 && event.data.type.startsWith('audio/'))
        {
            chunks.push(event.data);
            
            const audioBlob = new Blob(chunks, {type: 'audio/webm'})
            const buffer = await audioBlob.arrayBuffer();
            sendToBackend(buffer, { type: "audio", language: "en" });

        }
    }
    recorder.onstop = async () => {
      // const audioBlob = new Blob(chunks, { type: 'audio/webm' });
      // const buffer = await audioBlob.arrayBuffer();
      // sendToBackend(buffer);
    }
    recorderRef.current = recorder;
    recorder.start(3000);
    setRecording(true);
    
  }
  const stopRecordingAudio = () => {
    recorderRef.current?.stop();
    setRecording(false);
  }

  const sendToBackend = (bytes: ArrayBuffer, metadata: Record<string, any>) => {
    if (webSocketRef.current?.readyState !== WebSocket.OPEN) {
        console.error("WebSocket is not open. Unable to send data.");
        return;
    }

    // Serialize metadata as JSON
    const metadataJson = JSON.stringify(metadata);
    const metadataBytes = new TextEncoder().encode(metadataJson);

    // Combine metadata and audio bytes
    const combinedBytes = new Uint8Array(metadataBytes.length + bytes.byteLength);
    combinedBytes.set(metadataBytes, 0); // Add metadata at the beginning
    combinedBytes.set(new Uint8Array(bytes), metadataBytes.length); // Append audio bytes

    // Send combined data
    webSocketRef.current.send(combinedBytes);
};


  return (
    <>
    <div>
      { recording ? (
          <button onClick={stopRecordingAudio}>Stop</button>
        ) : (
            <button onClick={startRecordingAudio}>Start</button>
        )}
        <div>
            <h2>Translation</h2>
            <p>{translation}</p>
    </div>
    </div>
        </>
  )}

export default StreamAudio
