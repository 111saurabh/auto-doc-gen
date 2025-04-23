import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { Project } from 'ts-morph';
import { parseFile } from '../core/fileParser';
import { parseFolder } from '../core/folderParser';
import { HTML_STYLES } from '../utils/htmlStyles';
import { writeDocs } from '../output/writer';
import { DocsContent } from '../types';


export function registerGenerateDocsCommand(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand('auto-doc-gen.generateDocs', async () => {
        //for file selection
        const inputPath = await vscode.window.showOpenDialog({
            canSelectMany: false,
            openLabel: 'Select a TypeScript file or folder',
            canSelectFolders: true,
            canSelectFiles: true,
            filters: {
                'TypeScript Files': ['ts', 'tsx'],
                'All Files': ['*']
            }
        });

        if (!inputPath || inputPath.length === 0) {
            vscode.window.showErrorMessage(" Please provide a valid file or folder.");
            return;
        }

        const pathToProcess = inputPath[0].fsPath;
        const outputDir = fs.statSync(pathToProcess).isDirectory()
            ? pathToProcess
            : path.dirname(pathToProcess);

        const project = new Project();
        const docsContent: DocsContent = {
            markdown: '# Documentation\n\n',
            html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Documentation</title>
    <style>
        ${HTML_STYLES}
    </style>
</head>
<body>
    <h1> Documentation</h1>
`,
            parsedFileCount: 0
        };

        try {
            if (fs.statSync(pathToProcess).isFile()) {
                parseFile(pathToProcess, project, docsContent);
            } else {
                parseFolder(pathToProcess, project, docsContent);
            }

            if (docsContent.parsedFileCount === 0) {
                vscode.window.showWarningMessage(" No TypeScript/TSX files found or parsed.");
                return;
            }

            writeDocs(outputDir, docsContent.markdown, docsContent.html);
        } catch (error) {
            vscode.window.showErrorMessage(` Error processing files: ${error}`);
        }
    });

    context.subscriptions.push(disposable);
}