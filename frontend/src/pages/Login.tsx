import React, { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setU] = useState(""); const [password, setP] = useState("");
  const [err, setErr] = useState(""); const nav = useNavigate(); const { login } = useAuth();
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await login(username, password); nav("/"); }
    catch { setErr("Invalid credentials"); }
  };
  return (
    <form onSubmit={onSubmit} style={{ maxWidth: 360, margin: "4rem auto" }}>
      <h2>Sign in</h2>
      {err && <p style={{color:"crimson"}}>{err}</p>}
      <input placeholder="Username" value={username} onChange={e=>setU(e.target.value)} />
      <input placeholder="Password" type="password" value={password} onChange={e=>setP(e.target.value)} />
      <button type="submit">Login</button>
    </form>
  );
}
