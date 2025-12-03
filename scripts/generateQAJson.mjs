#!/usr/bin/env node
/**
 * generateQAJson.mjs
 * 
 * Script para generar JSON de QA a partir de SQLite.
 * Se ejecuta automáticamente en el build de Vercel.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import DAL from '../lib/database/dal.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const JSON_OUTPUT_PATH = path.join(__dirname, '..', 'public', 'data', 'qa-data.json');
const DATA_DIR = path.dirname(JSON_OUTPUT_PATH);

/**
 * Genera JSON desde SQLite
 */
async function generateJsonFromSQLite() {
  try {
    // Verificar que el directorio de salida existe
    if (!fs.existsSync(DATA_DIR)) {
      console.log(`📁 Creando directorio: ${DATA_DIR}`);
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    console.log(`📊 Generando JSON desde SQLite...`);

    // Obtener datos desde DAL
    const qaData = await DAL.getFullQAData();

    // Agregar metadata
    const outputData = {
      metadata: {
        version: '1.0',
        source: 'sqlite',
        generatedAt: new Date().toISOString(),
      },
      ...qaData,
    };

    // Guardar JSON
    fs.writeFileSync(JSON_OUTPUT_PATH, JSON.stringify(outputData, null, 2));
    console.log(`✅ JSON generado exitosamente: ${path.relative(process.cwd(), JSON_OUTPUT_PATH)}`);
    console.log(`   Tamaño: ${(fs.statSync(JSON_OUTPUT_PATH).size / 1024).toFixed(2)} KB`);

    return true;
  } catch (error) {
    console.error(`❌ Error generando JSON:`, error.message);
    console.error(error);
    return false;
  }
}

// Ejecutar si se llama directamente
(async () => {
  const success = await generateJsonFromSQLite();
  process.exit(success ? 0 : 1);
})();

export { generateJsonFromSQLite };
