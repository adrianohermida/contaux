/**
 * Lookup de CEP via API ViaCEP (https://viacep.com.br)
 */

export async function lookupCEP(cep) {
  const clean = cep.replace(/\D/g, '')
  if (clean.length !== 8) return null

  try {
    const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`)
    const data = await res.json()
    if (data.erro) return null
    return {
      street: data.logradouro || '',
      neighborhood: data.bairro || '',
      city: data.localidade || '',
      state: data.uf || '',
      zip: formatCEP(clean),
    }
  } catch {
    return null
  }
}

function formatCEP(cep) {
  return cep.replace(/(\d{5})(\d{3})/, '$1-$2')
}
