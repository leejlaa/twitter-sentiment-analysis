"use client";

import { useState } from "react";

export default function Home() {
  const [text, setText] = useState("");
  const [batchText, setBatchText] = useState("");
  const [result, setResult] = useState<{ text: string; sentiment: string; confidence: number } | null>(null);
  const [batchResult, setBatchResult] = useState<{ text: string; sentiment: string; confidence: number }[]>([]);
  const [loading, setLoading] = useState(false);

  // 🔹 Single prediction
  const analyzeSentiment = async () => {
    if (!text.trim()) return;
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) throw new Error(`Request failed: ${res.status}`);

      const data = await res.json();
      setResult(data);
    } catch (error) {
      console.error("Error analyzing sentiment:", error);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Batch prediction
  const analyzeBatch = async () => {
    const texts = batchText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (texts.length === 0) return;

    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/batch_predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texts }),
      });

      if (!res.ok) throw new Error(`Batch request failed: ${res.status}`);

      const data = await res.json();
      setBatchResult(data.results);
    } catch (error) {
      console.error("Error in batch prediction:", error);
      setBatchResult([]);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Helper for card colors
  const sentimentColor = (sentiment: string) => {
    if (sentiment === "positive") return "bg-green-100 border-green-400 text-green-700";
    if (sentiment === "negative") return "bg-red-100 border-red-400 text-red-700";
    return "bg-gray-100 border-gray-400 text-gray-700"; // neutral
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-8 bg-gray-50">
      <div className="w-full max-w-3xl bg-white shadow-lg rounded-xl p-8 space-y-10">
        {/* Project explanation */}
        <section>
          <h1 className="text-3xl font-bold text-center mb-4">Sentiment Analysis App</h1>
          <p className="text-gray-700 text-center">
            This project demonstrates a <strong>machine learning model</strong> deployed with{" "}
            <strong>FastAPI</strong> and integrated into a <strong>Next.js frontend</strong>.
            <br /> Enter text to analyze its sentiment (positive or negative) with a confidence score.
          </p>
        </section>

        {/* 🔹 Single prediction */}
        <section>
          <h2 className="text-xl font-semibold mb-2">Single Prediction</h2>
          <textarea
            className="w-full border rounded-lg p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="Type your text here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button
            onClick={analyzeSentiment}
            disabled={loading}
            className="w-full mt-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg disabled:bg-gray-400"
          >
            {loading ? "Analyzing..." : "Analyze"}
          </button>

          {result && (
            <div className={`mt-4 p-4 border rounded-lg ${sentimentColor(result.sentiment)}`}>
              <p className="text-lg">
                <strong>Text:</strong> {result.text}
              </p>
              <p className="mt-2">
                <strong>Sentiment:</strong> {result.sentiment} ({(result.confidence * 100).toFixed(1)}%)
              </p>
            </div>
          )}
        </section>

        <hr className="my-6" />

        {/* 🔹 Batch prediction */}
        <section>
          <h2 className="text-xl font-semibold mb-2">Batch Prediction</h2>
          <textarea
            className="w-full border rounded-lg p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            rows={6}
            placeholder="Enter multiple texts (one per line)..."
            value={batchText}
            onChange={(e) => setBatchText(e.target.value)}
          />
          <button
            onClick={analyzeBatch}
            disabled={loading}
            className="w-full mt-2 bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg disabled:bg-gray-400"
          >
            {loading ? "Analyzing Batch..." : "Analyze Batch"}
          </button>

          {batchResult.length > 0 && (
            <div className="mt-4 grid gap-3">
              {batchResult.map((item, i) => (
                <div
                  key={i}
                  className={`p-4 border rounded-lg ${sentimentColor(item.sentiment)}`}
                >
                  <p className="text-sm">
                    <strong>Text:</strong> {item.text}
                  </p>
                  <p className="mt-1">
                    <strong>Sentiment:</strong> {item.sentiment} (
                    {(item.confidence * 100).toFixed(1)}%)
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
