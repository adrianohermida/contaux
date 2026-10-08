/**
 * Similarity & Deduplication utilities
 * Fuzzy matching and duplicate detection
 */

/**
 * Levenshtein distance - measure string similarity (0-100%)
 */
export function levenshteinDistance(str1, str2) {
  const s1 = (str1 || '').toLowerCase().trim();
  const s2 = (str2 || '').toLowerCase().trim();
  
  if (s1 === s2) return 100;
  if (!s1 || !s2) return 0;
  
  const len1 = s1.length;
  const len2 = s2.length;
  const d = Array(len1 + 1).fill(0).map(() => Array(len2 + 1).fill(0));
  
  for (let i = 0; i <= len1; i++) d[i][0] = i;
  for (let j = 0; j <= len2; j++) d[0][j] = j;
  
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1,
        d[i][j - 1] + 1,
        d[i - 1][j - 1] + cost
      );
    }
  }
  
  const maxLen = Math.max(len1, len2);
  const similarity = ((maxLen - d[len1][len2]) / maxLen) * 100;
  return Math.round(similarity);
}

/**
 * Extract name parts for better matching
 */
function normalizeContactName(name) {
  return (name || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * Calculate weighted similarity score
 */
export function calculateContactSimilarity(contact1, contact2) {
  if (!contact1 || !contact2) return 0;
  
  const scores = [];
  
  // Company name (40% weight)
  const nameScore = levenshteinDistance(contact1.company_name, contact2.company_name);
  scores.push({ weight: 0.4, value: nameScore });
  
  // Email domain (30% weight)
  const email1Domain = (contact1.email || '').split('@')[1] || '';
  const email2Domain = (contact2.email || '').split('@')[1] || '';
  const emailScore = email1Domain && email2Domain 
    ? levenshteinDistance(email1Domain, email2Domain) 
    : 0;
  scores.push({ weight: 0.3, value: emailScore });
  
  // Phone similarity (20% weight)
  const phone1 = (contact1.phone || '').replace(/\D/g, '').slice(-7);
  const phone2 = (contact2.phone || '').replace(/\D/g, '').slice(-7);
  const phoneScore = phone1 && phone2 && phone1 === phone2 ? 100 : 0;
  scores.push({ weight: 0.2, value: phoneScore });
  
  // CNPJ/CPF (10% weight)
  const docScore = contact1.cnpj === contact2.cnpj || contact1.cpf === contact2.cpf ? 100 : 0;
  scores.push({ weight: 0.1, value: docScore });
  
  const totalScore = scores.reduce((sum, s) => sum + (s.value * s.weight), 0);
  return Math.round(totalScore);
}

/**
 * Find potential duplicates in contact list
 */
export function findDuplicates(contacts, threshold = 70) {
  const duplicates = [];
  const checked = new Set();
  
  for (let i = 0; i < contacts.length; i++) {
    for (let j = i + 1; j < contacts.length; j++) {
      const key = `${contacts[i].id}-${contacts[j].id}`;
      if (checked.has(key)) continue;
      
      const score = calculateContactSimilarity(contacts[i], contacts[j]);
      
      if (score >= threshold) {
        duplicates.push({
          id: `${contacts[i].id}-${contacts[j].id}`,
          contact1: contacts[i],
          contact2: contacts[j],
          score,
          severity: score >= 90 ? 'high' : score >= 80 ? 'medium' : 'low',
        });
      }
      
      checked.add(key);
    }
  }
  
  return duplicates.sort((a, b) => b.score - a.score);
}

/**
 * Merge two contacts intelligently
 */
export function mergeContacts(contact1, contact2, primaryId) {
  const primary = primaryId === contact1.id ? contact1 : contact2;
  const secondary = primaryId === contact1.id ? contact2 : contact1;
  
  return {
    company_name: primary.company_name || secondary.company_name,
    email: primary.email || secondary.email,
    phone: primary.phone || secondary.phone,
    client_type: primary.client_type || secondary.client_type,
    cnpj: primary.cnpj || secondary.cnpj,
    cpf: primary.cpf || secondary.cpf,
    endereco: primary.endereco || secondary.endereco,
    numero: primary.numero || secondary.numero,
    complemento: primary.complemento || secondary.complemento,
    bairro: primary.bairro || secondary.bairro,
    cidade: primary.cidade || secondary.cidade,
    uf: primary.uf || secondary.uf,
    cep: primary.cep || secondary.cep,
    status: primary.status || secondary.status,
    currency: primary.currency || secondary.currency,
  };
}