import { serve } from '@hono/node-server';
import { createApi } from './api';
import { MemoryStore } from './store';
import { hashPassword } from './auth';
import { profiles } from './seed';
const store=new MemoryStore();
const demoPassword='AlumniDemo2026!';
const users=[
  ...profiles.map(p=>({id:p.userId,name:p.name,email:p.id+'@example.test',role:'alumnus' as const,verified:true})),
  {id:'u-mod',name:'Morgan Vale',email:'moderator@example.test',role:'moderator' as const,verified:true},
  {id:'u-admin',name:'Riley Hart',email:'admin@example.test',role:'administrator' as const,verified:true}
];
for(const u of users)await store.createUser({...u,passwordHash:await hashPassword(u.role==='moderator'?'ModeratorDemo2026!':u.role==='administrator'?'AdminDemo2026!':demoPassword)});
const app=createApi(()=>store,{demo:true,origin:'http://127.0.0.1:5173'});
serve({fetch:app.fetch,port:8788,hostname:'127.0.0.1'},info=>console.log('Fictional demo API at http://127.0.0.1:'+info.port));

