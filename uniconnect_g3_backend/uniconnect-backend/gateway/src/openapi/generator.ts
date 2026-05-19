import * as fs from 'fs';
import * as path from 'path';
import { OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import { registry } from './registry';



// Read dynamic SemVer version from package.json
const packageJsonPath = path.join(__dirname, '../../package.json');
let version = '1.0.0';
try {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  version = packageJson.version || '1.0.0';
} catch (e) {
  console.warn('Could not read package.json version, using fallback version 1.0.0');
}

const generator = new OpenApiGeneratorV3(registry.definitions);

const openApiSpec = generator.generateDocument({
  openapi: '3.0.0',
  info: {
    title: 'UniConnect API',
    version,
    description: 'Documentación oficial y viva de los contratos API para UniConnect Monorepo G3',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'API Gateway',
    },
  ],
});

const outputPath = path.join(__dirname, '../../openapi.json');
fs.writeFileSync(outputPath, JSON.stringify(openApiSpec, null, 2), 'utf8');
console.log(`OpenAPI specification successfully generated and written to ${outputPath}`);
