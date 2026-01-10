export type Mode = 'mock' | 'test' | 'production';

export interface WorkflowConfig {
  id: string;
}

export interface EnvironmentConfig {
  baseURL: string;
  token: string;
  workflow: WorkflowConfig;
}

export interface MockConfig {
  enabled: boolean;
}

export interface Config {
  mode: Mode;
  mock: MockConfig;
  test: EnvironmentConfig;
  production: EnvironmentConfig;
}
