// loadStatus.js - los estados de una carga de datos, en un solo sitio y con un solo nombre.
//
// La vista pinta los cuatro estados obligatorios con esto: `loading`, `error`, y sobre `success` decide
// entre vacio y contenido segun si la coleccion trae elementos. Nunca una pantalla en blanco.

export const LOAD_STATUS = Object.freeze({
  loading: 'loading',
  success: 'success',
  error: 'error',
})

export default LOAD_STATUS
