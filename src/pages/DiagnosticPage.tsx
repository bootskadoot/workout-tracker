import { useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "../supabaseClient";

export function DiagnosticPage() {
  const [status, setStatus] = useState<string>("Checking...");
  const [details, setDetails] = useState<any>({});

  useEffect(() => {
    async function runDiagnostics() {
      const results: any = {
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL || "NOT SET",
        supabaseKeyExists: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
        isConfigured: isSupabaseConfigured(),
        clientExists: !!supabase,
      };

      if (supabase && isSupabaseConfigured()) {
        try {
          const { data, error } = await supabase
            .from("users")
            .select("*")
            .limit(1);

          if (error) {
            results.connectionTest = "FAILED";
            results.error = error.message;
            setStatus("❌ Connection failed");
          } else {
            results.connectionTest = "SUCCESS";
            results.usersFound = data?.length || 0;
            setStatus("✅ Everything working!");
          }
        } catch (e: any) {
          results.connectionTest = "ERROR";
          results.error = e.message;
          setStatus("❌ Error occurred");
        }
      } else {
        setStatus("⚠️ Supabase not configured");
        results.reason = "Environment variables not set";
      }

      setDetails(results);
    }

    runDiagnostics();
  }, []);

  return (
    <div className="stack">
      <section className="card">
        <h2 className="card-title">🔍 Diagnostic Check</h2>
        <h3 style={{ fontSize: "1.5rem", margin: "1rem 0" }}>{status}</h3>

        <div style={{ marginTop: "1.5rem" }}>
          <h3 className="card-subtitle">Environment Variables</h3>
          <div style={{ fontFamily: "monospace", fontSize: "0.85rem" }}>
            <div style={{ marginBottom: "0.5rem" }}>
              <strong>VITE_SUPABASE_URL:</strong>{" "}
              <span style={{ color: details.supabaseUrl !== "NOT SET" ? "#4ade80" : "#f87171" }}>
                {details.supabaseUrl}
              </span>
            </div>
            <div style={{ marginBottom: "0.5rem" }}>
              <strong>VITE_SUPABASE_ANON_KEY:</strong>{" "}
              <span style={{ color: details.supabaseKeyExists ? "#4ade80" : "#f87171" }}>
                {details.supabaseKeyExists ? "SET (hidden)" : "NOT SET"}
              </span>
            </div>
          </div>
        </div>

        <div style={{ marginTop: "1.5rem" }}>
          <h3 className="card-subtitle">Configuration Status</h3>
          <div style={{ fontFamily: "monospace", fontSize: "0.85rem" }}>
            <div style={{ marginBottom: "0.5rem" }}>
              <strong>isSupabaseConfigured():</strong>{" "}
              <span style={{ color: details.isConfigured ? "#4ade80" : "#f87171" }}>
                {String(details.isConfigured)}
              </span>
            </div>
            <div style={{ marginBottom: "0.5rem" }}>
              <strong>Supabase client exists:</strong>{" "}
              <span style={{ color: details.clientExists ? "#4ade80" : "#f87171" }}>
                {String(details.clientExists)}
              </span>
            </div>
          </div>
        </div>

        {details.connectionTest && (
          <div style={{ marginTop: "1.5rem" }}>
            <h3 className="card-subtitle">Connection Test</h3>
            <div style={{ fontFamily: "monospace", fontSize: "0.85rem" }}>
              <div style={{ marginBottom: "0.5rem" }}>
                <strong>Status:</strong>{" "}
                <span
                  style={{
                    color: details.connectionTest === "SUCCESS" ? "#4ade80" : "#f87171",
                  }}
                >
                  {details.connectionTest}
                </span>
              </div>
              {details.usersFound !== undefined && (
                <div style={{ marginBottom: "0.5rem" }}>
                  <strong>Users found:</strong> {details.usersFound}
                </div>
              )}
              {details.error && (
                <div style={{ marginBottom: "0.5rem", color: "#f87171" }}>
                  <strong>Error:</strong> {details.error}
                </div>
              )}
              {details.reason && (
                <div style={{ marginBottom: "0.5rem", color: "#fbbf24" }}>
                  <strong>Reason:</strong> {details.reason}
                </div>
              )}
            </div>
          </div>
        )}

        <div style={{ marginTop: "2rem", padding: "1rem", background: "rgba(59, 130, 246, 0.1)", borderRadius: "0.5rem" }}>
          <h3 className="card-subtitle">What to do if Supabase is not configured:</h3>
          <ol style={{ marginLeft: "1.5rem", lineHeight: "1.8" }}>
            <li>Go to your Netlify dashboard</li>
            <li>Navigate to Site settings → Environment variables</li>
            <li>Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY</li>
            <li>Trigger a new deployment</li>
            <li>Refresh this page to check again</li>
          </ol>
        </div>
      </section>
    </div>
  );
}
