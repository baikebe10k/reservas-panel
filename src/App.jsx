cat > /Users/nerea/Desktop/reservas-panel/src/App.jsx << 'EOF'
import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  LayoutDashboard, CalendarDays, MessageCircle, Settings,
  TrendingUp, Clock, Users, CheckCircle2, XCircle,
  AlertCircle, ArrowUpRight, Utensils, Phone, Calendar, Timer,
  Save, Edit2, X, Grid, Bell
} from "lucide-react";

const supabase = createClient(
  "https://xfhgkdequpejbinewfmf.supabase.co",
  "sb_publishable_7kantdqRUpAtsZ2R9Iq3zA_fGrg-6Za"
);

const LOGIN_PASSWORD = "reservia2024";

const STATUS = {
  confirmed: { label: "Confirmada", color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" },
  pending:   { label: "Pendiente",  color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
  cancelled: { label: "Cancelada",  color: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
};

const nav = [
  { id: "overview",     Icon: LayoutDashboard, label: "Resumen"  },
  { id: "reservations", Icon: CalendarDays,    label: "Reservas" },
  { id: "tables",       Icon: Grid,            label: "Mesas"    },
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
  const [restaurant, setRestaurant] = useState(null);
  const [tables, setTables] = useState([]);
  const [editingRestaurant, setEditingRestaurant] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [restForm, setRestForm] = useState({});
  const [tableForm, setTableForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [notifications, setNotifications] = useState([]);
  const audioCtx = useRef(null);

  function playSound() {
    try {
      if (!audioCtx.current) audioCtx.current = new (window.AudioContext || window.webkitAudioContext)();
      const ctx = audioCtx.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(880, ctx.currentTime);
      oscillator.frequency.setValueAtTime(660, ctx.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.4);
    } catch(e) {}
  }

  function addNotification(reservation) {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, reservation }]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 6000);
    playSound();
  }

  async function loadReservations() {
    setLoading(true);
    const { data } = await supabase.from("reservations").select("*").order("date", { ascending: true });
    setReservations(data || []);
    setLoading(false);
  }

  async function loadSettings() {
    const { data: rest } = await supabase.from("restaurants").select("*").eq("id", "00000000-0000-0000-0000-000000000001").maybeSingle();
    setRestaurant(rest);
    setRestForm({
      name: rest?.name || "",
      phone: rest?.phone || "",
      opening_time: rest?.opening_time || "13:00",
      closing_time: rest?.closing_time || "23:00",
      slot_duration: rest?.slot_duration || 30,
    });
    const { data: tbls } = await supabase.from("tables").select("*").eq("restaurant_id", "00000000-0000-0000-0000-000000000001").order("label");
    setTables(tbls || []);
  }

  useEffect(() => {
    if (!loggedIn) return;
    loadReservations();
    loadSettings();

    const channel = supabase
      .channel('reservations-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'reservations' }, payload => {
        loadReservations();
        addNotification(payload.new);
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
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
      name: restForm.name, phone: restForm.phone,
      opening_time: restForm.opening_time, closing_time: restForm.closing_time,
      slot_duration: parseInt(restForm.slot_duration),
    }).eq("id", "00000000-0000-0000-0000-000000000001");
    await loadSettings();
    setEditingRestaurant(false);
    setSaving(false);
    showSaveMsg("✓ Guardado correctamente");
  }

  async function saveTable(id) {
    setSaving(true);
    await supabase.from("tables").update({ label: tableForm.label, capacity: parseInt(tableForm.capacity) }).eq("id", id);
    await loadSettings();
    setEditingTable(null);
    setSaving(false);
    showSaveMsg("✓ Mesa actualizada");
  }

  async function setTableManualStatus(id, status) {
    await supabase.from("tables").update({ manual_status: status }).eq("id", id);
    await loadSettings();
  }

  function getTableStatus(table) {
    if (table.manual_status === 'occupied') return { label: "Ocupada", color: "#dc2626", bg: "#fef2f2", border: "#fecaca", dot: "#dc2626" };
    if (table.manual_status === 'blocked') return { label: "Bloqueada", color: "#6b7280", bg: "#f3f4f6", border: "#e5e7eb", dot: "#9ca3af" };
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    const activeRes = reservations.find(r =>
      r.table_id === table.id && r.date === todayStr && r.status === "confirmed" &&
      new Date(r.end_time) > now && new Date(r.date + "T" + r.time) <= now
    );
    if (activeRes) return { label: "Ocupada", color: "#dc2626", bg: "#fef2f2", border: "#fecaca", dot: "#dc2626", reservation: activeRes };
    const upcomingRes = reservations.find(r =>
      r.table_id === table.id && r.date === todayStr && r.status === "confirmed" &&
      new Date(r.date + "T" + r.time) > now
    );
    if (upcomingRes) return { label: "Reservada", color: "#d97706", bg: "#fffbeb", border: "#fde68a", dot: "#d97706", reservation: upcomingRes };
    return { label: "Libre", color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0", dot: "#16a34a" };
  }

  function showSaveMsg(msg) {
    setSaveMsg(msg);
    setTimeout(() => setSaveMsg(""), 3000);
  }

  function handleLogin() {
    if (password === LOGIN_PASSWORD) { setLoggedIn(true); setLoginError(""); }
    else setLoginError("Contraseña incorrecta");
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
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} placeholder="Introduce tu contraseña"
            style={{ width: "100%", padding: "10px 14px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 14, marginBottom: 12, fontFamily: "system-ui", boxSizing: "border-box" }} />
          {loginError && <div style={{ color: "#dc2626", fontSize: 12, marginBottom: 12 }}>{loginError}</div>}
          <button onClick={handleLogin} style={{ width: "100%", padding: 11, background: "#111827", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Entrar</button>
        </div>
      </div>
    );
  }

  const today = new Date().toISOString().split("T")[0];
  const todayRes = reservations.filter(r => r.date === today);
  const confirmed = reservations.filter(r => r.status === "confirmed").length;
  const pending = reservations.filter(r => r.status === "pending").length;
  const freeTables = tables.filter(t => getTableStatus(t).label === "Libre").length;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f9fafb", fontFamily: "system-ui" }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .nav-link { display: flex; align-items: center; gap: 10px; padding: 8px 12px; border-radius: 8px; cursor: pointer; font-size: 13.5px; font-weight: 500; color: #6b7280; border: none; background: none; width: 100%; text-align: left; transition: all 0.15s; }
        .nav-link:hover { color: #111827; background: #f3f4f6; }
        .nav-link.active { color: #111827; background: #fff; box-shadow: 0 1px 3px #0000000d; font-weight: 600; }
        .card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; }
        .card-header { padding: 16px 20px; border-bottom: 1px solid #f3f4f6; display: flex; justify-content: space-between; align-items: center; }
        .table-row { display: flex; align-items: center; gap: 14px; padding: 12px 20px; border-bottom: 1px solid #f9fafb; }
        .table-row:last-child { border-bottom: none; }
        .badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 9px; border-radius: 6px; font-size: 11px; font-weight: 600; border: 1px solid; }
        .btn { border: 1px solid; cursor: pointer; padding: 5px 12px; border-radius: 7px; font-size: 12px; font-weight: 600; font-family: inherit; transition: all 0.15s; }
        .btn-green { background: #f0fdf4; color: #15803d; border-color: #bbf7d0; }
        .btn-red { background: #fef2f2; color: #b91c1c; border-color: #fecaca; }
        .btn-dark { background: #111827; color: #fff; border-color: #111827; }
        .btn-