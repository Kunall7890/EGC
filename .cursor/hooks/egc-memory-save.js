#!/usr/bin/env node
'use strict';

function readStdin() {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', chunk => { data += chunk; });
    process.stdin.on('end', () => resolve(data));
    process.stdin.on('error', () => resolve(''));
  });
}

readStdin().then(raw => {
  try {
    let input;
    try {
      input = JSON.parse(raw || '{}');
    } catch (_) {
      input = {};
    }

    const instruction =
      'Antes de encerrar: chame a ferramenta `update_state` do servidor MCP `egc-memory` ' +
      'com um resumo desta sessão. Inclua: decisões tomadas, o que falhou, preferências identificadas ' +
      'e o que deve ser retomado na próxima sessão. Use o project_path atual.';

    input.promptForAssistant = input.promptForAssistant
      ? input.promptForAssistant + '\n\n' + instruction
      : instruction;

    process.stdout.write(JSON.stringify(input));
  } catch (_) {
    process.stdout.write(raw || '{}');
  }
}).catch(() => {
  process.exit(0);
});
