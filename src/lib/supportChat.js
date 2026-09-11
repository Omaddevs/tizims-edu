export const SUPPORT_CHAT_EVENT = 'tizims:open-support-chat'

export function openSupportChat() {
  window.dispatchEvent(new CustomEvent(SUPPORT_CHAT_EVENT))
}

export function formatFileSize(bytes = 0) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function isImageAttachment(file) {
  return String(file?.type || '').startsWith('image/')
}

const MAX_BYTES = 4 * 1024 * 1024

export function readAttachment(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('Fayl tanlanmadi'))
      return
    }
    if (file.size > MAX_BYTES) {
      reject(new Error('Fayl 4 MB dan oshmasin'))
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      resolve({
        id: `att_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
        name: file.name,
        type: file.type || 'application/octet-stream',
        size: file.size,
        dataUrl: reader.result,
      })
    }
    reader.onerror = () => reject(new Error('Faylni o‘qib bo‘lmadi'))
    reader.readAsDataURL(file)
  })
}
