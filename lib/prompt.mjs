import { createInterface } from 'node:readline';

const isTTY = () => Boolean(process.stdin.isTTY && process.stdout.isTTY);

const ansi = process.stdout.isTTY
  ? { reset: '\x1b[0m', bold: '\x1b[1m', dim: '\x1b[2m', cyan: '\x1b[36m' }
  : { reset: '', bold: '', dim: '', cyan: '' };

function createRL() {
  return createInterface({ input: process.stdin, output: process.stdout });
}

export async function confirm(question, defaultYes = true) {
  if (!isTTY()) return defaultYes;
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

function truncate(s, max) {
  return max > 0 && s.length > max ? s.slice(0, max - 1) + '…' : s;
}

// Raw-mode interactive selector. `choices` is [{ label, value, description? }].
// `message` must be a single line. Returns the chosen value (single) or an
// array of chosen values (multi).
function keypressSelect({ message, choices, multi }) {
  return new Promise(resolve => {
    const stdin = process.stdin;
    const stdout = process.stdout;
    let cursor = 0;
    const selected = new Set();
    const total = choices.length + 2; // message + choices + hint
    const hint = multi
      ? 'up/down move · space toggle · a all · enter confirm'
      : 'up/down move · enter select';

    function render(first) {
      if (!first) stdout.write(`\x1b[${total}A`);
      stdout.write('\r\x1b[0J');
      const width = (stdout.columns || 80) - 1;
      stdout.write(`${ansi.bold}${truncate(message, width)}${ansi.reset}\n`);
      choices.forEach((ch, i) => {
        const onCursor = i === cursor;
        const pointer = onCursor ? '›' : ' ';
        const mark = multi
          ? (selected.has(i) ? '[x]' : '[ ]')
          : (onCursor ? '(o)' : '( )');
        const text = ch.description ? `${ch.label} — ${ch.description}` : ch.label;
        let line = truncate(`${pointer} ${mark} ${text}`, width);
        if (onCursor) line = `${ansi.cyan}${line}${ansi.reset}`;
        stdout.write(line + '\n');
      });
      stdout.write(`${ansi.dim}${truncate(hint, width)}${ansi.reset}\n`);
    }

    function cleanup() {
      stdin.removeListener('data', onData);
      if (stdin.isTTY) stdin.setRawMode(false);
      stdin.pause();
      stdout.write('\x1b[?25h'); // show cursor
    }

    // Erase the whole selector — leading blank + message + choices + hint —
    // so it leaves nothing behind once a choice is made.
    function clearBlock() {
      stdout.write(`\x1b[${total + 1}A\r\x1b[0J`);
    }

    function onData(buf) {
      const s = buf.toString();
      if (s === '\x03') { // ctrl-c
        cleanup();
        stdout.write('\n');
        process.exit(130);
      } else if (s === 'q' && multi) { // abort = select nothing
        clearBlock();
        cleanup();
        resolve([]);
      } else if (s === '\r' || s === '\n') { // confirm
        clearBlock();
        cleanup();
        resolve(multi
          ? [...selected].sort((a, b) => a - b).map(i => choices[i].value)
          : choices[cursor].value);
      } else if (s === '\x1b[A' || s === 'k') { // up
        cursor = (cursor - 1 + choices.length) % choices.length;
        render(false);
      } else if (s === '\x1b[B' || s === 'j') { // down
        cursor = (cursor + 1) % choices.length;
        render(false);
      } else if (multi && s === ' ') { // toggle
        selected.has(cursor) ? selected.delete(cursor) : selected.add(cursor);
        render(false);
      } else if (multi && s === 'a') { // toggle all
        if (selected.size === choices.length) selected.clear();
        else choices.forEach((_, i) => selected.add(i));
        render(false);
      }
    }

    stdout.write('\n');        // leading margin — frames the selector
    stdout.write('\x1b[?25l'); // hide cursor
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');
    stdin.on('data', onData);
    render(true);
  });
}

export async function multiSelect(question, choices) {
  if (!isTTY() || choices.length === 0) return [];
  return keypressSelect({
    message: question,
    choices: choices.map(c => ({ label: c.id, value: c.id, description: c.description })),
    multi: true,
  });
}

export async function choice(question, options) {
  if (!isTTY() || options.length === 0) return options[0];
  return keypressSelect({
    message: question,
    choices: options.map(o => ({ label: o, value: o })),
    multi: false,
  });
}
