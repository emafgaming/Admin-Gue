"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  BadgeCheck,
  Ban,
  Bell,
  BriefcaseBusiness,
  Building2,
  ChartNoAxesCombined,
  ChevronLeft,
  ChevronRight,
  Clock3,
  ExternalLink,
  Flag,
  History,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  OctagonX,
  Pencil,
  Plus,
  Power,
  Save,
  Search,
  Settings,
  Users,
  X,
} from "lucide-react";

const colors = {
  maroon: "#6D0808",
  cream: "#EEEAD7",
  paper: "#FBF8EE",
  ink: "#211D1A",
  muted: "#706861",
  line: "#D8D0BB",
  sage: "#64705F",
  gold: "#A8782F",
  clay: "#9B5549",
  blue: "#3F6475",
};

const navItems = [
  ["dashboard", "Dashboard", LayoutDashboard],
  ["kost", "Manajemen Kost", Building2],
  ["owners", "Pemilik Kost", BriefcaseBusiness],
  ["users", "Pengguna", Users],
  ["reports", "Laporan Kost", Flag],
  ["ads", "Manajemen Iklan", Megaphone],
  ["analytics", "Statistik", ChartNoAxesCombined],
  ["audit", "Audit Log", History],
  ["settings", "Pengaturan", Settings],
];

const viewMeta = {
  dashboard: ["Dashboard", "Ringkasan Platform"],
  kost: ["Manajemen Kost", "Kelola Data Kost"],
  owners: ["Pemilik Kost", "Kelola Pemilik"],
  users: ["Pengguna", "Kelola Pengguna"],
  reports: ["Laporan Kost", "Tindak Lanjut Laporan"],
  ads: ["Manajemen Iklan", "Promosi dan Performa"],
  analytics: ["Statistik", "Analitik Platform"],
  audit: ["Audit Log", "Riwayat Aktivitas"],
  settings: ["Pengaturan", "Profil Admin"],
};

const initialKosts = [
  { id: 1, name: "Kost Mawar Residence", area: "Tampan", price: 1250000, owner: "Mira Santoso", status: "Aktif", created: "2026-01-12", address: "Jl. Garuda Sakti No. 18", month: "Jan" },
  { id: 2, name: "Kost Harmoni Putri", area: "Sukajadi", price: 950000, owner: "Budi Hartono", status: "Menunggu Verifikasi", created: "2026-02-04", address: "Jl. Melur No. 7", month: "Feb" },
  { id: 3, name: "Kost Cemara Eksklusif", area: "Marpoyan Damai", price: 1600000, owner: "Sari Utami", status: "Aktif", created: "2026-03-22", address: "Jl. Kaharuddin Nasution No. 45", month: "Mar" },
  { id: 4, name: "Kost Anggrek", area: "Payung Sekaki", price: 800000, owner: "Teguh Pramana", status: "Ditolak", created: "2026-04-10", address: "Jl. Fajar Ujung No. 5", month: "Apr" },
  { id: 5, name: "Kost Griya Nusa", area: "Bukit Raya", price: 1100000, owner: "Rina Saputra", status: "Nonaktif", created: "2026-05-15", address: "Jl. Tengku Bey No. 12", month: "Mei" },
  { id: 6, name: "Kost Pelita", area: "Tampan", price: 1000000, owner: "Agus Salim", status: "Aktif", created: "2026-06-19", address: "Jl. Bangau Sakti No. 20", month: "Jun" },
  { id: 7, name: "Kost Kenanga", area: "Rumbai", price: 900000, owner: "Yulia Basri", status: "Menunggu Verifikasi", created: "2026-07-08", address: "Jl. Sekolah No. 31", month: "Jul" },
];

const initialOwners = [
  { name: "Mira Santoso", email: "mira@kost.id", phone: "0812-4000-1100", status: "Aktif" },
  { name: "Budi Hartono", email: "budi@kost.id", phone: "0813-5000-2200", status: "Aktif" },
  { name: "Sari Utami", email: "sari@kost.id", phone: "0821-6000-3300", status: "Aktif" },
  { name: "Teguh Pramana", email: "teguh@kost.id", phone: "0852-7000-4400", status: "Nonaktif" },
  { name: "Rina Saputra", email: "rina@kost.id", phone: "0811-8000-5500", status: "Aktif" },
];

