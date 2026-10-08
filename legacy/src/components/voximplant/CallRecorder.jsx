/**
 * Gerencia gravação de chamadas
 * Captura áudio/vídeo das chamadas e armazena localmente
 */
export class CallRecorder {
  constructor() {
    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.isRecording = false;
    this.recordingStartTime = null;
  }

  /**
   * Iniciar gravação
   */
  startRecording(stream) {
    try {
      if (this.isRecording) return false;

      const mimeType = this.getSupportedMimeType();
      if (!mimeType) {
        console.error('Nenhum MIME type suportado para gravação');
        return false;
      }

      this.recordedChunks = [];
      this.mediaRecorder = new MediaRecorder(stream, { mimeType });
      this.recordingStartTime = new Date();

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      this.mediaRecorder.onerror = (error) => {
        console.error('Erro durante gravação:', error);
        this.isRecording = false;
      };

      this.mediaRecorder.start();
      this.isRecording = true;
      return true;
    } catch (error) {
      console.error('Erro ao iniciar gravação:', error);
      return false;
    }
  }

  /**
   * Parar gravação e retornar blob
   */
  stopRecording() {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || !this.isRecording) {
        resolve(null);
        return;
      }

      this.mediaRecorder.onstop = () => {
        const mimeType = this.getSupportedMimeType();
        const blob = new Blob(this.recordedChunks, { type: mimeType });
        this.isRecording = false;
        resolve(blob);
      };

      this.mediaRecorder.stop();
    });
  }

  /**
   * Obter duração da gravação em segundos
   */
  getRecordingDuration() {
    if (!this.recordingStartTime) return 0;
    return Math.floor((new Date() - this.recordingStartTime) / 1000);
  }

  /**
   * Verificar se está gravando
   */
  isCurrentlyRecording() {
    return this.isRecording;
  }

  /**
   * Obter MIME type suportado
   */
  getSupportedMimeType() {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/mpeg',
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }

    return null;
  }

  /**
   * Fazer download do arquivo gravado
   */
  downloadRecording(blob, filename = 'recording') {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const mimeType = this.getSupportedMimeType();
    const ext = mimeType?.includes('webm') ? 'webm' : 'mp4';
    link.download = `${filename}.${ext}`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Cleanup
   */
  cleanup() {
    if (this.mediaRecorder) {
      if (this.isRecording) {
        this.mediaRecorder.stop();
      }
      this.mediaRecorder = null;
    }
    this.recordedChunks = [];
    this.isRecording = false;
  }
}

export default CallRecorder;