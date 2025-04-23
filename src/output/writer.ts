import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export async function writeDocs(outputDir: string, markdown: string, html: string) {
    const mdPath = path.join(outputDir, "DOCS.md");
    const htmlPath = path.join(outputDir, "docs.html");

    try {
        // Verify kro output directory exists
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
            console.log(`Created directory: ${outputDir}`);
        }

        //  Verify kro markdown content generated or not
        if (!markdown || markdown.trim().length === 0) {
            markdown = "# Default Documentation\nNo content was generated.";
            console.warn("Empty markdown content - using fallback");
        }

        //  Write files with  error handling
        fs.writeFileSync(mdPath, markdown, { flag: 'w' });
        console.log(`Markdown file written to: ${mdPath}`);
        
        fs.writeFileSync(htmlPath, html + "</body>\n</html>", { flag: 'w' });
        console.log(`HTML file written to: ${htmlPath}`);

        // Verify kro files were created
        const filesCreated = {
            markdown: fs.existsSync(mdPath),
            html: fs.existsSync(htmlPath)
        };

        if (!filesCreated.markdown || !filesCreated.html) {
            throw new Error(
                `Files not created: MD-${filesCreated.markdown}, HTML-${filesCreated.html}`
            );
        }

        // For file choice
        const choice = await vscode.window.showQuickPick(
            [
                "Open generated documentation in browser (HTML)",
                "Open generated documentation in Notepad (Markdown)",
                "Open both files",
                "Just show file locations where ther are created"
            ],
            {
                placeHolder: "Documentation generated successfully. How would you like to view it?"
            }
        );

        switch (choice) {
            case "Open HTML documentation (browser)":
                await vscode.env.openExternal(vscode.Uri.file(htmlPath));
                break;
                
            case "Open Markdown documentation":
                await vscode.env.openExternal(vscode.Uri.file(mdPath));
                break;
                
            case "Open both files":
                await vscode.env.openExternal(vscode.Uri.file(htmlPath));
                await vscode.env.openExternal(vscode.Uri.file(mdPath));
                break;
                
            default:
                // Show file locations
                await vscode.window.showInformationMessage(
                    `Documentation files created at:
    Markdown: ${mdPath}
    HTML: ${htmlPath}`,
                    { modal: true }
                );
                break;
        }

    } catch (error) {
        const errorMsg = ` Failed to generate documentation:
Path: ${outputDir}
Error: ${error instanceof Error ? error.message : error}`;

        console.error(errorMsg);
        await vscode.window.showErrorMessage(errorMsg, { modal: true });
        
        // troubleshooting ke liye
        await vscode.window.showInformationMessage(
            `Troubleshooting:
1. Check directory permissions
2. Verify disk space
3. Try a different output location`,
            "OK"
        );
    }
}