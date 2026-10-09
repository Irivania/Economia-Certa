import { NextRequest } from 'next/server';

export interface CompanySession {
  userId: string;
  companyId: string;
  email: string;
  name: string;
  role: 'admin' | 'gerente' | 'supervisor' | 'geral';
}

export function requireCompanySession(request: NextRequest): CompanySession {
  try {
    // 1. Tenta ler o cabeçalho personalizado enviado pelo cliente (frontend atualizado)
    const customSessionHeader = request.headers.get('x-company-session');
    if (customSessionHeader) {
      const parsed = JSON.parse(customSessionHeader);
      if (parsed && parsed.companyId && parsed.userId) {
        return parsed as CompanySession;
      }
    }

    // 2. Tenta ler a sessão através dos cookies se o cabeçalho não estiver presente
    const cookieHeader = request.headers.get('cookie');
    if (cookieHeader) {
      // Procura pelo cookie de sessão correspondente se aplicável no teu projeto
      const cookies = Object.fromEntries(
        cookieHeader.split('; ').map((c) => {
          const [key, ...v] = c.split('=');
          return [key, decodeURIComponent(v.join('='))];
        })
      );

      if (cookies['melo_company_session']) {
        const parsedCookie = JSON.parse(cookies['melo_company_session']);
        if (parsedCookie && parsedCookie.companyId) {
          return parsedCookie as CompanySession;
        }
      }
    }

    // 3. Se nenhum método de autenticação for válido, rejeita com UNAUTHORIZED
    throw new Error('UNAUTHORIZED: Sessão inválida ou não fornecida no servidor.');
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : 'UNAUTHORIZED: Sessão inválida ou não fornecida no servidor.'
    );
  }
}