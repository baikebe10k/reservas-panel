import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  LayoutDashboard, CalendarDays, Star, MessageCircle, Settings,
  TrendingUp, Clock, Users, Zap, CheckCircle2, XCircle,
  AlertCircle, ChevronRight, Bell, ArrowUpRight,
  Utensils, Phone, Calendar, Timer, Save, Edit2, X
} from "lucide-react";

const supabase = createClient(
  "https://xfhgkdequpejbinewfmf.supabase.co",
  "sb_publishable_7kantdqRUpAtsZ2R9Iq3zA_fGrg-6Za"
);

const LOGIN_PASSWORD = "reservia2024";

const STATUS = {
  confirmed: { label: "Confirmada", color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0", icon: CheckCircle2 },
  pending:   { label: "Pendiente",  color: "#d97706", bg: "#fffbeb", border: "#fde68a", icon: AlertCircle  },
  cancelled: { label: "Cancelada",  color: "#dc2626", bg: "#fef2f2", border: "#fecaca", icon: XCircle      },
};

const nav = [
  { id: "overview",     Icon: LayoutDashboard, label: "Resumen"  },
  { id: "reservations", Icon: CalendarDays,    label: "Reservas" },
  { id: "whatsapp",     Icon: MessageCircle,   label: "WhatsApp" },
  { id: "settings",     Icon: Settings,        label: "Config"   },
];

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [tab, setTab] = useState("overview");
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Settings state
  const [restaurant, setRestaurant] = useState(null);
  const [tables, setTables] = useState([]);
  const [editingRestaurant, setEditingRestaurant] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [restForm, setRestForm] = useState({});
  const [tableForm, setTableForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  async function loadReservations() {
    setLoading(true);
    const { data } = await supabase
      .from("reservations")
      .select("*")
      .order("date", { ascending: true });
    setReservations(data || []);
    setLoading(false);
  }

  async function loadSettings() {
    const { data: rest } = await supabase
      .from("restaurants")
      .select("*")
      .eq("id", "00000000-0000-0000-0000-000000000001")
      .maybeSingle();
    setRestaurant(rest);
    setRestForm({
      name: rest?.name || "",
      phone: rest?.phone || "",
      opening_time: rest?.opening_time || "13:00",
      closing_time: rest?.closing_time || "23:00",
      slot_duration: rest?.slot_duration || 30,
    });

    const { data: tbls } = await supabase
      .from("tables")
      .select("*")
      .eq("restaurant_id", "00000000-0000-0000-0000-000000000001")
      .order("label");
    setTables(tbls || []);
  }

  useEffect(() => {
    if (loggedIn) {
      loadReservations();
      loadSettings();
    }
  }, [loggedIn]);

  async function confirmRes(id) {
    await supabase.from("reservations").update({ status: "confirmed" }).eq("id", id);
    loadReservations();
  }

  async function cancelRes(id) {
    await supabase.from("reservations").update({ status: "cancelled" }).eq("id", id);
    loadReservations();
  }

  async function saveRestaurant() {
    setSaving(true);
    await supabase.from("restaurants").update({
      name: restForm.name,
      phone: restForm.phone,
      opening_time: restForm.opening_time,
      closing_time: restForm.closing_time,
      slot_duration: parseInt(restForm.slot_duration),
    }).eq("id", "00000000-0000-0000-0000-000000000001");
    await loadSettings();
    setEditingRestaurant(false);
    setSaving(false);
    showSaveMsg("✓ Guardado correctamente");
  }

  async function saveTable(id) {
    setSaving(true);
    await supabase.from("tables").update({
      label: tableForm.label,
      capacity: parseInt(tableForm.capacity),
    }).eq("id", id);
    await loadSettings();
    setEditingTable(null);
    setSaving(false);
    showSaveMsg("✓ Mesa actualizada");
  }

  function showSaveMsg(msg) {
    setSaveMsg(msg);
    setTimeout(() => setSaveMsg(""), 3000);
  }

  function handleLogin() {
    if (password === LOGIN_PASSWORD) {
      setLoggedIn(true);
      setLoginError("");
    } else {
      setLoginError("Contraseña incorrecta");
    }
  }

  if (!loggedIn) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#f9fafb", fontFamily: "system-ui" }}>
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: 40, width: 360, boxShadow: "0 4px 24px #0000000a" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
            <div style={{ width: 40, height: 40, background: "#111827", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Utensils size={20} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>ReservIA</div>
              <div style={{ fontSize: 12, color: "#9ca3af" }}>Panel de control</div>
            </div>
          </div>
          <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
            placeholder="Introduce tu contraseña"
            style={{ width: "100%", padding: "10px 14px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 14, marginBottom: 12, fontFamily: "system-ui", boxSizing: "border-box" }}
          />
          {loginError && <div style={{ color: "#dc2626", fontSize: 12, marginBottom: 12 }}>{loginError}</div>}
          <button onClick={handleLogin} style={{ width: "100%", padding: 11, background: "#111827", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "system-ui" }}>
            Entrar
          </button>
        </div>
      </div>
    );
  }

  const today = new Date().toISOString().split("T")[0];
  const todayRes = reservations.filter(r => r.date === today);
  const confirmed = reservations.filter(r => r.status === "confirmed").length;
  const pending = reservations.filter(r => r.status === "pending").length;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f9fafb", fontFamily: "system-ui" }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .nav-link { display: flex; align-items: center; gap: 10px; padding: 8px 12px; border-radius: 8px; cursor: pointer; font-size: 13.5px; font-weight: 500; color: #6b7280; border: none; background: none; width: 100%; text-align: left; }
        .nav-link:hover { color: #111827; background: #f3f4f6; }
        .nav-link.active { color: #111827; background: #fff; box-shadow: 0 1px 3px #0000000d; font-weight: 600; }
        .card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; }
        .card-header { padding: 16px 20px; border-bottom: 1px solid #f3f4f6; display: flex; justify-content: space-between; align-items: center; }
        .table-row { display: flex; align-items: center; gap: 14px; padding: 12px 20px; border-bottom: 1px solid #f9fafb; }
        .table-row:last-child { border-bottom: none; }
        .badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 9px; border-radius: 6px; font-size: 11px; font-weight: 600; border: 1px solid; }
        .btn { border: 1px solid; cursor: pointer; padding: 5px 12px; border-radius: 7px; font-size: 12px; font-weight: 600; font-family: inherit; }
        .btn-green { background: #f0fdf4; color: #15803d; border-color: #bbf7d0; }
        .btn-red { background: #fef2f2; color: #b91c1c; border-color: #fecaca; }
        .btn-dark { background: #111827; color: #fff; border-color: #111827; }
        .btn-gray { background: #f3f4f6; color: #374151; border-color: #e5e7eb; }
        .stat-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; }
        .input-field { width: 100%; padding: 8px 12px; border: 1px solid #e5e7eb; border-radius: 8px; fontSize: 13px; fontFamily: system-ui; outline: none; }
        .input-field:focus { border-color: #111827; }
      `}</style>

      <aside style={{ width: 216, background: "#fff", borderRight: "1px solid #e5e7eb", display: "flex", flexDirection: "column", padding: "20px 12px", position: "sticky", top: 0, height: "100vh" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "4px 6px", marginBottom: 28 }}>
          <div style={{ width: 32, height: 32, background: "#111827", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Utensils size={16} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>ReservIA</div>
            <div style={{ fontSize: 10, color: "#9ca3af" }}>Panel Pro</div>
          </div>
        </div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
          {nav.map(({ id, Icon, label }) => (
            <button key={id} className={`nav-link ${tab === id ? "active" : ""}`} onClick={() => setTab(id)}>
              <Icon size={16} />{label}
            </button>
          ))}
        </nav>
        <button onClick={() => setLoggedIn(false)} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", color: "#6b7280", fontSize: 13, cursor: "pointer", fontFamily: "system-ui" }}>
          Cerrar sesión
        </button>
      </aside>

      <main style={{ flex: 1, overflowY: "auto" }}>
        <header style={{ position: "sticky", top: 0, zIndex: 20, background: "rgba(249,250,251,0.9)", borderBottom: "1px solid #e5e7eb", padding: "13px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>{restaurant?.name || "Restaurante Demo"}</h1>
            <p style={{ fontSize: 12, color: "#9ca3af" }}>Panel de control</p>
          </div>
          <button className="btn btn-dark" onClick={loadReservations}>↻ Actualizar</button>
        </header>

        <div style={{ padding: "24px 28px" }}>

          {tab === "overview" && (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 16 }}>
                {[
                  { label: "Reservas hoy",   value: todayRes.length,      Icon: CalendarDays, color: "#3b82f6", bg: "#eff6ff" },
                  { label: "Confirmadas",     value: confirmed,             Icon: CheckCircle2, color: "#10b981", bg: "#ecfdf5" },
                  { label: "Pendientes",      value: pending,               Icon: AlertCircle,  color: "#f59e0b", bg: "#fffbeb" },
                  { label: "Total reservas",  value: reservations.length,   Icon: TrendingUp,   color: "#8b5cf6", bg: "#f5f3ff" },
                ].map((s, i) => (
                  <div key={i} className="stat-card">
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                      <div style={{ width: 36, height: 36, background: s.bg, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <s.Icon size={17} color={s.color} />
                      </div>
                      <ArrowUpRight size={14} color="#d1d5db" />
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 700, color: "#111827" }}>{s.value}</div>
                    <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="card">
                <div className="card-header">
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>Reservas de hoy</span>
                  <button className="btn btn-dark" style={{ fontSize: 11 }} onClick={() => setTab("reservations")}>Ver todas →</button>
                </div>
                {loading && <div style={{ padding: 20, color: "#9ca3af", fontSize: 13 }}>Cargando...</div>}
                {!loading && todayRes.length === 0 && <div style={{ padding: 20, color: "#9ca3af", fontSize: 13 }}>No hay reservas para hoy</div>}
                {todayRes.map(r => {
                  const S = STATUS[r.status] || STATUS.confirmed;
                  return (
                    <div key={r.id} className="table-row">
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{r.customer_name}</div>
                        <div style={{ fontSize: 11, color: "#9ca3af" }}>{r.customer_phone}</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <Clock size={12} color="#9ca3af" />
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{r.time}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <Users size={12} color="#9ca3af" />
                        <span style={{ fontSize: 12, color: "#6b7280" }}>{r.guests} personas</span>
                      </div>
                      <span className="badge" style={{ background: S.bg, color: S.color, borderColor: S.border }}>{S.label}</span>
                      <div style={{ display: "flex", gap: 6 }}>
                        {r.status === "pending" && <button className="btn btn-green" onClick={() => confirmRes(r.id)}>Confirmar</button>}
                        {r.status !== "cancelled" && <button className="btn btn-red" onClick={() => cancelRes(r.id)}>Cancelar</button>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {tab === "reservations" && (
            <div className="card">
              <div className="card-header">
                <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{reservations.length} reservas totales</span>
              </div>
              {loading && <div style={{ padding: 20, color: "#9ca3af" }}>Cargando...</div>}
              {reservations.map(r => {
                const S = STATUS[r.status] || STATUS.confirmed;
                return (
                  <div key={r.id} className="table-row" style={{ opacity: r.status === "cancelled" ? 0.5 : 1 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{r.customer_name}</div>
                      <div style={{ fontSize: 11, color: "#9ca3af" }}>{r.customer_phone}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <Calendar size={11} color="#9ca3af" />
                      <span style={{ fontSize: 12, color: "#6b7280" }}>{r.date}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <Clock size={11} color="#9ca3af" />
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{r.time}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <Users size={11} color="#9ca3af" />
                      <span style={{ fontSize: 12, color: "#6b7280" }}>{r.guests} personas</span>
                    </div>
                    <span className="badge" style={{ background: S.bg, color: S.color, borderColor: S.border }}>{S.label}</span>
                    <div style={{ display: "flex", gap: 5 }}>
                      {r.status === "pending" && <button className="btn btn-green" onClick={() => confirmRes(r.id)}>✓</button>}
                      {r.status !== "cancelled" && <button className="btn btn-red" onClick={() => cancelRes(r.id)}>✕</button>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {tab === "whatsapp" && (
            <div className="card">
              <div className="card-header">
                <span style={{ fontSize: 13, fontWeight: 600 }}>Estado del chatbot</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#16a34a" }}>● Activo</span>
              </div>
              {[
                { label: "Número Twilio sandbox", value: "+1 415 523 8886" },
                { label: "Webhook URL", value: "reservas-bot-production-db9b.up.railway.app/webhook" },
                { label: "Estado", value: "Operativo" },
              ].map((s, i) => (
                <div key={i} className="table-row" style={{ justifyContent: "space-between" }}>
                  <span style={{ fontSize: 13, color: "#6b7280" }}>{s.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{s.value}</span>
                </div>
              ))}
            </div>
          )}

          {tab === "settings" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {saveMsg && (
                <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "10px 16px", color: "#15803d", fontSize: 13, fontWeight: 600 }}>
                  {saveMsg}
                </div>
              )}

              {/* Datos del restaurante */}
              <div className="card">
                <div className="card-header">
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Datos del restaurante</span>
                  {!editingRestaurant
                    ? <button className="btn btn-gray" onClick={() => setEditingRestaurant(true)}><Edit2 size={12} style={{ marginRight: 4 }} />Editar</button>
                    : <div style={{ display: "flex", gap: 8 }}>
                        <button className="btn btn-gray" onClick={() => setEditingRestaurant(false)}><X size={12} /></button>
                        <button className="btn btn-dark" onClick={saveRestaurant} disabled={saving}><Save size={12} style={{ marginRight: 4 }} />{saving ? "Guardando..." : "Guardar"}</button>
                      </div>
                  }
                </div>
                {[
                  { label: "Nombre", field: "name", icon: Utensils },
                  { label: "Teléfono WhatsApp", field: "phone", icon: Phone },
                  { label: "Hora apertura", field: "opening_time", icon: Clock, placeholder: "13:00" },
                  { label: "Hora cierre", field: "closing_time", icon: Clock, placeholder: "23:00" },
                  { label: "Duración slot (min)", field: "slot_duration", icon: Timer, placeholder: "30" },
                ].map(({ label, field, icon: Icon, placeholder }) => (
                  <div key={field} className="table-row" style={{ justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Icon size={14} color="#6b7280" />
                      <span style={{ fontSize: 13, color: "#6b7280" }}>{label}</span>
                    </div>
                    {editingRestaurant
                      ? <input
                          className="input-field"
                          style={{ width: 180, textAlign: "right" }}
                          value={restForm[field] || ""}
                          placeholder={placeholder}
                          onChange={e => setRestForm(f => ({ ...f, [field]: e.target.value }))}
                        />
                      : <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{restForm[field] || "—"}</span>
                    }
                  </div>
                ))}
              </div>

              {/* Mesas */}
              <div className="card">
                <div className="card-header">
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Mesas ({tables.length})</span>
                </div>
                {tables.map(t => (
                  <div key={t.id} className="table-row" style={{ justifyContent: "space-between" }}>
                    {editingTable === t.id ? (
                      <>
                        <div style={{ display: "flex", gap: 8, flex: 1 }}>
                          <input
                            className="input-field"
                            style={{ width: 120 }}
                            value={tableForm.label || ""}
                            placeholder="Nombre mesa"
                            onChange={e => setTableForm(f => ({ ...f, label: e.target.value }))}
                          />
                          <input
                            className="input-field"
                            style={{ width: 80 }}
                            type="number"
                            value={tableForm.capacity || ""}
                            placeholder="Capacidad"
                            onChange={e => setTableForm(f => ({ ...f, capacity: e.target.value }))}
                          />
                          <span style={{ fontSize: 12, color: "#9ca3af", alignSelf: "center" }}>personas</span>
                        </div>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button className="btn btn-gray" onClick={() => setEditingTable(null)}><X size={12} /></button>
                          <button className="btn btn-dark" onClick={() => saveTable(t.id)} disabled={saving}>
                            <Save size={12} style={{ marginRight: 4 }} />{saving ? "..." : "Guardar"}
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <Utensils size={14} color="#6b7280" />
                          <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{t.label}</span>
                          <span style={{ fontSize: 12, color: "#9ca3af" }}>{t.capacity} personas</span>
                        </div>
                        <button className="btn btn-gray" onClick={() => { setEditingTable(t.id); setTableForm({ label: t.label, capacity: t.capacity }); }}>
                          <Edit2 size={12} style={{ marginRight: 4 }} />Editar
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>

            </div>
          )}

        </div>
      </main>
    </div>
  );
}