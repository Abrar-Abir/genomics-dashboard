import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function saveSchema(schemaPath, outputPath = 'headers.json') {
    try {
        const data = await fs.promises.readFile(schemaPath, 'utf8');
        const schema = JSON.parse(data);

        const tableHeaders = Object.keys(schema.table)
            .flatMap((table) => Object.values(schema.table[table].entity).map((entity) => entity.alias))
            .sort();
        
        const binaryStr = tableHeaders
            .map((col) =>
                Object.keys(schema.table).some((table) =>
                    Object.keys(schema.table[table].entity).some(
                        (key) =>
                            schema.table[table].entity[key].alias === col && schema.table[table].entity[key].view
                    )
                )
                    ? "1"
                    : "0"
            )
            .join("");
    
        const tableHeadersProperties = Object.keys(schema.table).reduce((acc, table) => {
            Object.keys(schema.table[table].entity).forEach((key) => {
                const alias = schema.table[table].entity[key].alias;
                if (!acc[alias]) {
                    acc[alias] = {};
                }
                
                acc[alias].source = schema.table[table].entity[key].source;
                acc[alias].order = schema.table[table].entity[key].group * 100 + schema.table[table].entity[key].order;
                acc[alias].filter = schema.table[table].entity[key].order;
            });
            return acc;
        }, {});
    
        await fs.promises.writeFile(outputPath, JSON.stringify({ headers: tableHeaders, binaryStr, properties: tableHeadersProperties }, null, 2));

        console.log(`Table headers saved to ${outputPath}`);
    } catch (error) {
        console.error('Error reading schema or writing file:', error);
    }
}

const schemaFilePath = path.resolve(__dirname, '../schema.json');
const outputPath = path.resolve(__dirname, "src/lib/schema.json")
saveSchema(schemaFilePath, outputPath);

