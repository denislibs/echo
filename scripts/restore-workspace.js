import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

const packages = ['reactivity', 'utils', 'compiler', 'core', 'router'];
const restorePath = join(rootDir, 'scripts', '.restore-deps.json');

if (!existsSync(restorePath)) {
  console.log('No restore file found, skipping restore');
  process.exit(0);
}

const originalDeps = JSON.parse(readFileSync(restorePath, 'utf-8'));

// Восстанавливаем оригинальные зависимости
for (const pkg of packages) {
  const packagePath = join(rootDir, 'packages', pkg, 'package.json');
  const packageJson = JSON.parse(readFileSync(packagePath, 'utf-8'));
  
  if (packageJson.dependencies && originalDeps[packageJson.name]) {
    packageJson.dependencies = originalDeps[packageJson.name];
    writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n', 'utf-8');
    console.log(`✓ Restored ${pkg} dependencies`);
  }
}

// Удаляем файл восстановления
unlinkSync(restorePath);
console.log('✓ Workspace dependencies restored');

