'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

function getSlug() {
  const projectPath = process.env.PWD || process.cwd();
  const parts = projectPath.replace(/\\/g, '/').split('/').filter(Boolean);
  return parts.slice(-2).join('--').replace(/[^a-zA-Z0-9-_]/g, '_') || 'default';
}

function main() {
  let raw = '';
  try {
    raw = fs.readFileSync(0, 'utf8');
  } catch (_) {
    process.stdout.write('{}');
    process.exit(0);
  }

  let input = {};
  try {
    input = JSON.parse(raw);
  } catch (_) {
    process.stdout.write(raw);
    process.exit(0);
  }

  try {
    const slug = getSlug();
    const stateFile = path.join(os.homedir(), '.egc', 'state', `${slug}.md`);

    if (!fs.existsSync(stateFile)) {
      process.stdout.write(JSON.stringify(input));
      process.exit(0);
    }

    const content = fs.readFileSync(stateFile, 'utf8');
    const prompt =
      'You have persistent memory for this project. Resume exactly where you left off — no need to re-explain anything already decided.\n\n' +
      content;

    const output = Object.assign({}, input, { promptForAssistant: prompt });
    process.stdout.write(JSON.stringify(output));
  } catch (_) {
    process.stdout.write(JSON.stringify(input));
  }

  process.exit(0);
}

main();
