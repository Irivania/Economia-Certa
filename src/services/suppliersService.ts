import { uppercaseText } from '@/lib/text';

export async function fetchCepData(cep: string, signal?: AbortSignal) {
  const rawValue = cep.replace(/\D/g, '');
  if (rawValue.length !== 8) return null;

  const res = await fetch(`/api/proxy/cnpj?cep=${rawValue}`, { signal });
  const data = await res.json();
  if (!res.ok || data.erro) return null;

  return uppercaseText(
    `${data.street || data.logradouro || ''}, Bairro: ${data.neighborhood || data.bairro || ''}, ${data.city || data.localidade || ''}\n${data.state || data.uf || ''}`
  );
}

export async function fetchCnpjData(cnpj: string, signal?: AbortSignal) {
  const rawValue = cnpj.replace(/\D/g, '');
  if (rawValue.length !== 14) return null;

  const res = await fetch(`/api/proxy/cnpj?cnpj=${rawValue}`, { signal });
  const data = await res.json();
  if (!res.ok || data.message) return null;

  return {
    name: data.nome_fantasia || data.razao_social ? uppercaseText(data.nome_fantasia || data.razao_social) : '',
    cep: data.cep || '',
    address: data.logradouro ? uppercaseText(`${data.logradouro}, Nº ${data.numero || 'S/N'}, Bairro: ${data.bairro || ''}, ${data.municipio}\n${data.uf}`) : '',
    phone: data.ddd_telefone_1 || '',
    email: data.email ? data.email.toLowerCase() : '',
  };
}