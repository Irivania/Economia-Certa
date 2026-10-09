import { getCompanyId } from './companySession';

export async function apiFetch(url: string, options: RequestInit = {}) {
  const companyId = getCompanyId();
  const sessionData = typeof window !== 'undefined' ? sessionStorage.getItem('melo_company_session') : null;

  const separator = url.includes('?') ? '&' : '?';
  const finalUrl = companyId && !url.includes('companyId=') ? `${url}${separator}companyId=${companyId}` : url;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (sessionData) {
    headers['x-company-session'] = sessionData;
  }

  const res = await fetch(finalUrl, {
    ...options,
    headers,
    credentials: 'include',
  });

  return res;
}