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
            console.log("Received data:", data);
            setTranslation((prev) => prev.concat(" " + data));
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

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true})

    const recorder = new MediaRecorder(stream);
    const chunks : Blob[] = [];

    recorder.ondataavailable = async (event) => {
      if (event.data.size > 0) 
        {
            chunks.push(event.data);
            
            // const chunk: Blob[] = [chunks[chunks.length -1]]
            const audioBlob = new Blob(chunks, {type: 'audio/webm'})
            const buffer = await audioBlob.arrayBuffer();
            sendToBackend(new Uint8Array(buffer));

        }
    }
    recorder.onstop = async () => {
    //   const audioBlob = new Blob(chunks, {type: 'audio/webm'})
    //   const buffer = await audioBlob.arrayBuffer();
    //   sendToBackend(new Uint8Array(buffer));

    //   const url = URL.createObjectURL(audioBlob);
    //   const audio = new Audio(url);
    //   audio.play();
    }
    recorderRef.current = recorder;
    recorder.start(2000);
    setRecording(true);
  }
  const stopRecording = () => {
    recorderRef.current?.stop();
    setRecording(false);
  }

  const sendToBackend = (bytes: Uint8Array) => {
    if (webSocketRef.current.readyState !== WebSocket.OPEN) {
      console.error("WebSocket is not open. Unable to send data.");
      return;
    }
    console.log("Sending data to backend:", bytes);
    webSocketRef.current.send(bytes);
  }

  return (
    <>
    <div>
      { recording ? (
          <button onClick={stopRecording}>Stop</button>
        ) : (
            <button onClick={startRecording}>Start</button>
        )}
        <div>
            <h2>Translation</h2>
            <p>{translation}</p>
    </div>
    </div>
        </>
  )}

export default StreamAudio
