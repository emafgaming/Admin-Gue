"use client";

import { useEffect, useRef, useState } from "react";

const palette = ["#6D0808", "#64705F", "#A8782F", "#9B5549", "#3F6475"];
const cssVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

/**
 * Chart berbasis canvas (tanpa dependensi tambahan), responsive & mengikuti tema.
 * type: "bar" | "line" | "donut"
 * - bar/line: labels + (values | series[{name, values, color}])
 * - donut: data = { label: jumlah }
 */
export function ChartCanvas({ type = "bar", labels = [], values, series, data, color = "#6D0808", height = 270 }) {
  const ref = useRef(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const redraw = () => setTick((t) => t + 1);
    const canvas = ref.current;
    const ro = new ResizeObserver(redraw);
    if (canvas?.parentElement) ro.observe(canvas.parentElement);
    const mo = new MutationObserver(redraw);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => {
      ro.disconnect();
      mo.disconnect();
    };
  }, []);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    if (!width) return;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    const ink = cssVar("--ink");
    const muted = cssVar("--muted");
    const line = cssVar("--line");
    const paper = cssVar("--paper");
    const font = "700 12px 'Plus Jakarta Sans', sans-serif";
    ctx.font = font;

    const empty = (msg) => {
      ctx.fillStyle = muted;
      ctx.textAlign = "center";
      ctx.fillText(msg, width / 2, height / 2);
    };

    if (type === "donut") {
      const entries = Object.entries(data || {});
      const total = entries.reduce((s, [, v]) => s + v, 0);
      if (!total) return empty("Belum ada data");
      const legendRows = Math.ceil(entries.length / 2);
      const chartH = height - legendRows * 22 - 14;
      const cx = width / 2;
      const cy = chartH / 2 + 6;
      const radius = Math.max(30, Math.min(width / 2 - 10, chartH / 2 - 6));
      let start = -Math.PI / 2;
      entries.forEach(([, v], i) => {
        const angle = (v / total) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, start, start + angle);
        ctx.closePath();
        ctx.fillStyle = palette[i % palette.length];
        ctx.fill();
        start += angle;
      });
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.58, 0, Math.PI * 2);
      ctx.fillStyle = paper;
      ctx.fill();
      ctx.fillStyle = ink;
      ctx.textAlign = "center";
      ctx.font = "800 22px 'Plus Jakarta Sans', sans-serif";
      ctx.fillText(String(total), cx, cy + 2);
      ctx.font = font;
      ctx.fillStyle = muted;
      ctx.fillText("total", cx, cy + 18);
      ctx.textAlign = "left";
      entries.forEach(([label, v], i) => {
        const x = 8 + (i % 2) * (width / 2);
        const y = height - legendRows * 22 + Math.floor(i / 2) * 22 + 6;
        ctx.fillStyle = palette[i % palette.length];
        ctx.fillRect(x, y - 10, 10, 10);
        ctx.fillStyle = ink;
        ctx.fillText(`${label} ${v}`, x + 16, y);
      });
      return;
    }

    const all = series || [{ name: "", values: values || [], color }];
    const max = Math.max(...all.flatMap((s) => s.values), 1);
    if (!labels.length || !all.some((s) => s.values.some((v) => v > 0))) return empty("Belum ada data pada periode ini");
    const padL = 38;
    const padR = 12;
    const padT = series ? 28 : 14;
    const padB = 30;
    const chartW = width - padL - padR;
    const chartH = height - padT - padB;

    ctx.textAlign = "right";
    for (let i = 0; i <= 3; i += 1) {
      const y = padT + (chartH / 3) * i;
      ctx.strokeStyle = line;
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(width - padR, y);
      ctx.stroke();
      ctx.fillStyle = muted;
      const v = max - (max / 3) * i;
      ctx.fillText(v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(Math.round(v)), padL - 6, y + 4);
    }

    const step = chartW / labels.length;
    const skip = Math.ceil(labels.length / Math.max(1, Math.floor(chartW / 46)));
    ctx.textAlign = "center";
    labels.forEach((l, i) => {
      if (i % skip) return;
      ctx.fillStyle = ink;
      ctx.fillText(String(l).slice(0, 10), padL + step * i + step / 2, height - 10);
    });

    if (type === "line") {
      all.forEach((s, si) => {
        const col = s.color || palette[si % palette.length];
        ctx.strokeStyle = col;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        s.values.forEach((v, i) => {
          const x = padL + step * i + step / 2;
          const y = padT + chartH - (v / max) * chartH;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();
        ctx.fillStyle = col;
        s.values.forEach((v, i) => {
          ctx.beginPath();
          ctx.arc(padL + step * i + step / 2, padT + chartH - (v / max) * chartH, 3.5, 0, Math.PI * 2);
          ctx.fill();
        });
      });
    } else {
      const group = all.length;
      const barW = Math.max(4, Math.min(48, (step - 10) / group));
      all.forEach((s, si) => {
        s.values.forEach((v, i) => {
          const h = (v / max) * (chartH - 2);
          const x = padL + step * i + (step - barW * group) / 2 + si * barW;
          ctx.fillStyle = series ? s.color || palette[si % palette.length] : i % 2 ? "#64705F" : s.color;
          ctx.fillRect(x, padT + chartH - h, barW - (group > 1 ? 2 : 0), h);
          if (!series && barW >= 18 && v > 0) {
            ctx.fillStyle = ink;
            ctx.fillText(String(v), x + barW / 2, padT + chartH - h - 4);
          }
        });
      });
    }

    if (series) {
      ctx.textAlign = "left";
      let x = padL;
      all.forEach((s, si) => {
        ctx.fillStyle = s.color || palette[si % palette.length];
        ctx.fillRect(x, 8, 10, 10);
        ctx.fillStyle = ink;
        ctx.fillText(s.name, x + 15, 17);
        x += ctx.measureText(s.name).width + 36;
      });
    }
  }, [type, labels, values, series, data, color, height, tick]);

  return <canvas ref={ref} style={{ height }} role="img" aria-label="Grafik data" />;
}
