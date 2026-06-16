// frontend/components/ReceiptUpload.tsx
"use client";
import { useState, useRef } from "react";
import Cookies from "js-cookie";
import Image from "next/image";

interface Props {
  onUploaded: (path: string) => void;
}

export function ReceiptUpload({ onUploaded }: Props) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview immediately
    if (file.type.startsWith("image/")) {
      setPreview(URL.createObjectURL(file));
    }

    try {
      setUploading(true);
      setError("");

      const formData = new FormData();
      formData.append("receipt", file);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/upload/receipt`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${Cookies.get("access_token")}`,
            // Don't set Content-Type — browser sets it with boundary for FormData
          },
          body: formData,
        },
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      onUploaded(data.path); // pass path up to parent
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.log(err);
      setError(err.message);
      setPreview(null);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,application/pdf"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      <button onClick={() => inputRef.current?.click()} disabled={uploading}>
        {uploading ? "Uploading..." : "📎 Attach Receipt"}
      </button>

      {preview && (
        <Image
          src={preview}
          alt="Receipt preview"
          width={80}
          height={80}
          style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8 }}
        />
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
