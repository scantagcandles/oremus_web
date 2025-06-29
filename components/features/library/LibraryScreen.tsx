"use client";

import React, { useEffect, useState } from "react";

interface LibraryItem {
  id: string;
  title: string;
  type: "book" | "audiobook" | "prayer" | "song";
  author?: string;
  duration?: string;
}

const mockLibraryData: LibraryItem[] = [
  { id: "1", title: "Modlitewnik", type: "book", author: "Jan Paweł II" },
  { id: "2", title: "Różaniec", type: "prayer" },
  { id: "3", title: "Pieśni religijne", type: "song" },
  {
    id: "4",
    title: "Audiobook - Żywoty Świętych",
    type: "audiobook",
    author: "Ks. Piotr Skarga",
  },
];

export default function LibraryScreen() {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setItems(mockLibraryData);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-32 h-32 border-b-2 border-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8 mx-auto">
      <h1 className="mb-8 text-3xl font-bold text-center">Biblioteka</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="p-6 transition-shadow bg-white rounded-lg shadow-md cursor-pointer hover:shadow-lg"
          >
            <h3 className="mb-2 text-xl font-semibold">{item.title}</h3>
            {item.author && (
              <p className="mb-2 text-gray-600">Autor: {item.author}</p>
            )}
            <span className="inline-block px-2 py-1 text-sm text-blue-800 bg-blue-100 rounded">
              {item.type}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