const initialUsers = [
  { name: "Nadia Putri", email: "nadia@mail.com", phone: "0812-1111-1000", joined: "2026-01-16", status: "Aktif" },
  { name: "Fajar Akbar", email: "fajar@mail.com", phone: "0812-2222-2000", joined: "2026-02-20", status: "Aktif" },
  { name: "Dimas Arya", email: "dimas@mail.com", phone: "0812-3333-3000", joined: "2026-03-09", status: "Nonaktif" },
  { name: "Laras Wening", email: "laras@mail.com", phone: "0812-4444-4000", joined: "2026-04-27", status: "Aktif" },
];

const initialReports = [
  { kost: "Kost Mawar Residence", type: "Harga tidak sesuai", reporter: "Nadia Putri", status: "Baru", date: "2026-10-02" },
  { kost: "Kost Griya Nusa", type: "Kost sudah tidak tersedia", reporter: "Fajar Akbar", status: "Diproses", date: "2026-10-01" },
  { kost: "Kost Anggrek", type: "Lokasi tidak sesuai", reporter: "Laras Wening", status: "Selesai", date: "2026-09-27" },
  { kost: "Kost Pelita", type: "Foto tidak sesuai", reporter: "Dimas Arya", status: "Ditolak", date: "2026-09-20" },
];

const initialAds = [
  { title: "Promo Kost Dekat Kampus", type: "Banner", start: "2026-10-01", end: "2026-10-31", status: "Aktif", impressions: 6240, clicks: 412 },
  { title: "Diskon Biaya Admin", type: "Pop-up", start: "2026-09-18", end: "2026-10-18", status: "Aktif", impressions: 4820, clicks: 255 },
  { title: "Kost Eksklusif Pilihan", type: "Promo Kost", start: "2026-08-01", end: "2026-09-15", status: "Nonaktif", impressions: 3100, clicks: 121 },
];

const initialAudit = [
  { admin: "Admin Rafi", action: "Mengubah status Kost Mawar Residence menjadi Aktif", object: "Kost", time: "10 menit lalu", status: "Sukses" },
  { admin: "Admin Rafi", action: "Memproses laporan harga tidak sesuai", object: "Laporan", time: "36 menit lalu", status: "Sukses" },
  { admin: "Admin Dina", action: "Menonaktifkan iklan Kost Eksklusif Pilihan", object: "Iklan", time: "2 jam lalu", status: "Sukses" },
  { admin: "Admin Rafi", action: "Memperbarui profil admin", object: "Pengaturan", time: "Kemarin", status: "Sukses" },
];

const formatCurrency = (value) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);

const countBy = (items, key) =>
  items.reduce((acc, item) => ({ ...acc, [item[key]]: (acc[item[key]] || 0) + 1 }), {});

function Badge({ status }) {
  const tone = {
    Aktif: "bg-[#E3EADC] text-[#405A35]",
    Selesai: "bg-[#E3EADC] text-[#405A35]",
    Sukses: "bg-[#E3EADC] text-[#405A35]",
    "Menunggu Verifikasi": "bg-[#F4E8CF] text-[#77521D]",
    Baru: "bg-[#F4E8CF] text-[#77521D]",
    Diproses: "bg-[#F4E8CF] text-[#77521D]",
    Ditolak: "bg-[#EFD6CF] text-[#6D0808]",
    Nonaktif: "bg-[#EFD6CF] text-[#6D0808]",
  };

  return <span className={`inline-flex min-h-7 items-center rounded-full px-3 text-xs font-extrabold ${tone[status] || tone.Sukses}`}>{status}</span>;
}

function IconButton({ children, label, onClick }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#D8D0BB] bg-[#FBF8EE] text-[#6D0808] transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      {children}
    </button>
  );
}

