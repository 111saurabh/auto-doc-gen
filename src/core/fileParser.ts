import * as vscode from 'vscode';
import { Project, SyntaxKind } from "ts-morph";
import { DocsContent } from '../types';


export function parseFile(filePath: string, project: Project, docsContent: DocsContent) {
    const sourceFile = project.addSourceFileAtPathIfExists(filePath);
    if (!sourceFile) {
        vscode.window.showWarningMessage(` Could not parse file: ${filePath}`);
        return;
    }

    docsContent.parsedFileCount++;

    // Function Declarations...
    sourceFile.getFunctions().forEach(fn => {
        const name = fn.getName();
        const code = fn.getText();
        const docs = fn.getJsDocs();
        const description = docs.map(doc => doc.getComment()).join("\n");

        docsContent.markdown += `##   Function: ${name}\n\n`;
        if (description) {
            docsContent.markdown += `**Description:** ${description}\n\n`;
        }
        docsContent.markdown += `\`\`\`ts\n${code}\n\`\`\`\n\n`;

        docsContent.html += `
<div class="section">
    <h2>Function: <code>${name}</code></h2>
    ${description ? `<p><strong>Description:</strong> ${description}</p>` : ''}
    <pre><code>${code}</code></pre>
</div>`;
    });

    // For Arrow Functions
    sourceFile.getVariableDeclarations().forEach(decl => {
        const initializer = decl.getInitializer();
        if (initializer && initializer.getKind() === SyntaxKind.ArrowFunction) {
            const jsDocs = (decl as any).getJsDocs?.() || [];
            const name = decl.getName();
            const code = decl.getText();

            let description = "";
            const params: string[] = [];
            let returns = "";

            jsDocs.forEach((doc: any) => {
                const comment = doc.getComment();
                if (comment) {description = comment;}

                const tags = doc.getTags?.() || [];
                tags.forEach((tag: any) => {
                    const tagName = tag.getTagName();
                    const tagText = tag.getText();
                    if (tagName === "param") {params.push(tagText);}
                    else if (tagName === "returns" || tagName === "return") {returns = tagText;}
                });
            });

            docsContent.markdown += `##  Function: ${name}\n\n`;
            if (description) {docsContent.markdown += `**Description:** ${description}\n\n`;}
            if (params.length) {docsContent.markdown += `**Parameters:**\n${params.map(p => `- ${p}`).join("\n")}\n\n`;}
            if (returns) {docsContent.markdown += `**Returns:** ${returns}\n\n`;}
            docsContent.markdown += `\`\`\`ts\n${code}\n\`\`\`\n\n`;

            docsContent.html += `
<div class="section">
    <h2>Function: <code>${name}</code></h2>
    ${description ? `<p><strong>Description:</strong> ${description}</p>` : ''}
    ${params.length ? `<p><strong>Parameters:</strong></p><ul>${params.map(p => `<li>${p}</li>`).join("")}</ul>` : ''}
    ${returns ? `<p><strong>Returns:</strong> ${returns}</p>` : ''}
    <pre><code>${code}</code></pre>
</div>`;
        }
    });

    // For Classes
    sourceFile.getClasses().forEach(cls => {
        const className = cls.getName();
        const docs = cls.getJsDocs();
        const description = docs.map(doc => doc.getComment()).join("\n");
        
        docsContent.markdown += `##  Class: ${className}\n\n`;
        docsContent.html += `<div class="section"><h2>Class: <code>${className}</code></h2>`;
        
        if (description) {
            docsContent.markdown += `**Description:** ${description}\n\n`;
            docsContent.html += `<p><strong>Description:</strong> ${description}</p>`;
        }

        // For  Constructor
        cls.getConstructors().forEach(ctor => {
            const params = ctor.getParameters().map(p => ({
                name: p.getName(),
                type: p.getType().getText()
            }));
            
            docsContent.markdown += `###  Constructor\n\n`;
            docsContent.html += `<h3>Constructor</h3>`;
            
            if (params.length) {
                docsContent.markdown += `**Parameters:**\n${params.map(p => `- ${p.name} (${p.type})`).join("\n")}\n\n`;
                docsContent.html += `<ul class="property-list">${params.map(p => `<li><code>${p.name}</code> (${p.type})</li>`).join("")}</ul>`;
            }
        });

        // For Properties
        const properties = cls.getProperties();
        if (properties.length > 0) {
            docsContent.markdown += `**Properties:**\n`;
            docsContent.html += `<h3>Properties</h3><ul class="property-list">`;
            properties.forEach(prop => {
                const propName = prop.getName();
                const propType = prop.getType().getText();
                docsContent.markdown += `- ${propName} (${propType})\n`;
                docsContent.html += `<li><code>${propName}</code> (${propType})</li>`;
            });
            docsContent.html += `</ul>`;
        }

        // Methods
        cls.getMethods().forEach(method => {
            const methodName = method.getName();
            const returnType = method.getReturnType().getText();
            const methodDocs = method.getJsDocs();
            const methodDesc = methodDocs.map(doc => doc.getComment()).join("\n");
            
            docsContent.markdown += `###  Method: ${methodName}() → ${returnType}\n\n`;
            docsContent.html += `<div class="method-section"><h3>Method: <code>${methodName}()</code> → ${returnType}</h3>`;
            
            if (methodDesc) {
                docsContent.markdown += `${methodDesc}\n\n`;
                docsContent.html += `<p>${methodDesc}</p>`;
            }
            
            docsContent.html += `</div>`;
        });

        docsContent.markdown += `\n`;
        docsContent.html += `</div>`;
    });

    // For Interfaces
    sourceFile.getInterfaces().forEach(intf => {
        const interfaceName = intf.getName();
        const docs = intf.getJsDocs();
        const description = docs.map(doc => doc.getComment()).join("\n");
        
        docsContent.markdown += `##  Interface: ${interfaceName}\n\n`;
        docsContent.html += `<div class="section"><h2>Interface: <code>${interfaceName}</code></h2>`;
        
        if (description) {
            docsContent.markdown += `**Description:** ${description}\n\n`;
            docsContent.html += `<p><strong>Description:</strong> ${description}</p>`;
        }

        // For Properties
        intf.getProperties().forEach(prop => {
            const propName = prop.getName();
            const propType = prop.getType().getText();
            docsContent.markdown += `- ${propName}: ${propType}\n`;
            docsContent.html += `<p><code>${propName}</code>: ${propType}</p>`;
        });

        docsContent.markdown += `\n`;
        docsContent.html += `</div>`;
    });

    // For Enums
    sourceFile.getEnums().forEach(enumDecl => {
        const enumName = enumDecl.getName();
        const docs = enumDecl.getJsDocs();
        const description = docs.map(doc => doc.getComment()).join("\n");
        
        docsContent.markdown += `##  Enum: ${enumName}\n\n`;
        docsContent.html += `<div class="section"><h2>Enum: <code>${enumName}</code></h2>`;
        
        if (description) {
            docsContent.markdown += `**Description:** ${description}\n\n`;
            docsContent.html += `<p><strong>Description:</strong> ${description}</p>`;
        }

        enumDecl.getMembers().forEach(member => {
            docsContent.markdown += `- ${member.getName()}\n`;
            docsContent.html += `<p><code>${member.getName()}</code></p>`;
        });

        docsContent.markdown += `\n`;
        docsContent.html += `</div>`;
    });

    // For Type Aliases
    sourceFile.getTypeAliases().forEach(typeAlias => {
        const aliasName = typeAlias.getName();
        const docs = typeAlias.getJsDocs();
        const description = docs.map(doc => doc.getComment()).join("\n");
        const typeText = typeAlias.getText();
        
        docsContent.markdown += `##  Type Alias: ${aliasName}\n\n`;
        docsContent.html += `<div class="section"><h2>Type Alias: <code>${aliasName}</code></h2>`;
        
        if (description) {
            docsContent.markdown += `**Description:** ${description}\n\n`;
            docsContent.html += `<p><strong>Description:</strong> ${description}</p>`;
        }

        docsContent.markdown += `\`\`\`ts\n${typeText}\n\`\`\`\n\n`;
        docsContent.html += `<pre><code>${typeText}</code></pre></div>`;
    });
}