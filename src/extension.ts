import * as vscode from 'vscode';
import { Project, SyntaxKind } from "ts-morph";
import fs from "fs";
import path from "path";

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "auto-doc-gen" is now active!');

  const disposable = vscode.commands.registerCommand('auto-doc-gen.generateDocs', async () => {
    // Prompt the user to select a file or folder
    const inputPath = await vscode.window.showOpenDialog({
      canSelectMany: false,
      openLabel: 'Select a TypeScript file or folder',
      canSelectFolders: true,  // Allow folder selection
      filters: {
        'TypeScript': ['ts'],
        'All Files': ['*']
      }
    });

    if (!inputPath || inputPath.length === 0) {
      vscode.window.showErrorMessage("❌ Please provide a valid file or folder.");
      return;
    }

    const pathToProcess = inputPath[0].fsPath;
    let markdown = "#  Documentation\n\n";
    let html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Documentation</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 2rem; line-height: 1.6; }
        code { background: #f4f4f4; padding: 2px 4px; border-radius: 4px; }
        pre { background: #f9f9f9; padding: 1rem; border: 1px solid #ddd; border-radius: 5px; }
        .section { margin-bottom: 2rem; }
      </style>
    </head>
    <body>
    <h1>📘 Documentation</h1>
    `;

    const parseFile = (filePath: string) => {
      const project = new Project();
      const sourceFile = project.addSourceFileAtPath(filePath);

      // Function Declarations
      sourceFile.getFunctions().forEach(fn => {
        const name = fn.getName();
        const code = fn.getText();
        const docs = fn.getJsDocs();
        const description = docs.map(doc => doc.getComment()).join("\n");

        markdown += `## 🔹 Function: \`${name}\`\n`;
        if (description) {
          markdown += `**Description:** ${description}\n`;
        }
        markdown += `\n\`\`\`ts\n${code}\n\`\`\`\n\n`;

        html += `
        <div class="section">
          <h2>Function: <code>${name}</code></h2>
          ${description ? `<p><strong>Description:</strong> ${description}</p>` : ""}
          <pre><code>${code}</code></pre>
        </div>`;
      });

      // Arrow Functions
      sourceFile.getVariableDeclarations().forEach(decl => {
        const initializer = decl.getInitializer();
        if (initializer && initializer.getKind() === SyntaxKind.ArrowFunction) {
          const jsDocs = (decl as any).getJsDocs?.() || [];
          const name = decl.getName();
          const code = decl.getText();

          let description = "";
          let params: string[] = [];
          let returns = "";

          jsDocs.forEach((doc: any) => {
            const comment = doc.getComment();
            if (comment) {
              description = comment;
            }

            const tags = doc.getTags?.() || [];
            tags.forEach((tag: any) => {
              const tagName = tag.getTagName();
              const tagText = tag.getText();
              if (tagName === "param") {
                params.push(tagText);
              } else if (tagName === "returns" || tagName === "return") {
                returns = tagText;
              }
            });
          });

          markdown += `## 🔹 Function: \`${name}\`\n`;
          if (description) {
            markdown += `**Description:** ${description}\n`;
          }
          if (params.length) {
            markdown += `**Parameters:**\n${params.map(p => `- ${p}`).join("\n")}\n`;
          }
          if (returns) {
            markdown += `**Returns:** ${returns}\n`;
          }
          markdown += `\n\`\`\`ts\n${code}\n\`\`\`\n\n`;

          html += `
          <div class="section">
            <h2>Function: <code>${name}</code></h2>
            ${description ? `<p><strong>Description:</strong> ${description}</p>` : ""}
            ${params.length ? `<p><strong>Parameters:</strong></p><ul>${params.map(p => `<li>${p}</li>`).join("")}</ul>` : ""}
            ${returns ? `<p><strong>Returns:</strong> ${returns}</p>` : ""}
            <pre><code>${code}</code></pre>
          </div>`;
        }
      });

      // Repeat for other declarations (interfaces, enums, types)
    };

    const parseFolder = (folderPath: string) => {
      const items = fs.readdirSync(folderPath);

      items.forEach(item => {
        const fullPath = path.join(folderPath, item);
        const stats = fs.statSync(fullPath);

        if (stats.isDirectory()) {
          if (item === "node_modules" || item.startsWith(".")) {
            return;
          }
          parseFolder(fullPath);
        } else if (fullPath.endsWith(".ts")) {
          parseFile(fullPath);
        }
      });
    };

    const isFile = fs.existsSync(pathToProcess) && fs.statSync(pathToProcess).isFile();
    const isDirectory = fs.existsSync(pathToProcess) && fs.statSync(pathToProcess).isDirectory();

    if (isFile) {
      parseFile(pathToProcess);
    } else if (isDirectory) {
      parseFolder(pathToProcess);
    } else {
      vscode.window.showErrorMessage("❌ Invalid path.");
      return;
    }

    // Saving files
    fs.writeFileSync("DOCS.md", markdown);
    fs.writeFileSync("docs.html", html + "</body></html>");

    vscode.window.showInformationMessage("✅ Documentation generated: DOCS.md and docs.html");
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}
