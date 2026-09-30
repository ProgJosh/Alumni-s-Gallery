import postgres, { type Sql } from 'postgres';
import type { Audit, Batch, Comment, DirectoryResponse, Memory, Photo, Profile, Program, Report, Verification, Viewer } from '../src/shared';
import type { SessionRecord, Store, UserRecord } from '../server/store';
export class PgStore implements Store {
  photoBytes?: (key:string)=>Promise<{data:ArrayBuffer;type:string}|null>;
  putPhotoBytes?: (key:string,data:ArrayBuffer,type:string)=>Promise<void>;
  deletePhotoBytes?: (key:string)=>Promise<void>;
  constructor(private sql: Sql) {}
  async userByEmail(email:string){const r=await this.sql`SELECT * FROM users WHERE email=${email}`;return mapUser(r[0])}
  async userById(id:string){const r=await this.sql`SELECT * FROM users WHERE id=${id}`;return mapUser(r[0])}
  async createUser(x:UserRecord){await this.sql`INSERT INTO users (id,email,name,role,verified,password_hash) VALUES (${x.id},${x.email},${x.name},${x.role},${x.verified},${x.passwordHash})`}
  async updateUser(x:UserRecord){await this.sql`UPDATE users SET name=${x.name},role=${x.role},verified=${x.verified} WHERE id=${x.id}`}
  async putSession(x:SessionRecord){await this.sql`INSERT INTO sessions (token_hash,user_id,expires_at) VALUES (${x.tokenHash},${x.userId},${x.expiresAt})`}
  async session(hash:string){const r=await this.sql`SELECT token_hash,user_id,expires_at FROM sessions WHERE token_hash=${hash} AND expires_at>now()`;return r[0]?{tokenHash:r[0].token_hash,userId:r[0].user_id,expiresAt:String(r[0].expires_at)}:null}
  async deleteSession(hash:string){await this.sql`DELETE FROM sessions WHERE token_hash=${hash}`}
  async batches(){const r=await this.sql`SELECT year,theme,subtitle,cover_key FROM batches ORDER BY year DESC`;return r.map(x=>({year:x.year,theme:x.theme,subtitle:x.subtitle,cover:x.cover_key||undefined})) as Batch[]}
  async programs(){const r=await this.sql`SELECT id,name,short FROM programs ORDER BY name`;return r as unknown as Program[]}
  async saveBatch(x:Batch){await this.sql`INSERT INTO batches (year,theme,subtitle,cover_key) VALUES (${x.year},${x.theme},${x.subtitle},${x.cover||null}) ON CONFLICT (year) DO UPDATE SET theme=EXCLUDED.theme,subtitle=EXCLUDED.subtitle,cover_key=EXCLUDED.cover_key`}
  async saveProgram(x:Program){await this.sql`INSERT INTO programs (id,name,short) VALUES (${x.id},${x.name},${x.short}) ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name,short=EXCLUDED.short`}
  async deleteProgram(id:string){await this.sql`DELETE FROM programs WHERE id=${id}`}
  async directory(query:{q:string;year:number;program:string;sort:string;page:number;viewer:Viewer}):Promise<DirectoryResponse>{
    const {q,year,program,sort,page,viewer}=query, verified=!!viewer?.verified, moderator=viewer?.role==='moderator'||viewer?.role==='administrator', userId=viewer?.id||'', pattern='%'+q+'%';
    const count=await this.sql`SELECT count(*)::integer AS n FROM alumni_profiles WHERE status='published' AND (visibility='public' OR (visibility='alumni' AND ${verified}) OR (${userId}<>'' AND user_id=${userId}) OR ${moderator}) AND (${year}=0 OR graduation_year=${year}) AND (${program}='' OR program_id=${program}) AND (${q}='' OR lower(display_name) LIKE ${pattern} OR lower(data->>'motto') LIKE ${pattern})`;
    const rows=await this.sql`SELECT data FROM alumni_profiles WHERE status='published' AND (visibility='public' OR (visibility='alumni' AND ${verified}) OR (${userId}<>'' AND user_id=${userId}) OR ${moderator}) AND (${year}=0 OR graduation_year=${year}) AND (${program}='' OR program_id=${program}) AND (${q}='' OR lower(display_name) LIKE ${pattern} OR lower(data->>'motto') LIKE ${pattern}) ORDER BY CASE WHEN ${sort}='year' THEN graduation_year END DESC, CASE WHEN ${sort}='year-asc' THEN graduation_year END ASC, display_name ASC LIMIT 12 OFFSET ${(page-1)*12}`;
    const total=count[0].n as number;return {items:rows.map(x=>x.data as Profile),total,page,pages:Math.max(1,Math.ceil(total/12))};
  }
  async profiles(){const r=await this.sql`SELECT data FROM alumni_profiles`;return r.map(x=>x.data as Profile)}
  async saveProfile(x:Profile){await this.sql`INSERT INTO alumni_profiles (id,user_id,display_name,graduation_year,program_id,visibility,status,data) VALUES (${x.id},${x.userId},${x.name},${x.year},${x.programId},${x.visibility},${x.status},${this.sql.json(x)}) ON CONFLICT (id) DO UPDATE SET display_name=EXCLUDED.display_name,graduation_year=EXCLUDED.graduation_year,program_id=EXCLUDED.program_id,visibility=EXCLUDED.visibility,status=EXCLUDED.status,data=EXCLUDED.data,updated_at=now()`}
  async memories(){const r=await this.sql`SELECT data FROM memories`;return r.map(x=>x.data as Memory)}
  async saveMemory(x:Memory){await this.sql`INSERT INTO memories (id,owner_id,graduation_year,visibility,status,featured,data,created_at) VALUES (${x.id},${x.ownerId},${x.year},${x.visibility},${x.status},${x.featured},${this.sql.json(x)},${x.createdAt}) ON CONFLICT (id) DO UPDATE SET visibility=EXCLUDED.visibility,status=EXCLUDED.status,featured=EXCLUDED.featured,data=EXCLUDED.data,updated_at=now()`}
  async deleteMemory(id:string){await this.sql`DELETE FROM memories WHERE id=${id}`}
  async verifications(){const r=await this.sql`SELECT data FROM verification_requests`;return r.map(x=>x.data as Verification)}
  async saveVerification(x:Verification){await this.sql`INSERT INTO verification_requests (id,user_id,status,data) VALUES (${x.id},${x.userId},${x.status},${this.sql.json(x)}) ON CONFLICT (id) DO UPDATE SET status=EXCLUDED.status,data=EXCLUDED.data`}
  async comments(id?:string){const r=id?await this.sql`SELECT data FROM comments WHERE memory_id=${id}`:await this.sql`SELECT data FROM comments`;return r.map(x=>x.data as Comment)}
  async saveComment(x:Comment){await this.sql`INSERT INTO comments (id,memory_id,user_id,status,data) VALUES (${x.id},${x.memoryId},${x.userId},${x.status},${this.sql.json(x)}) ON CONFLICT (id) DO UPDATE SET status=EXCLUDED.status,data=EXCLUDED.data`}
  async reports(){const r=await this.sql`SELECT data FROM reports ORDER BY created_at DESC`;return r.map(x=>x.data as Report)}
  async saveReport(x:Report){await this.sql`INSERT INTO reports (id,reporter_id,target_type,target_id,status,data) VALUES (${x.id},${x.reporterId},${x.targetType},${x.targetId},${x.status},${this.sql.json(x)}) ON CONFLICT (id) DO UPDATE SET status=EXCLUDED.status,data=EXCLUDED.data`}
  async audits(){const r=await this.sql`SELECT id,actor_id,action,target,created_at FROM audit_events ORDER BY created_at DESC LIMIT 100`;return r.map(x=>({id:x.id,actor:x.actor_id,action:x.action,target:x.target,createdAt:String(x.created_at)})) as Audit[]}
  async addAudit(x:Audit){await this.sql`INSERT INTO audit_events (id,actor_id,action,target,created_at) VALUES (${x.id},${x.actor},${x.action},${x.target},${x.createdAt})`}
  async addDecision(actorId:string,targetType:string,targetId:string,action:string,note:string){await this.sql`INSERT INTO moderation_decisions (id,moderator_id,target_type,target_id,action,note) VALUES (${crypto.randomUUID()},${actorId},${targetType},${targetId},${action},${note})`}
  async photos(){const r=await this.sql`SELECT data FROM photos`;return r.map(x=>x.data as Photo)}
  async savePhoto(x:Photo){await this.sql`INSERT INTO photos (id,owner_id,object_key,visibility,status,data) VALUES (${x.id},${x.ownerId},${x.key},${x.visibility},${x.status},${this.sql.json(x)}) ON CONFLICT (id) DO UPDATE SET visibility=EXCLUDED.visibility,status=EXCLUDED.status,data=EXCLUDED.data`}
  async reactionCount(id:string){const r=await this.sql`SELECT count(*)::integer AS n FROM reactions WHERE memory_id=${id}`;return r[0].n}
  async hasReacted(id:string,userId:string){const r=await this.sql`SELECT 1 FROM reactions WHERE memory_id=${id} AND user_id=${userId}`;return !!r.length}
  async toggleReaction(id:string,userId:string){if(await this.hasReacted(id,userId)){await this.sql`DELETE FROM reactions WHERE memory_id=${id} AND user_id=${userId}`;return false}await this.sql`INSERT INTO reactions (memory_id,user_id) VALUES (${id},${userId}) ON CONFLICT DO NOTHING`;return true}
}
function mapUser(x: Record<string,unknown>|undefined):UserRecord|null {return x?{id:String(x.id),email:String(x.email),name:String(x.name),role:x.role as UserRecord['role'],verified:Boolean(x.verified),passwordHash:String(x.password_hash)}:null}
export const connect = (connectionString:string) => postgres(connectionString,{max:5,fetch_types:false,prepare:true});





