// src/auth.ts
import api from "../api/client";

export async function login(username: string, password: string) {
  // cookies are set server-side; body can return just user or empty
  const { data } = await api.post("/token/", { username, password });
  localStorage.setItem("access", data.access);
  localStorage.setItem("refresh", data.refresh);
}

export async function refresh() {
  await api.post("/token/refresh/", {}); // refresh read from cookie
}

export type Me = { id: number; username: string; role: "admin"|"manager"|"viewer"; perms: string[] };
export async function getMe() {
  const { data } = await api.get<Me>("/me/");
  return data;
}
