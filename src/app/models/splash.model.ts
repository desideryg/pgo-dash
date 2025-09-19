export interface SplashData {
  application: string;
  health: string;
  description: string;
  version: string;
  timestamp: string;
}

export interface SplashResponse {
  status: boolean;
  statusCode: number;
  message: string;
  data: SplashData;
}
