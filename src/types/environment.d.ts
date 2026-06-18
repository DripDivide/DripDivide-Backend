declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV?: 'development' | 'test' | 'production';
    PORT?: string;
    API_VERSION?: string;
    DATABASE_URL?: string;
    JWT_SECRET?: string;
  }
}
