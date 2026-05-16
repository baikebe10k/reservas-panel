import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import {
  LayoutDashboard, CalendarDays, MessageCircle, Settings,
  TrendingUp, Clock, Users, CheckCircle2, XCircle,
  AlertCircle, ArrowUpRight, Utensils, Phone, Calendar, Timer,
  Save, Edit2, X, Grid, Bell, BarChart2, Search, Plus, Trash2,
  ChevronLeft, ChevronRight, FileText
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
  const [newRes, setNewRes] = useState({ customer_name: "", customer_phone: "", date: "", time: "", guests: 2, notes: "" });
  const [editingNote, setEditingNote] = useState(null);
  const [noteText, setNoteText] = useState("");
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

  async function confirmRes(id) { await supabase.from("reservations").update({ status: "confirmed" }).eq("id", id); loadReservations(); }
  async function cancelRes(id) { await supabase.from("reservations").update({ status: "cancelled" }).eq("id", id); loadReservations(); }

  async function createManualReservation() {
    if (!newRes.customer_name || !newRes.date || !newRes.time || !newRes.guests) return;
    setSaving(true);
    const { data: tablesList } = await supabase.from("tables").select("*").eq("restaurant_id", "00000000-0000-0000-0000-000000000001").eq("active", true).gte("capacity", newRes.guests);
    const { data: existing } = await supabase.from("reservations").select("table_id").eq("restaurant_id", "00000000-0000-0000-0000-000000000001").eq("date", newRes.date).eq("time", newRes.time).eq("status", "confirmed");
    const bookedIds = (existing || []).map(r => r.table_id);
    const freeTable = (tablesList || []).find(t => !bookedIds.includes(t.id));
    const startDT = new Date(newRes.date + "T" + newRes.time + ":00");
    const endDT = new Date(startDT.getTime() + 90 * 60 * 1000);
    await supabase.from("reservations").insert([{
      restaurant_id: "00000000-0000-0000-0000-000000000001",
      table_id: freeTable?.id || null,
      customer_name: newRes.customer_name,
      customer_phone: newRes.customer_phone || "manual",
      date: newRes.date,
      time: newRes.time,
      guests: parseInt(newRes.guests),
      end_time: endDT.toISOString(),
      status: "confirmed",
      notes: newRes.notes || null,
      review_sent: false
    }]);
    setNewRes({ customer_name: "", customer_phone: "", date: "", time: "", guests: 2, notes: "" });
    setShowNewRes(false);
    setSaving(false);
    await loadReservations();
    showSaveMsg("✓ Reserva creada");
  }

  async function saveNote(id) {
    await supabase.from("reservations").update({ notes: noteText }).eq("id", id);
    setEditingNote(null);
    setNoteText("");
    await loadReservations();
    showSaveMsg("✓ Nota guardada");
  }

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
    const pieData = [{ name: 'Confirmadas', value: confirmed.length, color: '#16a34a' },