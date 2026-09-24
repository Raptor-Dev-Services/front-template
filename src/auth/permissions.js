// permissions.js - catalogo de permisos que el FRONT consulta (claims `permission` del JWT).
//
// Un solo sitio para los nombres: una guarda de ruta, un item de menu y un boton de accion citan la
// misma constante, asi que renombrar un permiso no deja a medias la mitad de la UI.
//
// Los valores tienen que coincidir con el catalogo de permisos del backend. Ocultar una opcion aqui
// es UX, no seguridad: el backend vuelve a autorizar cada request.
export const PERMISSIONS = Object.freeze({
  usersRead: 'users.read',
  usersManage: 'users.manage',
})

export default PERMISSIONS
