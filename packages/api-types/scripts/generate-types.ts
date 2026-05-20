import openapiTS, { astToString } from 'openapi-typescript';
import * as fs from 'fs';
import * as path from 'path';

async function generate() {
  const openapiPath = path.resolve(process.cwd(), '../../uniconnect_g3_backend/uniconnect-backend/gateway/openapi.json');
  const outputDir = path.resolve(process.cwd(), 'src/generated');
  const outputPath = path.join(outputDir, 'openapi.d.ts');

  console.log(`Leyendo OpenAPI spec desde: ${openapiPath}`);
  
  if (!fs.existsSync(openapiPath)) {
    console.error('El archivo openapi.json no existe. Asegúrate de compilar el Gateway primero.');
    process.exit(1);
  }

  // Create generated folder if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  try {
    const openapiData = JSON.parse(fs.readFileSync(openapiPath, 'utf8'));
    const ast = await openapiTS(openapiData);
    const output = astToString(ast);
    fs.writeFileSync(outputPath, output);
    console.log(`Tipos generados exitosamente en: ${outputPath}`);
  } catch (error) {
    console.error('Error generando tipos OpenAPI:', error);
    process.exit(1);
  }
}

generate();
