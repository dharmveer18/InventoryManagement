// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { login as srvLogin, getMe } from "./auth";

type Me = { id: number; username: string; role: "admin"|"manager"|"viewer"; perms: string[] };
type Ctx = { user: Me|null; login: (u:string,p:string)=>Promise<void>; logout: ()=>void; loading: boolean; error: string|null; };

const Ctx = createContext<Ctx>({ user:null, login: async()=>{}, logout: ()=>{}, loading:true, error:null });
export const useAuth = () => useContext(Ctx);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<Me|null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);

  const login = async (username: string, password: string) => {
    setError(null);
    await srvLogin(username, password);
    const me = await getMe();
    setUser(me);
  };

  const logout = () => {
    // optional: call an API to clear cookies; or just rely on expiry.
    setUser(null);
  };

  useEffect(() => {
    (async () => {
      try { setUser(await getMe()); } catch {} finally { setLoading(false); }
    })();
  }, []);

  return <Ctx.Provider value={{ user, login, logout, loading, error }}>{children}</Ctx.Provider>;
};
