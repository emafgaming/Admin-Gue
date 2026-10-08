import { NextResponse } from "next/server";
import { HttpError } from "./auth.js";

const NO_STORE = { "Cache-Control": "no-store, max-age=0" };

export const ok = (data, status = 200, headers = {}) => NextResponse.json(data, { status, headers: { ...NO_STORE, ...headers } });

export async function readBody(request) {
  try {
    return await request.json();
  } catch {
    throw new HttpError(400, "Body permintaan tidak valid.");
  }
}

/** Membungkus handler agar HttpError menjadi respons JSON yang konsisten. */
export function handle(fn, extraHeaders = {}) {
  return async (request, context) => {
    try {
      return await fn(request, context);
    } catch (error) {
      if (error instanceof HttpError) {
        return NextResponse.json({ error: error.message, fields: error.fields || null }, { status: error.status, headers: { ...NO_STORE, ...extraHeaders } });
      }
      console.error(error);
      return NextResponse.json({ error: "Terjadi kesalahan pada server." }, { status: 500, headers: { ...NO_STORE, ...extraHeaders } });
    }
  };
}
