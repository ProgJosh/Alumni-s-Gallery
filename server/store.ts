import type { Audit, Batch, Comment, DirectoryResponse, Memory, Photo, Profile, Program, Report, Role, Verification, Viewer } from '../src/shared';
import { batches, memories, profiles, programs } from './seed';
export type UserRecord = { id: string; email: string; name: string; role: Role; verified: boolean; passwordHash: string };
export type SessionRecord = { tokenHash: string; userId: string; expiresAt: string };
export interface Store {
  userByEmail(email: string): Promise<UserRecord | null>;
  userById(id: string): Promise<UserRecord | null>;
  createUser(user: UserRecord): Promise<void>;
  updateUser(user: UserRecord): Promise<void>;
  putSession(session: SessionRecord): Promise<void>;
  session(tokenHash: string): Promise<SessionRecord | null>;
  deleteSession(tokenHash: string): Promise<void>;
  batches(): Promise<Batch[]>;
  programs(): Promise<Program[]>;
  saveBatch(batch: Batch): Promise<void>;
  deleteBatch(year:number):Promise<void>;
  saveProgram(program: Program): Promise<void>;
  deleteProgram(id: string): Promise<void>;
  profiles(): Promise<Profile[]>;
  directory?(query:{q:string;year:number;program:string;sort:string;page:number;viewer:Viewer}):Promise<DirectoryResponse>;
  saveProfile(profile: Profile): Promise<void>;
  memories(): Promise<Memory[]>;
  saveMemory(memory: Memory): Promise<void>;
  deleteMemory(id: string): Promise<void>;
  verifications(): Promise<Verification[]>;
  saveVerification(item: Verification): Promise<void>;
  comments(memoryId?: string): Promise<Comment[]>;
  saveComment(comment: Comment): Promise<void>;
  reports(): Promise<Report[]>;
  saveReport(report: Report): Promise<void>;
  audits(): Promise<Audit[]>;
  addAudit(audit: Audit): Promise<void>;
  addDecision(actorId:string,targetType:string,targetId:string,action:string,note:string):Promise<void>;
  photos(): Promise<Photo[]>;
  savePhoto(photo: Photo): Promise<void>;
  photoBytes?(key: string): Promise<{ data: ArrayBuffer; type: string } | null>;
  putPhotoBytes?(key: string, data: ArrayBuffer, type: string): Promise<void>;
  deletePhotoBytes?(key: string): Promise<void>;
  reactionCount(memoryId: string): Promise<number>;
  hasReacted(memoryId: string, userId: string): Promise<boolean>;
  toggleReaction(memoryId: string, userId: string): Promise<boolean>;
}
const clone = <T>(value: T): T => structuredClone(value);
export class MemoryStore implements Store {
  users: UserRecord[] = [];
  sessions: SessionRecord[] = [];
  batchRows = clone(batches); programRows = clone(programs); profileRows = clone(profiles); memoryRows = clone(memories);
  verificationRows: Verification[] = []; commentRows: Comment[] = []; reportRows: Report[] = []; auditRows: Audit[] = []; photoRows: Photo[] = [];
  reactions = new Set<string>(); blobs = new Map<string, { data: ArrayBuffer; type: string }>();
  async userByEmail(email:string){return this.users.find(x=>x.email===email)||null}
  async userById(id:string){return this.users.find(x=>x.id===id)||null}
  async createUser(x:UserRecord){this.users.push(clone(x))}
  async updateUser(x:UserRecord){this.users=this.users.map(v=>v.id===x.id?clone(x):v)}
  async putSession(x:SessionRecord){this.sessions.push(x)}
  async session(hash:string){return this.sessions.find(x=>x.tokenHash===hash&&new Date(x.expiresAt)>new Date())||null}
  async deleteSession(hash:string){this.sessions=this.sessions.filter(x=>x.tokenHash!==hash)}
  async batches(){return clone(this.batchRows)}
  async programs(){return clone(this.programRows)}
  async saveBatch(x:Batch){this.batchRows=this.batchRows.filter(v=>v.year!==x.year).concat(clone(x)).sort((a,b)=>b.year-a.year)}
  async deleteBatch(year:number){this.batchRows=this.batchRows.filter(x=>x.year!==year)}
  async saveProgram(x:Program){this.programRows=this.programRows.filter(v=>v.id!==x.id).concat(clone(x))}
  async deleteProgram(id:string){this.programRows=this.programRows.filter(v=>v.id!==id)}
  async profiles(){return clone(this.profileRows)}
  async saveProfile(x:Profile){this.profileRows=this.profileRows.filter(v=>v.id!==x.id).concat(clone(x))}
  async memories(){return clone(this.memoryRows)}
  async saveMemory(x:Memory){this.memoryRows=this.memoryRows.filter(v=>v.id!==x.id).concat(clone(x))}
  async deleteMemory(id:string){this.memoryRows=this.memoryRows.filter(v=>v.id!==id)}
  async verifications(){return clone(this.verificationRows)}
  async saveVerification(x:Verification){this.verificationRows=this.verificationRows.filter(v=>v.id!==x.id).concat(clone(x))}
  async comments(id?:string){return clone(this.commentRows.filter(x=>!id||x.memoryId===id))}
  async saveComment(x:Comment){this.commentRows=this.commentRows.filter(v=>v.id!==x.id).concat(clone(x))}
  async reports(){return clone(this.reportRows)}
  async saveReport(x:Report){this.reportRows=this.reportRows.filter(v=>v.id!==x.id).concat(clone(x))}
  async audits(){return clone(this.auditRows)}
  async addAudit(x:Audit){this.auditRows.unshift(clone(x))}
  async addDecision(actorId:string,targetType:string,targetId:string,action:string,note:string){this.auditRows.unshift({id:crypto.randomUUID(),actor:actorId,action:'review '+action,target:targetType+':'+targetId+(note?' '+note:''),createdAt:new Date().toISOString()})}
  async photos(){return clone(this.photoRows)}
  async savePhoto(x:Photo){this.photoRows=this.photoRows.filter(v=>v.id!==x.id).concat(clone(x))}
  async photoBytes(key:string){return this.blobs.get(key)||null}
  async putPhotoBytes(key:string,data:ArrayBuffer,type:string){this.blobs.set(key,{data,type})}
  async deletePhotoBytes(key:string){this.blobs.delete(key)}
  async reactionCount(id:string){return [...this.reactions].filter(x=>x.startsWith(id+':')).length}
  async hasReacted(id:string,userId:string){return this.reactions.has(id+':'+userId)}
  async toggleReaction(id:string,userId:string){const key=id+':'+userId;if(this.reactions.has(key)){this.reactions.delete(key);return false}this.reactions.add(key);return true}
}
