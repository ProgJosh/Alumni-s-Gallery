import { createApi } from '../server/api';
import { PgStore, connect } from './db-store';
type Env={HYPERDRIVE:{connectionString:string};PHOTOS:R2Bucket;APP_ORIGIN:string;ASSETS:Fetcher};
const app=createApi(c=>{
 const env=c.env as Env;
 const store=new PgStore(connect(env.HYPERDRIVE.connectionString));
 store.putPhotoBytes=async(key,data,type)=>{await env.PHOTOS.put(key,data,{httpMetadata:{contentType:type}})};
 store.photoBytes=async key=>{const obj=await env.PHOTOS.get(key);return obj?{data:await obj.arrayBuffer(),type:obj.httpMetadata?.contentType||'application/octet-stream'}:null};
 store.deletePhotoBytes=async key=>{await env.PHOTOS.delete(key)};
 return store;
},{demo:false,origin:c=>(c.env as Env).APP_ORIGIN});
export default app;


