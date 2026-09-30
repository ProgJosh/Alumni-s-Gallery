import { readFile } from 'node:fs/promises';
import postgres from 'postgres';
const url=process.env.DATABASE_URL;
if(!url)throw new Error('Set DATABASE_URL before running migrations.');
const sql=postgres(url,{max:1,prepare:false});
const content=await readFile(new URL('../migrations/001_initial.sql',import.meta.url),'utf8');
await sql.unsafe(content);
await sql.end();
console.log('Applied 001_initial.sql');

