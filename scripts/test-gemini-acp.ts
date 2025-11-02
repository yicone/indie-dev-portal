#!/usr/bin/env tsx
/**
 * Test script to interact with Gemini CLI via ACP protocol
 * This helps us understand the correct message format
 */

import { spawn } from 'child_process';
import * as readline from 'readline';

const gemini = spawn('gemini', ['--acp'], {
  cwd: '/Users/tr/Workspace/doc-standards',
  stdio: ['pipe', 'pipe', 'pipe'],
});

let requestId = 0;

// Read responses from Gemini CLI
const rl = readline.createInterface({
  input: gemini.stdout,
  crlfDelay: Infinity,
});

rl.on('line', (line) => {
  try {
    const message = JSON.parse(line);
    console.log('<<<', JSON.stringify(message, null, 2));

    // Handle permission requests
    if (message.method === 'session/request_permission') {
      console.log('\n🔔 Permission request received!');
      console.log('Tool:', message.params.toolCall.title);
      console.log('Options:', message.params.options);

      // Auto-approve
      const response = {
        jsonrpc: '2.0',
        id: message.id,
        result: {
          optionId: message.params.options.find((opt: any) => opt.kind === 'allow_once')?.optionId,
        },
      };

      console.log('\n>>> Sending permission response:', JSON.stringify(response));
      gemini.stdin.write(JSON.stringify(response) + '\n');
    }
  } catch (e) {
    console.error('Failed to parse:', line);
  }
});

gemini.stderr.on('data', (data) => {
  console.error('STDERR:', data.toString());
});

gemini.on('exit', (code) => {
  console.log('Gemini CLI exited with code:', code);
  process.exit(code || 0);
});

// Send session/new
setTimeout(() => {
  const sessionNew = {
    jsonrpc: '2.0',
    id: ++requestId,
    method: 'session/new',
    params: {
      cwd: '/Users/tr/Workspace/doc-standards',
      mcpServers: [],
    },
  };

  console.log('>>> Sending session/new:', JSON.stringify(sessionNew));
  gemini.stdin.write(JSON.stringify(sessionNew) + '\n');
}, 1000);

// Send prompt after session is created
setTimeout(() => {
  const prompt = {
    jsonrpc: '2.0',
    id: ++requestId,
    method: 'session/prompt',
    params: {
      sessionId: 'REPLACE_WITH_ACTUAL_SESSION_ID', // Will be replaced manually
      prompt: [{ type: 'text', text: 'echo "hello world"' }],
    },
  };

  console.log('>>> Sending prompt:', JSON.stringify(prompt));
  // gemini.stdin.write(JSON.stringify(prompt) + '\n');
}, 3000);

// Keep process alive
process.stdin.resume();
