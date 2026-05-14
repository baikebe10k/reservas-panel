import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  LayoutDashboard, CalendarDays, Star, MessageCircle, Settings,
  TrendingUp, Clock, Users, Zap, CheckCircle2, XCircle,
  AlertCircle, ChevronRight, Bell, ArrowUpRight,
  Utensils, Phone, Calendar, Timer
} from "lucide-react";

const supabase = createClient(
  "https://xfhgkdequpejbinewfmf.supabase.co",
  "sb_publishable_7kantdqRUpAtsZ2R9Iq3zA_fGrg-6Za"
);

const STATUS = {
  confirmed: { label: "Confirmada", color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0", icon: CheckCircle2 },
  pending:   { label: "Pendiente",  color: "#d97706", bg: "#fffbeb", border: "#fde68a", icon: AlertCircle  },
  cancelled: { label: "Cancelada",  color: "#dc2626", bg: "#fef2f2", border: "#fecaca", icon: XCircle      },
};

const nav = [
  { id: "overview",     Icon: LayoutDashboard, label: "Resumen"  },
  { id: "reservations", Icon: CalendarDays,    label: "Reservas" },
  { id: "reviews",      Icon: Star,            label: "Reseñas"  },
  { id: "whatsapp",     Icon: MessageCircle,   label: "WhatsApp" },
  { id: "settings",     Icon: Settings,        label: "Config"   },
];

export default function App() {
  const [tab, setTab] = useState("overview");
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadReservations() {
    setLoading(true);
    const { data } = await supabase
      .from("reservations")
      .select("*")
      .order("date", { ascending: true });
    setReservations(data || []);
    setLoading(false);
  }

  useEffect(() => { loadReservations(); }, []);

  async function confirmRes(id) {
    await supabase.from("reservations").update({ status: "confirmed" }).eq("id", id);
    loadReservations();
  }

  async function cancelRes(id) {
    await supabase.from("reservations").update({ status: "cancelled" }).eq("id", id);
    loadReservations();
  }

  const today = new Date().toISOString().split("T")[0];
  const todayRes = reservations.filter(r => r.date === today);
  const confirmed = reservations.filter(r => r.status === "confirmed").length;
  const pending = reservations.filter(r => r.status === "pending").length;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f9fafb", fontFamily: "system-ui, sans-serif" }}>
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
        .stat-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; }
      `}</style>

      {/* SIDEBAR */}
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
        <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 10, padding: "12px 14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <Zap size={12} color="#f59e0b" fill="#f59e0b" />
            <span style={{ fontSize: 11, fontWeight: 700, color: "#111827" }}>Plan Pro</span>
          </div>
          <div style={{ fontSize: 11, color: "#6b7280" }}>299€/mes · activo</div>
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ flex: 1, overflowY: "auto" }}>
        <header style={{ position: "sticky", top: 0, zIndex: 20, background: "rgba(249,250,251,0.9)", borderBottom: "1px solid #e5e7eb", padding: "13px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>Restaurante Demo</h1>
            <p style={{ fontSize: 12, color: "#9ca3af" }}>Panel de control</p>
          </div>
          <button className="btn btn-dark" onClick={loadReservations}>↻ Actualizar</button>
        </header>

        <div style={{ padding: "24px 28px" }}>

          {/* OVERVIEW */}
          {tab === "overview" && (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 16 }}>
                {[
                  { label: "Reservas hoy",   value: todayRes.length,  Icon: CalendarDays, color: "#3b82f6", bg: "#eff6ff" },
                  { label: "Confirmadas",     value: confirmed,         Icon: CheckCircle2, color: "#10b981", bg: "#ecfdf5" },
                  { label: "Pendientes",      value: pending,           Icon: AlertCircle,  color: "#f59e0b", bg: "#fffbeb" },
                  { label: "Total reservas",  value: reservations.length, Icon: TrendingUp, color: "#8b5cf6", bg: "#f5f3ff" },
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
                      <span className="badge" style={{ background: S.bg, color: S.color, borderColor: S.border }}>
                        {S.label}
                      </span>
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

          {/* RESERVATIONS */}
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
                    <span className="badge" style={{ background: S.bg, color: S.color, borderColor: S.border }}>
                      {S.label}
                    </span>
                    <div style={{ display: "flex", gap: 5 }}>
                      {r.status === "pending" && <button className="btn btn-green" onClick={() => confirmRes(r.id)}>✓</button>}
                      {r.status !== "cancelled" && <button className="btn btn-red" onClick={() => cancelRes(r.id)}>✕</button>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* WHATSAPP */}
          {tab === "whatsapp" && (
            <div className="card">
              <div className="card-header"><span style={{ fontSize: 13, fontWeight: 600 }}>Estado del chatbot</span>
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

          {/* SETTINGS */}
          {tab === "settings" && (
            <div className="card">
              <div className="card-header"><span style={{ fontSize: 13, fontWeight: 600 }}>Configuración</span></div>
              {[
                { Icon: Utensils, label: "Restaurante",     value: "Restaurante Demo" },
                { Icon: Phone,    label: "WhatsApp",        value: "+1 415 523 8886"  },
                { Icon: Timer,    label: "Duración reserva", value: "90 minutos"       },
              ].map((f, i) => (
                <div key={i} className="table-row" style={{ justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <f.Icon size={14} color="#6b7280" />
                    <span style={{ fontSize: 13, color: "#6b7280" }}>{f.label}</span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{f.value}</span>
                </div>
              ))}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}