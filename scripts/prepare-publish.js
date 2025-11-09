import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

const packages = ['reactivity', 'utils', 'compiler', 'core', 'router'];
const packageVersions = {};
const originalDeps = {};

// Сначала читаем все версии
for (const pkg of packages) {
  const packagePath = join(rootDir, 'packages', pkg, 'package.json');
  const packageJson = JSON.parse(readFileSync(packagePath, 'utf-8'));
  packageVersions[packageJson.name] = packageJson.version;
  // Сохраняем оригинальные зависимости
  if (packageJson.dependencies) {
    originalDeps[packageJson.name] = { ...packageJson.dependencies };
  }
}

// Затем заменяем workspace:* на версии
for (const pkg of packages) {
  const packagePath = join(rootDir, 'packages', pkg, 'package.json');
  const packageJson = JSON.parse(readFileSync(packagePath, 'utf-8'));
  
  let changed = false;
  
  // Заменяем в dependencies
  if (packageJson.dependencies) {
    for (const [dep, version] of Object.entries(packageJson.dependencies)) {
      if (version === 'workspace:*' && packageVersions[dep]) {
        packageJson.dependencies[dep] = `^${packageVersions[dep]}`;
        changed = true;
      }
    }
  }
  
  if (changed) {
    writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n', 'utf-8');
    console.log(`✓ Updated ${pkg} dependencies`);
  }
}

// Сохраняем оригинальные зависимости для восстановления
const restorePath = join(rootDir, 'scripts', '.restore-deps.json');
writeFileSync(restorePath, JSON.stringify(originalDeps, null, 2), 'utf-8');

console.log('✓ All packages prepared for publishing');

