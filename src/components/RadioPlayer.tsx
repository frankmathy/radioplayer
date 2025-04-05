import { useState, useRef, useEffect } from "react";

interface RadioPlayerProps {
  streamUrl: string;
  stationName: string;
}

const RadioPlayer = ({ streamUrl, stationName }: RadioPlayerProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const startRecording = async () => {
    try {
      const audio = audioRef.current;
      if (!audio) return;

      const audioContext = new AudioContext();
      const source = audioContext.createMediaElementSource(audio);
      const destination = audioContext.createMediaStreamDestination();
      source.connect(destination);
      source.connect(audioContext.destination);

      mediaRecorderRef.current = new MediaRecorder(destination.stream);
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/mpeg" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${stationName}-${new Date().toISOString()}.mp3`;
        a.click();
        URL.revokeObjectURL(url);
        chunksRef.current = [];
        audioContext.close();
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Add this effect to handle autoplay
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.play().catch((error) => {
        console.error("Error auto-playing stream:", error);
      });
    }
  }, [streamUrl]);

  return (
    <div className="radio-player">
      <audio ref={audioRef} src={streamUrl} controls />
      <div className="recording-controls">
        {!isRecording ? (
          <button onClick={startRecording} className="record-button">
            Start Recording
          </button>
        ) : (
          <button onClick={stopRecording} className="record-button recording">
            Stop Recording
          </button>
        )}
      </div>
    </div>
  );
};

export default RadioPlayer;
