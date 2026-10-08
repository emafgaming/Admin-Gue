"use client";

import { useEffect, useMemo, useState } from "react";
import { History } from "lucide-react";
import { useApp } from "../AppContext";
import { Badge, EmptyState, ExportMenu, FilterBar, Pagination, Panel, PanelTitle, selectCls, usePagination } from "../ui";
import { formatDateTime, inRange } from "@/lib/format";

export function AuditView() {
  const { data } = useApp();
  const [search, setSearch] = useState("");
  const [object, setObject] = useState("Semua Objek");
  const [status, setStatus] = useState("Semua Status");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const objects = useMemo(() => ["Semua Objek", ...new Set(data.audit.map((a) => a.object))], [data.audit]);

  const hasActiveFilters = object !== "Semua Objek" || status !== "Semua Status" || Boolean(from) || Boolean(to) || Boolean(search);
  const resetFilters = () => {
    setObject("Semua Objek");
    setStatus("Semua Status");
    setFrom("");
    setTo("");
    setSearch("");
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return data.audit.filter(
      (a) =>
        (object === "Semua Objek" || a.object === object) &&
        (status === "Semua Status" || a.status === status) &&
        inRange(new Date(a.time).toLocaleDateString("sv-SE"), from, to) &&
        (!q || [a.adminName, a.activity, a.target].some((v) => String(v).toLowerCase().includes(q))),
    );
  }, [data.audit, object, status, from, to, search]);

  const pager = usePagination(filtered, 10);
  useEffect(() => pager.reset(), [object, status, from, to, search]); // eslint-disable-line react-hooks/exhaustive-deps

  const filters = [
    object !== "Semua Objek" && `Objek: ${object}`,
    status !== "Semua Status" && `Status: ${status}`,
    from && `Dari: ${from}`,
    to && `Sampai: ${to}`,
    search && `Pencarian: "${search}"`,
  ].filter(Boolean);

  const columns = [
    { label: "Admin", value: (a) => a.adminName },
    { label: "Aktivitas", value: (a) => a.activity },
    { label: "Target", value: (a) => a.target },
    { label: "Waktu", value: (a) => formatDateTime(a.time) },
    { label: "Status", value: (a) => a.status },
  ];

  return (
    <div className="space-y-4">
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari admin, aktivitas, target..."
        extraFilters={
          <>
            <label className="flex items-center gap-1.5 text-xs font-bold text-muted">
              <span>Dari:</span>
              <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} aria-label="Dari tanggal" className={`${selectCls} !h-8 text-xs`} />
            </label>
            <label className="flex items-center gap-1.5 text-xs font-bold text-muted">
              <span>Sampai:</span>
              <input type="date" value={to} onChange={(e) => setTo(e.target.value)} aria-label="Sampai tanggal" className={`${selectCls} !h-8 text-xs`} />
            </label>
          </>
        }
        extraCount={Boolean(from) + Boolean(to)}
        hasActiveFilters={hasActiveFilters}
        onReset={resetFilters}
        actions={<ExportMenu name="Audit_Log" title="Audit Log" columns={columns} rows={filtered} filters={filters} />}
      >
        <select value={object} onChange={(e) => setObject(e.target.value)} aria-label="Filter objek" className={selectCls}>
          {objects.map((o) => <option key={o}>{o}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter status" className={selectCls}>
          <option>Semua Status</option>
          <option>Sukses</option>
          <option>Gagal</option>
        </select>
      </FilterBar>

      <Panel>
        <div className="mb-4">
          <PanelTitle eyebrow="Keamanan" title="Riwayat Aktivitas Admin" />
        </div>
        <div className="grid gap-3">
          {pager.slice.length ? pager.slice.map((a) => (
            <article key={a.id} className="grid grid-cols-[40px_minmax(0,1fr)] gap-3 border-b border-line pb-3 last:border-b-0">
              <div className={`grid h-10 w-10 place-items-center rounded-lg text-[#EEEAD7] ${a.status === "Gagal" ? "bg-clay" : "bg-maroon"}`}>
                <History size={17} />
              </div>
              <div className="min-w-0">
                <strong className="break-words">{a.activity}</strong>
                <p className="text-sm text-muted">{a.adminName} · {a.target} · {formatDateTime(a.time)}</p>
                <div className="mt-1"><Badge status={a.status} /></div>
              </div>
            </article>
          )) : (
            <EmptyState title="Belum ada aktivitas" message="Aktivitas yang sesuai filter tidak ditemukan." onReset={hasActiveFilters ? resetFilters : undefined} />
          )}
        </div>
        <Pagination pager={pager} />
      </Panel>
    </div>
  );
}
