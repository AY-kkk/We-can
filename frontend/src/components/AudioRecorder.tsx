import { Mic, Square } from "lucide-react";
import * as React from "react";
import { Button } from "./Button";

export function AudioRecorder({
  onRecorded,
}: {
  onRecorded: (blob: Blob) => void;
}) {
  const [recording, setRecording] = React.useState(false);
  const [seconds, setSeconds] = React.useState(0);
  const [error, setError] = React.useState("");
  const mediaRef = React.useRef<MediaRecorder | null>(null);
  const chunksRef = React.useRef<Blob[]>([]);
  const timerRef = React.useRef<number | null>(null);

  const start = async () => {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        onRecorded(blob);
        stream.getTracks().forEach((t) => t.stop());
      };
      mr.start();
      mediaRef.current = mr;
      setRecording(true);
      setSeconds(0);
      timerRef.current = window.setInterval(
        () => setSeconds((s) => s + 1),
        1000,
      );
    } catch {
      setError("无法访问麦克风，请检查浏览器权限，或改用文件上传。");
    }
  };

  const stop = () => {
    mediaRef.current?.stop();
    setRecording(false);
    if (timerRef.current) window.clearInterval(timerRef.current);
  };

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`grid h-20 w-20 place-items-center rounded-full transition ${
          recording
            ? "bg-accent-500/15 text-accent-600 animate-pulse"
            : "bg-brand-50 text-brand-500 dark:bg-ink-800"
        }`}
      >
        <Mic className="h-8 w-8" />
      </div>
      <span className="font-mono text-sm text-[var(--text-muted)]">
        {mm}:{ss}
      </span>
      {recording ? (
        <Button variant="primary" onClick={stop}>
          <Square className="h-4 w-4" /> 停止录音
        </Button>
      ) : (
        <Button variant="brand" onClick={start}>
          <Mic className="h-4 w-4" /> 开始录音
        </Button>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
