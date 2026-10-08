import { useRef, useState } from 'react'
import { Paperclip, FileText, Image, FileCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * Botão de anexar arquivos (CQ-06).
 * Valida tipo e tamanho no cliente antes de enviar.
 * Anexos são privados — acesso segue permissões da conversa.
 */
const MAX_SIZE = 10 * 1024 * 1024 // 10 MB

const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/csv',
  'application/zip',
]

const TYPE_ICONS = {
  'application/pdf': FileText,
  'image/': Image,
  'application/msword': FileText,
  'application/vnd.openxmlformats': FileText,
  'application/vnd.ms-excel': FileText,
  'text/': FileText,
  'application/zip': FileText,
}

function getIcon(mime) {
  for (const [prefix, Icon] of Object.entries(TYPE_ICONS)) {
    if (mime.startsWith(prefix)) return Icon
  }
  return FileCheck
}

export default function AttachmentButton({ onUpload, disabled }) {
  const inputRef = useRef(null)
  const [error, setError] = useState(null)

  const handleSelect = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = '' // reset para permitir re-selecionar
    if (!file) return

    setError(null)

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Tipo de arquivo não permitido')
      return
    }
    if (file.size > MAX_SIZE) {
      setError('Arquivo muito grande (máx 10 MB)')
      return
    }

    onUpload(file)
  }

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
        className="h-9 w-9 shrink-0"
        title="Anexar arquivo"
      >
        <Paperclip className="h-4 w-4" />
      </Button>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={handleSelect}
        accept={ALLOWED_TYPES.join(',')}
      />
      {error && (
        <span className="absolute bottom-14 left-2 rounded bg-destructive px-2 py-0.5 text-[10px] text-destructive-foreground">
          {error}
        </span>
      )}
    </>
  )
}

export { getIcon, MAX_SIZE, ALLOWED_TYPES }
