import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Detect duplicate contacts based on:
 * - Exact email match
 * - Exact CNPJ/CPF match
 * - Similar company name (fuzzy matching)
 */

function normalizeString(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, '')
    .trim();
}

function calculateSimilarity(str1, str2) {
  const norm1 = normalizeString(str1);
  const norm2 = normalizeString(str2);
  
  if (norm1 === norm2) return 1;
  
  // Levenshtein distance
  const matrix = [];
  for (let i = 0; i <= norm2.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= norm1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= norm2.length; i++) {
    for (let j = 1; j <= norm1.length; j++) {
      if (norm2.charAt(i - 1) === norm1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  const maxLen = Math.max(norm1.length, norm2.length);
  return 1 - (matrix[norm2.length][norm1.length] / maxLen);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { workspace_id, contact_id, threshold = 0.85 } = await req.json();

    if (!workspace_id) {
      return Response.json({ error: 'workspace_id is required' }, { status: 400 });
    }

    // Get all contacts in workspace
    const allContacts = await base44.entities.Client.filter({ tenant_id: workspace_id });

    // If contact_id provided, find duplicates for that specific contact
    let targetContacts = allContacts;
    if (contact_id) {
      const targetContact = allContacts.find(c => c.id === contact_id);
      if (!targetContact) {
        return Response.json({ error: 'Contact not found' }, { status: 404 });
      }
      targetContacts = [targetContact];
    }

    const duplicates = [];

    for (const contact of targetContacts) {
      const matches = [];

      for (const otherContact of allContacts) {
        if (contact.id === otherContact.id) continue;

        let matchScore = 0;
        let matchReasons = [];

        // Exact email match (100% duplicate)
        if (contact.email && otherContact.email && 
            contact.email.toLowerCase() === otherContact.email.toLowerCase()) {
          matchScore = 1;
          matchReasons.push('email_exact');
        }

        // Exact document match (100% duplicate)
        if (contact.cnpj && otherContact.cnpj && contact.cnpj === otherContact.cnpj) {
          matchScore = 1;
          matchReasons.push('cnpj_exact');
        }
        if (contact.cpf && otherContact.cpf && contact.cpf === otherContact.cpf) {
          matchScore = 1;
          matchReasons.push('cpf_exact');
        }

        // Fuzzy name match
        if (contact.company_name && otherContact.company_name) {
          const nameSimilarity = calculateSimilarity(contact.company_name, otherContact.company_name);
          if (nameSimilarity >= threshold) {
            matchScore = Math.max(matchScore, nameSimilarity);
            matchReasons.push(`name_similar_${Math.round(nameSimilarity * 100)}%`);
          }
        }

        // Phone match
        if (contact.phone && otherContact.phone) {
          const phone1 = contact.phone.replace(/\D/g, '');
          const phone2 = otherContact.phone.replace(/\D/g, '');
          if (phone1 === phone2 && phone1.length > 0) {
            matchScore = Math.max(matchScore, 0.9);
            matchReasons.push('phone_exact');
          }
        }

        if (matchScore >= threshold) {
          matches.push({
            contact_id: otherContact.id,
            company_name: otherContact.company_name,
            email: otherContact.email,
            match_score: Math.round(matchScore * 100) / 100,
            match_reasons: matchReasons,
          });
        }
      }

      if (matches.length > 0) {
        duplicates.push({
          contact_id: contact.id,
          company_name: contact.company_name,
          email: contact.email,
          matches: matches.sort((a, b) => b.match_score - a.match_score),
        });
      }
    }

    return Response.json({
      workspace_id,
      total_contacts: allContacts.length,
      duplicates_found: duplicates.length,
      duplicates: duplicates,
    });
  } catch (error) {
    console.error('Error detecting duplicates:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});