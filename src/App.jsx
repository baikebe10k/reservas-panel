import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import {
  LayoutDashboard, CalendarDays, MessageCircle, Settings,
  TrendingUp, Clock, Users, CheckCircle2, XCircle,
  AlertCircle, ArrowUpRight, Utensils, Phone, Calendar, Timer,
  Save, Edit2, X, Grid, Bell, BarChart2, Search, Plus, Trash2,
  ChevronLeft, ChevronRight
} from "lucide-react";

const supabase = createClient(
  "https://xfhgkdequpejbinewfmf.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmaGdrZGVxdXBlamJpbmV3Zm1mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0MjEyNDksImV4cCI6MjA5Mzk5NzI0OX0._wjZHBkkpx5F-1uYStWCx79a9wJhoVs-UPEY5fjjCdE"
);

const LOGIN_PASSWORD = "reservia2024";
const STATUS = {
  confirmed: { label: "Confirmada", color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" },
  pending:   { label: "Pendiente",  color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
  cancelled: { label: "Cancelada",  color: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
};
const nav = [
  { id: "overview",     Icon: LayoutDashboard, label: "Resumen" },
  { id: "reservations", Icon: CalendarDays,    label: "Reservas" },
  { id: "calendar",     Icon: Calendar,        label: "Calendario" },
  { id: "tables",       Icon: Grid,            label: "Mesas" },
  { id: "stats",        Icon: BarChart2,       label: "Estadísticas" },
  { id: "whatsapp",     Icon: MessageCircle,   label: "WhatsApp" },
  { id: "settings",     Icon: Settings,        label: "Config" },
];

const DAYS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

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
  const [search, setSearch] = useState("");
  const [searchOverview, setSearchOverview] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterHour, setFilterHour] = useState("");
  const [newTable, setNewTable] = useState({ label: "", capacity: "" });
  const [addingTable, setAddingTable] = useState(false);
  const [calView, setCalView] = useState("week");
  const [calDate, setCalDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showNewRes, setShowNewRes] = useState(false);
  const [newRes, setNewRes] = useState({ date: '', time: '', guests: 2, name: '', phone: '', notes: '' });
  const [editingNote, setEditingNote] = useState(null);
  const [noteText, setNoteText] = useState('');
  const audioCtx = useRef(null);

  function playSound() {
    try {
      if (!audioCtx.current) audioCtx.current = new (window.AudioContext || window.webkitAudioContext)();
      const ctx = audioCtx.current;
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type = "sine";
      o.frequency.setValueAtTime(880, ctx.currentTime);
      o.frequency.setValueAtTime(660, ctx.currentTime + 0.1);
      g.gain.setValueAtTime(0.3, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.4);
    } catch(e) {}
  }

  function addNotification(reservation) {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, reservation }]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 10000);
    playSound();
  }

  async function loadReservations() {
    setLoading(true);
    const { data } = await supabase.from("reservations").select("*").order("date", { ascending: false });
    setReservations(data || []);
    setLoading(false);
  }

  async function loadSettings() {
    const { data: rest } = await supabase.from("restaurants").select("*").eq("id", "00000000-0000-0000-0000-000000000001").maybeSingle();
    setRestaurant(rest);
    setRestForm({ name: rest?.name || "", phone: rest?.phone || "", opening_time: rest?.opening_time || "13:00", closing_time: rest?.closing_time || "23:00", slot_duration: rest?.slot_duration || 30 });
    const { data: tbls } = await supabase.from("tables").select("*").eq("restaurant_id", "00000000-0000-0000-0000-000000000001").order("label");
    setTables(tbls || []);
  }

  useEffect(() => {
    if (!loggedIn) return;
    loadReservations(); loadSettings();
    const channel = supabase.channel('reservations-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'reservations' }, payload => {
        loadReservations(); addNotification(payload.new);
      }).subscribe();
    return () => supabase.removeChannel(channel);
  }, [loggedIn]);

  async function createManualReservation() {
    const { date, time, guests, name, phone, notes } = newRes;
    if (!date || !time || !guests || !name || !phone) { alert('Rellena todos los campos'); return; }
    const { error } = await supabase.from('reservations').insert([{
      restaurant_id: '00000000-0000-0000-0000-000000000001',
      customer_name: name, customer_phone: phone,
      date, time, guests: parseInt(guests),
      status: 'confirmed', notes: notes || null, source: 'manual'
    }]);
    if (error) { alert('Error: ' + error.message); return; }
    setShowNewRes(false);
    setNewRes({ date: '', time: '', guests: 2, name: '', phone: '', notes: '' });
    loadReservations();
  }

  async function saveNote(id, text) {
    const { error } = await supabase.from('reservations').update({ notes: text }).eq('id', id);
    if (error) { alert('Error: ' + error.message); return; }
    setEditingNote(null); setNoteText(''); loadReservations();
  }

  async function confirmRes(id) { await supabase.from("reservations").update({ status: "confirmed" }).eq("id", id); loadReservations(); }
  async function cancelRes(id) { await supabase.from("reservations").update({ status: "cancelled" }).eq("id", id); loadReservations(); }

  async function saveRestaurant() {
    setSaving(true);
    await supabase.from("restaurants").update({ name: restForm.name, phone: restForm.phone, opening_time: restForm.opening_time, closing_time: restForm.closing_time, slot_duration: parseInt(restForm.slot_duration) }).eq("id", "00000000-0000-0000-0000-000000000001");
    await loadSettings(); setEditingRestaurant(false); setSaving(false); showSaveMsg("✓ Guardado correctamente");
  }

  async function saveTable(id) {
    setSaving(true);
    await supabase.from("tables").update({ label: tableForm.label, capacity: parseInt(tableForm.capacity) }).eq("id", id);
    await loadSettings(); setEditingTable(null); setSaving(false); showSaveMsg("✓ Mesa actualizada");
  }

  async function addTable() {
    if (!newTable.label || !newTable.capacity) return;
    setSaving(true);
    await supabase.from("tables").insert([{ restaurant_id: "00000000-0000-0000-0000-000000000001", label: newTable.label, capacity: parseInt(newTable.capacity), active: true, manual_status: "available" }]);
    setNewTable({ label: "", capacity: "" }); setAddingTable(false);
    await loadSettings(); setSaving(false); showSaveMsg("✓ Mesa añadida");
  }

  async function deleteTable(id) {
    if (!confirm("¿Eliminar esta mesa?")) return;
    await supabase.from("tables").delete().eq("id", id);
    await loadSettings(); showSaveMsg("✓ Mesa eliminada");
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
    const activeRes = reservations.find(r => r.table_id === table.id && r.date === todayStr && r.status === "confirmed" && new Date(r.end_time) > now && new Date(r.date + "T" + r.time) <= now);
    if (activeRes) return { label: "Ocupada", color: "#dc2626", bg: "#fef2f2", border: "#fecaca", dot: "#dc2626", reservation: activeRes };
    const upcomingRes = reservations.find(r => r.table_id === table.id && r.date === todayStr && r.status === "confirmed" && new Date(r.date + "T" + r.time) > now);
    if (upcomingRes) return { label: "Reservada", color: "#d97706", bg: "#fffbeb", border: "#fde68a", dot: "#d97706", reservation: upcomingRes };
    return { label: "Libre", color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0", dot: "#16a34a" };
  }

  function showSaveMsg(msg) { setSaveMsg(msg); setTimeout(() => setSaveMsg(""), 3000); }
  function handleLogin() {
    if (password === LOGIN_PASSWORD) { setLoggedIn(true); setLoginError(""); }
    else setLoginError("Contraseña incorrecta");
  }

  function getStats() {
    const confirmed = reservations.filter(r => r.status === "confirmed");
    const cancelled = reservations.filter(r => r.status === "cancelled");
    const totalGuests = confirmed.reduce((sum, r) => sum + (r.guests || 0), 0);
    const cancellationRate = reservations.length > 0 ? Math.round((cancelled.length / reservations.length) * 100) : 0;
    const last7 = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const dayName = d.toLocaleDateString('es-ES', { weekday: 'short' });
      last7.push({ day: dayName, reservas: confirmed.filter(r => r.date === dateStr).length });
    }
    const hourCount = {};
    confirmed.forEach(r => { const h = r.time?.split(':')[0] + ':00'; hourCount[h] = (hourCount[h] || 0) + 1; });
    const horasPico = Object.entries(hourCount).map(([hora, reservas]) => ({ hora, reservas })).sort((a, b) => a.hora.localeCompare(b.hora));
    const mesaCount = {};
    confirmed.forEach(r => { const mesa = tables.find(t => t.id === r.table_id); const label = mesa?.label || 'Desconocida'; mesaCount[label] = (mesaCount[label] || 0) + 1; });
    const ocupacionMesas = Object.entries(mesaCount).map(([mesa, reservas]) => ({ mesa, reservas })).sort((a, b) => b.reservas - a.reservas).slice(0, 8);
    const pieData = [{ name: 'Confirmadas', value: confirmed.length, color: '#16a34a' }, { name: 'Canceladas', value: cancelled.length, color: '#dc2626' }];
    return { last7, horasPico, ocupacionMesas, pieData, totalGuests, cancellationRate, totalConfirmed: confirmed.length };
  }

  function getWeekDays(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    return Array.from({ length: 7 }, (_, i) => {
      const dd = new Date(monday);
      dd.setDate(monday.getDate() + i);
      return dd;
    });
  }

  function getMonthDays(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    const days = [];
    for (let i = 0; i < startDay; i++) {
      const d = new Date(firstDay); d.setDate(d.getDate() - (startDay - i));
      days.push({ date: d, currentMonth: false });
    }
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ date: new Date(year, month, i), currentMonth: true });
    }
    while (days.length % 7 !== 0) {
      const last = days[days.length - 1].date;
      const d = new Date(last); d.setDate(last.getDate() + 1);
      days.push({ date: d, currentMonth: false });
    }
    return days;
  }

  function dateStr(d) { return d.toISOString().split("T")[0]; }

  const filteredReservations = reservations.filter(r => {
    const matchSearch = !search || r.customer_name?.toLowerCase().includes(search.toLowerCase()) || r.customer_phone?.includes(search);
    const matchDate = !filterDate || r.date === filterDate;
    const matchStatus = !filterStatus || r.status === filterStatus;
    const matchHour = !filterHour || r.time?.startsWith(filterHour);
    return matchSearch && matchDate && matchStatus && matchHour;
  });

  const today = new Date().toISOString().split("T")[0];
  const todayRes = reservations.filter(r => r.date === today).filter(r => {
    if (!searchOverview) return true;
    return r.customer_name?.toLowerCase().includes(searchOverview.toLowerCase()) || r.customer_phone?.includes(searchOverview);
  });

  if (!loggedIn) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#f9fafb", fontFamily: "system-ui" }}>
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: 40, width: 360, boxShadow: "0 4px 24px #0000000a" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
            <div style={{ width: 40, height: 40, background: "#111827", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}><Utensils size={20} color="#fff" /></div>
            <div><div style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>ReservIA</div><div style={{ fontSize: 12, color: "#9ca3af" }}>Panel de control</div></div>
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

  const confirmedCount = reservations.filter(r => r.status === "confirmed").length;
  const freeTables = tables.filter(t => getTableStatus(t).label === "Libre").length;
  const stats = getStats();
  const weekDays = getWeekDays(calDate);
  const monthDays = getMonthDays(calDate);

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
        .btn-gray { background: #f3f4f6; color: #374151; border-color: #e5e7eb; }
        .stat-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; }
        .mesa-card { border-radius: 10px; padding: 14px 16px; border: 1.5px solid; transition: box-shadow 0.15s; display: flex; flex-direction: column; gap: 8px; }
        .mesa-card:hover { box-shadow: 0 4px 12px #00000010; }
        .cal-day { border: 1px solid #f3f4f6; border-radius: 8px; padding: 8px; min-height: 80px; cursor: pointer; transition: background 0.1s; }
        .cal-day:hover { background: #f9fafb; }
        .cal-day.today { border-color: #111827; }
        .cal-day.other-month { opacity: 0.4; }
        @keyframes slideIn { from { transform: translateX(120%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .notif { animation: slideIn 0.3s ease; }
      `}</style>

      <div style={{ position: "fixed", top: 20, right: 20, zIndex: 999, display: "flex", flexDirection: "column", gap: 10 }}>
        {notifications.map(n => (
          <div key={n.id} className="notif" style={{ background: "#fff", color: "#111827", borderRadius: 12, padding: "14px 18px", minWidth: 300, boxShadow: "0 8px 24px #00000015", border: "1px solid #e5e7eb", display: "flex", alignItems: "flex-start", gap: 12 }}>
            <div style={{ width: 36, height: 36, background: "#f0fdf4", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "1px solid #bbf7d0" }}><Bell size={16} color="#16a34a" /></div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#111827", marginBottom: 2 }}>Nueva reserva!</div>
              <div style={{ fontSize: 12, color: "#374151" }}>{n.reservation.customer_name} · {n.reservation.time} · {n.reservation.guests}p</div>
              <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{n.reservation.date}</div>
            </div>
            <button onClick={() => setNotifications(prev => prev.filter(x => x.id !== n.id))} style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", marginLeft: "auto" }}><X size={14} /></button>
          </div>
        ))}
      </div>

      <aside style={{ width: 216, background: "#fff", borderRight: "1px solid #e5e7eb", display: "flex", flexDirection: "column", padding: "20px 12px", position: "sticky", top: 0, height: "100vh" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "4px 6px", marginBottom: 28 }}>
          <div style={{ width: 32, height: 32, background: "#111827", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}><Utensils size={16} color="#fff" /></div>
          <div><div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>ReservIA</div><div style={{ fontSize: 10, color: "#9ca3af" }}>Panel Pro</div></div>
        </div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
          {nav.map(({ id, Icon, label }) => (
            <button key={id} className={"nav-link" + (tab === id ? " active" : "")} onClick={() => setTab(id)}><Icon size={16} />{label}</button>
          ))}
        </nav>
        <button onClick={() => setLoggedIn(false)} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", color: "#6b7280", fontSize: 13, cursor: "pointer" }}>Cerrar sesión</button>
      </aside>

      <main style={{ flex: 1, overflowY: "auto" }}>
        <header style={{ position: "sticky", top: 0, zIndex: 20, background: "rgba(249,250,251,0.95)", borderBottom: "1px solid #e5e7eb", padding: "13px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>{restaurant?.name || "Restaurante"}</h1>
            <p style={{ fontSize: 12, color: "#9ca3af" }}>Panel de control</p>
          </div>
          <button className="btn btn-dark" onClick={() => { loadReservations(); loadSettings(); }}>↻ Actualizar</button>
            <button style={{border:'none',cursor:'pointer',padding:'7px 14px',borderRadius:7,fontSize:12,fontWeight:600,background:'#3b82f6',color:'#fff'}} onClick={() => setShowNewRes(true)}>+ Nueva Reserva</button>
        </header>

        <div style={{ padding: "24px 28px" }}>

          {tab === "overview" && (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 16 }}>
                {[
                  { label: "Reservas hoy",   value: reservations.filter(r => r.date === today).length, Icon: CalendarDays, color: "#3b82f6", bg: "#eff6ff" },
                  { label: "Confirmadas",    value: confirmedCount,      Icon: CheckCircle2, color: "#10b981", bg: "#ecfdf5" },
                  { label: "Mesas libres",   value: freeTables,          Icon: Grid,         color: "#16a34a", bg: "#f0fdf4" },
                  { label: "Total reservas", value: reservations.length, Icon: TrendingUp,   color: "#8b5cf6", bg: "#f5f3ff" },
                ].map((s, i) => (
                  <div key={i} className="stat-card">
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                      <div style={{ width: 36, height: 36, background: s.bg, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}><s.Icon size={17} color={s.color} /></div>
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
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <div style={{ position: "relative" }}>
                      <Search size={12} color="#9ca3af" style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)" }} />
                      <input placeholder="Buscar..." value={searchOverview} onChange={e => setSearchOverview(e.target.value)}
                        style={{ padding: "5px 10px 5px 26px", border: "1px solid #e5e7eb", borderRadius: 7, fontSize: 12, fontFamily: "system-ui", width: 150, outline: "none" }} />
                    </div>
                    <button className="btn btn-dark" style={{ fontSize: 11 }} onClick={() => setTab("reservations")}>Ver todas →</button>
                  </div>
                </div>
                {loading && <div style={{ padding: 20, color: "#9ca3af", fontSize: 13 }}>Cargando...</div>}
                {!loading && todayRes.length === 0 && <div style={{ padding: 20, color: "#9ca3af", fontSize: 13 }}>No hay reservas para hoy</div>}
                {todayRes.map(r => {
                  const S = STATUS[r.status] || STATUS.confirmed;
                  return (
                    <div key={r.id} className="table-row">
                      <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{r.customer_name}</div><div style={{ fontSize: 11, color: "#9ca3af" }}>{r.customer_phone}</div></div>
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}><Clock size={12} color="#9ca3af" /><span style={{ fontSize: 13, fontWeight: 600 }}>{r.time}</span></div>
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}><Users size={12} color="#9ca3af" /><span style={{ fontSize: 12, color: "#6b7280" }}>{r.guests}p</span></div>
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
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
                  <Search size={14} color="#9ca3af" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
                  <input placeholder="Buscar nombre o teléfono..." value={search} onChange={e => setSearch(e.target.value)}
                    style={{ width: "100%", padding: "8px 12px 8px 32px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, fontFamily: "system-ui", outline: "none" }} />
                </div>
                <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)}
                  style={{ padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, fontFamily: "system-ui", outline: "none" }} />
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                  style={{ padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, fontFamily: "system-ui", outline: "none", background: "#fff" }}>
                  <option value="">Todos los estados</option>
                  <option value="confirmed">Confirmadas</option>
                  <option value="pending">Pendientes</option>
                  <option value="cancelled">Canceladas</option>
                </select>
                <select value={filterHour} onChange={e => setFilterHour(e.target.value)}
                  style={{ padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, fontFamily: "system-ui", outline: "none", background: "#fff" }}>
                  <option value="">Todas las horas</option>
                  {["13","14","15","16","17","18","19","20","21","22","23"].map(h => <option key={h} value={h}>{h}:00</option>)}
                </select>
                {(search || filterDate || filterStatus || filterHour) && (
                  <button className="btn btn-gray" onClick={() => { setSearch(""); setFilterDate(""); setFilterStatus(""); setFilterHour(""); }}>✕ Limpiar</button>
                )}
              </div>
              <div className="card">
                <div className="card-header"><span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{filteredReservations.length} reservas</span></div>
                {loading && <div style={{ padding: 20, color: "#9ca3af" }}>Cargando...</div>}
                {!loading && filteredReservations.length === 0 && <div style={{ padding: 20, color: "#9ca3af", fontSize: 13 }}>No hay reservas con estos filtros</div>}
                {filteredReservations.map(r => {
                  const S = STATUS[r.status] || STATUS.confirmed;
                  return (
                    <div key={r.id} className="table-row" style={{ opacity: r.status === "cancelled" ? 0.5 : 1 }}>
                      <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{r.customer_name}</div><div style={{ fontSize: 11, color: "#9ca3af" }}>{r.customer_phone}</div></div>
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}><Calendar size={11} color="#9ca3af" /><span style={{ fontSize: 12, color: "#6b7280" }}>{r.date}</span></div>
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}><Clock size={11} color="#9ca3af" /><span style={{ fontSize: 13, fontWeight: 600 }}>{r.time}</span></div>
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}><Users size={11} color="#9ca3af" /><span style={{ fontSize: 12, color: "#6b7280" }}>{r.guests}p</span></div>
                      <span className="badge" style={{ background: S.bg, color: S.color, borderColor: S.border }}>{S.label}</span>
                      <div style={{ display: "flex", gap: 5 }}>
                        {r.status === "pending" && <button className="btn btn-green" onClick={() => confirmRes(r.id)}>✓</button>}
                        {r.status !== "cancelled" && <button className="btn btn-red" onClick={() => cancelRes(r.id)}>✕</button>}
                        {editingNote === r.id ? (
                          <span style={{display:'inline-flex',gap:4,alignItems:'center'}}>
                            <input value={noteText} onChange={e=>setNoteText(e.target.value)} placeholder="Nota..." autoFocus style={{padding:'3px 7px',borderRadius:5,border:'1px solid #e5e7eb',fontSize:12,fontFamily:'system-ui',width:130}} />
                            <button className="btn btn-green" style={{padding:'3px 8px'}} onClick={()=>saveNote(r.id,noteText)}>✓</button>
                            <button className="btn btn-gray" style={{padding:'3px 8px'}} onClick={()=>setEditingNote(null)}>✕</button>
                          </span>
                        ) : (
                          <button title={r.notes||'Añadir nota'} className="btn btn-gray" style={{padding:'3px 8px',fontSize:13}} onClick={()=>{setEditingNote(r.id);setNoteText(r.notes||'');}}>
                            {r.notes?'📝':'🗒️'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {tab === "calendar" && (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <button className="btn btn-gray" onClick={() => {
                    const d = new Date(calDate);
                    if (calView === "week") d.setDate(d.getDate() - 7);
                    else d.setMonth(d.getMonth() - 1);
                    setCalDate(d);
                  }}><ChevronLeft size={14} /></button>
                  <span style={{ fontSize: 15, fontWeight: 700, color: "#111827", minWidth: 180, textAlign: "center" }}>
                    {calView === "week"
                      ? weekDays[0].toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) + ' – ' + weekDays[6].toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
                      : MONTHS_ES[calDate.getMonth()] + ' ' + calDate.getFullYear()
                    }
                  </span>
                  <button className="btn btn-gray" onClick={() => {
                    const d = new Date(calDate);
                    if (calView === "week") d.setDate(d.getDate() + 7);
                    else d.setMonth(d.getMonth() + 1);
                    setCalDate(d);
                  }}><ChevronRight size={14} /></button>
                  <button className="btn btn-gray" onClick={() => setCalDate(new Date())} style={{ fontSize: 11 }}>Hoy</button>
                </div>
                <div style={{ display: "flex", gap: 4, background: "#f3f4f6", borderRadius: 8, padding: 4 }}>
                  <button onClick={() => setCalView("week")} style={{ padding: "5px 14px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "system-ui", background: calView === "week" ? "#fff" : "transparent", color: calView === "week" ? "#111827" : "#6b7280", boxShadow: calView === "week" ? "0 1px 3px #0000000d" : "none" }}>Semana</button>
                  <button onClick={() => setCalView("month")} style={{ padding: "5px 14px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "system-ui", background: calView === "month" ? "#fff" : "transparent", color: calView === "month" ? "#111827" : "#6b7280", boxShadow: calView === "month" ? "0 1px 3px #0000000d" : "none" }}>Mes</button>
                </div>
              </div>

              {calView === "week" && (
                <div className="card">
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderBottom: "1px solid #f3f4f6" }}>
                    {weekDays.map((d, i) => {
                      const isToday = dateStr(d) === today;
                      const dayRes = reservations.filter(r => r.date === dateStr(d) && r.status === "confirmed");
                      return (
                        <div key={i} style={{ padding: "12px 8px", borderRight: i < 6 ? "1px solid #f3f4f6" : "none", cursor: "pointer" }} onClick={() => setSelectedDate(selectedDate === dateStr(d) ? null : dateStr(d))}>
                          <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 4 }}>{DAYS_ES[d.getDay()]}</div>
                          <div style={{ width: 28, height: 28, borderRadius: "50%", background: isToday ? "#111827" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
                            <span style={{ fontSize: 14, fontWeight: 700, color: isToday ? "#fff" : "#111827" }}>{d.getDate()}</span>
                          </div>
                          {dayRes.length > 0 && (
                            <div style={{ background: "#eff6ff", borderRadius: 6, padding: "3px 6px", fontSize: 11, fontWeight: 600, color: "#3b82f6", textAlign: "center" }}>
                              {dayRes.length} reserva{dayRes.length > 1 ? 's' : ''}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {selectedDate && (
                    <div style={{ padding: 16 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 12 }}>
                        {new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                      </div>
                      {reservations.filter(r => r.date === selectedDate).length === 0 && (
                        <div style={{ color: "#9ca3af", fontSize: 13 }}>No hay reservas este día</div>
                      )}
                      {reservations.filter(r => r.date === selectedDate).sort((a, b) => a.time?.localeCompare(b.time)).map(r => {
                        const S = STATUS[r.status] || STATUS.confirmed;
                        return (
                          <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid #f9fafb" }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: "#111827", minWidth: 45 }}>{r.time}</div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{r.customer_name}</div>
                              <div style={{ fontSize: 11, color: "#9ca3af" }}>{r.customer_phone}</div>
                            </div>
                            <div style={{ fontSize: 12, color: "#6b7280" }}>{r.guests}p</div>
                            <span className="badge" style={{ background: S.bg, color: S.color, borderColor: S.border }}>{S.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {calView === "month" && (
                <div className="card">
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderBottom: "1px solid #f3f4f6" }}>
                    {['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'].map(d => (
                      <div key={d} style={{ padding: "10px 8px", fontSize: 11, fontWeight: 600, color: "#9ca3af", textAlign: "center" }}>{d}</div>
                    ))}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, padding: 8 }}>
                    {monthDays.map(({ date: d, currentMonth }, i) => {
                      const ds = dateStr(d);
                      const isToday = ds === today;
                      const dayRes = reservations.filter(r => r.date === ds && r.status !== "cancelled");
                      const isSelected = selectedDate === ds;
                      return (
                        <div key={i} className={"cal-day" + (isToday ? " today" : "") + (!currentMonth ? " other-month" : "")}
                          style={{ background: isSelected ? "#f0fdf4" : "white", borderColor: isToday ? "#111827" : isSelected ? "#bbf7d0" : "#f3f4f6" }}
                          onClick={() => setSelectedDate(isSelected ? null : ds)}>
                          <div style={{ fontSize: 12, fontWeight: isToday ? 700 : 500, color: isToday ? "#111827" : "#374151", marginBottom: 4 }}>{d.getDate()}</div>
                          {dayRes.length > 0 && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                              <div style={{ background: "#111827", borderRadius: 4, padding: "2px 5px", fontSize: 10, fontWeight: 600, color: "#fff" }}>{dayRes.length} res.</div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {selectedDate && (
                    <div style={{ padding: 16, borderTop: "1px solid #f3f4f6" }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 12 }}>
                        {new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                      </div>
                      {reservations.filter(r => r.date === selectedDate).length === 0 && (
                        <div style={{ color: "#9ca3af", fontSize: 13 }}>No hay reservas este día</div>
                      )}
                      {reservations.filter(r => r.date === selectedDate).sort((a, b) => a.time?.localeCompare(b.time)).map(r => {
                        const S = STATUS[r.status] || STATUS.confirmed;
                        return (
                          <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid #f9fafb" }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: "#111827", minWidth: 45 }}>{r.time}</div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{r.customer_name}</div>
                              <div style={{ fontSize: 11, color: "#9ca3af" }}>{r.customer_phone}</div>
                            </div>
                            <div style={{ fontSize: 12, color: "#6b7280" }}>{r.guests}p</div>
                            <span className="badge" style={{ background: S.bg, color: S.color, borderColor: S.border }}>{S.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {tab === "tables" && (
            <div>
              <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
                {[
                  { color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0", label: "Libre" },
                  { color: "#d97706", bg: "#fffbeb", border: "#fde68a", label: "Reservada hoy" },
                  { color: "#dc2626", bg: "#fef2f2", border: "#fecaca", label: "Ocupada" },
                  { color: "#6b7280", bg: "#f3f4f6", border: "#e5e7eb", label: "Bloqueada" },
                ].map((s, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, background: s.bg, padding: "5px 12px", borderRadius: 20, border: "1px solid " + s.border }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: s.color }} />
                    <span style={{ fontSize: 12, color: s.color, fontWeight: 600 }}>{s.label}</span>
                  </div>
                ))}
                <div style={{ marginLeft: "auto", fontSize: 12, color: "#9ca3af", alignSelf: "center" }}>
                  {tables.filter(t => getTableStatus(t).label === "Libre").length} libres · {tables.length} total
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10 }}>
                {tables.map(table => {
                  const status = getTableStatus(table);
                  const isOccupied = table.manual_status === 'occupied';
                  const isBlocked = table.manual_status === 'blocked';
                  return (
                    <div key={table.id} className="mesa-card" style={{ background: status.bg, borderColor: status.border }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div><div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>{table.label}</div><div style={{ fontSize: 11, color: "#6b7280", marginTop: 1 }}>{table.capacity} personas</div></div>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: status.dot, marginTop: 4, flexShrink: 0 }} />
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: status.color }}>{status.label}</div>
                      {status.reservation && (
                        <div style={{ fontSize: 11, color: "#374151", background: "#fff", padding: "5px 8px", borderRadius: 6, border: "1px solid #f3f4f6" }}>
                          <div style={{ fontWeight: 600 }}>{status.reservation.customer_name}</div>
                          <div style={{ color: "#9ca3af" }}>{status.reservation.time} · {status.reservation.guests}p</div>
                        </div>
                      )}
                      <div style={{ display: "flex", gap: 5, marginTop: 2 }}>
                        {!isBlocked && !isOccupied && <button className="btn btn-red" style={{ fontSize: 11, flex: 1 }} onClick={() => setTableManualStatus(table.id, 'occupied')}>Ocupar</button>}
                        {isOccupied && <button className="btn btn-green" style={{ fontSize: 11, flex: 1 }} onClick={() => setTableManualStatus(table.id, 'available')}>Liberar</button>}
                        {!isBlocked && !isOccupied && <button className="btn btn-gray" style={{ fontSize: 11, flex: 1 }} onClick={() => setTableManualStatus(table.id, 'blocked')}>Bloquear</button>}
                        {isBlocked && <button className="btn btn-green" style={{ fontSize: 11, flex: 1 }} onClick={() => setTableManualStatus(table.id, 'available')}>Liberar</button>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {tab === "stats" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
                {[
                  { label: "Total confirmadas", value: stats.totalConfirmed, color: "#16a34a" },
                  { label: "Total comensales", value: stats.totalGuests, color: "#3b82f6" },
                  { label: "Tasa cancelación", value: stats.cancellationRate + "%", color: "#dc2626" },
                ].map((s, i) => (
                  <div key={i} className="stat-card" style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 36, fontWeight: 800, color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="card">
                <div className="card-header"><span style={{ fontSize: 13, fontWeight: 600 }}>Reservas últimos 7 días</span></div>
                <div style={{ padding: 20 }}>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={stats.last7}><XAxis dataKey="day" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 12 }} /><Tooltip /><Bar dataKey="reservas" fill="#111827" radius={[4,4,0,0]} /></BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div className="card">
                  <div className="card-header"><span style={{ fontSize: 13, fontWeight: 600 }}>Horas pico</span></div>
                  <div style={{ padding: 20 }}>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={stats.horasPico}><XAxis dataKey="hora" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip /><Bar dataKey="reservas" fill="#3b82f6" radius={[4,4,0,0]} /></BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="card">
                  <div className="card-header"><span style={{ fontSize: 13, fontWeight: 600 }}>Estado reservas</span></div>
                  <div style={{ padding: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <PieChart width={200} height={200}>
                      <Pie data={stats.pieData} cx={100} cy={100} innerRadius={60} outerRadius={90} dataKey="value">
                        {stats.pieData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                      </Pie><Tooltip />
                    </PieChart>
                  </div>
                  <div style={{ padding: "0 20px 16px", display: "flex", gap: 16, justifyContent: "center" }}>
                    {stats.pieData.map((d, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: d.color }} />
                        <span style={{ fontSize: 12, color: "#6b7280" }}>{d.name}: {d.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="card">
                <div className="card-header"><span style={{ fontSize: 13, fontWeight: 600 }}>Mesas más reservadas</span></div>
                <div style={{ padding: 20 }}>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={stats.ocupacionMesas} layout="vertical">
                      <XAxis type="number" tick={{ fontSize: 11 }} /><YAxis dataKey="mesa" type="category" tick={{ fontSize: 11 }} width={70} /><Tooltip /><Bar dataKey="reservas" fill="#8b5cf6" radius={[0,4,4,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
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
              {saveMsg && <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "10px 16px", color: "#15803d", fontSize: 13, fontWeight: 600 }}>{saveMsg}</div>}
              <div className="card">
                <div className="card-header">
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Datos del restaurante</span>
                  {!editingRestaurant
                    ? <button className="btn btn-gray" onClick={() => setEditingRestaurant(true)}><Edit2 size={12} style={{ marginRight: 4 }} />Editar</button>
                    : <div style={{ display: "flex", gap: 8 }}>
                        <button className="btn btn-gray" onClick={() => setEditingRestaurant(false)}><X size={12} /></button>
                        <button className="btn btn-dark" onClick={saveRestaurant} disabled={saving}><Save size={12} style={{ marginRight: 4 }} />{saving ? "..." : "Guardar"}</button>
                      </div>
                  }
                </div>
                {[
                  { label: "Nombre", field: "name", icon: Utensils },
                  { label: "Teléfono WhatsApp", field: "phone", icon: Phone },
                  { label: "Hora apertura", field: "opening_time", icon: Clock },
                  { label: "Hora cierre", field: "closing_time", icon: Clock },
                  { label: "Duración slot (min)", field: "slot_duration", icon: Timer },
                ].map(({ label, field, icon: Icon }) => (
                  <div key={field} className="table-row" style={{ justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}><Icon size={14} color="#6b7280" /><span style={{ fontSize: 13, color: "#6b7280" }}>{label}</span></div>
                    {editingRestaurant
                      ? <input style={{ width: 180, textAlign: "right", padding: "6px 10px", border: "1px solid #e5e7eb", borderRadius: 7, fontSize: 13, fontFamily: "system-ui" }} value={restForm[field] || ""} onChange={e => setRestForm(f => ({ ...f, [field]: e.target.value }))} />
                      : <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{restForm[field] || "—"}</span>
                    }
                  </div>
                ))}
              </div>
              <div className="card">
                <div className="card-header">
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Mesas ({tables.length})</span>
                  <button className="btn btn-dark" style={{ fontSize: 11 }} onClick={() => setAddingTable(!addingTable)}>
                    <Plus size={12} style={{ marginRight: 4 }} />Añadir mesa
                  </button>
                </div>
                {addingTable && (
                  <div className="table-row" style={{ background: "#f9fafb", gap: 8 }}>
                    <input placeholder="Nombre (ej: Mesa 30)" value={newTable.label} onChange={e => setNewTable(t => ({ ...t, label: e.target.value }))}
                      style={{ flex: 1, padding: "6px 10px", border: "1px solid #e5e7eb", borderRadius: 7, fontSize: 13, fontFamily: "system-ui" }} />
                    <input placeholder="Capacidad" type="number" value={newTable.capacity} onChange={e => setNewTable(t => ({ ...t, capacity: e.target.value }))}
                      style={{ width: 90, padding: "6px 10px", border: "1px solid #e5e7eb", borderRadius: 7, fontSize: 13, fontFamily: "system-ui" }} />
                    <span style={{ fontSize: 12, color: "#6b7280" }}>personas</span>
                    <button className="btn btn-gray" onClick={() => setAddingTable(false)}><X size={12} /></button>
                    <button className="btn btn-dark" onClick={addTable} disabled={saving}><Save size={12} style={{ marginRight: 4 }} />{saving ? "..." : "Guardar"}</button>
                  </div>
                )}
                {tables.map(t => (
                  <div key={t.id} className="table-row" style={{ justifyContent: "space-between" }}>
                    {editingTable === t.id ? (
                      <>
                        <div style={{ display: "flex", gap: 8, flex: 1 }}>
                          <input style={{ width: 120, padding: "6px 10px", border: "1px solid #e5e7eb", borderRadius: 7, fontSize: 13, fontFamily: "system-ui" }} value={tableForm.label || ""} placeholder="Nombre" onChange={e => setTableForm(f => ({ ...f, label: e.target.value }))} />
                          <input style={{ width: 70, padding: "6px 10px", border: "1px solid #e5e7eb", borderRadius: 7, fontSize: 13, fontFamily: "system-ui" }} type="number" value={tableForm.capacity || ""} placeholder="Cap." onChange={e => setTableForm(f => ({ ...f, capacity: e.target.value }))} />
                        </div>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button className="btn btn-gray" onClick={() => setEditingTable(null)}><X size={12} /></button>
                          <button className="btn btn-dark" onClick={() => saveTable(t.id)} disabled={saving}><Save size={12} style={{ marginRight: 4 }} />{saving ? "..." : "Guardar"}</button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}><Utensils size={14} color="#6b7280" /><span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{t.label}</span><span style={{ fontSize: 12, color: "#9ca3af" }}>{t.capacity} personas</span></div>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button className="btn btn-gray" onClick={() => { setEditingTable(t.id); setTableForm({ label: t.label, capacity: t.capacity }); }}><Edit2 size={12} style={{ marginRight: 4 }} />Editar</button>
                          <button className="btn btn-red" onClick={() => deleteTable(t.id)}><Trash2 size={12} /></button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>

      {showNewRes && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{background:'#fff',borderRadius:16,padding:32,width:440,maxWidth:'95vw',boxShadow:'0 20px 60px #00000030'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
              <h3 style={{fontSize:16,fontWeight:700,color:'#111827'}}>Nueva Reserva Manual</h3>
              <button onClick={()=>setShowNewRes(false)} style={{background:'none',border:'none',cursor:'pointer',fontSize:20,color:'#9ca3af'}}>✕</button>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              <input placeholder="Nombre *" value={newRes.name} onChange={e=>setNewRes({...newRes,name:e.target.value})} style={{width:'100%',padding:'8px 12px',borderRadius:8,border:'1px solid #e5e7eb',fontSize:13,fontFamily:'system-ui'}} />
              <input placeholder="Teléfono *" value={newRes.phone} onChange={e=>setNewRes({...newRes,phone:e.target.value})} style={{width:'100%',padding:'8px 12px',borderRadius:8,border:'1px solid #e5e7eb',fontSize:13,fontFamily:'system-ui'}} />
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                <input type="date" value={newRes.date} onChange={e=>setNewRes({...newRes,date:e.target.value})} style={{width:'100%',padding:'8px 12px',borderRadius:8,border:'1px solid #e5e7eb',fontSize:13,fontFamily:'system-ui'}} />
                <input type="time" value={newRes.time} onChange={e=>setNewRes({...newRes,time:e.target.value})} style={{width:'100%',padding:'8px 12px',borderRadius:8,border:'1px solid #e5e7eb',fontSize:13,fontFamily:'system-ui'}} />
              </div>
              <input type="number" placeholder="Personas *" min={1} max={30} value={newRes.guests} onChange={e=>setNewRes({...newRes,guests:e.target.value})} style={{width:'100%',padding:'8px 12px',borderRadius:8,border:'1px solid #e5e7eb',fontSize:13,fontFamily:'system-ui'}} />
              <textarea placeholder="Notas (alergia, cumpleaños, VIP...)" value={newRes.notes} onChange={e=>setNewRes({...newRes,notes:e.target.value})} rows={3} style={{width:'100%',padding:'8px 12px',borderRadius:8,border:'1px solid #e5e7eb',fontSize:13,fontFamily:'system-ui',resize:'none'}} />
            </div>
            <div style={{display:'flex',gap:10,marginTop:24,justifyContent:'flex-end'}}>
              <button className="btn btn-gray" onClick={()=>setShowNewRes(false)}>Cancelar</button>
              <button style={{border:'none',cursor:'pointer',padding:'7px 16px',borderRadius:7,fontSize:13,fontWeight:600,background:'#3b82f6',color:'#fff'}} onClick={createManualReservation}>Crear Reserva</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}