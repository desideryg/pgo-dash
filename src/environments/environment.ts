export const environment = {
  production: false,
  apiUrl: '/api', // This will be proxied to https://pgo-api.otapp.live/api
  enableDevAuth: true, // Enable development authentication bypass
  devCredentials: {
    username: 'developer',
    password: 'dev123'
  }
};
