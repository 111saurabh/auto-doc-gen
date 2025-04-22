import * as vscode from 'vscode';
import { Project, SyntaxKind } from "ts-morph";
import fs from "fs";
import path from "path";

export function activate(context: vscode.ExtensionContext) {
  console.log('🎉 Extension "auto-doc-gen" is now active!');

  const disposable = vscode.commands.registerCommand('auto-doc-gen.generateDocs', async () => {
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
      vscode.window.showErrorMessage("❌ Please provide a valid file or folder.");
      return;
    }

    const pathToProcess = inputPath[0].fsPath;
    const outputDir = fs.statSync(pathToProcess).isDirectory() 
      ? pathToProcess 
      : path.dirname(pathToProcess);

    let markdown = "# 📘 Documentation\n\n";
    let html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Documentation</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          padding: 2rem; 
          line-height: 1.6; 
          background-color: #1A1A1A; 
          color: #FFFFFF;
        }
        code { 
          background: #0D0D0D; 
          color: #C9D1D9;
          padding: 2px 4px; 
          border-radius: 4px; 
        }
        pre { 
          background: #0D0D0D; 
          color: #C9D1D9;
          padding: 1rem; 
          border: 1px solid #333; 
          border-radius: 5px; 
        }
        .section { 
          margin-bottom: 2rem; 
          border-left: 3px solid #2E7D32;
          padding-left: 1rem;
        }
        .property-list { 
          margin-left: 1.5rem; 
          color: #B0BEC5;
        }
        h1, h2, h3 {
          color: #4CAF50;
        }
      </style>
    </head>
    <body>
    <h1>📘 Documentation</h1>
    `;

    const project = new Project();
    let parsedFileCount = 0;

    const parseFile = (filePath: string) => {
      const sourceFile = project.addSourceFileAtPathIfExists(filePath);
      if (!sourceFile) {
        vscode.window.showWarningMessage(`⚠️ Could not parse file: ${filePath}`);
        return;
      }

      parsedFileCount++;

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

      // Classes
      sourceFile.getClasses().forEach(cls => {
        const className = cls.getName();
        const docs = cls.getJsDocs();
        const description = docs.map(doc => doc.getComment()).join("\n");
        
        markdown += `## 🏛 Class: \`${className}\`\n`;
        html += `<div class="section"><h2>Class: <code>${className}</code></h2>`;
        
        if (description) {
          markdown += `**Description:** ${description}\n`;
          html += `<p><strong>Description:</strong> ${description}</p>`;
        }

        // Constructor
        cls.getConstructors().forEach(ctor => {
          const params = ctor.getParameters().map(p => ({
            name: p.getName(),
            type: p.getType().getText()
          }));
          
          markdown += `\n### 🔨 Constructor\n`;
          html += `<h3>Constructor</h3>`;
          
          if (params.length) {
            markdown += `**Parameters:**\n${params.map(p => `- \`${p.name}\` (${p.type})`).join("\n")}\n`;
            html += `<ul class="property-list">${params.map(p => `<li><code>${p.name}</code> (${p.type})</li>`).join("")}</ul>`;
          }
        });

        // Properties
        const properties = cls.getProperties();
        if (properties.length > 0) {
          markdown += `\n**Properties:**\n`;
          html += `<h3>Properties</h3><ul class="property-list">`;
          properties.forEach(prop => {
            const propName = prop.getName();
            const propType = prop.getType().getText();
            markdown += `- \`${propName}\` (${propType})\n`;
            html += `<li><code>${propName}</code> (${propType})</li>`;
          });
          html += `</ul>`;
        }

        // Methods
        cls.getMethods().forEach(method => {
          const methodName = method.getName();
          const returnType = method.getReturnType().getText();
          const methodDocs = method.getJsDocs();
          const methodDesc = methodDocs.map(doc => doc.getComment()).join("\n");
          
          markdown += `\n### 📋 Method: \`${methodName}()\` → ${returnType}\n`;
          html += `<div class="method-section"><h3>Method: <code>${methodName}()</code> → ${returnType}</h3>`;
          
          if (methodDesc) {
            markdown += `${methodDesc}\n`;
            html += `<p>${methodDesc}</p>`;
          }
          
          html += `</div>`;
        });

        markdown += `\n\n`;
        html += `</div>`;
      });

      // Interfaces
      sourceFile.getInterfaces().forEach(intf => {
        const interfaceName = intf.getName();
        const docs = intf.getJsDocs();
        const description = docs.map(doc => doc.getComment()).join("\n");
        
        markdown += `## 📜 Interface: \`${interfaceName}\`\n`;
        html += `<div class="section"><h2>Interface: <code>${interfaceName}</code></h2>`;
        
        if (description) {
          markdown += `**Description:** ${description}\n`;
          html += `<p><strong>Description:</strong> ${description}</p>`;
        }

        // Properties
        intf.getProperties().forEach(prop => {
          const propName = prop.getName();
          const propType = prop.getType().getText();
          markdown += `- \`${propName}\`: ${propType}\n`;
          html += `<p><code>${propName}</code>: ${propType}</p>`;
        });

        markdown += `\n`;
        html += `</div>`;
      });

      // Enums
      sourceFile.getEnums().forEach(enumDecl => {
        const enumName = enumDecl.getName();
        const docs = enumDecl.getJsDocs();
        const description = docs.map(doc => doc.getComment()).join("\n");
        
        markdown += `## 🔢 Enum: \`${enumName}\`\n`;
        html += `<div class="section"><h2>Enum: <code>${enumName}</code></h2>`;
        
        if (description) {
          markdown += `**Description:** ${description}\n`;
          html += `<p><strong>Description:</strong> ${description}</p>`;
        }

        enumDecl.getMembers().forEach(member => {
          markdown += `- \`${member.getName()}\`\n`;
          html += `<p><code>${member.getName()}</code></p>`;
        });

        markdown += `\n`;
        html += `</div>`;
      });

      // Type Aliases
      sourceFile.getTypeAliases().forEach(typeAlias => {
        const aliasName = typeAlias.getName();
        const docs = typeAlias.getJsDocs();
        const description = docs.map(doc => doc.getComment()).join("\n");
        const typeText = typeAlias.getText();
        
        markdown += `## 🏷 Type Alias: \`${aliasName}\`\n`;
        html += `<div class="section"><h2>Type Alias: <code>${aliasName}</code></h2>`;
        
        if (description) {
          markdown += `**Description:** ${description}\n`;
          html += `<p><strong>Description:</strong> ${description}</p>`;
        }

        markdown += `\n\`\`\`ts\n${typeText}\n\`\`\`\n\n`;
        html += `<pre><code>${typeText}</code></pre></div>`;
      });
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
        } else if (fullPath.endsWith(".ts") || fullPath.endsWith(".tsx")) {
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

    if (parsedFileCount === 0) {
      vscode.window.showWarningMessage("⚠️ No TypeScript/TSX files found or parsed.");
      return;
    }

    // Write output files to the correct location ;)
    const mdPath = path.join(outputDir, "DOCS.md");
    const htmlPath = path.join(outputDir, "docs.html");

    try {
      fs.writeFileSync(mdPath, markdown);
      fs.writeFileSync(htmlPath, html + "</body>\n</html>");
      
      const openFile = "Open Documentation";
      vscode.window.showInformationMessage(
        `📄 Documentation generated in: ${outputDir}`,
        openFile
      ).then(choice => {
        if (choice === openFile) {
          vscode.env.openExternal(vscode.Uri.file(mdPath));
          vscode.env.openExternal(vscode.Uri.file(htmlPath));
        }
      });
    } catch (error) {
      vscode.window.showErrorMessage(`❌ Failed to write documentation files: ${error}`);
    }
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}