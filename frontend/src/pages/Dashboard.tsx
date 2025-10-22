import React, { useEffect, useState } from "react";
import api from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { RoleGate } from "../auth/guards";

type Item = { id:number; name:string; quantity:number; price:string; category:number };

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [delta, setDelta] = useState(1);
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => { api.get("/items/").then(r => setItems(r.data)); }, []);

  const adjust = async () => {
    if (!selected) return;
    await api.post(`/items/${selected}/adjust_quantity/`, { delta });
    const res = await api.get("/items/"); setItems(res.data);
  };

  return (
    <div style={{ padding: 24 }}>
      <header style={{ display:"flex", justifyContent:"space-between" }}>
        <h1>Inventory Dashboard</h1>
        <div>
          <span>Role: <b>{user?.role}</b></span>
          <button onClick={logout} style={{ marginLeft: 12 }}>Logout</button>
        </div>
      </header>

      {/* Everyone can view */}
      <section>
        <h2>Items</h2>
        <table>
          <thead><tr><th>ID</th><th>Name</th><th>Qty</th><th>Price</th></tr></thead>
          <tbody>
            {items.map(it => (
              <tr key={it.id} onClick={()=>setSelected(it.id)} style={{ cursor:"pointer" }}>
                <td>{it.id}</td><td>{it.name}</td><td>{it.quantity}</td><td>{it.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Managers/Admins: quantity adjustments */}
      <RoleGate min="manager">
        <section style={{ marginTop: 24 }}>
          <h2>Adjust Stock</h2>
          <p>Selected Item ID: {selected ?? "None"}</p>
          <input type="number" value={delta} onChange={e=>setDelta(parseInt(e.target.value||"0"))} />
          <button disabled={!selected} onClick={adjust}>Apply Delta</button>
        </section>
      </RoleGate>

      {/* Admin-only: catalog & user management placeholders */}
      <RoleGate min="admin">
        <section style={{ marginTop: 24 }}>
          <h2>Admin Tools</h2>
          <p>Catalog & user management (call admin-only APIs).</p>
        </section>
      </RoleGate>
    </div>
  );
}
