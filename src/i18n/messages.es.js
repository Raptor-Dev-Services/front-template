// messages.es.js - diccionario de i18n en espanol (idioma por defecto: viaja en el chunk principal).
//
// Regla: MISMO set de claves que messages.en.js. Una clave a medias se pinta en el idioma por
// defecto, que es peor que no tenerla, porque nadie la ve faltar (lo vigila paridadDeIdiomas.test.js).
// Las variables van con {llave} y se interpolan pasando un objeto a t(); nunca se concatena texto.

export const es = {
  app: {
    name: 'front-template',
    tagline: 'Plantilla de cliente web',
    skipToContent: 'Saltar al contenido principal',
    version: 'Version {version}',
  },
  nav: {
    label: 'Navegacion principal',
    home: 'Inicio',
    users: 'Usuarios',
    openMenu: 'Abrir menu',
    closeMenu: 'Cerrar menu',
    logout: 'Cerrar sesion',
  },
  theme: {
    toggle: 'Cambiar tema',
    toLight: 'Activar tema claro',
    toDark: 'Activar tema oscuro',
  },
  locale: {
    label: 'Idioma',
    es: 'Espanol',
    en: 'English',
    short: { es: 'ES', en: 'EN' },
  },
  common: {
    loading: 'Cargando...',
    retry: 'Reintentar',
    cancel: 'Cancelar',
    close: 'Cerrar',
    save: 'Guardar',
    working: 'Trabajando...',
    backHome: 'Volver al inicio',
    actions: 'Acciones',
    required: 'obligatorio',
    showPassword: 'Mostrar contrasena',
    hidePassword: 'Ocultar contrasena',
    // Fallos que genera el propio cliente (src/api/client.js, API_ERROR_KEYS). El mensaje del backend
    // no pasa por aqui: se muestra tal cual.
    errorNetwork: 'No pudimos conectar con el servidor. Revisa tu conexion e intenta de nuevo.',
    errorTimeout: 'El servidor tardo demasiado en responder. Intenta de nuevo.',
    errorUnexpected: 'Ocurrio un error inesperado.',
    errorOperationFailed: 'No se pudo completar la operacion.',
    errorSessionExpired: 'Tu sesion termino. Vuelve a iniciar sesion.',
    errorForbidden: 'Tu cuenta no tiene permiso para esta accion. Pidele el acceso a un administrador.',
  },
  notification: {
    close: 'Cerrar aviso',
    region: 'Avisos',
  },
  errorBoundary: {
    eyebrow: 'Error inesperado',
    title: 'Algo se rompio en esta pantalla',
    body: 'No fue algo que hicieras tu. Recarga la pagina; si vuelve a pasar, comparte el detalle de abajo con soporte.',
    noDetail: 'Error sin detalle disponible.',
    reload: 'Recargar pagina',
  },
  notFound: {
    eyebrow: 'Error 404',
    title: 'Esta pagina no existe',
    body: 'Puede que el enlace este mal escrito o que la pagina se haya movido.',
  },
  auth: {
    title: 'Inicia sesion',
    subtitle: 'Entra con tu correo y contrasena.',
    email: 'Correo electronico',
    emailPlaceholder: 'usuario@empresa.com',
    password: 'Contrasena',
    rememberMe: 'Mantener la sesion en este equipo',
    submit: 'Iniciar sesion',
    submitting: 'Iniciando sesion...',
    errors: {
      emailRequired: 'Escribe tu correo.',
      emailInvalid: 'El correo no tiene un formato valido.',
      passwordRequired: 'Escribe tu contrasena.',
      twoFactorUnsupported: 'Esta cuenta tiene verificacion en dos pasos, que esta plantilla todavia no soporta.',
    },
  },
  home: {
    title: 'Bienvenido',
    greeting: 'Hola, {name}',
    subtitle: 'Este es el panel de ejemplo de la plantilla. Sustituye esta pantalla por la de tu producto.',
    usersTitle: 'Modulo de ejemplo',
    usersBody: 'Listado paginado de usuarios contra el back-template: estados de carga, vacio y error, edicion, baja con confirmacion y exportacion a CSV.',
    usersCta: 'Ver usuarios',
    chassisTitle: 'Lo que ya trae el armazon',
    chassisBody: 'Cliente HTTP con refresh de sesion, guardas por permiso, i18n es/en, tema claro/oscuro, limites de error y primitivas accesibles.',
  },
  users: {
    title: 'Usuarios',
    subtitle: 'Perfiles de usuario del tenant de tu sesion.',
    loading: 'Cargando usuarios',
    loadError: 'No pudimos cargar los usuarios',
    emptyTitle: 'Aun no hay usuarios',
    emptyHint: 'Cuando se registren usuarios en este tenant apareceran aqui.',
    tableCaption: 'Usuarios del tenant',
    you: 'Tu',
    col: {
      name: 'Nombre',
      status: 'Estado',
      created: 'Creado',
      updated: 'Actualizado',
      actions: 'Acciones',
    },
    status: {
      active: 'Activo',
      inactive: 'Inactivo',
    },
    actions: {
      menu: 'Acciones para {name}',
      edit: 'Editar',
      disable: 'Dar de baja',
    },
    pagination: {
      label: 'Paginacion de usuarios',
      info: 'Pagina {page} de {pageCount} - {total} usuarios',
      prev: 'Anterior',
      next: 'Siguiente',
    },
    edit: {
      title: 'Editar usuario',
      hint: 'Corrige el nombre con el que aparece este usuario.',
      fullName: 'Nombre completo',
      fullNameRequired: 'Escribe el nombre completo.',
      submit: 'Guardar cambios',
      done: 'Se actualizo a {name}.',
    },
    disable: {
      title: 'Dar de baja a {name}',
      body: 'El usuario dejara de poder iniciar sesion. Su historial se conserva.',
      confirm: 'Dar de baja',
      done: 'Se dio de baja a {name}.',
    },
    export: {
      button: 'Exportar CSV',
      exporting: 'Exportando...',
      fileName: 'usuarios',
      error: 'No se pudo exportar: {message}',
    },
  },
}

export default es