function PrimaryButton({ children, onClick, type = "button" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[#6D0808] bg-[#6D0808] px-4 font-extrabold text-[#EEEAD7] transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      {children}
    </button>
  );
}

function GhostButton({ children, onClick, type = "button" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[#D8D0BB] bg-[#FBF8EE] px-3 font-bold text-[#6D0808] transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      {children}
    </button>
  );
}

function Panel({ children, className = "" }) {
  return <section className={`rounded-lg border border-[#D8D0BB] bg-[#FBF8EE] p-5 shadow-[0_18px_45px_rgba(44,30,24,0.12)] ${className}`}>{children}</section>;
}

function ChartCanvas({ type, labels, values, data, color = colors.maroon, className = "" }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.height;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    if (type === "donut") {
      const entries = Object.entries(data || {});
      const total = entries.reduce((sum, [, value]) => sum + value, 0) || 1;
      const chartColors = [colors.maroon, colors.sage, colors.gold, colors.clay, colors.blue];
      let start = -Math.PI / 2;
      const cx = width / 2;
      const cy = height / 2 - 8;
      const radius = Math.min(width, height) * 0.28;

      entries.forEach(([, value], index) => {
        const angle = (value / total) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, start, start + angle);
        ctx.closePath();
        ctx.fillStyle = chartColors[index % chartColors.length];
        ctx.fill();
        start += angle;
      });

      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.58, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";
      entries.forEach(([label, value], index) => {
        const x = 20 + (index % 2) * (width / 2);
        const y = height - 58 + Math.floor(index / 2) * 22;
        ctx.fillStyle = chartColors[index % chartColors.length];
        ctx.fillRect(x, y - 10, 10, 10);
        ctx.fillStyle = colors.ink;
        ctx.font = "700 12px 'Plus Jakarta Sans'";
        ctx.fillText(`${label} ${value}`, x + 16, y);
      });
      return;
    }

    const max = Math.max(...values, 1);
    const pad = 34;
    const chartH = height - pad * 2;
    const barW = (width - pad * 2) / values.length - 12;
    ctx.strokeStyle = colors.line;
    for (let i = 0; i < 4; i += 1) {
      const y = pad + (chartH / 3) * i;
      ctx.beginPath();
      ctx.moveTo(pad, y);
      ctx.lineTo(width - pad, y);
      ctx.stroke();
    }

    values.forEach((value, index) => {
      const x = pad + index * (barW + 12);
      const h = (value / max) * (chartH - 18);
      const y = height - pad - h;
      ctx.fillStyle = index % 2 ? colors.sage : color;
      ctx.fillRect(x, y, barW, h);
      ctx.fillStyle = colors.ink;
      ctx.font = "700 12px 'Plus Jakarta Sans'";
      ctx.textAlign = "center";
      ctx.fillText(labels[index], x + barW / 2, height - 11);
    });
  }, [type, labels, values, data, color]);

  return <canvas ref={ref} height="270" className={className} />;
}

