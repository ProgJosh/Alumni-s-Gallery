import { beforeEach, describe, expect, it } from 'vitest';
import { createApi } from '../server/api';
import { MemoryStore } from '../server/store';
import { hashPassword } from '../server/auth';
import type { Profile } from '../src/shared';
let store:MemoryStore;
let app:ReturnType<typeof createApi>;
async function req(path:string,method='GET',body?:unknown,cookie?:string){
 const headers:Record<string,string>={};
 if(body!==undefined)headers['content-type']='application/json';
 if(cookie)headers.cookie=cookie;
 return app.request('http://localhost'+path,{method,headers,body:body===undefined?undefined:JSON.stringify(body)});
}
async function login(email:string,password:string){const r=await req('/api/auth/login','POST',{email,password});expect(r.status).toBe(200);return r.headers.get('set-cookie')!.split(';')[0]}
beforeEach(async()=>{
 store=new MemoryStore();
 await store.createUser({id:'u-maya',email:'maya-chen@example.test',name:'Maya Chen',role:'alumnus',verified:true,passwordHash:await hashPassword('AlumniDemo2026!')});
 await store.createUser({id:'u-mod',email:'mod@example.test',name:'Moderator',role:'moderator',verified:true,passwordHash:await hashPassword('ModeratorDemo2026!')});
 await store.createUser({id:'u-admin',email:'admin@example.test',name:'Administrator',role:'administrator',verified:true,passwordHash:await hashPassword('AdminDemo2026!')});
 app=createApi(()=>store,{demo:true,origin:'http://127.0.0.1:5173'});
});
describe('public discovery and privacy',()=>{
 it('filters years, searches names, and opens a public profile',async()=>{
  const r=await req('/api/profiles?year=2024&q=maya');expect(r.status).toBe(200);
  const result:any=await r.json();expect(result.total).toBe(1);expect(result.items[0].name).toBe('Maya Chen');
  const p=await req('/api/profiles/maya-chen');expect(p.status).toBe(200);
  const batch=await req('/api/batches/2024');expect(batch.status).toBe(200);
 });
 it('hides unpublished and restricted content from visitors',async()=>{
  const existing=(await store.profiles())[0];
  await store.saveProfile({...existing,visibility:'hidden'});
  const dir:any=await (await req('/api/profiles')).json();expect(dir.items.find((x:Profile)=>x.id===existing.id)).toBeUndefined();
  expect((await req('/api/profiles/'+existing.id)).status).toBe(404);
  const m=(await store.memories())[0];await store.saveMemory({...m,visibility:'alumni'});
  expect((await req('/api/memories/'+m.id)).status).toBe(404);
  const cookie=await login('maya-chen@example.test','AlumniDemo2026!');
  expect((await req('/api/memories/'+m.id,'GET',undefined,cookie)).status).toBe(200);
 });
});
describe('submissions and moderation',()=>{
 it('registers, submits content, and requires verification before approval',async()=>{
  const registered=await req('/api/auth/register','POST',{name:'Taylor Reed',email:'taylor@example.test',password:'StrongPassword2026!',year:2024,programId:'arts',evidence:'Student record reference 1234'});
  expect(registered.status).toBe(201);
  const alumniCookie=registered.headers.get('set-cookie')!.split(';')[0];
  const p=await req('/api/me/profile','PUT',{name:'Taylor Reed',year:2024,programId:'arts',motto:'Keep the good stories.',bio:'A story of late night rehearsals.',visibility:'public',links:[]},alumniCookie);
  expect(p.status).toBe(200);const submittedProfile=(await p.json() as any).profile;expect(submittedProfile.status).toBe('pending');
  const m=await req('/api/memories','POST',{title:'The rehearsal room',body:'We practiced until the moon appeared above campus.',year:2024,visibility:'public'},alumniCookie);
  expect(m.status).toBe(201);const memory=(await m.json() as any).memory;
  expect((await req('/api/memories/'+memory.id)).status).toBe(404);
  const mod=await login('mod@example.test','ModeratorDemo2026!');
  const queue:any=await (await req('/api/admin','GET',undefined,mod)).json();
  expect(queue.verification.length).toBe(1);expect(queue.profiles.length).toBe(1);
  expect((await req('/api/admin/review','POST',{type:'profile',id:submittedProfile.id,status:'published',note:''},mod)).status).toBe(409);
  expect((await req('/api/admin/review','POST',{type:'verification',id:queue.verification[0].id,status:'published',note:''},mod)).status).toBe(200);
  expect((await req('/api/admin/review','POST',{type:'profile',id:submittedProfile.id,status:'published',note:''},mod)).status).toBe(200);
  expect((await req('/api/admin/review','POST',{type:'memory',id:memory.id,status:'published',note:''},mod)).status).toBe(200);
  expect((await req('/api/memories/'+memory.id)).status).toBe(200);
 });
 it('rejects unauthorized editing and admin access',async()=>{
  const maya=await login('maya-chen@example.test','AlumniDemo2026!');
  expect((await req('/api/admin','GET',undefined,maya)).status).toBe(403);
  expect((await req('/api/memories/m2','DELETE',undefined,maya)).status).toBe(404);
  expect((await req('/api/me/profile','PUT',{name:'Impostor',year:2024,programId:'arts',motto:'Test',bio:'',visibility:'public',portrait:'/api/photos/not-mine',links:[]},maya)).status).toBe(400);
 });
 it('allows owners to edit and withdraw memories',async()=>{
  const maya=await login('maya-chen@example.test','AlumniDemo2026!');
  const m=(await store.memories())[0];
  const edited=await req('/api/memories/'+m.id,'PUT',{title:'A revised evening',body:'A longer version of that last evening together.',year:2024,visibility:'hidden',image:m.image},maya);
  expect(edited.status).toBe(200);expect((await edited.json() as any).memory.status).toBe('pending');
  expect((await req('/api/memories/'+m.id)).status).toBe(404);
  expect((await req('/api/memories/'+m.id,'DELETE',undefined,maya)).status).toBe(200);
  expect((await req('/api/memories/'+m.id)).status).toBe(404);
 });
});
describe('interaction and administration',()=>{
 it('records reactions, moderates comments, accepts reports, and manages programs',async()=>{
  const maya=await login('maya-chen@example.test','AlumniDemo2026!');
  const reaction=await req('/api/memories/m1/react','POST',undefined,maya);expect(reaction.status).toBe(200);expect((await reaction.json() as any).reacted).toBe(true);
  const comment=await req('/api/memories/m1/comments','POST',{body:'I remember the coffee cups!'},maya);expect(comment.status).toBe(201);
  const report=await req('/api/reports','POST',{targetType:'memory',targetId:'m1',reason:'Please review this story.'},maya);expect(report.status).toBe(201);
  const admin=await login('admin@example.test','AdminDemo2026!');
  const queue:any=await (await req('/api/admin','GET',undefined,admin)).json();expect(queue.comments).toHaveLength(1);expect(queue.reports).toHaveLength(1);
  expect((await req('/api/admin/review','POST',{type:'comment',id:queue.comments[0].id,status:'published',note:''},admin)).status).toBe(200);
  expect((await req('/api/admin/reports/'+queue.reports[0].id+'/resolve','POST',undefined,admin)).status).toBe(200);
  expect((await req('/api/admin/programs/design','PUT',{name:'Design Studies',short:'Design'},admin)).status).toBe(200);
  expect((await req('/api/admin/batches/2026','PUT',{theme:'New horizons',subtitle:'A new class.'},admin)).status).toBe(200);
  expect((await req('/api/bootstrap')).status).toBe(200);
  const mod=await login('mod@example.test','ModeratorDemo2026!');
  expect((await req('/api/admin/programs/denied','PUT',{name:'Denied',short:'No'},mod)).status).toBe(403);
 });
});




