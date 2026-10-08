/**
 * Mapeamento de roles do sistema para labels em português.
 * Compartilhado entre Header, Admin, Portal e qualquer lugar que exiba o role do usuário.
 */
export const roleLabels = {
  superadmin: 'Super Admin',
  admin: 'Administrador',
  accountant: 'Contador',
  viewer: 'Visualizador',
  client: 'Cliente',
}

export const roleVariants = {
  superadmin: 'default',
  admin: 'default',
  accountant: 'secondary',
  viewer: 'outline',
  client: 'outline',
}

export function getRoleLabel(role) {
  return roleLabels[role] || role || ''
}
