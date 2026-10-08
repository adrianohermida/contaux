import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Valida CPF/CNPJ com dígito verificador
 * Protege contra duplicação
 */
Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }

    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const { document, type, tenantId, excludeClientId } = await req.json();

    if (!document || !type || !tenantId) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    // Validação de dígitos verificadores
    const isValid = type === 'cpf' 
      ? validateCPF(document) 
      : validateCNPJ(document);

    if (!isValid) {
      return new Response(JSON.stringify({ 
        valid: false, 
        message: `${type.toUpperCase()} inválido` 
      }), { status: 200 });
    }

    // Verificar duplicação
    const cleanDocument = document.replace(/\D/g, '');
    const query = type === 'cpf' 
      ? { cpf: cleanDocument, tenant_id: tenantId }
      : { cnpj: cleanDocument, tenant_id: tenantId };

    const existing = await base44.asServiceRole.entities.Client.filter(query);

    if (existing.length > 0) {
      // Se há ID para excluir (edit), permitir se for do mesmo cliente
      if (excludeClientId && existing[0].id === excludeClientId) {
        return new Response(JSON.stringify({ valid: true }), { status: 200 });
      }
      return new Response(JSON.stringify({ 
        valid: false, 
        message: `${type.toUpperCase()} já cadastrado no sistema` 
      }), { status: 200 });
    }

    return new Response(JSON.stringify({ valid: true }), { status: 200 });

  } catch (error) {
    console.error('Erro ao validar documento:', error);
    return new Response(JSON.stringify({ 
      error: 'Erro na validação',
      details: error.message 
    }), { status: 500 });
  }
});

/**
 * Valida CPF com dígito verificador
 * Formato: XXX.XXX.XXX-XX
 */
function validateCPF(cpf) {
  const clean = cpf.replace(/\D/g, '');
  
  // Validações básicas
  if (clean.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(clean)) return false; // Todos iguais
  
  // Primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(clean[i]) * (10 - i);
  }
  let digit1 = 11 - (sum % 11);
  digit1 = digit1 >= 10 ? 0 : digit1;
  
  if (parseInt(clean[9]) !== digit1) return false;
  
  // Segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(clean[i]) * (11 - i);
  }
  let digit2 = 11 - (sum % 11);
  digit2 = digit2 >= 10 ? 0 : digit2;
  
  return parseInt(clean[10]) === digit2;
}

/**
 * Valida CNPJ com dígito verificador
 * Formato: XX.XXX.XXX/XXXX-XX
 */
function validateCNPJ(cnpj) {
  const clean = cnpj.replace(/\D/g, '');
  
  // Validações básicas
  if (clean.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(clean)) return false; // Todos iguais
  
  // Primeiro dígito verificador
  let sum = 0;
  const multiplier1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  for (let i = 0; i < 12; i++) {
    sum += parseInt(clean[i]) * multiplier1[i];
  }
  let digit1 = 11 - (sum % 11);
  digit1 = digit1 >= 10 ? 0 : digit1;
  
  if (parseInt(clean[12]) !== digit1) return false;
  
  // Segundo dígito verificador
  sum = 0;
  const multiplier2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  for (let i = 0; i < 13; i++) {
    sum += parseInt(clean[i]) * multiplier2[i];
  }
  let digit2 = 11 - (sum % 11);
  digit2 = digit2 >= 10 ? 0 : digit2;
  
  return parseInt(clean[13]) === digit2;
}