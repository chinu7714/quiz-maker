"use client";
import { useCallback, useEffect, useRef, useState } from "react";

export function useSpeechRecognition() {
  const recognitionRef = useRef<any>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [finalTranscript, setFinalTranscript] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    setIsSupported(true);
    const rec = new SpeechRecognition();
    rec.lang = "en-US";
    rec.interimResults = true;
    rec.onstart = () => setIsListening(true);
    rec.onend = () => setIsListening(false);
    rec.onresult = (event: any) => {
      let live = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const value = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += value + " ";
        else live += value;
      }
      setTranscript(live.trim());
      if (final.trim()) setFinalTranscript(final.trim());
    };
    recognitionRef.current = rec;
    return () => rec.stop();
  }, []);

  const startListening = useCallback(() => recognitionRef.current?.start(), []);
  const stopListening = useCallback(() => recognitionRef.current?.stop(), []);
  const resetTranscript = useCallback(() => { setTranscript(""); setFinalTranscript(""); }, []);

  return { isSupported, isListening, transcript, finalTranscript, startListening, stopListening, resetTranscript };
}
