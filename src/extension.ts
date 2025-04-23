import * as vscode from 'vscode';
import { registerGenerateDocsCommand } from './commands/generateDocs';

export function activate(context: vscode.ExtensionContext) {
    console.log('Extension "auto-doc-gen" is now active!');
    registerGenerateDocsCommand(context);
}

export function deactivate() {}