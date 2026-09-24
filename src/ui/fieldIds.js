// Vive aparte de FieldLabel.jsx para que ese modulo solo exporte componentes (react-refresh).

/** ids de hint/error y el aria-describedby que los une al control. */
export function describedByFor(id, { hint, error }) {
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  return { hintId, errorId, describedBy: [hintId, errorId].filter(Boolean).join(' ') || undefined }
}
