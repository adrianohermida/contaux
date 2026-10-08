import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Levenshtein distance algorithm
function levenshteinDistance(a, b) {
  const aLower = a.toLowerCase().trim();
  const bLower = b.toLowerCase().trim();
  
  if (aLower === bLower) return 0;
  
  const matrix = [];
  for (let i = 0; i <= bLower.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= aLower.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= bLower.length; i++) {
    for (let j = 1; j <= aLower.length; j++) {
      const cost = bLower[i - 1] === aLower[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i][j - 1] + 1,
        matrix[i - 1][j] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  
  return matrix[bLower.length][aLower.length];
}

// Calculate similarity score (0-100)
function calculateSimilarity(a, b) {
  const maxLen = Math.max(a.length, b.length);
  const distance = levenshteinDistance(a, b);
  return Math.round(((maxLen - distance) / maxLen) * 100);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get workspace_id from request body
    const { workspace_id } = await req.json();

    if (!workspace_id) {
      return Response.json({ error: 'workspace_id required' }, { status: 400 });
    }

    // Verify user has access to workspace
    if (user.workspace_id !== workspace_id) {
      return Response.json({ error: 'Workspace access denied' }, { status: 403 });
    }

    // Fetch all contacts in workspace
    const contacts = await base44.entities.Client.filter({ tenant_id: workspace_id });

    if (contacts.length === 0) {
      return Response.json({ duplicates: [], totalFound: 0 });
    }

    const duplicates = [];
    const checked = new Set();
    const SIMILARITY_THRESHOLD = 85;

    // Check each contact against others
    for (let i = 0; i < contacts.length; i++) {
      for (let j = i + 1; j < contacts.length; j++) {
        const pair = [contacts[i].id, contacts[j].id].sort().join('-');
        
        if (checked.has(pair)) continue;
        checked.add(pair);

        const c1 = contacts[i];
        const c2 = contacts[j];
        
        let similarity = 0;
        let reason = '';
        
        // 1. Exact email match
        if (c1.email && c2.email && c1.email.toLowerCase() === c2.email.toLowerCase()) {
          similarity = 100;
          reason = 'Email idêntico';
        }
        // 2. Exact CNPJ/CPF match
        else if (
          c1.client_type === 'pj' && c2.client_type === 'pj' &&
          c1.cnpj && c2.cnpj && c1.cnpj === c2.cnpj
        ) {
          similarity = 100;
          reason = 'CNPJ idêntico';
        }
        else if (
          c1.client_type === 'pf' && c2.client_type === 'pf' &&
          c1.cpf && c2.cpf && c1.cpf === c2.cpf
        ) {
          similarity = 100;
          reason = 'CPF idêntico';
        }
        // 3. Fuzzy name matching
        else if (c1.company_name && c2.company_name) {
          const nameSimilarity = calculateSimilarity(c1.company_name, c2.company_name);
          
          // Phone match as secondary indicator
          let phoneMatch = false;
          if (c1.phone && c2.phone && c1.phone === c2.phone) {
            phoneMatch = true;
          }
          
          if (nameSimilarity >= SIMILARITY_THRESHOLD) {
            similarity = nameSimilarity;
            reason = phoneMatch ? 'Nome similar + Telefone' : 'Nome similar';
          }
        }
        
        // Only add if similarity is high enough
        if (similarity >= SIMILARITY_THRESHOLD) {
          duplicates.push({
            contact1: {
              id: c1.id,
              name: c1.company_name,
              email: c1.email,
              phone: c1.phone,
              document: c1.client_type === 'pj' ? c1.cnpj : c1.cpf,
            },
            contact2: {
              id: c2.id,
              name: c2.company_name,
              email: c2.email,
              phone: c2.phone,
              document: c2.client_type === 'pj' ? c2.cnpj : c2.cpf,
            },
            similarity,
            reason,
          });
        }
      }
    }

    return Response.json({
      duplicates: duplicates.sort((a, b) => b.similarity - a.similarity),
      totalFound: duplicates.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in scanDuplicates:', error);
    return Response.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
});