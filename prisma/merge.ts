import fs from 'fs';
import path from 'path';

const base = fs.readFileSync(path.join(__dirname, 'base.prisma'), 'utf-8');

const modelsDir = path.join(__dirname, 'models');
const modelFiles = fs.existsSync(modelsDir)
  ? fs
      .readdirSync(modelsDir)
      .filter((f) => f.endsWith('.prisma'))
      .map((f) => fs.readFileSync(path.join(modelsDir, f), 'utf-8'))
  : [];

const finalSchema = [base, ...modelFiles].join('\n\n');

fs.writeFileSync(path.join(__dirname, 'schema.prisma'), finalSchema);
console.log('✅ schema.prisma generated!');
