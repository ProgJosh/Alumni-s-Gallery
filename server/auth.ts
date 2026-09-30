export const id = () => crypto.randomUUID();
const bytes = (value: string) => new TextEncoder().encode(value);
const hex = (array: ArrayBuffer | Uint8Array) => [...new Uint8Array(array)].map(x=>x.toString(16).padStart(2,'0')).join('');
const fromHex = (value: string) => new Uint8Array(value.match(/.{2}/g)?.map(x=>parseInt(x,16))||[]);
export async function hashPassword(password:string, salt=hex(crypto.getRandomValues(new Uint8Array(16)))) {
  const key=await crypto.subtle.importKey('raw',bytes(password),'PBKDF2',false,['deriveBits']);
  const hash=await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:fromHex(salt),iterations:210000},key,256);
  return salt+':'+hex(hash);
}
export async function verifyPassword(password:string, stored:string){
  const [salt]=stored.split(':');
  if(!salt||!stored.includes(':'))return false;
  return (await hashPassword(password,salt))===stored;
}
export async function hashToken(token:string){return hex(await crypto.subtle.digest('SHA-256',bytes(token)))}
export const newToken=()=>hex(crypto.getRandomValues(new Uint8Array(32)));

