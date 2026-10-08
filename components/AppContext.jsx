"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api";

const AppContext = createContext(null);
export const AppProvider = AppContext.Provider;
export const useApp = () => useContext(AppContext);

/** Mengambil statistik aktual dari server; refetch otomatis saat data berubah. */
export function useStats(period) {
  const { data } = useApp();
  const [state, setState] = useState({ stats: null, loading: true, error: "" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: "" }));
    api(`stats?period=${period}`)
      .then((res) => !cancelled && setState({ stats: res.stats, loading: false, error: "" }))
      .catch((e) => !cancelled && setState((s) => ({ ...s, loading: false, error: e.message })));
    return () => {
      cancelled = true;
    };
  }, [period, data, attempt]);

  return { ...state, retry: useCallback(() => setAttempt((n) => n + 1), []) };
}
