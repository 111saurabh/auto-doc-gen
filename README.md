#  auto-doc-gen

[![VS Code Marketplace](https://img.shields.io/visual-studio-marketplace/v/SaurabhDoke.auto-doc-gen?label=VS%20Code%20Marketplace&style=for-the-badge&logo=visualstudiocode)](https://marketplace.visualstudio.com/items?itemName=SaurabhDoke.auto-doc-gen)
[![Installs](https://img.shields.io/visual-studio-marketplace/i/SaurabhDoke.auto-doc-gen?style=for-the-badge)](https://marketplace.visualstudio.com/items?itemName=SaurabhDoke.auto-doc-gen)
[![Rating](https://img.shields.io/visual-studio-marketplace/stars/SaurabhDoke.auto-doc-gen?style=for-the-badge)](https://marketplace.visualstudio.com/items?itemName=SaurabhDoke.auto-doc-gen)

Your awesome auto-doc-gen extension for VS Code...


**Generate rich documentation for your TypeScript code in Markdown and HTML — right from VS Code.**

---

## Features

- - Parses TypeScript files or folders
- - Supports:->
  - Function declarations
  - Arrow functions
  - JSDoc comments (`@param`, `@returns`)
  - Interfaces
  - Enums
  - Classes
  - Constructor
  - Properties
  - Methods
  - Type Aliases
    
- - Outputs clean and structured:
  - `DOCS.md`
  - `docs.html`
- - VS Code integrated — works via Command Palette

---

##  Installation

1. Clone this repository  
   ```bash
   git clone https://github.com/111saurabh/auto-doc-gen
   cd auto-doc-gen
   ```
2. Open it in VS Code
3. Press `F5` to launch the extension in a new Extension Development Host window

---

##  Usage

1. Open the Command Palette (`Ctrl+Shift+P`)
2. Type `Generate Docs` and select **auto-doc-gen: Generate Docs**
3. Select a `.ts` file or a folder containing TypeScript files
4. Select option which output file you want to see
5. Done! You’ll see `DOCS.md` or `docs.html` as per choice created in your workspace

In case you don't have , Use this well-commented sample TypeScript file to test the extension: https://github.com/111saurabh/test-for-auto-doc-gen.git

---

##  Example

**Input:**

```ts
/**
 * Adds two numbers
 * @param a - First number
 * @param b - Second number
 * @returns Sum of a and b
 */
const add = (a: number, b: number): number => {
  return a + b;
}
```

**Output (Markdown):**
```markdown
##  Function: `add`
**Description:** Adds two numbers  
**Parameters:**
- a - First number
- b - Second number  
**Returns:** Sum of a and b

```ts
const add = (a: number, b: number): number => {
  return a + b;
}
```
```

---

##  Roadmap

- [x] Support function & arrow function docs
- [x] Support for classes & interfaces
- [x] Add 'Download as PDF' feature
- [x] Publish on VS Code Marketplace
- [ ] Add configuration options (output path, style)
- [ ] Advanced Features...


---

##  Contributing

Pull requests and suggestions are welcome. Let's build better docs together! 

---

##  License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

MIT © 2025 [Saurabh Doke](https://github.com/111saurabh)




## Version History

- **0.0.1** - Initial release with support for function & arrow function documentation generation.
- **1.1.0** - Added support for user interface, enum, class etc. File selection improved.
- **1.1.3** - Added dark themed output with better visual representation
- **1.2.0** - Added 'Download as PDF' feature in HTML output
