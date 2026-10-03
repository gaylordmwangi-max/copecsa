// Smoke test for the SEOMonster MCP server registered in .mcp.json.
//
// Launches the server exactly as Claude Code does (same command, args and env
// expansion), speaks MCP over stdio, and checks that the server answers the
// handshake, advertises its tools and prompts, and that `system_status`
// returns the documented result envelope. It needs no credentials: tools for
// unconfigured services report AUTH_MISSING rather than failing.
//
// Run: npm run test:mcp   (offline apart from the first uvx download from PyPI)

import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createInterface } from 'node:readline';

const SERVER_NAME = 'seo-monster';
const config = JSON.parse(readFileSync(new URL('../.mcp.json', import.meta.url), 'utf8'));
const server = config.mcpServers?.[SERVER_NAME];

// Mirrors Claude Code's .mcp.json expansion: ${VAR} and ${VAR:-default}.
function expand(value) {
  return value.replace(/\$\{([A-Za-z_][A-Za-z0-9_]*)(?::-([^}]*))?\}/g, (_, name, fallback) => {
    const resolved = process.env[name] ?? fallback;
    if (resolved === undefined) throw new Error(`${name} is unset and has no default in .mcp.json`);
    return resolved;
  });
}

let child;
let nextId = 1;
const pending = new Map();
let stderr = '';

function request(method, params = {}, timeoutMs = 60_000) {
  const id = nextId++;
  child.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n');
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      pending.delete(id);
      reject(new Error(`${method} timed out after ${timeoutMs}ms\n--- server stderr ---\n${stderr}`));
    }, timeoutMs);
    pending.set(id, (msg) => {
      clearTimeout(timer);
      msg.error ? reject(new Error(`${method}: ${JSON.stringify(msg.error)}`)) : resolve(msg.result);
    });
  });
}

// Tool results arrive as MCP content blocks; the envelope is the JSON text block.
function envelopeOf(result) {
  if (result.structuredContent?.ok !== undefined) return result.structuredContent;
  const text = result.content?.find((block) => block.type === 'text')?.text;
  assert.ok(text, `tool returned no text content: ${JSON.stringify(result)}`);
  assert.ok(!result.isError, `tool call rejected: ${text}`);
  return JSON.parse(text);
}

before(async () => {
  assert.ok(server, `.mcp.json has no "${SERVER_NAME}" server`);
  const env = { ...process.env };
  for (const [key, value] of Object.entries(server.env ?? {})) env[key] = expand(value);

  child = spawn(server.command, (server.args ?? []).map(expand), { env, stdio: ['pipe', 'pipe', 'pipe'] });
  child.stderr.on('data', (chunk) => { stderr += chunk; });
  createInterface({ input: child.stdout }).on('line', (line) => {
    let msg;
    try { msg = JSON.parse(line); } catch { return; }
    pending.get(msg.id)?.(msg);
    pending.delete(msg.id);
  });

  // The first run downloads the package through uvx, so allow extra time.
  const init = await request('initialize', {
    protocolVersion: '2025-06-18',
    capabilities: {},
    clientInfo: { name: 'copecsa-mcp-smoke-test', version: '1.0.0' },
  }, 300_000);
  child.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n');
  globalThis.serverInit = init;
});

after(() => child?.kill());

test('.mcp.json pins a stdio uvx launch of the seo-monster package', () => {
  assert.equal(server.type ?? 'stdio', 'stdio');
  assert.equal(server.command, 'uvx');
  assert.match(server.args[0], /^seo-monster@\d+\.\d+\.\d+$/, 'package should be version-pinned');
});

test('project settings auto-approve the server', () => {
  const settings = JSON.parse(readFileSync(new URL('../.claude/settings.json', import.meta.url), 'utf8'));
  assert.ok(settings.enabledMcpjsonServers?.includes(SERVER_NAME));
});

test('server completes the MCP handshake', () => {
  const init = globalThis.serverInit;
  assert.ok(init.protocolVersion, 'no protocolVersion negotiated');
  assert.ok(init.capabilities?.tools, 'server does not advertise tools');
  assert.ok(init.serverInfo?.name, 'server did not identify itself');
});

test('server advertises the core SEO tools', async () => {
  const { tools } = await request('tools/list');
  const names = new Set(tools.map((tool) => tool.name));
  for (const name of [
    'system_status', 'gsc_search_analytics', 'gsc_inspect_url', 'ga4_run_report',
    'psi_analyze', 'cf_list_zones', 'inspect_meta', 'robots_txt_validate', 'sitemap_health',
  ]) {
    assert.ok(names.has(name), `missing tool ${name}`);
  }
  for (const tool of tools) assert.equal(tool.inputSchema?.type, 'object', `${tool.name} has no input schema`);
});

test('server publishes the workflow prompts', async () => {
  const { prompts } = await request('prompts/list');
  const names = prompts.map((prompt) => prompt.name);
  for (const name of ['technical_seo_audit', 'pre_deploy_check', 'weekly_review']) {
    assert.ok(names.includes(name), `missing prompt ${name}`);
  }
});

test('system_status returns the documented result envelope', async () => {
  const envelope = envelopeOf(await request('tools/call', { name: 'system_status', arguments: {} }));
  assert.equal(envelope.ok, true, `system_status failed: ${JSON.stringify(envelope.error)}`);
  assert.equal(envelope.error, null);
  assert.equal(typeof envelope.data, 'object');
});

test('credential-backed tools fail soft without credentials', { skip: Boolean(process.env.SEO_MCP_GOOGLE_TOKEN || process.env.SEO_MCP_GOOGLE_CREDENTIALS || process.env.GOOGLE_APPLICATION_CREDENTIALS) }, async () => {
  const envelope = envelopeOf(await request('tools/call', { name: 'gsc_list_properties', arguments: {} }));
  assert.equal(envelope.ok, false);
  assert.equal(envelope.data, null);
  assert.ok(envelope.error?.code, 'error envelope has no code');
  assert.ok(envelope.error?.remediation, 'error envelope has no remediation');
});
