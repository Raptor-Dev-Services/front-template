/** El secreto TOTP en grupos de 4, que es como se teclea en una app autenticadora sin perderse. */
export function groupSecret(secret = '') {
  return secret.replace(/\s+/g, '').match(/.{1,4}/g)?.join(' ') ?? ''
}
