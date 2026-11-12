"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { processVideoFrame, type ProcessedImage } from "@/lib/image";

export function useCamera(active: boolean) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;

    async function start() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError(true);
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 1280 },
          },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((tr) => tr.stop());
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          video.muted = true;
          video.playsInline = true;
          try {
            await video.play();
          } catch {
            /* autoplay handled by user gesture */
          }
        }
        setReady(true);
        setError(false);
      } catch {
        if (!cancelled) setError(true);
      }
    }

    start();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((tr) => tr.stop());
      streamRef.current = null;
      if (videoRef.current) videoRef.current.srcObject = null;
      setReady(false);
    };
  }, [active]);

  const capture = useCallback(async (): Promise<ProcessedImage | null> => {
    const video = videoRef.current;
    if (!video) return null;
    try {
      return await processVideoFrame(video);
    } catch {
      return null;
    }
  }, []);

  return { videoRef, error, ready, capture };
}
