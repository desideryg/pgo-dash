import { ProxyConfig } from '@angular-devkit/build-angular';

const proxyConfig: ProxyConfig = {
  "/api/*": {
    // "target": "http://localhost:8080",
    "target": "https://pgo-api.otapp.live",
    "secure": true,
    "changeOrigin": true,
    "logLevel": "debug"
  }
};

export default proxyConfig;
