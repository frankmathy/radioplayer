import { useState, useRef, useEffect } from "react";

interface RadioPlayerProps {
  streamUrl: string;
  stationName: string;
}

const RadioPlayer = ({ streamUrl, stationName }: RadioPlayerProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const startRecording = async () => {
    try {
      const audio = audioRef.current;
      if (!audio) return;

      // Check supported mime types
      const mimeType = [
        "audio/mp4",
        "audio/mpeg",
        "audio/aac",
        "audio/ogg",
        "audio/webm",
        "audio/x-wav",
        "", // empty string as fallback, lets browser choose format
      ].find((type) => {
        try {
          return type === "" || MediaRecorder.isTypeSupported(type);
        } catch {
          return false;
        }
      });

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
        sourceNodeRef.current = audioContextRef.current.createMediaElementSource(audio);
        sourceNodeRef.current.connect(audioContextRef.current.destination);
      }

      const destination = audioContextRef.current.createMediaStreamDestination();
      sourceNodeRef.current?.connect(destination);

      mediaRecorderRef.current = new MediaRecorder(
        destination.stream,
        mimeType
          ? {
              mimeType,
              audioBitsPerSecond: 128000,
            }
          : undefined
      );

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const fileExtension = mimeType?.includes("mp4")
          ? "mp4"
          : mimeType?.includes("mpeg")
          ? "mp3"
          : mimeType?.includes("aac")
          ? "aac"
          : mimeType?.includes("ogg")
          ? "ogg"
          : mimeType?.includes("webm")
          ? "webm"
          : "wav";
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${stationName}-${new Date().toISOString()}.${fileExtension}`;
        a.click();
        URL.revokeObjectURL(url);
        chunksRef.current = [];
      };

      mediaRecorderRef.current.start(1000);
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

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

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
