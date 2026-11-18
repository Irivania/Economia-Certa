import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const RTC_API_URL =
  process.env.RTC_API_URL ||
  process.env.NEXT_PUBLIC_RTC_API_URL ||
  "http://127.0.0.1:8080/api";

async function proxy(request: NextRequest, path: string[]) {
  if (path.length === 0) {
    return NextResponse.json(
      { error: "Caminho da Calculadora RTC nao informado" },
      { status: 400 },
    );
  }

  const upstreamPath =
    path[0] === "calculadora" ? path : ["calculadora", ...path];
  const url = new URL(
    `${RTC_API_URL.replace(/\/$/, "")}/${upstreamPath
      .map((segment) => encodeURIComponent(segment))
      .join("/")}`,
  );

  const incomingUrl = new URL(request.url);
  incomingUrl.searchParams.forEach((value, key) => {
    url.searchParams.append(key, value);
  });

  try {
    const body =
      request.method === "GET" || request.method === "HEAD"
        ? undefined
        : await request.text();

    const response = await fetch(url.toString(), {
      method: request.method,
      headers: {
        "Content-Type":
          request.headers.get("content-type") || "application/json",
        Accept: request.headers.get("accept") || "application/json",
      },
      body,
      cache: "no-store",
    });

    const responseBody = await response.text();
    return new NextResponse(responseBody || null, {
      status: response.status,
      headers: {
        "Cache-Control": "no-store",
        "Content-Type":
          response.headers.get("content-type") || "application/json",
      },
    });
  } catch (error) {
    console.error("[RTC proxy] Falha ao comunicar com a calculadora:", error);
    return NextResponse.json(
      { error: "Calculadora RTC indisponivel" },
      { status: 502 },
    );
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  return proxy(request, path);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  return proxy(request, path);
}
