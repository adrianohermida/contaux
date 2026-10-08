export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validateCPF = (cpf) => {
  if (!cpf?.trim()) return false;
  const clean = cpf.replace(/\D/g, '');
  if (clean.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(clean)) return false;
  let sum = 0;
  let remainder;
  for (let i = 1; i <= 9; i++) sum += parseInt(clean.substring(i - 1, i)) * (11 - i);
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(clean.substring(9, 10))) return false;
  sum = 0;
  for (let i = 1; i <= 10; i++) sum += parseInt(clean.substring(i - 1, i)) * (12 - i);
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  return remainder === parseInt(clean.substring(10, 11));
};

export const validateCNPJ = (cnpj) => {
  if (!cnpj?.trim()) return false;
  const clean = cnpj.replace(/\D/g, '');
  if (clean.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(clean)) return false;
  let size = clean.length - 2;
  let numbers = clean.substring(0, size);
  const digits = clean.substring(size);
  let sum = 0;
  let pos = size - 7;
  for (let i = size; i >= 1; i--) {
    sum += numbers.charAt(size - i) * pos--;
    if (pos < 2) pos = 9;
  }
  let result = sum % 11 < 2 ? 0 : 11 - sum % 11;
  if (result !== parseInt(digits.charAt(0))) return false;
  size = size + 1;
  numbers = clean.substring(0, size);
  sum = 0;
  pos = size - 7;
  for (let i = size; i >= 1; i--) {
    sum += numbers.charAt(size - i) * pos--;
    if (pos < 2) pos = 9;
  }
  result = sum % 11 < 2 ? 0 : 11 - sum % 11;
  return result === parseInt(digits.charAt(1));
};

export const validatePhone = (phone) => {
  if (!phone) return true;
  const clean = phone.replace(/\D/g, '');
  return clean.length >= 10 && clean.length <= 11;
};

export const validateCEP = (cep) => {
  if (!cep) return true;
  return /^\d{5}-?\d{3}$/.test(cep);
};

export const formatCPF = (value) => {
  return value
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{2})$/, '$1-$2');
};

export const formatCNPJ = (value) => {
  return value
    .replace(/\D/g, '')
    .slice(0, 14)
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
};

export const formatPhone = (value) => {
  const clean = value.replace(/\D/g, '');
  if (clean.length <= 10) {
    return clean.replace(/(\d{2})(\d{4})(\d)/, '($1) $2-$3');
  }
  return clean.replace(/(\d{2})(\d{5})(\d)/, '($1) $2-$3');
};

export const formatCEP = (value) => {
  return value.replace(/\D/g, '').slice(0, 8).replace(/(\d{5})(\d)/, '$1-$2');
};

export const validateContactForm = (data) => {
   const errors = {};

   if (!data.company_name?.trim()) {
     errors.company_name = 'Nome da empresa é obrigatório';
   }

   if (!data.email?.trim()) {
     errors.email = 'Email é obrigatório';
   } else if (!validateEmail(data.email)) {
     errors.email = 'Email inválido';
   }

   if (data.client_type === 'pf') {
     if (!data.cpf?.trim()) {
       errors.cpf = 'CPF é obrigatório';
     } else if (!validateCPF(data.cpf)) {
       errors.cpf = 'CPF inválido';
     }
   } else {
     if (!data.cnpj?.trim()) {
       errors.cnpj = 'CNPJ é obrigatório';
     } else if (!validateCNPJ(data.cnpj)) {
       errors.cnpj = 'CNPJ inválido';
     }
   }

   if (data.phone && !validatePhone(data.phone)) {
     errors.phone = 'Telefone inválido';
   }

   if (data.cep && !validateCEP(data.cep)) {
     errors.cep = 'CEP inválido';
   }

   return errors;
 };

export const validateEmailUniqueness = async (base44, email, currentContactId = null, workspaceId) => {
  if (!email || !workspaceId) return true;
  
  try {
    const contacts = await base44.entities.Client.filter({ 
      tenant_id: workspaceId,
      email: email 
    });
    
    // Check if email exists in another contact
    const duplicate = contacts.find(c => c.id !== currentContactId);
    return !duplicate;
  } catch (error) {
    console.error('Error checking email uniqueness:', error);
    return true; // Allow save on error to avoid blocking
  }
};