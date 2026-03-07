import { build } from 'esbuild';

build({
  entryPoints: ['../back/src/server.ts'],
  bundle: true,
  platform: 'node',
  target: 'node18',
  outfile: 'dist-back/server.cjs',
  external: ['better-sqlite3', 'puppeteer', 'kysely', 'uuid', 'fastify', '@fastify/cors'],
  format: 'cjs',
}).catch(() => process.exit(1));