describe('photo approval and safe delivery',()=>{
 it('rejects disguised files and keeps pending or unreferenced photos private',async()=>{
  const maya=await login('maya-chen@example.test','AlumniDemo2026!');
  const invalid=new FormData();
  invalid.append('file',new File([new Uint8Array([1,2,3,4])],'fake.jpg',{type:'image/jpeg'}));
  invalid.append('alt','Portrait of Maya');
  const bad=await app.request('http://localhost/api/photos',{method:'POST',headers:{cookie:maya},body:invalid});
  expect(bad.status).toBe(400);
  const valid=new FormData();
  valid.append('file',new File([new Uint8Array([0xff,0xd8,0xff,0xd9])],'maya.jpg',{type:'image/jpeg'}));
  valid.append('alt','Portrait of Maya');
  const uploaded=await app.request('http://localhost/api/photos',{method:'POST',headers:{cookie:maya},body:valid});
  expect(uploaded.status).toBe(201);
  const photo=(await uploaded.json() as any).photo;
  expect((await req('/api/photos/'+photo.id)).status).toBe(404);
  expect((await req('/api/photos/'+photo.id,'GET',undefined,maya)).status).toBe(200);
  const mod=await login('mod@example.test','ModeratorDemo2026!');
  expect((await req('/api/admin/review','POST',{type:'photo',id:photo.id,status:'published',note:''},mod)).status).toBe(200);
  expect((await req('/api/photos/'+photo.id)).status).toBe(404);
  const p=(await store.profiles())[0];
  const submitted=await req('/api/me/profile','PUT',{name:p.name,year:p.year,programId:p.programId,motto:p.motto,bio:p.bio,visibility:'public',portrait:'/api/photos/'+photo.id,links:[]},maya);
  expect(submitted.status).toBe(200);
  expect((await req('/api/admin/review','POST',{type:'profile',id:p.id,status:'published',note:''},mod)).status).toBe(200);
  const publicPhoto=await req('/api/photos/'+photo.id);
  expect(publicPhoto.status).toBe(200);
  expect(publicPhoto.headers.get('cache-control')).toBe('private, no-store');
 });
});

