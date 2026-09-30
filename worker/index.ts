import { createApi } from '../server/api';
import { MemoryStore } from '../server/store';
import { PgStore, connect } from './db-store';
type Env={HYPERDRIVE?:{connectionString:string};PHOTOS?:R2Bucket;APP_ORIGIN?:string;ASSETS:Fetcher};
const demoStore=new MemoryStore();
const app=createApi(c=>{
 const env=c.env as Env;
 if(!env.HYPERDRIVE)return demoStore;
 const store=new PgStore(connect(env.HYPERDRIVE.connectionString));
 if(!env.PHOTOS)throw new Error('The PHOTOS R2 binding is required when Hyperdrive is configured.');
 store.putPhotoBytes=async(key,data,type)=>{await env.PHOTOS!.put(key,data,{httpMetadata:{contentType:type}})};
 store.photoBytes=async key=>{const obj=await env.PHOTOS!.get(key);return obj?{data:await obj.arrayBuffer(),type:obj.httpMetadata?.contentType||'application/octet-stream'}:null};
 store.deletePhotoBytes=async key=>{await env.PHOTOS!.delete(key)};
 return store;
},{demo:c=>!(c.env as Env).HYPERDRIVE,origin:c=>{const configured=(c.env as Env).APP_ORIGIN?.trim();return configured||new URL(c.req.url).origin}});
export default app;
