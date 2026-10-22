"use client";

import { useRef, useState } from "react";
import { fileToCompressedDataUrl } from "./imageCompress";
import { TextInput } from "./ui";

export default function PhotoInput({ caption, image, onCaptionChange, onImageChange, label }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const dataUrl = await fileToCompressedDataUrl(file);
      onImageChange(dataUrl);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-lg border border-border-base bg-surface-variant/50 p-3">
      {label ? <p className="text-xs font-medium text-on-surface-variant mb-2">{label}</p> : null}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="relative h-24 w-32 shrink-0 overflow-hidden rounded-md border border-dashed border-border-base bg-surface flex items-center justify-center text-on-surface-variant hover:border-primary hover:text-primary"
        >
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt={caption || "photo"} className="h-full w-full object-cover" />
          ) : (
            <span className="text-[11px] text-center px-2">{busy ? "Processing…" : "Tap to add photo"}</span>
          )}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFile}
          className="hidden"
        />
        <div className="flex-1">
          <TextInput
            placeholder="Caption (e.g. Left side view of the property)"
            value={caption}
            onChange={(e) => onCaptionChange(e.target.value)}
          />
          {image ? (
            <button
              type="button"
              onClick={() => onImageChange("")}
              className="mt-2 text-[11px] text-red-500 hover:underline"
            >
              Remove photo
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
