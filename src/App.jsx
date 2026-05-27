import { useState, useEffect, useRef, useMemo, useCallback } from "react";
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

const TRANSLATIONS = {
  es: {
    overview: "Resumen", reservations: "Reservas", calendar: "Calendario",
    tables: "Mesas", stats: "Estadísticas", whatsapp: "WhatsApp",
    conversations: "Conversaciones", settings: "Config",
    todayRes: "Reservas de hoy", noRes: "No hay reservas para hoy",
    confirmed: "Confirmada", pending: "Pendiente", cancelled: "Cancelada",
    confirm: "Confirmar", cancel: "Cancelar", update: "↻ Actualizar",
    newRes: "+ Nueva Reserva", logout: "Cerrar sesión",
    searchPlaceholder: "Buscar...", allStatus: "Todos los estados",
    activeRes: "reservas activas", archivedRes: "reservas archivadas",
    exportCsv: "⬇ Exportar CSV", addNote: "Añadir nota",
    newManualRes: "Nueva Reserva Manual", name: "Nombre", phone: "Teléfono",
    guests: "Personas", notes: "Notas (alergia, cumpleaños, VIP...)",
    create: "Crear Reserva", creating: "Creando...", fillAll: "Rellena todos los campos",
    today: "Hoy", week: "Semana", month: "Mes",
    noResDay: "No hay reservas este día", free: "Libre",
    occupied: "Ocupada", reserved: "Reservada", blocked: "Bloqueada",
    occupy: "Ocupar", release: "Liberar", block: "Bloquear",
    totalConfirmed: "Total confirmadas", totalGuests: "Total comensales",
    cancellationRate: "Tasa cancelación", last7: "Reservas últimos 7 días",
    peakHours: "Horas pico", resStatus: "Estado reservas", topTables: "Mesas más reservadas",
    botStatus: "Estado del chatbot", active: "● Activo", operative: "Operativo",
    whatsappNum: "Número WhatsApp", webhookUrl: "Webhook URL", status: "Estado",
    conversations2: "Conversaciones", noConversations: "Sin conversaciones aún",
    noConvMsg: "Aparecerán cuando el bot reciba mensajes", selectConv: "Selecciona una conversación",
    restData: "Datos del restaurante", edit: "Editar", save: "Guardar",
    savedOk: "✓ Guardado correctamente", opening: "Hora apertura", closing: "Hora cierre",
    slotDuration: "Duración slot (min)", tablesTitle: "Mesas", addTable: "Añadir mesa",
    tableUpdated: "✓ Mesa actualizada", tableAdded: "✓ Mesa añadida", tableDeleted: "✓ Mesa eliminada",
    deleteTable: "¿Eliminar esta mesa?", capacity: "Capacidad", tableName: "Nombre (ej: Mesa 30)",
    reservasHoy: "Reservas hoy", mesasLibres: "Mesas libres", totalReservas: "Total reservas",
    panelControl: "Panel de control", searchName: "Buscar nombre o teléfono...",
    allHours: "Todas las horas", clear: "✕ Limpiar", newReservation: "Nueva reserva!",
    openDays: "Días de apertura", shifts: "Turnos", addShift: "Añadir turno",
    shiftName: "Nombre turno (ej: Comida)", shiftStart: "Inicio", shiftEnd: "Fin",
    deleteShift: "¿Eliminar este turno?", noShifts: "Sin turnos — se usa horario general",
    cancelledTab: "Canceladas",
  },
  ca: {
    overview: "Resum", reservations: "Reserves", calendar: "Calendari",
    tables: "Taules", stats: "Estadístiques", whatsapp: "WhatsApp",
    conversations: "Converses", settings: "Config",
    todayRes: "Reserves d'avui", noRes: "No hi ha reserves per avui",
    confirmed: "Confirmada", pending: "Pendent", cancelled: "Cancel·lada",
    confirm: "Confirmar", cancel: "Cancel·lar", update: "↻ Actualitzar",
    newRes: "+ Nova Reserva", logout: "Tancar sessió",
    searchPlaceholder: "Cercar...", allStatus: "Tots els estats",
    activeRes: "reserves actives", archivedRes: "reserves arxivades",
    exportCsv: "⬇ Exportar CSV", addNote: "Afegir nota",
    newManualRes: "Nova Reserva Manual", name: "Nom", phone: "Telèfon",
    guests: "Persones", notes: "Notes (al·lèrgia, aniversari, VIP...)",
    create: "Crear Reserva", creating: "Creant...", fillAll: "Omple tots els camps",
    today: "Avui", week: "Setmana", month: "Mes",
    noResDay: "No hi ha reserves aquest dia", free: "Lliure",
    occupied: "Ocupada", reserved: "Reservada", blocked: "Bloquejada",
    occupy: "Ocupar", release: "Alliberar", block: "Bloquejar",
    totalConfirmed: "Total confirmades", totalGuests: "Total comensals",
    cancellationRate: "Taxa cancel·lació", last7: "Reserves últims 7 dies",
    peakHours: "Hores punta", resStatus: "Estat reserves", topTables: "Taules més reservades",
    botStatus: "Estat del chatbot", active: "● Actiu", operative: "Operatiu",
    whatsappNum: "Número WhatsApp", webhookUrl: "Webhook URL", status: "Estat",
    conversations2: "Converses", noConversations: "Sense converses encara",
    noConvMsg: "Apareixeran quan el bot rebi missatges", selectConv: "Selecciona una conversa",
    restData: "Dades del restaurant", edit: "Editar", save: "Desar",
    savedOk: "✓ Desat correctament", opening: "Hora obertura", closing: "Hora tancament",
    slotDuration: "Durada slot (min)", tablesTitle: "Taules", addTable: "Afegir taula",
    tableUpdated: "✓ Taula actualitzada", tableAdded: "✓ Taula afegida", tableDeleted: "✓ Taula eliminada",
    deleteTable: "Eliminar aquesta taula?", capacity: "Capacitat", tableName: "Nom (ex: Taula 30)",
    reservasHoy: "Reserves avui", mesasLibres: "Taules lliures", totalReservas: "Total reserves",
    panelControl: "Tauler de control", searchName: "Cercar nom o telèfon...",
    allHours: "Totes les hores", clear: "✕ Netejar", newReservation: "Nova reserva!",
    openDays: "Dies d'apertura", shifts: "Torns", addShift: "Afegir torn",
    shiftName: "Nom torn (ex: Dinar)", shiftStart: "Inici", shiftEnd: "Fi",
    deleteShift: "Eliminar aquest torn?", noShifts: "Sense torns — s'usa horari general",
    cancelledTab: "Cancel·lades",
  }
};

