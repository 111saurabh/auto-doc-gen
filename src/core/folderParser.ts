import * as fs from 'fs';
import * as path from 'path';
import { Project } from 'ts-morph';
import { parseFile } from './fileParser';
import { DocsContent } from '../types';

export function parseFolder(folderPath: string, project: Project, docsContent: DocsContent) {
    const items = fs.readdirSync(folderPath);

    items.forEach(item => {
        const fullPath = path.join(folderPath, item);
        const stats = fs.statSync(fullPath);

        if (stats.isDirectory()) {
            if (item === "node_modules" || item.startsWith(".")) {return;}
            parseFolder(fullPath, project, docsContent);
        } else if (fullPath.endsWith(".ts") || fullPath.endsWith(".tsx")) {
            parseFile(fullPath, project, docsContent);
        }
    });
}