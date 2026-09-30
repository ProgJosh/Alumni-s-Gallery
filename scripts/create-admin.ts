import postgres from 'postgres';
import { hashPassword, id } from '../server/auth';
const url=process.env.DATABASE_URL,email=process.env.ADMIN_EMAIL,password=process.env.ADMIN_PASSWORD;
if(!url||!email||!password)throw new Error('Set DATABASE_URL, ADMIN_EMAIL and ADMIN_PASSWORD.');
if(password.length<12)throw new Error('Use a password of at least 12 characters.');
const sql=postgres(url,{max:1});
await sql`INSERT INTO users (id,email,name,role,verified,password_hash) VALUES (${id()},${email.toLowerCase()},'School Administrator','administrator',true,${await hashPassword(password)})`;
await sql.end();
console.log('Administrator created: '+email);