const STATUS_LABELS = (t) => ({
  confirmed: { label: t.confirmed, color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" },
  pending:   { label: t.pending,   color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
  cancelled: { label: t.cancelled, color: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
});

const RESTAURANT_ID = '00000000-0000-0000-0000-000000000001';
const DAYS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const DAYS_CA = ['Dg', 'Dl', 'Dt', 'Dc', 'Dj', 'Dv', 'Ds'];
const MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const MONTHS_CA = ['Gener','Febrer','Març','Abril','Maig','Juny','Juliol','Agost','Setembre','Octubre','Novembre','Desembre'];

const WEEKDAYS_CONFIG = [
  { key: 'monday',    es: 'Lun', ca: 'Dl' },
  { key: 'tuesday',   es: 'Mar', ca: 'Dt' },
  { key: 'wednesday', es: 'Mié', ca: 'Dc' },
  { key: 'thursday',  es: 'Jue', ca: 'Dj' },
  { key: 'friday',    es: 'Vie', ca: 'Dv' },
  { key: 'saturday',  es: 'Sáb', ca: 'Ds' },
  { key: 'sunday',    es: 'Dom', ca: 'Dg' },
];

export default function App() {
  const [lang, setLang] = useState(() => localStorage.getItem('reservia_lang') || 'es');
  const t = TRANSLATIONS[lang];
  const STATUS = STATUS_LABELS(t);
  const DAYS = lang === 'ca' ? DAYS_CA : DAYS_ES;
  const MONTHS = lang === 'ca' ? MONTHS_CA : MONTHS_ES;

  function toggleLang(l) { setLang(l); localStorage.setItem('reservia_lang', l); }

  const [loggedIn, setLoggedIn] = useState(false);
  const [email, setEmail] = useState("baikebe10k@gmail.com");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [tab, setTab] = useState("overview");
  const [reservations, setReservations] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);
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
  const [subTab, setSubTab] = useState('active');
  const [newTable, setNewTable] = useState({ label: "", capacity: "" });
  const [addingTable, setAddingTable] = useState(false);
  const [calView, setCalView] = useState("week");
  const [calDate, setCalDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showNewRes, setShowNewRes] = useState(false);
  const [newRes, setNewRes] = useState({ date: '', time: '', guests: 2, name: '', phone: '', notes: '' });
  const [editingNote, setEditingNote] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [openDays, setOpenDays] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [addingShift, setAddingShift] = useState(false);
  const [newShift, setNewShift] = useState({ name: '', start: '', end: '' });
  const [seenIds, setSeenIds] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('seenResIds') || '[]')); } catch { return new Set(); }
  });
  const audioCtx = useRef(null);
  const messagesEndRef = useRef(null);

  const today = new Date().toLocaleDateString('sv-SE');

  const pendingCount = useMemo(() => reservations.filter(r => r.status === 'pending').length, [reservations]);

  // FIX BADGE: solo reservas futuras no vistas y no canceladas
  const unseenCount = useMemo(() =>
    reservations.filter(r => !seenIds.has(r.id) && r.date >= today && r.status !== 'cancelled').length,
    [reservations, seenIds, today]
  );

  const convsByPhone = useMemo(() => {
    const map = {};
    conversations.forEach(msg => {
      if (!map[msg.customer_phone]) {
        map[msg.customer_phone] = { phone: msg.customer_phone, name: msg.customer_name, messages: [], last_at: msg.created_at };
      }
      map[msg.customer_phone].messages.push(msg);
      if (msg.created_at > map[msg.customer_phone].last_at) {
        map[msg.customer_phone].last_at = msg.created_at;
        if (msg.customer_name) map[msg.customer_phone].name = msg.customer_name;
      }
    });
    return Object.values(map).sort((a, b) => new Date(b.last_at) - new Date(a.last_at));
  }, [conversations]);

  const nav = useMemo(() => [
    { id: "overview",      Icon: LayoutDashboard, label: t.overview,       badge: pendingCount },
    { id: "reservations",  Icon: CalendarDays,    label: t.reservations,   badge: unseenCount },
    { id: "calendar",      Icon: Calendar,        label: t.calendar,       badge: 0 },
    { id: "tables",        Icon: Grid,            label: t.tables,         badge: 0 },
    { id: "stats",         Icon: BarChart2,       label: t.stats,          badge: 0 },
    { id: "whatsapp",      Icon: MessageCircle,   label: t.whatsapp,       badge: 0 },
    { id: "conversations", Icon: MessageCircle,   label: t.conversations,  badge: 0 },
    { id: "settings",      Icon: Settings,        label: t.settings,       badge: 0 },
  ], [pendingCount, unseenCount, t]);

  function markAllSeen() {
    const allIds = reservations.filter(r => r.date >= today && r.status !== 'cancelled').map(r => r.id);
    const newSeen = new Set([...seenIds, ...allIds]);
    setSeenIds(newSeen);
    try { localStorage.setItem('seenResIds', JSON.stringify([...newSeen])); } catch {}
  }

  useEffect(() => { if (tab === 'reservations') markAllSeen(); }, [tab, reservations]);

  useEffect(() => {
    if (tab === 'conversations') messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConv, tab]);

  function showToast(msg, type = 'success') { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); }

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
    if (!reservation) return;
    const id = Date.now();
    setNotifications(prev => [...prev, { id, reservation, type: 'new' }]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 10000);
    playSound();
  }

  // FIX NOTIFICACIONES: función separada para cancelaciones
  function addCancelNotification(reservation) {
    if (!reservation) return;
    const id = Date.now();
    setNotifications(prev => [...prev, { id, reservation, type: 'cancel' }]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 10000);
    playSound();
  }

  async function loadReservations() {
    setLoading(true);
    const { data } = await supabase.from("reservations").select("*").order("date", { ascending: false });
    setReservations(data || []);
    setLoading(false);
  }

  async function loadConversations() {
    const { data } = await supabase.from("conversations").select("*").eq("restaurant_id", RESTAURANT_ID).order("created_at", { ascending: true });
    setConversations(data || []);
  }

  async function loadSettings() {
    const { data: rest } = await supabase.from("restaurants").select("*").eq("id", RESTAURANT_ID).maybeSingle();
    setRestaurant(rest);
    setRestForm({
      name: rest?.name || "",
      phone: rest?.phone || "",
      opening_time: rest?.opening_time || "13:00",
      closing_time: rest?.closing_time || "23:00",
      slot_duration: rest?.slot_duration || 30
    });
    setOpenDays(rest?.open_days || ["monday","tuesday","wednesday","thursday","friday","saturday"]);
    setShifts(rest?.shifts || []);
    const { data: tbls } = await supabase.from("tables").select("*").eq("restaurant_id", RESTAURANT_ID).order("label");
    setTables(tbls || []);
  }

  useEffect(() => {
    if (!loggedIn) return;
    loadReservations(); loadSettings(); loadConversations();

    const resChannel = supabase.channel('reservations-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reservations' }, payload => {
        loadReservations();
        // FIX: INSERT nuevo → notificación verde; UPDATE a cancelled → notificación roja
        if (payload.eventType === 'INSERT') {
          if (payload.new?.status === 'cancelled') {
            addCancelNotification(payload.new);
          } else {
            addNotification(payload.new);
          }
        } else if (payload.eventType === 'UPDATE' && payload.new?.status === 'cancelled' && payload.old?.status !== 'cancelled') {
          addCancelNotification(payload.new);
        }
      }).subscribe();

    const convChannel = supabase.channel('conversations-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'conversations' }, () => {
        loadConversations();
      }).subscribe();

    return () => { supabase.removeChannel(resChannel); supabase.removeChannel(convChannel); };
  }, [loggedIn]);

  async function createManualReservation() {
    const { date, time, guests, name, phone, notes } = newRes;
    if (!date || !time || !guests || !name || !phone) { alert(t.fillAll); return; }
    const { error } = await supabase.from('reservations').insert([{
      restaurant_id: RESTAURANT_ID, customer_name: name, customer_phone: phone,
      date, time, guests: parseInt(guests), status: 'confirmed', notes: notes || null, source: 'manual'
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
    await supabase.from("restaurants").update({
      name: restForm.name,
      phone: restForm.phone,
      opening_time: restForm.opening_time,
      closing_time: restForm.closing_time,
      slot_duration: parseInt(restForm.slot_duration),
      open_days: openDays,
      shifts: shifts
    }).eq("id", RESTAURANT_ID);
    await loadSettings(); setEditingRestaurant(false); setSaving(false); showSaveMsg(t.savedOk);
  }

  async function saveTable(id) {
    setSaving(true);
    await supabase.from("tables").update({ label: tableForm.label, capacity: parseInt(tableForm.capacity) }).eq("id", id);
    await loadSettings(); setEditingTable(null); setSaving(false); showSaveMsg(t.tableUpdated);
  }

  async function addTable() {
    if (!newTable.label || !newTable.capacity) return;
    setSaving(true);
    await supabase.from("tables").insert([{ restaurant_id: RESTAURANT_ID, label: newTable.label, capacity: parseInt(newTable.capacity), active: true, manual_status: "available" }]);
    setNewTable({ label: "", capacity: "" }); setAddingTable(false);
    await loadSettings(); setSaving(false); showSaveMsg(t.tableAdded);
  }

  async function deleteTable(id) {
    if (!confirm(t.deleteTable)) return;
    await supabase.from("tables").delete().eq("id", id);
    await loadSettings(); showSaveMsg(t.tableDeleted);
  }

  async function setTableManualStatus(id, status) {
    await supabase.from("tables").update({ manual_status: status }).eq("id", id);
    await loadSettings();
  }

  function toggleOpenDay(day) {
    setOpenDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  }

  function addShift() {
    if (!newShift.name || !newShift.start || !newShift.end) return;
    setShifts(prev => [...prev, { ...newShift, id: Date.now().toString() }]);
    setNewShift({ name: '', start: '', end: '' });
    setAddingShift(false);
  }

  function deleteShift(id) {
    if (!confirm(t.deleteShift)) return;
    setShifts(prev => prev.filter(s => s.id !== id));
  }

  // FIX MESAS: solo "Reservada" si la reserva es HOY
  const getTableStatus = useCallback((table) => {
    if (table.manual_status === 'occupied') return { label: t.occupied, color: "#dc2626", bg: "#fef2f2", border: "#fecaca", dot: "#dc2626" };
    if (table.manual_status === 'blocked') return { label: t.blocked, color: "#6b7280", bg: "#f3f4f6", border: "#e5e7eb", dot: "#9ca3af" };
    const now = new Date();
    const todayStr = now.toLocaleDateString('sv-SE');
    const activeRes = reservations.find(r => {
      if (r.table_id !== table.id || r.status !== "confirmed") return false;
      const start = new Date(r.date + "T" + r.time);
      if (isNaN(start.getTime()) || !r.end_time) return false;
      const end = new Date(r.end_time);
      if (isNaN(end.getTime())) return false;
      return start <= now && end > now;
    });
    if (activeRes) return { label: t.occupied, color: "#dc2626", bg: "#fef2f2", border: "#fecaca", dot: "#dc2626", reservation: activeRes };
    // FIX: solo "Reservada" si es HOY
    const upcomingRes = reservations.find(r => {
      if (r.table_id !== table.id || r.status !== "confirmed") return false;
      if (r.date !== todayStr) return false;
      const start = new Date(r.date + "T" + r.time);
      if (isNaN(start.getTime())) return false;
      return start > now;
    });
    if (upcomingRes) return { label: t.reserved, color: "#d97706", bg: "#fffbeb", border: "#fde68a", dot: "#d97706", reservation: upcomingRes };
    return { label: t.free, color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0", dot: "#16a34a" };
  }, [reservations, t]);

  function showSaveMsg(msg) { setSaveMsg(msg); setTimeout(() => setSaveMsg(""), 3000); }

  async function handleLogin() {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setLoginError("Contraseña incorrecta");
    else { setLoggedIn(true); setLoginError(""); }
  }

  const getStats = useMemo(() => {
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
    confirmed.forEach(r => { const mesa = tables.find(tb => tb.id === r.table_id); const label = mesa?.label || 'Desconocida'; mesaCount[label] = (mesaCount[label] || 0) + 1; });
    const ocupacionMesas = Object.entries(mesaCount).map(([mesa, reservas]) => ({ mesa, reservas })).sort((a, b) => b.reservas - a.reservas).slice(0, 8);
    const pieData = [{ name: t.confirmed, value: confirmed.length, color: '#16a34a' }, { name: t.cancelled, value: cancelled.length, color: '#dc2626' }];
    return { last7, horasPico, ocupacionMesas, pieData, totalGuests, cancellationRate, totalConfirmed: confirmed.length };
  }, [reservations, tables, t]);

  function getWeekDays(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    return Array.from({ length: 7 }, (_, i) => { const dd = new Date(monday); dd.setDate(monday.getDate() + i); return dd; });
  }

  function getMonthDays(date) {
    const year = date.getFullYear(), month = date.getMonth();
    const firstDay = new Date(year, month, 1), lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    const days = [];
    for (let i = 0; i < startDay; i++) { const d = new Date(firstDay); d.setDate(d.getDate() - (startDay - i)); days.push({ date: d, currentMonth: false }); }
    for (let i = 1; i <= lastDay.getDate(); i++) days.push({ date: new Date(year, month, i), currentMonth: true });
    while (days.length % 7 !== 0) { const last = days[days.length - 1].date; const d = new Date(last); d.setDate(last.getDate() + 1); days.push({ date: d, currentMonth: false }); }
    return days;
  }

  function dateStr(d) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  const filteredReservations = useMemo(() => {
    const todayStr = new Date().toLocaleDateString('sv-SE');
    return reservations.filter(r => {
      const isPast = r.date < todayStr, isCancelled = r.status === 'cancelled';
      if (subTab === 'active') { if (isPast || isCancelled) return false; }
      else if (subTab === 'cancelled') { if (!isCancelled) return false; }
      else if (subTab === 'archived') { if (!isPast || isCancelled) return false; }
      const matchSearch = !search || r.customer_name?.toLowerCase().includes(search.toLowerCase()) || r.customer_phone?.includes(search);
      const matchDate = !filterDate || r.date === filterDate;
      const matchStatus = !filterStatus || r.status === filterStatus;
      const matchHour = !filterHour || r.time?.startsWith(filterHour);
      return matchSearch && matchDate && matchStatus && matchHour;
    });
  }, [reservations, search, filterDate, filterStatus, filterHour, subTab]);

  const todayRes = reservations.filter(r => r.date === today).filter(r => {
    if (!searchOverview) return true;
    return r.customer_name?.toLowerCase().includes(searchOverview.toLowerCase()) || r.customer_phone?.includes(searchOverview);
  });

  function exportToExcel() {
    const headers = ['Nombre','Teléfono','Fecha','Hora','Personas','Estado','Notas'];
    const rows = reservations.map(r => [r.customer_name||'', r.customer_phone||'', r.date||'', r.time||'', r.guests||'', r.status||'', r.notes||'']);
    const csvContent = [headers, ...rows].map(row => row.map(cell => `"${String(cell).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `reservas_${new Date().toLocaleDateString('sv-SE')}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  if (!loggedIn) {
    return (
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh", background:"#f9fafb", fontFamily:"system-ui" }}>
        <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:16, padding:40, width:360, boxShadow:"0 4px 24px #0000000a" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:28 }}>
            <div style={{ width:40, height:40, background:"#111827", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center" }}><Utensils size={20} color="#fff" /></div>
            <div><div style={{ fontSize:16, fontWeight:700, color:"#111827" }}>ReservIA</div><div style={{ fontSize:12, color:"#9ca3af" }}>{t.panelControl}</div></div>
          </div>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email"
            style={{ width:"100%", padding:"10px 14px", border:"1px solid #e5e7eb", borderRadius:8, fontSize:14, marginBottom:12, fontFamily:"system-ui", boxSizing:"border-box" }} />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key==="Enter" && handleLogin()} placeholder="Contraseña"
            style={{ width:"100%", padding:"10px 14px", border:"1px solid #e5e7eb", borderRadius:8, fontSize:14, marginBottom:12, fontFamily:"system-ui", boxSizing:"border-box" }} />
          {loginError && <div style={{ color:"#dc2626", fontSize:12, marginBottom:12 }}>{loginError}</div>}
          <button onClick={handleLogin} style={{ width:"100%", padding:11, background:"#111827", color:"#fff", border:"none", borderRadius:8, fontSize:14, fontWeight:600, cursor:"pointer" }}>Entrar</button>
        </div>
      </div>
    );
  }

  const confirmedCount = reservations.filter(r => r.status === "confirmed").length;
  const freeTables = tables.filter(t2 => getTableStatus(t2).label === t.free).length;
  const stats = getStats;
  const weekDays = getWeekDays(calDate);
  const monthDays = getMonthDays(calDate);

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"#f9fafb", fontFamily:"system-ui" }}>
      <style>{`
        * { box-sizing:border-box; margin:0; padding:0; }
        .nav-link { display:flex; align-items:center; gap:10px; padding:8px 12px; border-radius:8px; cursor:pointer; font-size:13.5px; font-weight:500; color:#6b7280; border:none; background:none; width:100%; text-align:left; transition:all 0.15s; }
        .nav-link:hover { color:#111827; background:#f3f4f6; }
        .nav-link.active { color:#111827; background:#fff; box-shadow:0 1px 3px #0000000d; font-weight:600; }
        .card { background:#fff; border:1px solid #e5e7eb; border-radius:12px; overflow:hidden; }
        .card-header { padding:16px 20px; border-bottom:1px solid #f3f4f6; display:flex; justify-content:space-between; align-items:center; }
        .table-row { display:flex; align-items:center; gap:14px; padding:12px 20px; border-bottom:1px solid #f9fafb; }
        .table-row:last-child { border-bottom:none; }
        .badge { display:inline-flex; align-items:center; gap:4px; padding:3px 9px; border-radius:6px; font-size:11px; font-weight:600; border:1px solid; }
        .btn { border:1px solid; cursor:pointer; padding:5px 12px; border-radius:7px; font-size:12px; font-weight:600; font-family:inherit; transition:all 0.15s; }
        .btn-green { background:#f0fdf4; color:#15803d; border-color:#bbf7d0; }
        .btn-red { background:#fef2f2; color:#b91c1c; border-color:#fecaca; }
        .btn-dark { background:#111827; color:#fff; border-color:#111827; }
        .btn-gray { background:#f3f4f6; color:#374151; border-color:#e5e7eb; }
        .stat-card { background:#fff; border:1px solid #e5e7eb; border-radius:12px; padding:20px; }
        .mesa-card { border-radius:10px; padding:14px 16px; border:1.5px solid; transition:box-shadow 0.15s; display:flex; flex-direction:column; gap:8px; }
        .mesa-card:hover { box-shadow:0 4px 12px #00000010; }
        .cal-day { border:1px solid #f3f4f6; border-radius:8px; padding:8px; min-height:80px; cursor:pointer; transition:background 0.1s; }
        .cal-day:hover { background:#f9fafb; }
        .cal-day.today { border-color:#111827; }
        .cal-day.other-month { opacity:0.4; }
        @keyframes slideIn { from { transform:translateX(120%); opacity:0; } to { transform:translateX(0); opacity:1; } }
        .notif { animation:slideIn 0.3s ease; }
        .nav-badge { background:#ef4444; color:#fff; border-radius:10px; font-size:10px; font-weight:700; padding:1px 6px; min-width:18px; text-align:center; margin-left:auto; }
        .conv-item { padding:12px 16px; cursor:pointer; border-bottom:1px solid #f3f4f6; transition:background 0.1s; }
        .conv-item:hover { background:#f9fafb; }
        .conv-item.active { background:#f0fdf4; border-left:3px solid #16a34a; }
        .msg-bubble { max-width:75%; padding:9px 14px; border-radius:12px; font-size:13px; line-height:1.5; word-break:break-word; }
        .msg-in { background:#f3f4f6; color:#111827; border-bottom-left-radius:4px; align-self:flex-start; }
        .msg-out { background:#111827; color:#fff; border-bottom-right-radius:4px; align-self:flex-end; }
        .lang-btn { padding:4px 10px; border-radius:6px; border:1px solid #e5e7eb; font-size:12px; font-weight:600; cursor:pointer; font-family:inherit; transition:all 0.15s; }
        .lang-btn.active { background:#111827; color:#fff; border-color:#111827; }
        .lang-btn:not(.active) { background:#fff; color:#6b7280; }
        .day-chip { display:inline-flex; align-items:center; justify-content:center; width:40px; height:40px; border-radius:50%; border:1.5px solid #e5e7eb; cursor:pointer; font-size:12px; font-weight:700; transition:all 0.15s; user-select:none; }
        .day-chip.on { background:#111827; color:#fff; border-color:#111827; }
        .day-chip.off { background:#fff; color:#9ca3af; }
        .archived-table { width:100%; border-collapse:collapse; font-size:12px; }
        .archived-table th { background:#f3f4f6; padding:9px 14px; text-align:left; font-weight:600; color:#6b7280; border-bottom:2px solid #e5e7eb; white-space:nowrap; }
        .archived-table td { padding:9px 14px; border-bottom:1px solid #f3f4f6; color:#374151; white-space:nowrap; }
        .archived-table tr:last-child td { border-bottom:none; }
        .archived-table tbody tr:hover td { background:#f9fafb; }
      `}</style>

      {/* Notificaciones */}
      <div style={{ position:"fixed", top:20, right:20, zIndex:999, display:"flex", flexDirection:"column", gap:10 }}>
        {notifications.map(n => (
          <div key={n.id} className="notif" style={{ background:"#fff", color:"#111827", borderRadius:12, padding:"14px 18px", minWidth:300, boxShadow:"0 8px 24px #00000015", border:`1px solid ${n.type==='cancel'?'#fecaca':'#e5e7eb'}`, display:"flex", alignItems:"flex-start", gap:12 }}>
            <div style={{ width:36, height:36, background:n.type==='cancel'?"#fef2f2":"#f0fdf4", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, border:`1px solid ${n.type==='cancel'?'#fecaca':'#bbf7d0'}` }}>
              <Bell size={16} color={n.type==='cancel'?"#dc2626":"#16a34a"} />
            </div>
            <div>
              <div style={{ fontSize:13, fontWeight:700, color:"#111827", marginBottom:2 }}>{n.type==='cancel' ? '❌ Reserva cancelada' : '🟢 ' + t.newReservation}</div>
              <div style={{ fontSize:12, color:"#374151" }}>{n.reservation.customer_name} · {n.reservation.time} · {n.reservation.guests}p</div>
              <div style={{ fontSize:11, color:"#9ca3af", marginTop:2 }}>{n.reservation.date}</div>
            </div>
            <button onClick={() => setNotifications(prev => prev.filter(x => x.id !== n.id))} style={{ background:"none", border:"none", color:"#9ca3af", cursor:"pointer", marginLeft:"auto" }}><X size={14} /></button>
          </div>
        ))}
      </div>

      {toast && (
        <div style={{ position:'fixed', top:20, left:'50%', transform:'translateX(-50%)', zIndex:9999, padding:'10px 20px', borderRadius:8, fontSize:13, fontWeight:600,
          background: toast.type==='error' ? '#fef2f2' : '#f0fdf4', color: toast.type==='error' ? '#b91c1c' : '#15803d',
          border: `1px solid ${toast.type==='error' ? '#fecaca' : '#bbf7d0'}`, boxShadow:'0 4px 12px #00000015' }}>{toast.msg}</div>
      )}

      {/* Sidebar */}
      <aside style={{ width:216, background:"#fff", borderRight:"1px solid #e5e7eb", display:"flex", flexDirection:"column", padding:"20px 12px", position:"sticky", top:0, height:"100vh" }}>
        <div style={{ display:"flex", alignItems:"center", gap:9, padding:"4px 6px", marginBottom:28 }}>
          <div style={{ width:32, height:32, background:"#111827", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center" }}><Utensils size={16} color="#fff" /></div>
          <div><div style={{ fontSize:14, fontWeight:700, color:"#111827" }}>ReservIA</div><div style={{ fontSize:10, color:"#9ca3af" }}>Panel Pro</div></div>
        </div>
        <nav style={{ display:"flex", flexDirection:"column", gap:2, flex:1 }}>
          {nav.map(({ id, Icon, label, badge }) => (
            <button key={id} className={"nav-link" + (tab===id ? " active" : "")} onClick={() => setTab(id)}>
              <Icon size={16} />{label}
              {badge > 0 && <span className="nav-badge">{badge}</span>}
            </button>
          ))}
        </nav>
        <div style={{ display:"flex", gap:4, marginBottom:10, padding:"0 2px" }}>
          <span style={{ fontSize:12, color:"#9ca3af", alignSelf:"center", marginRight:4 }}>🌐</span>
          <button className={"lang-btn" + (lang==='es' ? " active" : "")} onClick={() => toggleLang('es')}>ES</button>
          <button className={"lang-btn" + (lang==='ca' ? " active" : "")} onClick={() => toggleLang('ca')}>CA</button>
        </div>
        <button onClick={async () => { await supabase.auth.signOut(); setLoggedIn(false); }} style={{ padding:"8px 12px", borderRadius:8, border:"1px solid #e5e7eb", background:"#fff", color:"#6b7280", fontSize:13, cursor:"pointer" }}>{t.logout}</button>
      </aside>

      <main style={{ flex:1, overflowY:"auto" }}>
        <header style={{ position:"sticky", top:0, zIndex:20, background:"rgba(249,250,251,0.95)", borderBottom:"1px solid #e5e7eb", padding:"13px 28px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <h1 style={{ fontSize:16, fontWeight:700, color:"#111827" }}>{restaurant?.name || "Restaurante"}</h1>
            <p style={{ fontSize:12, color:"#9ca3af" }}>{t.panelControl}</p>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button className="btn btn-gray" onClick={() => { loadReservations(); loadSettings(); loadConversations(); }}>{t.update}</button>
            <button style={{ border:'none', cursor:'pointer', padding:'7px 14px', borderRadius:7, fontSize:12, fontWeight:600, background:'#3b82f6', color:'#fff' }} onClick={() => setShowNewRes(true)}>{t.newRes}</button>
          </div>
        </header>

        <div style={{ padding:"24px 28px" }}>

          {/* OVERVIEW */}
          {tab === "overview" && (
            <div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:16 }}>
                {[
                  { label: t.reservasHoy,   value: reservations.filter(r => r.date===today).length, Icon: CalendarDays, color:"#3b82f6", bg:"#eff6ff" },
                  { label: t.confirmed,     value: confirmedCount,      Icon: CheckCircle2, color:"#10b981", bg:"#ecfdf5" },
                  { label: t.mesasLibres,   value: freeTables,          Icon: Grid,         color:"#16a34a", bg:"#f0fdf4" },
                  { label: t.totalReservas, value: reservations.length, Icon: TrendingUp,   color:"#8b5cf6", bg:"#f5f3ff" },
                ].map((s, i) => (
                  <div key={i} className="stat-card">
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
                      <div style={{ width:36, height:36, background:s.bg, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center" }}><s.Icon size={17} color={s.color} /></div>
                      <ArrowUpRight size={14} color="#d1d5db" />
                    </div>
                    <div style={{ fontSize:28, fontWeight:700, color:"#111827" }}>{s.value}</div>
                    <div style={{ fontSize:12, color:"#6b7280", marginTop:4 }}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="card">
                <div className="card-header">
                  <span style={{ fontSize:13, fontWeight:600, color:"#374151" }}>{t.todayRes}</span>
                  <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                    <div style={{ position:"relative" }}>
                      <Search size={12} color="#9ca3af" style={{ position:"absolute", left:8, top:"50%", transform:"translateY(-50%)" }} />
                      <input placeholder={t.searchPlaceholder} value={searchOverview} onChange={e => setSearchOverview(e.target.value)}
                        style={{ padding:"5px 10px 5px 26px", border:"1px solid #e5e7eb", borderRadius:7, fontSize:12, fontFamily:"system-ui", width:150, outline:"none" }} />
                    </div>
                    <button className="btn btn-dark" style={{ fontSize:11 }} onClick={() => setTab("reservations")}>→</button>
                  </div>
                </div>
                {loading && <div style={{ padding:20, color:"#9ca3af", fontSize:13 }}>...</div>}
                {!loading && todayRes.length===0 && <div style={{ padding:20, color:"#9ca3af", fontSize:13 }}>{t.noRes}</div>}
                {todayRes.map(r => {
                  const S = STATUS[r.status] || STATUS.confirmed;
                  return (
                    <div key={r.id} className="table-row">
                      <div style={{ flex:1 }}><div style={{ fontSize:13, fontWeight:600, color:"#111827" }}>{r.customer_name}</div><div style={{ fontSize:11, color:"#9ca3af" }}>{r.customer_phone}</div></div>
                      <div style={{ display:"flex", alignItems:"center", gap:5 }}><Clock size={12} color="#9ca3af" /><span style={{ fontSize:13, fontWeight:600 }}>{r.time}</span></div>
                      <div style={{ display:"flex", alignItems:"center", gap:5 }}><Users size={12} color="#9ca3af" /><span style={{ fontSize:12, color:"#6b7280" }}>{r.guests}p</span></div>
                      <span className="badge" style={{ background:S.bg, color:S.color, borderColor:S.border }}>{S.label}</span>
                      <div style={{ display:"flex", gap:6 }}>
                        {r.status==="pending" && <button className="btn btn-green" onClick={() => confirmRes(r.id)}>{t.confirm}</button>}
                        {r.status!=="cancelled" && <button className="btn btn-red" onClick={() => cancelRes(r.id)}>{t.cancel}</button>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* RESERVATIONS */}
          {tab === "reservations" && (
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>
                <div style={{ position:"relative", flex:1, minWidth:200 }}>
                  <Search size={14} color="#9ca3af" style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)" }} />
                  <input placeholder={t.searchName} value={search} onChange={e => setSearch(e.target.value)}
                    style={{ width:"100%", padding:"8px 12px 8px 32px", border:"1px solid #e5e7eb", borderRadius:8, fontSize:13, fontFamily:"system-ui", outline:"none" }} />
                </div>
                <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)}
                  style={{ padding:"8px 12px", border:"1px solid #e5e7eb", borderRadius:8, fontSize:13, fontFamily:"system-ui", outline:"none" }} />
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                  style={{ padding:"8px 12px", border:"1px solid #e5e7eb", borderRadius:8, fontSize:13, fontFamily:"system-ui", outline:"none", background:"#fff" }}>
                  <option value="">{t.allStatus}</option>
                  <option value="confirmed">{t.confirmed}</option>
                  <option value="pending">{t.pending}</option>
                  <option value="cancelled">{t.cancelled}</option>
                </select>
                <select value={filterHour} onChange={e => setFilterHour(e.target.value)}
                  style={{ padding:"8px 12px", border:"1px solid #e5e7eb", borderRadius:8, fontSize:13, fontFamily:"system-ui", outline:"none", background:"#fff" }}>
                  <option value="">{t.allHours}</option>
                  {["13","14","15","16","17","18","19","20","21","22","23"].map(h => <option key={h} value={h}>{h}:00</option>)}
                </select>
                {(search || filterDate || filterStatus || filterHour) && (
                  <button className="btn btn-gray" onClick={() => { setSearch(""); setFilterDate(""); setFilterStatus(""); setFilterHour(""); }}>{t.clear}</button>
                )}
              </div>
              <div className="card">
                <div className="card-header">
                  <span style={{ fontSize:13, fontWeight:600, color:"#374151" }}>{filteredReservations.length} {subTab==='active' ? t.activeRes : subTab==='cancelled' ? t.cancelledTab : t.archivedRes}</span>
                  <div style={{ display:'flex', gap:8 }}>
                    <div style={{ display:'flex', gap:4, background:'#f3f4f6', borderRadius:8, padding:4 }}>
                      {[['active', t.activeRes],['cancelled', t.cancelledTab],['archived', t.archivedRes]].map(([key, label]) => (
                        <button key={key} className="btn" style={{ fontSize:11, background:subTab===key?'#111827':'transparent', color:subTab===key?'#fff':'#374151', borderColor:subTab===key?'#111827':'transparent' }} onClick={() => setSubTab(key)}>{label}</button>
                      ))}
                    </div>
                    <button className="btn btn-gray" style={{ fontSize:11 }} onClick={exportToExcel}>{t.exportCsv}</button>
                  </div>
                </div>
                {loading && <div style={{ padding:20, color:"#9ca3af" }}>...</div>}
                {!loading && filteredReservations.length===0 && <div style={{ padding:20, color:"#9ca3af", fontSize:13 }}>{t.noRes}</div>}

                {/* FORMATO TABLA PARA ARCHIVADAS */}
                {subTab === 'archived' && filteredReservations.length > 0 && (
                  <div style={{ overflowX:'auto', padding:'0 4px' }}>
                    <table className="archived-table">
                      <thead>
                        <tr>
                          <th>{t.name}</th>
                          <th>{t.phone}</th>
                          <th>Fecha</th>
                          <th>Hora</th>
                          <th>{t.guests}</th>
                          <th>Estado</th>
                          <th>{t.notes}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredReservations.map(r => {
                          const S = STATUS[r.status] || STATUS.confirmed;
                          return (
                            <tr key={r.id}>
                              <td style={{ fontWeight:600 }}>{r.customer_name}</td>
                              <td style={{ color:"#9ca3af" }}>{r.customer_phone}</td>
                              <td>{r.date}</td>
                              <td style={{ fontWeight:600 }}>{r.time}</td>
                              <td>{r.guests}p</td>
                              <td><span className="badge" style={{ background:S.bg, color:S.color, borderColor:S.border }}>{S.label}</span></td>
                              <td style={{ color:"#9ca3af", maxWidth:180, overflow:'hidden', textOverflow:'ellipsis' }}>{r.notes || '—'}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* FORMATO NORMAL PARA ACTIVAS Y CANCELADAS */}
                {subTab !== 'archived' && filteredReservations.map(r => {
                  const S = STATUS[r.status] || STATUS.confirmed;
                  return (
                    <div key={r.id} className="table-row" style={{ opacity:r.status==="cancelled"?0.6:1 }}>
                      <div style={{ flex:1 }}><div style={{ fontSize:13, fontWeight:600, color:"#111827" }}>{r.customer_name}</div><div style={{ fontSize:11, color:"#9ca3af" }}>{r.customer_phone}</div></div>
                      <div style={{ display:"flex", alignItems:"center", gap:5 }}><Calendar size={11} color="#9ca3af" /><span style={{ fontSize:12, color:"#6b7280" }}>{r.date}</span></div>
                      <div style={{ display:"flex", alignItems:"center", gap:5 }}><Clock size={11} color="#9ca3af" /><span style={{ fontSize:13, fontWeight:600 }}>{r.time}</span></div>
                      <div style={{ display:"flex", alignItems:"center", gap:5 }}><Users size={11} color="#9ca3af" /><span style={{ fontSize:12, color:"#6b7280" }}>{r.guests}p</span></div>
                      <span className="badge" style={{ background:S.bg, color:S.color, borderColor:S.border }}>{S.label}</span>
                      <div style={{ display:"flex", gap:5 }}>
                        {r.status==="pending" && <button className="btn btn-green" onClick={() => confirmRes(r.id)}>✓</button>}
                        {r.status!=="cancelled" && <button className="btn btn-red" onClick={() => cancelRes(r.id)}>✕</button>}
                        {editingNote===r.id ? (
                          <span style={{ display:'inline-flex', gap:4, alignItems:'center' }}>
                            <input value={noteText} onChange={e=>setNoteText(e.target.value)} placeholder={t.addNote} autoFocus style={{ padding:'3px 7px', borderRadius:5, border:'1px solid #e5e7eb', fontSize:12, fontFamily:'system-ui', width:130 }} />
                            <button className="btn btn-green" style={{ padding:'3px 8px' }} onClick={()=>saveNote(r.id,noteText)}>✓</button>
                            <button className="btn btn-gray" style={{ padding:'3px 8px' }} onClick={()=>setEditingNote(null)}>✕</button>
                          </span>
                        ) : (
                          <button title={r.notes||t.addNote} className="btn btn-gray" style={{ padding:'3px 8px', fontSize:13 }} onClick={()=>{setEditingNote(r.id);setNoteText(r.notes||'');}}>
                            {r.notes?'📝':'🗒'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* CALENDAR */}
          {tab === "calendar" && (
            <div>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <button className="btn btn-gray" onClick={() => { const d=new Date(calDate); if(calView==="week") d.setDate(d.getDate()-7); else d.setMonth(d.getMonth()-1); setCalDate(d); }}><ChevronLeft size={14} /></button>
                  <span style={{ fontSize:15, fontWeight:700, color:"#111827", minWidth:180, textAlign:"center" }}>
                    {calView==="week"
                      ? weekDays[0].toLocaleDateString('es-ES',{day:'numeric',month:'short'})+' – '+weekDays[6].toLocaleDateString('es-ES',{day:'numeric',month:'short',year:'numeric'})
                      : MONTHS[calDate.getMonth()]+' '+calDate.getFullYear()}
                  </span>
                  <button className="btn btn-gray" onClick={() => { const d=new Date(calDate); if(calView==="week") d.setDate(d.getDate()+7); else d.setMonth(d.getMonth()+1); setCalDate(d); }}><ChevronRight size={14} /></button>
                  <button className="btn btn-gray" onClick={() => setCalDate(new Date())} style={{ fontSize:11 }}>{t.today}</button>
                </div>
                <div style={{ display:"flex", gap:4, background:"#f3f4f6", borderRadius:8, padding:4 }}>
                  {[['week',t.week],['month',t.month]].map(([v,l]) => (
                    <button key={v} onClick={() => setCalView(v)} style={{ padding:"5px 14px", borderRadius:6, border:"none", cursor:"pointer", fontSize:12, fontWeight:600, fontFamily:"system-ui", background:calView===v?"#fff":"transparent", color:calView===v?"#111827":"#6b7280", boxShadow:calView===v?"0 1px 3px #0000000d":"none" }}>{l}</button>
                  ))}
                </div>
              </div>
              {calView==="week" && (
                <div className="card">
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", borderBottom:"1px solid #f3f4f6" }}>
                    {weekDays.map((d,i) => {
                      const isToday=dateStr(d)===today;
                      const dayRes=reservations.filter(r=>r.date===dateStr(d)&&r.status==="confirmed");
                      return (
                        <div key={i} style={{ padding:"12px 8px", borderRight:i<6?"1px solid #f3f4f6":"none", cursor:"pointer" }} onClick={()=>setSelectedDate(selectedDate===dateStr(d)?null:dateStr(d))}>
                          <div style={{ fontSize:11, color:"#9ca3af", marginBottom:4 }}>{DAYS[d.getDay()]}</div>
                          <div style={{ width:28, height:28, borderRadius:"50%", background:isToday?"#111827":"transparent", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:8 }}>
                            <span style={{ fontSize:14, fontWeight:700, color:isToday?"#fff":"#111827" }}>{d.getDate()}</span>
                          </div>
                          {dayRes.length>0 && <div style={{ background:"#eff6ff", borderRadius:6, padding:"3px 6px", fontSize:11, fontWeight:600, color:"#3b82f6", textAlign:"center" }}>{dayRes.length}</div>}
                        </div>
                      );
                    })}
                  </div>
                  {selectedDate && (
                    <div style={{ padding:16 }}>
                      <div style={{ fontSize:13, fontWeight:600, color:"#374151", marginBottom:12 }}>{new Date(selectedDate+'T12:00:00').toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'long'})}</div>
                      {reservations.filter(r=>r.date===selectedDate).length===0 && <div style={{ color:"#9ca3af", fontSize:13 }}>{t.noResDay}</div>}
                      {reservations.filter(r=>r.date===selectedDate).sort((a,b)=>a.time?.localeCompare(b.time)).map(r => {
                        const S=STATUS[r.status]||STATUS.confirmed;
                        return (
                          <div key={r.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 0", borderBottom:"1px solid #f9fafb" }}>
                            <div style={{ fontSize:13, fontWeight:700, color:"#111827", minWidth:45 }}>{r.time}</div>
                            <div style={{ flex:1 }}><div style={{ fontSize:13, fontWeight:600 }}>{r.customer_name}</div><div style={{ fontSize:11, color:"#9ca3af" }}>{r.customer_phone}</div></div>
                            <div style={{ fontSize:12, color:"#6b7280" }}>{r.guests}p</div>
                            <span className="badge" style={{ background:S.bg, color:S.color, borderColor:S.border }}>{S.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
              {calView==="month" && (
                <div className="card">
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", borderBottom:"1px solid #f3f4f6" }}>
                    {(lang==='ca'?['Dl','Dt','Dc','Dj','Dv','Ds','Dg']:['Lun','Mar','Mié','Jue','Vie','Sáb','Dom']).map(d => (
                      <div key={d} style={{ padding:"10px 8px", fontSize:11, fontWeight:600, color:"#9ca3af", textAlign:"center" }}>{d}</div>
                    ))}
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:4, padding:8 }}>
                    {monthDays.map(({date:d,currentMonth},i) => {
                      const ds=dateStr(d), isToday=ds===today;
                      const dayRes=reservations.filter(r=>r.date===ds&&r.status!=="cancelled");
                      const isSelected=selectedDate===ds;
                      return (
                        <div key={i} className={"cal-day"+(isToday?" today":"")+(!currentMonth?" other-month":"")}
                          style={{ background:isSelected?"#f0fdf4":"white", borderColor:isToday?"#111827":isSelected?"#bbf7d0":"#f3f4f6" }}
                          onClick={()=>setSelectedDate(isSelected?null:ds)}>
                          <div style={{ fontSize:12, fontWeight:isToday?700:500, color:isToday?"#111827":"#374151", marginBottom:4 }}>{d.getDate()}</div>
                          {dayRes.length>0 && <div style={{ background:"#111827", borderRadius:4, padding:"2px 5px", fontSize:10, fontWeight:600, color:"#fff" }}>{dayRes.length}</div>}
                        </div>
                      );
                    })}
                  </div>
                  {selectedDate && (
                    <div style={{ padding:16, borderTop:"1px solid #f3f4f6" }}>
                      <div style={{ fontSize:13, fontWeight:600, color:"#374151", marginBottom:12 }}>{new Date(selectedDate+'T12:00:00Z').toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'long', timeZone:'Europe/Madrid'})}</div>
                      {reservations.filter(r=>r.date===selectedDate).length===0 && <div style={{ color:"#9ca3af", fontSize:13 }}>{t.noResDay}</div>}
                      {reservations.filter(r=>r.date===selectedDate).sort((a,b)=>a.time?.localeCompare(b.time)).map(r => {
                        const S=STATUS[r.status]||STATUS.confirmed;
                        return (
                          <div key={r.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 0", borderBottom:"1px solid #f9fafb" }}>
                            <div style={{ fontSize:13, fontWeight:700, color:"#111827", minWidth:45 }}>{r.time}</div>
                            <div style={{ flex:1 }}><div style={{ fontSize:13, fontWeight:600 }}>{r.customer_name}</div><div style={{ fontSize:11, color:"#9ca3af" }}>{r.customer_phone}</div></div>
                            <div style={{ fontSize:12, color:"#6b7280" }}>{r.guests}p</div>
                            <span className="badge" style={{ background:S.bg, color:S.color, borderColor:S.border }}>{S.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TABLES */}
          {tab === "tables" && (
            <div>
              <div style={{ display:"flex", gap:8, marginBottom:20, flexWrap:"wrap" }}>
                {[
                  { color:"#16a34a", bg:"#f0fdf4", border:"#bbf7d0", label:t.free },
                  { color:"#d97706", bg:"#fffbeb", border:"#fde68a", label:t.reserved },
                  { color:"#dc2626", bg:"#fef2f2", border:"#fecaca", label:t.occupied },
                  { color:"#6b7280", bg:"#f3f4f6", border:"#e5e7eb", label:t.blocked },
                ].map((s,i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:6, background:s.bg, padding:"5px 12px", borderRadius:20, border:"1px solid "+s.border }}>
                    <div style={{ width:7, height:7, borderRadius:"50%", background:s.color }} />
                    <span style={{ fontSize:12, color:s.color, fontWeight:600 }}>{s.label}</span>
                  </div>
                ))}
                <div style={{ marginLeft:"auto", fontSize:12, color:"#9ca3af", alignSelf:"center" }}>
                  {freeTables} {t.free.toLowerCase()} · {tables.length} total
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:10 }}>
                {tables.map(table => {
                  const status=getTableStatus(table);
                  const isOccupied=table.manual_status==='occupied', isBlocked=table.manual_status==='blocked';
                  return (
                    <div key={table.id} className="mesa-card" style={{ background:status.bg, borderColor:status.border }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                        <div><div style={{ fontSize:14, fontWeight:700, color:"#111827" }}>{table.label}</div><div style={{ fontSize:11, color:"#6b7280", marginTop:1 }}>{table.capacity} {lang==='ca'?'persones':'personas'}</div></div>
                        <div style={{ width:8, height:8, borderRadius:"50%", background:status.dot, marginTop:4, flexShrink:0 }} />
                      </div>
                      <div style={{ fontSize:11, fontWeight:600, color:status.color }}>{status.label}</div>
                      {status.reservation && (
                        <div style={{ fontSize:11, color:"#374151", background:"#fff", padding:"5px 8px", borderRadius:6, border:"1px solid #f3f4f6" }}>
                          <div style={{ fontWeight:600 }}>{status.reservation.customer_name}</div>
                          <div style={{ color:"#9ca3af" }}>{status.reservation.time} · {status.reservation.guests}p</div>
                        </div>
                      )}
                      <div style={{ display:"flex", gap:5, marginTop:2 }}>
                        {!isBlocked&&!isOccupied&&<button className="btn btn-red" style={{ fontSize:11, flex:1 }} onClick={()=>setTableManualStatus(table.id,'occupied')}>{t.occupy}</button>}
                        {isOccupied&&<button className="btn btn-green" style={{ fontSize:11, flex:1 }} onClick={()=>setTableManualStatus(table.id,'available')}>{t.release}</button>}
                        {!isBlocked&&!isOccupied&&<button className="btn btn-gray" style={{ fontSize:11, flex:1 }} onClick={()=>setTableManualStatus(table.id,'blocked')}>{t.block}</button>}
                        {isBlocked&&<button className="btn btn-green" style={{ fontSize:11, flex:1 }} onClick={()=>setTableManualStatus(table.id,'available')}>{t.release}</button>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STATS */}
          {tab === "stats" && (
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
                {[
                  { label:t.totalConfirmed, value:stats.totalConfirmed, color:"#16a34a" },
                  { label:t.totalGuests,    value:stats.totalGuests,    color:"#3b82f6" },
                  { label:t.cancellationRate, value:stats.cancellationRate+"%", color:"#dc2626" },
                ].map((s,i) => (
                  <div key={i} className="stat-card" style={{ textAlign:"center" }}>
                    <div style={{ fontSize:36, fontWeight:800, color:s.color }}>{s.value}</div>
                    <div style={{ fontSize:12, color:"#6b7280", marginTop:4 }}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="card">
                <div className="card-header"><span style={{ fontSize:13, fontWeight:600 }}>{t.last7}</span></div>
                <div style={{ padding:20 }}>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={stats.last7}><XAxis dataKey="day" tick={{fontSize:12}}/><YAxis tick={{fontSize:12}}/><Tooltip/><Bar dataKey="reservas" fill="#111827" radius={[4,4,0,0]}/></BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                <div className="card">
                  <div className="card-header"><span style={{ fontSize:13, fontWeight:600 }}>{t.peakHours}</span></div>
                  <div style={{ padding:20 }}>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={stats.horasPico}><XAxis dataKey="hora" tick={{fontSize:11}}/><YAxis tick={{fontSize:11}}/><Tooltip/><Bar dataKey="reservas" fill="#3b82f6" radius={[4,4,0,0]}/></BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="card">
                  <div className="card-header"><span style={{ fontSize:13, fontWeight:600 }}>{t.resStatus}</span></div>
                  <div style={{ padding:20, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <PieChart width={200} height={200}>
                      <Pie data={stats.pieData} cx={100} cy={100} innerRadius={60} outerRadius={90} dataKey="value">
                        {stats.pieData.map((entry,index)=><Cell key={index} fill={entry.color}/>)}
                      </Pie><Tooltip/>
                    </PieChart>
                  </div>
                  <div style={{ padding:"0 20px 16px", display:"flex", gap:16, justifyContent:"center" }}>
                    {stats.pieData.map((d,i)=>(
                      <div key={i} style={{ display:"flex", alignItems:"center", gap:6 }}>
                        <div style={{ width:10, height:10, borderRadius:"50%", background:d.color }}/>
                        <span style={{ fontSize:12, color:"#6b7280" }}>{d.name}: {d.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="card">
                <div className="card-header"><span style={{ fontSize:13, fontWeight:600 }}>{t.topTables}</span></div>
                <div style={{ padding:20 }}>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={stats.ocupacionMesas} layout="vertical">
                      <XAxis type="number" tick={{fontSize:11}}/><YAxis dataKey="mesa" type="category" tick={{fontSize:11}} width={70}/><Tooltip/><Bar dataKey="reservas" fill="#8b5cf6" radius={[0,4,4,0]}/>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* WHATSAPP */}
          {tab === "whatsapp" && (
            <div className="card">
              <div className="card-header">
                <span style={{ fontSize:13, fontWeight:600 }}>{t.botStatus}</span>
                <span style={{ fontSize:11, fontWeight:600, color:"#16a34a" }}>{t.active}</span>
              </div>
              {[
                { label:t.whatsappNum, value:"+34 641 17 15 38" },
                { label:t.webhookUrl, value:"reservas-bot-production-db9b.up.railway.app/webhook" },
                { label:t.status, value:t.operative },
              ].map((s,i)=>(
                <div key={i} className="table-row" style={{ justifyContent:"space-between" }}>
                  <span style={{ fontSize:13, color:"#6b7280" }}>{s.label}</span>
                  <span style={{ fontSize:13, fontWeight:600, color:"#111827" }}>{s.value}</span>
                </div>
              ))}
            </div>
          )}

          {/* CONVERSATIONS */}
          {tab === "conversations" && (
            <div style={{ display:"flex", gap:16, height:"calc(100vh - 140px)" }}>
              <div className="card" style={{ width:280, flexShrink:0, overflowY:"auto" }}>
                <div className="card-header">
                  <span style={{ fontSize:13, fontWeight:600 }}>{t.conversations2}</span>
                  <span style={{ fontSize:11, color:"#9ca3af" }}>{convsByPhone.length}</span>
                </div>
                {convsByPhone.length===0 && (
                  <div style={{ padding:24, textAlign:"center" }}>
                    <MessageCircle size={32} color="#e5e7eb" style={{ margin:"0 auto 8px" }}/>
                    <div style={{ fontSize:13, color:"#9ca3af" }}>{t.noConversations}</div>
                    <div style={{ fontSize:11, color:"#d1d5db", marginTop:4 }}>{t.noConvMsg}</div>
                  </div>
                )}
                {convsByPhone.map(conv => {
                  const lastMsg=conv.messages[conv.messages.length-1];
                  const isActive=selectedConv===conv.phone;
                  const clientRes=reservations.filter(r=>r.customer_phone===conv.phone);
                  return (
                    <div key={conv.phone} className={"conv-item"+(isActive?" active":"")} onClick={()=>setSelectedConv(conv.phone)}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:4 }}>
                        <div style={{ fontSize:13, fontWeight:600, color:"#111827" }}>{conv.name||conv.phone}</div>
                        <div style={{ fontSize:10, color:"#9ca3af" }}>{new Date(conv.last_at).toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'})}</div>
                      </div>
                      <div style={{ fontSize:11, color:"#6b7280", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", maxWidth:200 }}>
                        {lastMsg?.direction==='outbound'?'🤖 ':''}{lastMsg?.message||''}
                      </div>
                      {clientRes.length>0 && (
                        <div style={{ marginTop:6, display:"flex", gap:4 }}>
                          {clientRes.slice(0,2).map(r=>(
                            <span key={r.id} className="badge" style={{ background:STATUS[r.status]?.bg, color:STATUS[r.status]?.color, borderColor:STATUS[r.status]?.border, fontSize:10 }}>
                              {r.date} {r.time}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="card" style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
                {!selectedConv ? (
                  <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:8 }}>
                    <MessageCircle size={40} color="#e5e7eb"/>
                    <div style={{ fontSize:13, color:"#9ca3af" }}>{t.selectConv}</div>
                  </div>
                ) : (() => {
                  const conv=convsByPhone.find(c=>c.phone===selectedConv);
                  const clientRes=reservations.filter(r=>r.customer_phone===selectedConv);
                  return (
                    <>
                      <div className="card-header">
                        <div>
                          <div style={{ fontSize:14, fontWeight:700, color:"#111827" }}>{conv?.name||selectedConv}</div>
                          <div style={{ fontSize:11, color:"#9ca3af" }}>{selectedConv}</div>
                        </div>
                        {clientRes.length>0 && (
                          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                            {clientRes.map(r=>(
                              <span key={r.id} className="badge" style={{ background:STATUS[r.status]?.bg, color:STATUS[r.status]?.color, borderColor:STATUS[r.status]?.border }}>
                                {r.date} · {r.time} · {r.guests}p
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div style={{ flex:1, overflowY:"auto", padding:16, display:"flex", flexDirection:"column", gap:8 }}>
                        {conv?.messages.map(msg=>(
                          <div key={msg.id} style={{ display:"flex", flexDirection:"column", alignItems:msg.direction==='outbound'?'flex-end':'flex-start' }}>
                            <div className={"msg-bubble "+(msg.direction==='outbound'?'msg-out':'msg-in')}>{msg.message}</div>
                            <div style={{ fontSize:10, color:"#9ca3af", marginTop:2, paddingLeft:4, paddingRight:4 }}>
                              {new Date(msg.created_at).toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'})}
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef}/>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          )}

          {/* SETTINGS */}
          {tab === "settings" && (
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              {saveMsg && <div style={{ background:"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:8, padding:"10px 16px", color:"#15803d", fontSize:13, fontWeight:600 }}>{saveMsg}</div>}

              {/* Datos restaurante */}
              <div className="card">
                <div className="card-header">
                  <span style={{ fontSize:13, fontWeight:600 }}>{t.restData}</span>
                  {!editingRestaurant
                    ? <button className="btn btn-gray" onClick={()=>setEditingRestaurant(true)}><Edit2 size={12} style={{marginRight:4}}/>{t.edit}</button>
                    : <div style={{ display:"flex", gap:8 }}>
                        <button className="btn btn-gray" onClick={()=>setEditingRestaurant(false)}><X size={12}/></button>
                        <button className="btn btn-dark" onClick={saveRestaurant} disabled={saving}><Save size={12} style={{marginRight:4}}/>{saving?"...":t.save}</button>
                      </div>
                  }
                </div>
                {[
                  { label:t.name,         field:"name",         icon:Utensils },
                  { label:t.whatsappNum,  field:"phone",        icon:Phone },
                  { label:t.opening,      field:"opening_time", icon:Clock },
                  { label:t.closing,      field:"closing_time", icon:Clock },
                  { label:t.slotDuration, field:"slot_duration",icon:Timer },
                ].map(({label,field,icon:Icon})=>(
                  <div key={field} className="table-row" style={{ justifyContent:"space-between" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}><Icon size={14} color="#6b7280"/><span style={{ fontSize:13, color:"#6b7280" }}>{label}</span></div>
                    {editingRestaurant
                      ? <input style={{ width:180, textAlign:"right", padding:"6px 10px", border:"1px solid #e5e7eb", borderRadius:7, fontSize:13, fontFamily:"system-ui" }} value={restForm[field]||""} onChange={e=>setRestForm(f=>({...f,[field]:e.target.value}))}/>
                      : <span style={{ fontSize:13, fontWeight:600, color:"#111827" }}>{restForm[field]||"—"}</span>
                    }
                  </div>
                ))}

                {/* Días de apertura */}
                <div style={{ padding:"16px 20px", borderTop:"1px solid #f3f4f6" }}>
                  <div style={{ fontSize:13, fontWeight:600, color:"#374151", marginBottom:12 }}>{t.openDays}</div>
                  <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                    {WEEKDAYS_CONFIG.map(({ key, es, ca }) => {
                      const isOn = openDays.includes(key);
                      return (
                        <div key={key} className={"day-chip " + (isOn ? "on" : "off")} onClick={() => { if (editingRestaurant) toggleOpenDay(key); }}
                          style={{ opacity: editingRestaurant ? 1 : 0.7, cursor: editingRestaurant ? 'pointer' : 'default' }}>
                          {lang === 'ca' ? ca : es}
                        </div>
                      );
                    })}
                  </div>
                  {!editingRestaurant && <div style={{ fontSize:11, color:"#9ca3af", marginTop:8 }}>Pulsa "Editar" para cambiar los días</div>}
                </div>

                {/* Turnos */}
                <div style={{ padding:"16px 20px", borderTop:"1px solid #f3f4f6" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:"#374151" }}>{t.shifts}</div>
                    {editingRestaurant && (
                      <button className="btn btn-dark" style={{ fontSize:11 }} onClick={() => setAddingShift(!addingShift)}>
                        <Plus size={12} style={{marginRight:4}}/>{t.addShift}
                      </button>
                    )}
                  </div>
                  {addingShift && editingRestaurant && (
                    <div style={{ display:"flex", gap:8, marginBottom:12, flexWrap:"wrap", background:"#f9fafb", padding:12, borderRadius:8 }}>
                      <input placeholder={t.shiftName} value={newShift.name} onChange={e=>setNewShift(s=>({...s,name:e.target.value}))}
                        style={{ flex:1, minWidth:120, padding:"6px 10px", border:"1px solid #e5e7eb", borderRadius:7, fontSize:13, fontFamily:"system-ui" }}/>
                      <input type="time" value={newShift.start} onChange={e=>setNewShift(s=>({...s,start:e.target.value}))}
                        style={{ width:110, padding:"6px 10px", border:"1px solid #e5e7eb", borderRadius:7, fontSize:13, fontFamily:"system-ui" }}/>
                      <input type="time" value={newShift.end} onChange={e=>setNewShift(s=>({...s,end:e.target.value}))}
                        style={{ width:110, padding:"6px 10px", border:"1px solid #e5e7eb", borderRadius:7, fontSize:13, fontFamily:"system-ui" }}/>
                      <button className="btn btn-gray" onClick={()=>setAddingShift(false)}><X size={12}/></button>
                      <button className="btn btn-dark" onClick={addShift}><Save size={12} style={{marginRight:4}}/>{t.save}</button>
                    </div>
                  )}
                  {shifts.length === 0 && <div style={{ fontSize:12, color:"#9ca3af" }}>{t.noShifts}</div>}
                  {shifts.map(shift => (
                    <div key={shift.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 0", borderBottom:"1px solid #f9fafb" }}>
                      <div style={{ width:8, height:8, borderRadius:"50%", background:"#6b7280" }}/>
                      <span style={{ fontSize:13, fontWeight:600, color:"#111827", flex:1 }}>{shift.name}</span>
                      <span style={{ fontSize:12, color:"#6b7280" }}>{shift.start} – {shift.end}</span>
                      {editingRestaurant && (
                        <button className="btn btn-red" style={{ padding:"3px 8px" }} onClick={()=>deleteShift(shift.id)}><Trash2 size={12}/></button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Mesas */}
              <div className="card">
                <div className="card-header">
                  <span style={{ fontSize:13, fontWeight:600 }}>{t.tablesTitle} ({tables.length})</span>
                  <button className="btn btn-dark" style={{ fontSize:11 }} onClick={()=>setAddingTable(!addingTable)}>
                    <Plus size={12} style={{marginRight:4}}/>{t.addTable}
                  </button>
                </div>
                {addingTable && (
                  <div className="table-row" style={{ background:"#f9fafb", gap:8 }}>
                    <input placeholder={t.tableName} value={newTable.label} onChange={e=>setNewTable(tb=>({...tb,label:e.target.value}))}
                      style={{ flex:1, padding:"6px 10px", border:"1px solid #e5e7eb", borderRadius:7, fontSize:13, fontFamily:"system-ui" }}/>
                    <input placeholder={t.capacity} type="number" value={newTable.capacity} onChange={e=>setNewTable(tb=>({...tb,capacity:e.target.value}))}
                      style={{ width:90, padding:"6px 10px", border:"1px solid #e5e7eb", borderRadius:7, fontSize:13, fontFamily:"system-ui" }}/>
                    <button className="btn btn-gray" onClick={()=>setAddingTable(false)}><X size={12}/></button>
                    <button className="btn btn-dark" onClick={addTable} disabled={saving}><Save size={12} style={{marginRight:4}}/>{saving?"...":t.save}</button>
                  </div>
                )}
                {tables.map(tb=>(
                  <div key={tb.id} className="table-row" style={{ justifyContent:"space-between" }}>
                    {editingTable===tb.id ? (
                      <>
                        <div style={{ display:"flex", gap:8, flex:1 }}>
                          <input style={{ width:120, padding:"6px 10px", border:"1px solid #e5e7eb", borderRadius:7, fontSize:13, fontFamily:"system-ui" }} value={tableForm.label||""} placeholder={t.name} onChange={e=>setTableForm(f=>({...f,label:e.target.value}))}/>
                          <input style={{ width:70, padding:"6px 10px", border:"1px solid #e5e7eb", borderRadius:7, fontSize:13, fontFamily:"system-ui" }} type="number" value={tableForm.capacity||""} placeholder={t.capacity} onChange={e=>setTableForm(f=>({...f,capacity:e.target.value}))}/>
                        </div>
                        <div style={{ display:"flex", gap:6 }}>
                          <button className="btn btn-gray" onClick={()=>setEditingTable(null)}><X size={12}/></button>
                          <button className="btn btn-dark" onClick={()=>saveTable(tb.id)} disabled={saving}><Save size={12} style={{marginRight:4}}/>{saving?"...":t.save}</button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={{ display:"flex", alignItems:"center", gap:10 }}><Utensils size={14} color="#6b7280"/><span style={{ fontSize:13, fontWeight:600, color:"#111827" }}>{tb.label}</span><span style={{ fontSize:12, color:"#9ca3af" }}>{tb.capacity} {lang==='ca'?'persones':'personas'}</span></div>
                        <div style={{ display:"flex", gap:6 }}>
                          <button className="btn btn-gray" onClick={()=>{setEditingTable(tb.id);setTableForm({label:tb.label,capacity:tb.capacity});}}><Edit2 size={12} style={{marginRight:4}}/>{t.edit}</button>
                          <button className="btn btn-red" onClick={()=>deleteTable(tb.id)}><Trash2 size={12}/></button>
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

      {/* Modal nueva reserva */}
      {showNewRes && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ background:'#fff', borderRadius:16, padding:32, width:440, maxWidth:'95vw', boxShadow:'0 20px 60px #00000030' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
              <h3 style={{ fontSize:16, fontWeight:700, color:'#111827' }}>{t.newManualRes}</h3>
              <button onClick={()=>setShowNewRes(false)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:20, color:'#9ca3af' }}>✕</button>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <input placeholder={t.name+" *"} value={newRes.name} onChange={e=>setNewRes({...newRes,name:e.target.value})} style={{ width:'100%', padding:'8px 12px', borderRadius:8, border:'1px solid #e5e7eb', fontSize:13, fontFamily:'system-ui' }}/>
              <input placeholder={t.phone+" *"} value={newRes.phone} onChange={e=>setNewRes({...newRes,phone:e.target.value})} style={{ width:'100%', padding:'8px 12px', borderRadius:8, border:'1px solid #e5e7eb', fontSize:13, fontFamily:'system-ui' }}/>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                <input type="date" value={newRes.date} onChange={e=>setNewRes({...newRes,date:e.target.value})} style={{ width:'100%', padding:'8px 12px', borderRadius:8, border:'1px solid #e5e7eb', fontSize:13, fontFamily:'system-ui' }}/>
                <input type="time" value={newRes.time} onChange={e=>setNewRes({...newRes,time:e.target.value})} style={{ width:'100%', padding:'8px 12px', borderRadius:8, border:'1px solid #e5e7eb', fontSize:13, fontFamily:'system-ui' }}/>
              </div>
              <input type="number" placeholder={t.guests+" *"} min={1} max={30} value={newRes.guests} onChange={e=>setNewRes({...newRes,guests:e.target.value})} style={{ width:'100%', padding:'8px 12px', borderRadius:8, border:'1px solid #e5e7eb', fontSize:13, fontFamily:'system-ui' }}/>
              <textarea placeholder={t.notes} value={newRes.notes} onChange={e=>setNewRes({...newRes,notes:e.target.value})} rows={3} style={{ width:'100%', padding:'8px 12px', borderRadius:8, border:'1px solid #e5e7eb', fontSize:13, fontFamily:'system-ui', resize:'none' }}/>
            </div>
            <div style={{ display:'flex', gap:10, marginTop:24, justifyContent:'flex-end' }}>
              <button className="btn btn-gray" onClick={()=>setShowNewRes(false)}>{t.cancel}</button>
              <button style={{ border:'none', cursor:'pointer', padding:'7px 16px', borderRadius:7, fontSize:13, fontWeight:600, background:'#3b82f6', color:'#fff' }} onClick={createManualReservation}>{t.create}</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
