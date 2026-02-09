import { useEffect, useState } from "react";

export default function App() {
  const [health, setHealth] = useState("Checking API...");

  useEffect(() => {
    fetch("/api/health")
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((data) => setHealth(`API: ${data.status}`))
      .catch((err) => setHealth(`API: unavailable (${err.message})`));
  }, []);

  return (
    <main className="shell">
      <header className="hero">
        <img src="/firstregistrars.png" alt="First Registrars" className="logo" />
        <h1>Company Secretariat Portal (Version 1.0, Feb.2026)</h1>
        <p>Frontend served from Vite build output (`dist`), backend served via `/api/*` functions.</p>
      </header>

      <section className="card">
        <h2>Deployment Structure</h2>
        <ul>
          <li><code>/src</code> frontend app</li>
          <li><code>/api</code> serverless backend</li>
          <li><code>/prisma</code> schema and seeds</li>
        </ul>
        <p className="status">{health}</p>
      </section>
    </main>
  );
}
