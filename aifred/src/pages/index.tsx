import { useState } from "react";
import styles from "../styles/Home.module.css";

export default function Home() {
  const [description, setDescription] = useState("");
  const [output, setOutput] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, output }),
      });
      const data = await response.json();
      setResult(data.result || "No result generated");
    } catch (error) {
      console.error("Error:", error);
    }
    setLoading(false);
  };

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>ZEE Workflow ++</h1>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label>Description:</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter workflow description..."
              required
            />
          </div>
          <div className={styles.field}>
            <label>Expected Output:</label>
            <input
              type="text"
              value={output}
              onChange={(e) => setOutput(e.target.value)}
              placeholder="Enter expected output..."
              required
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? "Generating..." : "Generate"}
          </button>
        </form>
        {result && (
          <div className={styles.result}>
            <h2>Result:</h2>
            <pre>{result}</pre>
          </div>
        )}
      </main>
    </div>
  );
}
