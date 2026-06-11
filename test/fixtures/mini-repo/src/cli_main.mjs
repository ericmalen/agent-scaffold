#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { parse_args } from './parse_args.mjs';
import { word_count } from './word_count.mjs';
import { format_table } from './format_table.mjs';

const opts = parse_args(process.argv.slice(2));
const text = opts.files.map((f) => readFileSync(f, 'utf8')).join('\n');
console.log(format_table(word_count(text), opts.top));
