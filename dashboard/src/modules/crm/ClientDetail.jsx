import { Tabs } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { statusLabels, statusVariants, typeLabels } from './lib/mockData'
import { ArrowLeft, Mail, Phone, MapPin, FileText, StickyNote, Activity, User } from 'lucide-react'

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2 py-2">
      <Icon className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value || '—'}</p>
      </div>
    </div>
  )
}

function ContactsTab({ contacts, clientId }) {
  const clientContacts = contacts.filter((c) => c.clientId === clientId)
  if (!clientContacts.length) return <p className="text-sm text-muted-foreground py-4">Nenhum contato vinculado.</p>
  return (
    <div className="space-y-2">
      {clientContacts.map((c) => (
        <div key={c.id} className="flex items-center justify-between rounded-md border border-border p-3">
          <div>
            <p className="text-sm font-medium">{c.name}</p>
            <p className="text-xs text-muted-foreground">{c.position} · {c.email}</p>
          </div>
          <div className="flex gap-1">
            {c.tags.map((t) => <Badge key={t} variant="outline" className="text-xs">{t}</Badge>)}
          </div>
        </div>
      ))}
    </div>
  )
}

function NotesTab({ notes, contactId }) {
  const contactNotes = notes.filter((n) => n.contactId === contactId)
  if (!contactNotes.length) return <p className="text-sm text-muted-foreground py-4">Nenhuma nota registrada.</p>
  return (
    <div className="space-y-2">
      {contactNotes.map((n) => (
        <div key={n.id} className="rounded-md border border-border p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium">{n.author}</span>
            <span className="text-xs text-muted-foreground">{new Date(n.created).toLocaleDateString('pt-BR')}</span>
          </div>
          <p className="text-sm">{n.content}</p>
        </div>
      ))}
    </div>
  )
}

function ActivitiesTab({ activities, contactId }) {
  const contactActivities = activities.filter((a) => a.contactId === contactId)
  if (!contactActivities.length) return <p className="text-sm text-muted-foreground py-4">Nenhuma atividade registrada.</p>
  return (
    <div className="space-y-2">
      {contactActivities.map((a) => (
        <div key={a.id} className="flex gap-3 rounded-md border border-border p-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
            <Activity className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-medium">{a.description}</p>
            <p className="text-xs text-muted-foreground capitalize">{a.type} · {new Date(a.created).toLocaleDateString('pt-BR')}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function ClientDetail({ client, contacts, notes, activities, onBack, onEdit }) {
  if (!client) return null
  const firstContact = contacts.find((c) => c.clientId === client.id)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Button>
        <Button variant="outline" size="sm" onClick={onEdit}>Editar</Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold">{client.name}</h2>
              <p className="text-sm text-muted-foreground">{typeLabels[client.type]} · {client.document}</p>
            </div>
            <Badge variant={statusVariants[client.status]}>{statusLabels[client.status]}</Badge>
          </div>
          {client.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {client.tags.map((t) => <Badge key={t} variant="outline">{t}</Badge>)}
            </div>
          )}
        </CardHeader>
      </Card>

      <Tabs
        tabs={[
          { value: 'info', label: 'Dados' },
          { value: 'contacts', label: 'Contatos' },
          { value: 'notes', label: 'Notas' },
          { value: 'activities', label: 'Atividades' },
        ]}
      >
        {(active) => (
          <Card>
            <CardContent className="pt-4">
              {active === 'info' && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <p className="mb-2 text-sm font-medium">Contato</p>
                    <InfoRow icon={Mail} label="Email" value={client.email} />
                    <InfoRow icon={Phone} label="Telefone" value={client.phone} />
                  </div>
                  <div>
                    <p className="mb-2 text-sm font-medium">Endereço</p>
                    <InfoRow icon={MapPin} label="Endereço" value={`${client.address.street}, ${client.address.number}`} />
                    <InfoRow icon={MapPin} label="Cidade" value={`${client.address.city} - ${client.address.state}`} />
                    <InfoRow icon={MapPin} label="CEP" value={client.address.zip} />
                  </div>
                  {client.type === 'PJ' && (
                    <div className="sm:col-span-2">
                      <p className="mb-2 text-sm font-medium">Dados Fiscais</p>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <InfoRow icon={FileText} label="Insc. Estadual" value={client.fiscal.inscricao_estadual} />
                        <InfoRow icon={FileText} label="Insc. Municipal" value={client.fiscal.inscricao_municipal} />
                        <InfoRow icon={FileText} label="Regime" value={client.fiscal.regime_tributario} />
                      </div>
                    </div>
                  )}
                </div>
              )}
              {active === 'contacts' && <ContactsTab contacts={contacts} clientId={client.id} />}
              {active === 'notes' && <NotesTab notes={notes} contactId={firstContact?.id} />}
              {active === 'activities' && <ActivitiesTab activities={activities} contactId={firstContact?.id} />}
            </CardContent>
          </Card>
        )}
      </Tabs>
    </div>
  )
}
