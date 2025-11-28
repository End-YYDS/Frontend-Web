import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input: 'https://127.0.0.1:50050/api-doc/openapi.json', // sign up at app.heyapi.dev
  output: 'src/api/openapi-client',
  plugins: ['@hey-api/client-axios'],
});
