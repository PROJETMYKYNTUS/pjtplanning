/*export const environment = {
  production: false,
  apiUrl: 'http://localhost:5201/api'
};*/

export const environment = {
  production: true,
  // ✅ Vide car Nginx proxifie /api/ vers le backend
  apiUrl: '/api'
};