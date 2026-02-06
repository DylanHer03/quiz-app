"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Home() {
  const [status, setStatus] = useState("Checking Supabase...");

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.auth.getSession();
      setStatus(error ? `Error: ${error.message}` : "Supabase OK ✅");
    })();
  }, []);

  return (
    <main style={{ padding: 24 }}>
      <h1>Quiz App</h1>
      <p>{status}</p>
    </main>
  );
}
