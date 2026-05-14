import { createInterface } from 'node:readline';

function createRL() {
  return createInterface({ input: process.stdin, output: process.stdout });
}

export async function confirm(question, defaultYes = true) {
  if (!process.stdin.isTTY) return defaultYes;
  const hint = defaultYes ? '[Y/n]' : '[y/N]';
  const rl = createRL();
  return new Promise(resolve => {
    rl.question(`${question} ${hint} `, answer => {
      rl.close();
      const a = answer.trim().toLowerCase();
      resolve(a === '' ? defaultYes : a === 'y' || a === 'yes');
    });
  });
}

export async function multiSelect(question, choices) {
  if (!process.stdin.isTTY || choices.length === 0) return [];
  console.log(`\n${question}`);
  choices.forEach((c, i) => {
    console.log(`  ${i + 1}. ${c.id} — ${c.description}`);
  });
  console.log('  Enter comma-separated numbers, or blank for none.');
  const rl = createRL();
  return new Promise(resolve => {
    rl.question('> ', answer => {
      rl.close();
      const input = answer.trim();
      if (!input) { resolve([]); return; }
      const selected = [];
      for (const tok of input.split(',')) {
        const n = parseInt(tok.trim(), 10);
        if (n >= 1 && n <= choices.length) selected.push(choices[n - 1].id);
      }
      resolve(selected);
    });
  });
}

export async function choice(question, options) {
  if (!process.stdin.isTTY) return options[0];
  const display = options.map((o, i) => (i === 0 ? `[${o}]` : o)).join(' / ');
  const rl = createRL();
  return new Promise(resolve => {
    rl.question(`${question} ${display} `, answer => {
      rl.close();
      const a = answer.trim().toLowerCase();
      if (!a) { resolve(options[0]); return; }
      const match = options.find(o => o.toLowerCase().startsWith(a));
      resolve(match ?? options[0]);
    });
  });
}
