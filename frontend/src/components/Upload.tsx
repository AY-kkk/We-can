import { UploadCloud } from "lucide-react";
import * as React from "react";

export function Upload({
  accept,
  onFile,
  hint = "点击或拖拽文件到此处上传",
}: {
  accept?: string;
  onFile: (file: File) => void;
  hint?: string;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [drag, setDrag] = React.useState(false);
  const [name, setName] = React.useState<string>("");

  const handle = (file?: File | null) => {
    if (!file) return;
    setName(file.name);
    onFile(file);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        handle(e.dataTransfer.files?.[0]);
      }}
      className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-card border-2 border-dashed px-6 py-10 text-center transition ${
        drag
          ? "border-brand-400 bg-brand-50 dark:bg-ink-800"
          : "border-[var(--border)] hover:border-brand-300"
      }`}
    >
      <UploadCloud className="h-8 w-8 text-brand-500" />
      <p className="text-sm text-[var(--text)]">{name || hint}</p>
      {name && <p className="text-xs text-[var(--text-muted)]">已选择，可重新点击更换</p>}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => handle(e.target.files?.[0])}
      />
    </div>
  );
}
