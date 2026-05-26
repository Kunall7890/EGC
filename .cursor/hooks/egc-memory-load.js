#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

function getSlug() {
  const projectPath = process.env.PWD || process.cwd();
  const parts = projectPath.replace(/\\/g, '/').split('/').filter(Boolean);
  return parts.slice(-2).join('--').replace(/[^a-zA-Z0-9-_]/g, '_') || 'default';
}

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
    const slug = getSlug();
    const statePath = path.join(os.homedir(), '.egc', 'state', slug + '.md');
    let stateContent;
    try {
      stateContent = fs.readFileSync(statePath, 'utf8');
    } catch (_) {
      stateContent = null;
    }

    if (!stateContent) {
      process.stdout.write(raw || '{}');
      return;
    }

    let input;
    try {
      input = JSON.parse(raw || '{}');
    } catch (_) {
      input = {};
    }

    const instruction =
      'RETOME DE ONDE PAROU. O estado persistido desta sessão anterior está abaixo. ' +
      'Leia-o antes de responder qualquer coisa.\n\n' +
      stateContent;

    input.promptForAssistant = input.promptForAssistant
      ? instruction + '\n\n' + input.promptForAssistant
      : instruction;

    process.stdout.write(JSON.stringify(input));
  } catch (_) {
    process.stdout.write(raw || '{}');
  }
}).catch(() => {
  process.exit(0);
});
