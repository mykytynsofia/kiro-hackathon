export const environment = {
  production: false,
  // Use window.location.hostname to automatically connect to the same host
  // This allows both localhost and network IP connections to work
  websocketUrl: `ws://${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}:8080`
};
