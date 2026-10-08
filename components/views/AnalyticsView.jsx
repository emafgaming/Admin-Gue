"use client";

import { useState } from "react";
import { useStats } from "../AppContext";
import { ChartCanvas } from "../charts";
import { PeriodSelect } from "./DashboardView";
import { StatCard } from "./AdsView";
import { ErrorState, ExportMenu, LoadingState, Panel, PanelTitle, SkeletonCard, SkeletonChart } from "../ui";
import { formatNumber } from "@/lib/format";
import { PERIODS } from "@/lib/constants";

export function AnalyticsView() {
  const [period, setPeriod] = useState("bulanan");
  const { stats, loading, error, retry } = useStats(period);
  if (error && !stats) return <Panel><ErrorState message={error} onRetry={retry} /></Panel>;
  if (!stats) return (
    <div className="space-y-4">
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4">
        <SkeletonCard count={8} />
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <SkeletonChart height={220} />
        <SkeletonChart height={220} />
        <SkeletonChart height={220} />
        <SkeletonChart height={220} />
      </div>
    </div>
  );

  const t = stats.totals;
  const periodLabel = PERIODS.find(([v]) => v === period)[1];
  // Baris export statistik: satu baris per periode.
  const rows = stats.kostGrowth.labels.map((label, i) => ({
    label, kost: stats.kostGrowth.values[i], users: stats.userGrowth.values[i], owners: stats.ownerGrowth.values[i], impressions: stats.ads.series.impressions[i], clicks: stats.ads.series.clicks[i],
  }));
  const columns = [
    { label: "Periode", value: (r) => r.label }, { label: "Kost Baru", value: (r) => r.kost }, { label: "Pengguna Baru", value: (r) => r.users }, { label: "Pemilik Baru", value: (r) => r.owners },
    { label: "Impression Iklan", value: (r) => r.impressions }, { label: "Click Iklan", value: (r) => r.clicks },
  ];

  return (
    <div className={`space-y-4 ${loading ? "opacity-70" : ""}`}>
      <div className="flex flex-wrap items-center justify-end gap-2">
        <PeriodSelect value={period} onChange={setPeriod} />
        <ExportMenu name="Statistik" title="Statistik Platform" columns={columns} rows={rows} filters={[`Periode: ${periodLabel}`]} />
      </div>
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4">
        <StatCard label="Total Pengguna" value={formatNumber(t.users)} />
        <StatCard label="Total Pemilik" value={formatNumber(t.owners)} />
        <StatCard label="Total Kost / Aktif" value={`${t.kost} / ${t.kostActive}`} />
        <StatCard label="Total Laporan" value={formatNumber(t.reports)} />
        <StatCard label="Impression Iklan" value={formatNumber(stats.ads.impressions)} />
        <StatCard label="Click Iklan" value={formatNumber(stats.ads.clicks)} />
        <StatCard label="CTR Iklan" value={`${stats.ads.ctr.toFixed(2)}%`} />
        <StatCard label="Iklan Aktif" value={t.adsActive} />
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <Panel><PanelTitle eyebrow="Kost" title={`Pertumbuhan Kost (${periodLabel})`} /><ChartCanvas labels={stats.kostGrowth.labels} values={stats.kostGrowth.values} /></Panel>
        <Panel><PanelTitle eyebrow="Pengguna" title="Pertumbuhan Pengguna" /><ChartCanvas labels={stats.userGrowth.labels} values={stats.userGrowth.values} color="#64705F" /></Panel>
        <Panel><PanelTitle eyebrow="Pemilik" title="Pertumbuhan Pemilik" /><ChartCanvas labels={stats.ownerGrowth.labels} values={stats.ownerGrowth.values} color="#3F6475" /></Panel>
        <Panel><PanelTitle eyebrow="Laporan" title="Status Laporan" /><ChartCanvas type="donut" data={stats.reportStatus} /></Panel>
        <Panel><PanelTitle eyebrow="Status" title="Kost Berdasarkan Status" /><ChartCanvas type="donut" data={stats.kostStatus} /></Panel>
        <Panel><PanelTitle eyebrow="Wilayah" title="Kost Berdasarkan Lokasi" /><ChartCanvas labels={Object.keys(stats.kostArea)} values={Object.values(stats.kostArea)} color="#A8782F" /></Panel>
      </div>
      <Panel>
        <PanelTitle eyebrow="Iklan" title="Impression & Click" />
        <ChartCanvas type="line" labels={stats.ads.series.labels} series={[{ name: "Impression", values: stats.ads.series.impressions, color: "#6D0808" }, { name: "Click", values: stats.ads.series.clicks, color: "#3F6475" }]} />
      </Panel>
    </div>
  );
}
