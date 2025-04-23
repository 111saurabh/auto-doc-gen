export const HTML_STYLES = `
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
    .pdf-button {
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #2E7D32;
        color: white;
        border: none;
        border-radius: 4px;
        padding: 8px 16px;
        font-size: 14px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 6px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        transition: background-color 0.3s;
    }
    .pdf-button:hover {
        background-color: #1B5E20;
    }
    @media print {
        .pdf-button {
            display: none;
        }
    }
`;