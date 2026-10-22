// ─────────────────────────────────────────────────────────────
// Único lugar del frontend que toca el almacenamiento del navegador.
//
// ¿Por qué sessionStorage y no localStorage?
//  - sessionStorage sobrevive a F5 pero se borra al cerrar la pestaña,
//    así que el token vive menos tiempo expuesto.
//  - Lo más seguro sería una cookie httpOnly, pero el contrato del backend
//    usa "Authorization: Bearer", por lo que el token debe ser legible por JS.
//  - Ningún almacenamiento del navegador es inmune a XSS: por eso en React
//    nunca usamos dangerouslySetInnerHTML y el token dura solo 8 h.
// ─────────────────────────────────────────────────────────────
const TOKEN_KEY = 'conciliaya.token';
const USER_KEY = 'conciliaya.user';

export const tokenStorage = {
  getToken: () => sessionStorage.getItem(TOKEN_KEY),

  getUser() {
    try {
      return JSON.parse(sessionStorage.getItem(USER_KEY));
    } catch {
      return null; // JSON corrupto → tratamos como sin sesión
    }
  },

  saveSession(token, user) {
    sessionStorage.setItem(TOKEN_KEY, token);
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  clear() {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  },
};

// Un JWT son 3 partes en base64: header.payload.firma. El campo "exp" del payload
// es la fecha de expiración (en segundos). Esto es solo para mejorar la UX:
// la validación REAL del token la hace siempre el backend.
export function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return !payload.exp || payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}