export default function AdminPage() {
  const [activeView, setActiveView] = useState("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const [kosts, setKosts] = useState(initialKosts);
  const [owners, setOwners] = useState(initialOwners);
  const [users, setUsers] = useState(initialUsers);
  const [reports, setReports] = useState(initialReports);
  const [ads, setAds] = useState(initialAds);
  const [audit, setAudit] = useState(initialAudit);
  const [search, setSearch] = useState("");
  const [kostStatus, setKostStatus] = useState("Semua");
  const [areaFilter, setAreaFilter] = useState("Semua Wilayah");
  const [modalKost, setModalKost] = useState(null);
  const [toast, setToast] = useState("");

  const areas = useMemo(() => ["Semua Wilayah", ...new Set(kosts.map((kost) => kost.area))], [kosts]);
  const statusCounts = useMemo(() => countBy(kosts, "status"), [kosts]);
  const areaCounts = useMemo(() => countBy(kosts, "area"), [kosts]);
  const reportCounts = useMemo(() => countBy(reports, "status"), [reports]);
  const maxArea = Math.max(...Object.values(areaCounts), 1);
  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt"];
  const growthValues = months.map((month) => kosts.filter((kost) => kost.month === month).length);

  const filteredKosts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return kosts.filter((kost) => {
      const matchStatus = kostStatus === "Semua" || kost.status === kostStatus;
      const matchArea = areaFilter === "Semua Wilayah" || kost.area === areaFilter;
      const matchSearch = !q || [kost.name, kost.area, kost.owner, kost.status].some((value) => value.toLowerCase().includes(q));
      return matchStatus && matchArea && matchSearch;
    });
  }, [kosts, kostStatus, areaFilter, search]);

  const pushAudit = (action, object) => {
    setAudit((items) => [{ admin: "Admin Rafi", action, object, time: "Baru saja", status: "Sukses" }, ...items]);
  };

  const notify = (message) => {
    setToast(message);
    window.clearTimeout(notify.timer);
    notify.timer = window.setTimeout(() => setToast(""), 2600);
  };

  const updateKostStatus = (id, status) => {
    const selected = kosts.find((kost) => kost.id === id);
    setKosts((items) => items.map((kost) => (kost.id === id ? { ...kost, status } : kost)));
    pushAudit(`Mengubah status ${selected.name} menjadi ${status}`, "Kost");
    notify(`Status ${selected.name} diperbarui.`);
  };

  const saveKost = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const id = Number(form.get("id"));
    const payload = {
      id: id || Date.now(),
      name: form.get("name").trim(),
      price: Number(form.get("price")),
      area: form.get("area").trim(),
      owner: form.get("owner").trim(),
      address: form.get("address").trim(),
      status: form.get("status"),
      created: id ? modalKost.created : new Date().toISOString().slice(0, 10),
      month: id ? modalKost.month : "Okt",
    };

    setKosts((items) => (id ? items.map((kost) => (kost.id === id ? payload : kost)) : [payload, ...items]));
    pushAudit(`${id ? "Mengedit" : "Menambahkan"} ${payload.name}`, "Kost");
    setModalKost(null);
    notify("Data kost berhasil disimpan.");
  };

  const toggleByName = (collection, setter, name, object) => {
    setter((items) => items.map((item) => (item.name === name ? { ...item, status: item.status === "Aktif" ? "Nonaktif" : "Aktif" } : item)));
    pushAudit(`Mengubah status ${object.toLowerCase()} ${name}`, object);
    notify(`Status ${name} diperbarui.`);
  };

  const toggleAd = (title) => {
    setAds((items) => items.map((ad) => (ad.title === title ? { ...ad, status: ad.status === "Aktif" ? "Nonaktif" : "Aktif" } : ad)));
    pushAudit(`Mengubah status iklan ${title}`, "Iklan");
    notify("Status iklan diperbarui.");
  };

  const advanceReport = (kostName) => {
    const flow = ["Baru", "Diproses", "Selesai"];
    setReports((items) =>
      items.map((report) => {
        if (report.kost !== kostName) return report;
        const current = flow.indexOf(report.status);
        return current >= 0 && current < flow.length - 1 ? { ...report, status: flow[current + 1] } : report;
      }),
    );
    pushAudit(`Memproses laporan ${kostName}`, "Laporan");
    notify(`Laporan ${kostName} diperbarui.`);
  };

  const statCards = [
    ["Total Kost", kosts.length, Building2, colors.maroon],
    ["Kost Aktif", kosts.filter((kost) => kost.status === "Aktif").length, BadgeCheck, colors.sage],
    ["Menunggu Verifikasi", kosts.filter((kost) => kost.status === "Menunggu Verifikasi").length, Clock3, colors.gold],
    ["Ditolak atau Nonaktif", kosts.filter((kost) => ["Ditolak", "Nonaktif"].includes(kost.status)).length, OctagonX, colors.clay],
    ["Pemilik Kost", owners.length, BriefcaseBusiness, colors.blue],
    ["Pengguna", users.length, Users, colors.sage],
    ["Laporan", reports.length, Flag, colors.gold],
    ["Iklan Aktif", ads.filter((ad) => ad.status === "Aktif").length, Megaphone, colors.maroon],
  ];

  const [eyebrow, title] = viewMeta[activeView];

  return (
    <div className="min-h-screen bg-[#EEEAD7] lg:grid lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[280px] flex-col gap-6 bg-[#6D0808] p-4 text-[#EEEAD7] transition lg:sticky lg:top-0 lg:h-screen ${menuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="flex items-center gap-3 px-2">
          <div className="grid h-11 w-11 place-items-center rounded-lg border border-[#EEEAD766] bg-[#EEEAD71F] font-extrabold">CK</div>
          <div>
            <strong>CariKostKita</strong>
            <span className="block text-xs text-[#EEEAD7B8]">Admin Panel</span>
          </div>
        </div>

        <nav className="grid gap-1.5">
          {navItems.map(([key, label, Icon]) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setActiveView(key);
                setMenuOpen(false);
              }}
              className={`flex min-h-11 items-center gap-3 rounded-lg px-3 text-left transition ${activeView === key ? "bg-[#EEEAD7] text-[#6D0808]" : "text-[#EEEAD7D1] hover:bg-[#EEEAD71F]"}`}
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto flex items-center gap-3 rounded-lg border border-[#EEEAD73D] p-3">
          <div className="grid h-11 w-11 place-items-center rounded-lg border border-[#EEEAD766] bg-[#EEEAD71F] font-extrabold">AR</div>
          <div>
            <strong>Admin Rafi</strong>
            <span className="block text-xs text-[#EEEAD7B8]">Super Admin</span>
          </div>
        </div>
      </aside>

      <main className="min-w-0 p-4 lg:p-6">
        <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <IconButton label="Buka navigasi" onClick={() => setMenuOpen(true)}>
              <Menu size={18} />
            </IconButton>
            <div>
              <p className="mb-1 text-xs font-extrabold uppercase text-[#6D0808]">{eyebrow}</p>
              <h1 className="text-3xl font-extrabold leading-tight text-[#211D1A] lg:text-4xl">{title}</h1>
            </div>
          </div>
          <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
            <label className="flex h-11 w-full items-center gap-2 rounded-lg border border-[#D8D0BB] bg-[#FBF8EE] px-3 text-[#706861] sm:w-[330px]">
              <Search size={18} />
              <input value={search} onChange={(event) => setSearch(event.target.value)} className="w-full bg-transparent text-[#211D1A] outline-none" placeholder="Cari data admin" />
            </label>
            <IconButton label="Notifikasi">
              <Bell size={18} />
            </IconButton>
            <PrimaryButton onClick={() => setModalKost({})}>
              <Plus size={18} />
              <span>Tambah Kost</span>
            </PrimaryButton>
          </div>
        </header>

        {activeView === "dashboard" && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {statCards.map(([label, value, Icon, color]) => (
                <article key={label} className="flex min-h-28 items-center gap-4 rounded-lg border border-[#D8D0BB] bg-[#FBF8EE] p-5 shadow-[0_18px_45px_rgba(44,30,24,0.12)]">
                  <div className="grid h-11 w-11 place-items-center rounded-lg text-[#EEEAD7]" style={{ backgroundColor: color }}>
                    <Icon size={19} />
                  </div>
                  <div>
                    <p className="text-sm text-[#706861]">{label}</p>
                    <strong className="mt-1 block text-3xl leading-none">{value}</strong>
                  </div>
                </article>
              ))}
            </div>

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.85fr)]">
              <Panel>
                <PanelTitle eyebrow="Pertumbuhan" title="Kost Baru per Bulan" />
                <ChartCanvas labels={months} values={growthValues} />
              </Panel>
              <Panel>
                <PanelTitle eyebrow="Status" title="Kondisi Kost" />
                <ChartCanvas type="donut" data={statusCounts} />
              </Panel>
              <Panel>
                <PanelTitle eyebrow="Wilayah" title="Sebaran Kost" />
                <div className="grid gap-3">
                  {Object.entries(areaCounts).map(([area, total]) => (
                    <div key={area} className="grid gap-1.5">
                      <div className="flex justify-between text-sm font-bold">
                        <span>{area}</span>
                        <span>{total}</span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-[#E4DCC8]">
                        <div className="h-full bg-[#6D0808]" style={{ width: `${(total / maxArea) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
              <Panel>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <PanelTitle eyebrow="Aktivitas" title="Aktivitas Terbaru" />
                  <GhostButton onClick={() => setActiveView("audit")}>
                    <ExternalLink size={17} />
                    <span>Lihat Audit</span>
                  </GhostButton>
                </div>
                <DataTable headers={["Admin", "Aktivitas", "Objek", "Waktu", "Status"]}>
                  {audit.slice(0, 4).map((item) => (
                    <tr key={`${item.action}-${item.time}`}>
                      <Td>{item.admin}</Td>
                      <Td>{item.action}</Td>
                      <Td>{item.object}</Td>
                      <Td>{item.time}</Td>
                      <Td><Badge status={item.status} /></Td>
                    </tr>
                  ))}
                </DataTable>
              </Panel>
            </div>
          </div>
        )}

        {activeView === "kost" && (
          <div className="space-y-4">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex overflow-x-auto rounded-lg border border-[#D8D0BB] bg-[#FBF8EE]">
                {["Semua", "Menunggu Verifikasi", "Aktif", "Ditolak", "Nonaktif"].map((status) => (
                  <button key={status} type="button" onClick={() => setKostStatus(status)} className={`min-h-10 whitespace-nowrap border-r border-[#D8D0BB] px-4 font-extrabold last:border-r-0 ${kostStatus === status ? "bg-[#6D0808] text-[#EEEAD7]" : "text-[#706861]"}`}>
                    {status}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                <select value={areaFilter} onChange={(event) => setAreaFilter(event.target.value)} className="h-10 rounded-lg border border-[#D8D0BB] bg-[#FBF8EE] px-3">
                  {areas.map((area) => <option key={area}>{area}</option>)}
                </select>
                <PrimaryButton onClick={() => setModalKost({})}><Plus size={18} /><span>Tambah Kost</span></PrimaryButton>
              </div>
            </div>
            <Panel>
              <DataTable headers={["Nama Kost", "Wilayah", "Harga", "Pemilik", "Status", "Tanggal", "Aksi"]}>
                {filteredKosts.length ? filteredKosts.map((kost) => (
                  <tr key={kost.id}>
                    <Td><strong>{kost.name}</strong><span className="block text-xs text-[#706861]">{kost.address}</span></Td>
                    <Td>{kost.area}</Td>
                    <Td>{formatCurrency(kost.price)}</Td>
                    <Td>{kost.owner}</Td>
                    <Td><Badge status={kost.status} /></Td>
                    <Td>{kost.created}</Td>
                    <Td>
                      <div className="flex gap-2">
                        <IconButton label="Edit" onClick={() => setModalKost(kost)}><Pencil size={17} /></IconButton>
                        <IconButton label="Verifikasi" onClick={() => updateKostStatus(kost.id, "Aktif")}><BadgeCheck size={17} /></IconButton>
                        <IconButton label="Nonaktifkan" onClick={() => updateKostStatus(kost.id, "Nonaktif")}><Ban size={17} /></IconButton>
                      </div>
                    </Td>
                  </tr>
                )) : (
                  <tr><Td colSpan={7}>Tidak ada data yang cocok.</Td></tr>
                )}
              </DataTable>
              <div className="mt-4 flex justify-end gap-2 text-sm text-[#706861]">
                <GhostButton><ChevronLeft size={16} /></GhostButton>
                <span className="self-center">Halaman 1 dari 1</span>
                <GhostButton><ChevronRight size={16} /></GhostButton>
              </div>
            </Panel>
          </div>
        )}

        {activeView === "owners" && (
          <Panel>
            <PanelTitle eyebrow="Akun" title="Daftar Pemilik Kost" />
            <DataTable headers={["Nama", "Email", "Telepon", "Jumlah Kost", "Status", "Aksi"]}>
              {owners.map((owner) => (
                <tr key={owner.name}>
                  <Td><strong>{owner.name}</strong></Td>
                  <Td>{owner.email}</Td>
                  <Td>{owner.phone}</Td>
                  <Td>{kosts.filter((kost) => kost.owner === owner.name).length}</Td>
                  <Td><Badge status={owner.status} /></Td>
                  <Td><GhostButton onClick={() => toggleByName(owners, setOwners, owner.name, "Pemilik")}><Power size={17} /><span>Ubah Status</span></GhostButton></Td>
                </tr>
              ))}
            </DataTable>
          </Panel>
        )}

        {activeView === "users" && (
          <Panel>
            <PanelTitle eyebrow="Akun" title="Daftar Pengguna" />
            <DataTable headers={["Nama", "Email", "Telepon", "Terdaftar", "Status", "Aksi"]}>
              {users.map((user) => (
                <tr key={user.name}>
                  <Td><strong>{user.name}</strong></Td>
                  <Td>{user.email}</Td>
                  <Td>{user.phone}</Td>
                  <Td>{user.joined}</Td>
                  <Td><Badge status={user.status} /></Td>
                  <Td><GhostButton onClick={() => toggleByName(users, setUsers, user.name, "Pengguna")}><Power size={17} /><span>Ubah Status</span></GhostButton></Td>
                </tr>
              ))}
            </DataTable>
          </Panel>
        )}

        {activeView === "reports" && (
          <div className="grid gap-4 xl:grid-cols-4">
            {["Baru", "Diproses", "Selesai", "Ditolak"].map((status) => (
              <section key={status} className="min-h-[420px] rounded-lg border border-[#D8D0BB] bg-[#FBF8EE] p-4">
                <h2 className="mb-3 text-lg font-extrabold">{status}</h2>
                <div className="grid gap-3">
                  {reports.filter((report) => report.status === status).map((report) => (
                    <article key={`${report.kost}-${report.status}`} className="grid gap-2 rounded-lg border border-[#D8D0BB] bg-[#FFFDF6] p-3">
                      <strong className="text-[#6D0808]">{report.kost}</strong>
                      <p className="text-sm text-[#706861]">{report.type}</p>
                      <p className="text-sm text-[#706861]">{report.reporter} - {report.date}</p>
                      <GhostButton onClick={() => advanceReport(report.kost)}>Proses</GhostButton>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {activeView === "ads" && (
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.85fr)]">
            <Panel>
              <div className="mb-4 flex items-center justify-between gap-3">
                <PanelTitle eyebrow="Iklan" title="Daftar Promosi" />
                <PrimaryButton onClick={() => notify("Form iklan siap disambungkan ke backend.")}><Plus size={18} /><span>Tambah Iklan</span></PrimaryButton>
              </div>
              <DataTable headers={["Judul", "Tipe", "Periode", "Status", "CTR", "Aksi"]}>
                {ads.map((ad) => (
                  <tr key={ad.title}>
                    <Td><strong>{ad.title}</strong></Td>
                    <Td>{ad.type}</Td>
                    <Td>{ad.start} sampai {ad.end}</Td>
                    <Td><Badge status={ad.status} /></Td>
                    <Td>{((ad.clicks / ad.impressions) * 100).toFixed(1)}%</Td>
                    <Td><GhostButton onClick={() => toggleAd(ad.title)}><Power size={17} /><span>Ubah Status</span></GhostButton></Td>
                  </tr>
                ))}
              </DataTable>
            </Panel>
            <Panel>
              <PanelTitle eyebrow="Performa" title="Klik dan Tayangan" />
              <ChartCanvas labels={ads.map((ad) => ad.type)} values={ads.map((ad) => Math.round((ad.clicks / ad.impressions) * 100))} color={colors.blue} />
            </Panel>
          </div>
        )}

        {activeView === "analytics" && (
          <div className="grid gap-4 xl:grid-cols-2">
            <Panel><PanelTitle eyebrow="Laporan" title="Status Laporan" /><ChartCanvas type="donut" data={reportCounts} /></Panel>
            <Panel><PanelTitle eyebrow="Pengguna" title="Pertumbuhan Akun" /><ChartCanvas labels={["Jan", "Feb", "Mar", "Apr", "Mei", "Jun"]} values={[3, 4, 6, 8, 9, 12]} color={colors.sage} /></Panel>
          </div>
        )}

        {activeView === "audit" && (
          <Panel>
            <PanelTitle eyebrow="Keamanan" title="Riwayat Aktivitas Admin" />
            <div className="grid gap-3">
              {audit.map((item) => (
                <article key={`${item.action}-${item.time}`} className="grid grid-cols-[38px_minmax(0,1fr)] gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-[#6D0808] text-[#EEEAD7]"><History size={17} /></div>
                  <div>
                    <strong>{item.action}</strong>
                    <p className="text-sm text-[#706861]">{item.admin} - {item.object} - {item.time} - {item.status}</p>
                  </div>
                </article>
              ))}
            </div>
          </Panel>
        )}

        {activeView === "settings" && (
          <Panel className="max-w-3xl">
            <div className="mb-5 flex items-center gap-3">
              <div className="grid h-16 w-16 place-items-center rounded-lg bg-[#6D0808] font-extrabold text-[#EEEAD7]">AR</div>
              <div>
                <h2 className="text-2xl font-extrabold">Admin Rafi</h2>
                <p className="text-[#706861]">admin@carikostkita.id</p>
              </div>
            </div>
            <form className="grid gap-4 sm:grid-cols-2" onSubmit={(event) => { event.preventDefault(); notify("Profil admin berhasil diperbarui."); }}>
              <Field label="Nama" defaultValue="Admin Rafi" />
              <Field label="Email" type="email" defaultValue="admin@carikostkita.id" />
              <Field label="Password saat ini" type="password" placeholder="Masukkan password" />
              <Field label="Password baru" type="password" placeholder="Minimal 8 karakter" />
              <PrimaryButton type="submit"><Save size={18} /><span>Simpan Perubahan</span></PrimaryButton>
              <button type="button" onClick={() => notify("Sesi admin ditutup.")} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[#D8AAA1] bg-[#FFF7F1] px-4 font-extrabold text-[#6D0808]">
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </form>
          </Panel>
        )}
      </main>

      {modalKost !== null && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#211D1A8A] p-4">
          <div className="relative w-full max-w-2xl rounded-lg bg-[#FBF8EE] p-6 shadow-2xl">
            <IconButton label="Tutup" onClick={() => setModalKost(null)}>
              <X size={18} />
            </IconButton>
            <h2 className="mb-5 mt-3 text-2xl font-extrabold">{modalKost.id ? "Edit Kost" : "Tambah Kost"}</h2>
            <form onSubmit={saveKost} className="grid gap-4 sm:grid-cols-2">
              <input type="hidden" name="id" defaultValue={modalKost.id || ""} />
              <Field label="Nama Kost" name="name" defaultValue={modalKost.name || ""} required />
              <Field label="Harga Sewa" name="price" type="number" defaultValue={modalKost.price || ""} required />
              <Field label="Kecamatan" name="area" defaultValue={modalKost.area || ""} required />
              <Field label="Pemilik" name="owner" defaultValue={modalKost.owner || ""} required />
              <label className="grid gap-2 text-sm font-extrabold text-[#706861] sm:col-span-2">
                Alamat
                <textarea name="address" rows={3} defaultValue={modalKost.address || ""} required className="rounded-lg border border-[#D8D0BB] bg-[#FFFDF6] p-3 text-[#211D1A] outline-[#6D0808]" />
              </label>
              <label className="grid gap-2 text-sm font-extrabold text-[#706861]">
                Status
                <select name="status" defaultValue={modalKost.status || "Menunggu Verifikasi"} className="h-10 rounded-lg border border-[#D8D0BB] bg-[#FFFDF6] px-3 text-[#211D1A] outline-[#6D0808]">
                  <option>Menunggu Verifikasi</option>
                  <option>Aktif</option>
                  <option>Ditolak</option>
                  <option>Nonaktif</option>
                </select>
              </label>
              <div className="flex items-end justify-end gap-2 sm:col-span-2">
                <GhostButton onClick={() => setModalKost(null)}>Batal</GhostButton>
                <PrimaryButton type="submit"><Save size={18} /><span>Simpan</span></PrimaryButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && <div className="fixed bottom-5 right-5 z-50 max-w-[calc(100vw-40px)] rounded-lg border border-[#D8D0BB] bg-[#6D0808] px-4 py-3 font-extrabold text-[#EEEAD7] shadow-xl">{toast}</div>}
    </div>
  );
}

function PanelTitle({ eyebrow, title }) {
  return (
    <div>
      <p className="mb-1 text-xs font-extrabold uppercase text-[#6D0808]">{eyebrow}</p>
      <h2 className="text-xl font-extrabold leading-tight">{title}</h2>
    </div>
  );
}

function DataTable({ headers, children }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] border-collapse">
        <thead>
          <tr>{headers.map((header) => <th key={header} className="border-b border-[#D8D0BB] px-3 py-3 text-left text-xs font-extrabold uppercase text-[#706861]">{header}</th>)}</tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function Td({ children, colSpan }) {
  return <td colSpan={colSpan} className="border-b border-[#D8D0BB] px-3 py-3 align-middle text-sm">{children}</td>;
}

function Field({ label, name, type = "text", defaultValue = "", placeholder = "", required = false }) {
  return (
    <label className="grid gap-2 text-sm font-extrabold text-[#706861]">
      {label}
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        className="h-10 rounded-lg border border-[#D8D0BB] bg-[#FFFDF6] px-3 text-[#211D1A] outline-[#6D0808]"
      />
    </label>
  );
}
