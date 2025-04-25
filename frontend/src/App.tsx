import { useEffect, useRef, useState } from "react";
import { AudioBytes, Empty, TextResponse } from "./generated/text_pb";
import { TranslationServiceClient } from "./generated/TextServiceClientPb";

function App() {

  const recorderRef = useRef<MediaRecorder | null>(null);
  const [recording, setRecording] = useState(false);
  const client = new TranslationServiceClient("http://localhhost:8080")

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true})
    const recorder = new MediaRecorder(stream);
    const chunks : Blob[] = [];
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.push(event.data);
    }
    recorder.onstop = async () => {
      const audioBlob = new Blob(chunks, {type: 'audio/webm'})
      const buffer = await audioBlob.arrayBuffer();
      sendToBackend(new Uint8Array(buffer));

      const url = URL.createObjectURL(audioBlob);
      const audio = new Audio(url);
      audio.play();
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
    const chunk = new AudioBytes()
    chunk.setAudiobytes(bytes)
    client.sendAudioBytes(chunk, {}, (err, res) => {
      if (err) console.log(err);
      else console.log('success')
    })
    
  }

useEffect(() =>{
  const stream = client.receiveTextResponse(new Empty());
  stream.on("data", (response: TextResponse) => {
    const message = response.getText();
    console.log("Received: ", message);
  })
  stream.on("end", () => {
    console.log("ended")
  })
  stream.on("error", (err) => {
    console.error("Stream error:", err);
  });

  stream.on("status", (status) => {
    console.log("Stream status:", status.code, status.details);
})
return () => {
 stream.cancel() 
}
},[])
  return (
    <div>
      { recording ? (
        <button onClick={stopRecording}>Stop</button>
      ) : (
        <button onClick={startRecording}>Start</button>
      )}
    </div>
  )
}

export default App
