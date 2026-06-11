// usage: wordy [--top n] <file...>
export function parse_args(argv) {
  const opts = { top: 10, files: [] };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--top') opts.top = Number(argv[++i]);
    else opts.files.push(argv[i]);
  }
  return opts;
}
