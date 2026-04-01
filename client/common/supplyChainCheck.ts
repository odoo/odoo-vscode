// This check targets the axios supply chain attack of March 31, 2026.
// Users who installed the extension from the VS Code Marketplace are NOT affected,
// as no build was published during the attack's time frame. This only concerns
// developers who built the extension from source during that period.

import * as fs from "fs";
import * as path from "path";
import { ExtensionContext, ViewColumn, window } from "vscode";

const COMPROMISED_AXIOS_VERSIONS = ["1.14.1", "0.30.4"];


function scan(extensionRoot: string): string[] {
    const compromisedPkgs: string[] = [];

    // Check for compromised axios versions
    const axiosPkgPath = path.join(extensionRoot, "node_modules", "axios", "package.json");
    try {
        const axiosPkg = JSON.parse(fs.readFileSync(axiosPkgPath, "utf-8"));
        if (COMPROMISED_AXIOS_VERSIONS.includes(axiosPkg.version)) {
            compromisedPkgs.push(`axios@${axiosPkg.version}`);
        }
    } catch {
        // axios not installed or unreadable — not a concern
    }

    // Check for malicious plain-crypto-js directory — its presence alone
    // confirms the dropper ran
    const plainCryptoDir = path.join(extensionRoot, "node_modules", "plain-crypto-js");
    if (fs.existsSync(plainCryptoDir)) {
        compromisedPkgs.push("plain-crypto-js");
    }

    return compromisedPkgs;
}

function buildAlertHtml(compromisedPkgs: string[]): string {
    const pkgListHtml = `<ul>${compromisedPkgs.map(p => `<li><span class="pkg">${p}</span></li>`).join("")}</ul>`;

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <style>
        body {
            font-family: var(--vscode-font-family, sans-serif);
            padding: 24px;
            max-width: 860px;
            color: var(--vscode-foreground);
            background: var(--vscode-editor-background);
        }
        h1 { color: #e74c3c; border-bottom: 2px solid #e74c3c; padding-bottom: 8px; }
        h2 { margin-top: 24px; }
        .pkg {
            background: var(--vscode-textBlockQuote-background, #2d2d2d);
            padding: 4px 8px; border-radius: 4px; font-family: monospace;
        }
        code {
            background: var(--vscode-textBlockQuote-background, #2d2d2d);
            padding: 2px 5px; border-radius: 3px;
        }
        ul, ol { line-height: 1.8; }
        a { color: var(--vscode-textLink-foreground); }
        .alert { padding: 12px 16px; border-radius: 6px; margin: 12px 0; }
        .alert-warn { background: rgba(241, 196, 15, 0.15); border-left: 4px solid #f1c40f; }
    </style>
</head>
<body>
    <h1>Odoo Extension — Supply Chain Security Alert</h1>
    <p>On March 31, 2026, the npm package <strong>axios</strong> was compromised via a maintainer
       account hijack. The attacker published malicious versions that install a
       <strong>Remote Access Trojan (RAT)</strong> on affected machines through the hidden
       dependency <code>plain-crypto-js@4.2.1</code>.
       The Odoo VS Code extension uses <code>axios</code> as a dependency and may be affected.</p>

    <h2>Compromised packages detected</h2>
    ${pkgListHtml}

    <h2>What should you do?</h2>
    <div class="alert alert-warn">
        <strong>Removing the compromised packages from <code>node_modules</code> is NOT
        sufficient.</strong> The RAT is deployed to your system on <code>npm install</code>
        and runs independently of Node.js. Do not attempt manual remediation — the RAT
        can download and execute additional payloads.
    </div>
    <ol>
        <li><strong>Disconnect the machine from the network</strong> immediately.</li>
        <li><strong>Rebuild from a clean system snapshot.</strong></li>
        <li><strong>Rotate ALL credentials</strong> — npm tokens, SSH keys, API keys,
            cloud credentials (AWS/GCP/Azure), CI/CD secrets, database passwords,
            and any other secrets accessible from this machine.</li>
    </ol>

    <h2>More information</h2>
    <ul>
        <li><a href="https://www.aikido.dev/blog/axios-npm-compromised-maintainer-hijacked-rat">Aikido — Axios Maintainer Hijacked, RAT Deployed</a></li>
        <li><a href="https://socket.dev/blog/axios-npm-package-compromised">Socket — Axios npm Package Compromised</a></li>
        <li><a href="https://snyk.io/blog/axios-npm-package-compromised-supply-chain-attack-delivers-cross-platform/">Snyk — Axios Supply Chain Attack Analysis</a></li>
    </ul>
</body>
</html>`;
}

export function checkCompromisedDependencies(context: ExtensionContext): void {
    const compromisedPkgs = scan(context.extensionPath);

    if (compromisedPkgs.length === 0) return;

    const panel = window.createWebviewPanel(
        "odooSecurityAlert",
        "Odoo — Security Alert",
        ViewColumn.Active,
        { enableScripts: false }
    );
    panel.webview.html = buildAlertHtml(compromisedPkgs);
}
