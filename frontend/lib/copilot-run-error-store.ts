type Listener = () => void

let snapshot: string | null = null
const listeners = new Set<Listener>()

function emit() {
  listeners.forEach((l) => {
    l()
  })
}

function subscribeCopilotRunError(listener: Listener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function getCopilotRunErrorSnapshot() {
  return snapshot
}

function publishCopilotRunError(message: string) {
  snapshot = message
  emit()
}

function clearCopilotRunError() {
  snapshot = null
  emit()
}

export {
  clearCopilotRunError,
  getCopilotRunErrorSnapshot,
  publishCopilotRunError,
  subscribeCopilotRunError,
}
