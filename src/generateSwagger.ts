import fs from 'fs';
import path from 'path';
import { swaggerSpec } from './swagger';

const outputPath = path.resolve(__dirname, 'swagger-output.json');

fs.writeFileSync(outputPath, `${JSON.stringify(swaggerSpec, null, 2)}\n`, 'utf-8');
console.log(`✅ Swagger OpenAPI spec generated at ${outputPath}`);
