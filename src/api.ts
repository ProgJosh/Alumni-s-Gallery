import type { Bootstrap, DirectoryResponse, Memory, Profile, Viewer } from './shared';
export async function api<T>(path:string,init?:RequestInit):Promise<T>{
 const response=await fetch('/api'+path,{credentials:'same-origin',...init,headers:init?.body instanceof FormData?init.headers:{'content-type':'application/json',...init?.headers}});
 const data=await response.json().catch(()=>({error:'Unexpected server response'})) as {error?:string};
 if(!response.ok)throw new Error(data.error||'Request failed');
 return data as T;
}
export const json=(method:string,value:unknown):RequestInit=>({method,body:JSON.stringify(value)});
export const bootstrap=()=>api<Bootstrap>('/bootstrap');
export const directory=(search:string)=>api<DirectoryResponse>('/profiles'+search);
export const profile=(id:string)=>api<{profile:Profile;memories:Memory[]}>('/profiles/'+encodeURIComponent(id));
export const me=()=>api<{viewer:Viewer;profile:Profile|null;memories:Memory[];verification:{status:string}|null}>('/me');


