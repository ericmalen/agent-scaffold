const isTTY = process.stdout.isTTY;

const c = {
  reset:  isTTY ? '\x1b[0m'  : '',
  bold:   isTTY ? '\x1b[1m'  : '',
  dim:    isTTY ? '\x1b[2m'  : '',
  green:  isTTY ? '\x1b[32m' : '',
  yellow: isTTY ? '\x1b[33m' : '',
  red:    isTTY ? '\x1b[31m' : '',
  cyan:   isTTY ? '\x1b[36m' : '',
};

export const log = {
  info(msg)    { console.log(`  ${msg}`); },
  success(msg) { console.log(`${c.green}ok${c.reset}  ${msg}`); },
  warn(msg)    { console.warn(`${c.yellow}!!${c.reset}  ${msg}`); },
  error(msg)   { console.error(`${c.red}ERR${c.reset} ${msg}`); },
  step(msg)    { console.log(`${c.cyan}>>${c.reset}  ${msg}`); },
  header(msg)  { console.log(`\n${c.bold}${msg}${c.reset}`); },
  dim(msg)     { console.log(`${c.dim}  ${msg}${c.reset}`); },
  blank()      { console.log(''); },
};
