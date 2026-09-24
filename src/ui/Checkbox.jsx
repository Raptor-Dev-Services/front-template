// Checkbox - casilla con su etiqueta. La <label> ENVUELVE al input: asi el texto entero es area de clic
// y el nombre accesible sale solo, sin depender de que alguien acierte con un htmlFor.
export function Checkbox({ id, label, description, className = '', ...rest }) {
  return (
    <label htmlFor={id} className={`flex min-h-11 cursor-pointer items-start gap-3 ${className}`}>
      <input id={id} type="checkbox" className="ui-checkbox mt-0.5 shrink-0" {...rest} />
      <span className="text-sm">
        <span className="text-content">{label}</span>
        {description ? <span className="mt-0.5 block text-muted">{description}</span> : null}
      </span>
    </label>
  )
}

export default Checkbox
