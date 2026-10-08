import { useState, useRef, useCallback, useEffect } from 'react'
import { Mic, Square } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * Entrada por voz opcional (CQ-06).
 * Usa a Web Speech API (SpeechRecognition) para transcrever fala em texto.
 * Preenche o campo de rascunho do assistente.
 *
 * Funciona apenas em navegadores compatíveis (Chrome, Edge, Safari 14+).
 * Em navegadores sem suporte, o botão fica oculto.
 */
export default function VoiceInput({ onTranscript, disabled }) {
  const [listening, setListening] = useState(false)
  const [supported, setSupported] = useState(false)
  const recognitionRef = useRef(null)

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      setSupported(true)
      const recognition = new SpeechRecognition()
      recognition.lang = 'pt-BR'
      recognition.continuous = true
      recognition.interimResults = false

      recognition.onresult = (event) => {
        let transcript = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript
        }
        if (transcript) onTranscript(transcript)
      }

      recognition.onerror = (event) => {
        console.warn('[voice] Erro:', event.error)
        setListening(false)
      }

      recognition.onend = () => {
        setListening(false)
      }

      recognitionRef.current = recognition
    }

    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop() } catch { /* ignora */ }
      }
    }
  }, [onTranscript])

  const toggle = useCallback(() => {
    if (!recognitionRef.current) return
    if (listening) {
      recognitionRef.current.stop()
      setListening(false)
    } else {
      try {
        recognitionRef.current.start()
        setListening(true)
      } catch {
        setListening(false)
      }
    }
  }, [listening])

  if (!supported) return null

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={toggle}
      disabled={disabled}
      className={`h-9 w-9 shrink-0 ${listening ? 'bg-red-500/10 text-red-500' : ''}`}
      title={listening ? 'Parar gravação' : 'Falar'}
    >
      {listening ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
    </Button>
  )
}
