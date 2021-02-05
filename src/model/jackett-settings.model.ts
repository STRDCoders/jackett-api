export interface IJackettSettings {
  selfSignedSSL: boolean;
  connectionSettings: IJackettUrlSetting;
}

export interface IJackettUrlSetting {
  apiKey: string;
  baseUrl: string;
}
