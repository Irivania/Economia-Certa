import { NextResponse, NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cnpj = searchParams.get("cnpj");
    const cep = searchParams.get("cep");

    if (cnpj) {
      const cleanCnpj = cnpj.replace(/\D/g, "");
      if (cleanCnpj.length !== 14) {
        return NextResponse.json({ error: "CNPJ inválido" }, { status: 400 });
      }

      const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`, {
        headers: {
          "User-Agent": "EconomiaCerta-ERP/1.0",
        },
      });

      if (!response.ok) {
        return NextResponse.json({ error: "CNPJ não encontrado na base pública." }, { status: 404 });
      }

      const data = await response.json();
      return NextResponse.json(data);
    }

    if (cep) {
      const cleanCep = cep.replace(/\D/g, "");
      if (cleanCep.length !== 8) {
        return NextResponse.json({ error: "CEP inválido" }, { status: 400 });
      }

      const response = await fetch(`https://brasilapi.com.br/api/cep/v2/${cleanCep}`, {
        headers: {
          "User-Agent": "EconomiaCerta-ERP/1.0",
        },
      });

      if (!response.ok) {
        return NextResponse.json({ error: "CEP não encontrado." }, { status: 404 });
      }

      const data = await response.json();
      return NextResponse.json(data);
    }

    return NextResponse.json({ error: "Parâmetro inválido" }, { status: 400 });
  } catch (error) {
    console.error("Erro no proxy de consulta:", error);
    return NextResponse.json({ error: "Falha ao comunicar com o serviço externo." }, { status: 500 });
  }
}