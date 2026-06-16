// frontend/components/ReceiptViewer.tsx
"use client";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";

export function ReceiptViewer({ path }: { path: string }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!path) return;

    fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/expense/receipt?path=${encodeURIComponent(path)}`,
      {
        headers: { Authorization: `Bearer ${Cookies.get("access_token")}` },
      },
    )
      .then((r) => r.json())
      .then((data) => setUrl(data.url));
  }, [path]);

  if (!url) return <span>Loading receipt...</span>;

  return (
    <a href={url} target="_blank" rel="noopener noreferrer">
      View Receipt
    </a>
  );
}
