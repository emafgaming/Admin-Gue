export const formatCurrency = (value) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value || 0);
export const formatNumber = (value) => new Intl.NumberFormat("id-ID").format(value || 0);

export const formatDate = (value) => {
  if (!value) return "-";
  const d = new Date(String(value).length === 10 ? `${value}T00:00:00` : value);
  return Number.isNaN(d.getTime()) ? "-" : d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
};

export const formatDateLong = (value = new Date()) => {
  if (!value) return "-";
  const d = new Date(String(value).length === 10 ? `${value}T00:00:00` : value);
  return Number.isNaN(d.getTime()) ? "-" : d.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
};

export const formatDateTime = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "-" : d.toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

export const timeAgo = (value) => {
  const diff = Math.max(0, Date.now() - new Date(value).getTime());
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Baru saja";
  if (m < 60) return `${m} menit lalu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} jam lalu`;
  const d = Math.floor(h / 24);
  return d < 7 ? `${d} hari lalu` : formatDate(value);
};

export const initials = (name = "") => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?";
export const todayString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
export const inRange = (dateValue, from, to) => {
  const d = String(dateValue).slice(0, 10);
  return (!from || d >= from) && (!to || d <= to);
};
