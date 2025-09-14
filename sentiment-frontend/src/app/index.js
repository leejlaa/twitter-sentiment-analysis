import { useState } from "react";

export default function Home() {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);

  const analyze = async () => {
    const res = await fetch("http://127.0.0.1:8000/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const data = await res.json();
    setResult(data);
  };

  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>Sentiment Analysis</h1>
      <textarea
        rows="4"
        cols="50"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type something..."
      />
      <br /><br />
      <button onClick={analyze}>Analyze</button>
      {result && (
        <p>
          Sentiment:{" "}
          <span
            style={{
              color: result.sentiment === "positive" ? "green" : "red",
              fontWeight: "bold",
            }}
          >
            {result.sentiment}
          </span>
        </p>
      )}
    </div>
  );
}
