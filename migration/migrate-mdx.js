#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const glob = require('glob');

/**
 * Script para migrar archivos MDX de CodeHike v0 a v1
 * Convierte <CH.Code> a sintaxis estándar de codeblocks
 */

function migrateMDXFile(filePath) {
    console.log(`Procesando: ${filePath}`);
    
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    
    // Expresión regular para encontrar bloques <CH.Code>
    const chCodeRegex = /<CH\.Code[^>]*>([\s\S]*?)<\/CH\.Code>/g;
    
    content = content.replace(chCodeRegex, (match, innerContent) => {
        changed = true;
        
        // Extraer el bloque de código de dentro
        const codeBlockRegex = /```(\w+)?\s*([^`]*?)?\n([\s\S]*?)```/;
        const codeMatch = innerContent.match(codeBlockRegex);
        
        if (codeMatch) {
            const [, language = '', meta = '', code] = codeMatch;
            // Agregar meta "v1" para que CodeHike v1 lo procese
            const newMeta = meta.trim() ? `${meta.trim()} v1` : 'v1';
            
            return `\`\`\`${language} ${newMeta}\n${code}\`\`\``;
        }
        
        // Si no encontramos un bloque de código válido, devolver el contenido sin <CH.Code>
        return innerContent.trim();
    });
    
    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Migrado: ${filePath}`);
        return true;
    }
    
    return false;
}

function main() {
    const dataDir = path.join(__dirname, 'data');
    const pattern = path.join(dataDir, '**/*.mdx');
    
    console.log('🚀 Iniciando migración de archivos MDX...');
    console.log(`Buscando archivos en: ${pattern}`);
    
    const files = glob.sync(pattern);
    console.log(`Encontrados ${files.length} archivos MDX`);
    
    let migratedCount = 0;
    
    files.forEach(file => {
        if (migrateMDXFile(file)) {
            migratedCount++;
        }
    });
    
    console.log(`\n✨ Migración completada!`);
    console.log(`📄 Archivos procesados: ${files.length}`);
    console.log(`🔄 Archivos migrados: ${migratedCount}`);
    console.log(`\n🎯 Siguiente paso: Simplificar configuración para usar solo CodeHike v1`);
}

if (require.main === module) {
    main();
}
