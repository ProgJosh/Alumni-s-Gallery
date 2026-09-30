import { createContext, useContext, useEffect, useState } from 'react';
import { BrowserRouter, Link, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { ArrowUpRight, BookOpen, Menu, X } from 'lucide-react';
import type { Bootstrap } from './shared';
import { bootstrap } from './api';
import { Home, Directory, BatchPage, ProfilePage, MemoriesPage, MemoryPage } from './pages/Browse';
import { AccountPage, AuthPage, AdminPage } from './pages/Manage';
type AppContext={data:Bootstrap;refresh:()=>Promise<void>};
const Context=createContext<AppContext|null>(null);
export const useApp=()=>{const value=useContext(Context);if(!value)throw new Error('App unavailable');return value};
function Shell(){const [data,setData]=useState<Bootstrap|null>(null),[error,setError]=useState(''),[menu,setMenu]=useState(false);const location=useLocation();
 async function refresh(){try{setData(await bootstrap());setError('')}catch(e){setError((e as Error).message)}}
 useEffect(()=>{void refresh()},[]);
 useEffect(()=>{setMenu(false);window.scrollTo({top:0,behavior:'instant'})},[location.pathname]);
 if(error&&!data)return <div className="container py-5"><h1>We could not open the gallery</h1><p>{error}</p><button className="btn btn-primary" onClick={()=>void refresh()}>Try again</button></div>;
 if(!data)return <div className="app-loading"><div className="brand-mark"><img src="/brand-mark-light.svg" alt=""/></div><span>Opening the gallery…</span></div>;
 const nav=[['/','Home'],['/alumni','Alumni'],['/years/2024','Yearbook'],['/memories','Memories']];
 return <Context.Provider value={{data,refresh}}><div className="app-shell">
  <div className="demo-banner">FICTIONAL DEMO <span aria-hidden="true">✦</span> Sample people, stories, and photographs</div>
  <header className="site-header"><div className="container-fluid shell-width header-inner">
   <Link to="/" className="brand" aria-label="Alumni Gallery home"><span className="brand-mark"><img src="/brand-mark.svg" alt=""/></span><span className="brand-type"><strong>Alumni</strong><em>Gallery</em></span></Link>
   <nav className={'main-nav '+(menu?'is-open':'')} aria-label="Main navigation">{nav.map(([url,label])=><NavLink key={url} to={url} end={url==='/'} className={({isActive})=>isActive?'active':''}>{label}</NavLink>)}<Link className="mobile-account" to={data.viewer?'/account':'/join'}>{data.viewer?'My space':'Join the gallery'}</Link></nav>
   <div className="header-actions"><Link className="header-join" to={data.viewer?'/account':'/join'}>{data.viewer?'My space':'Join the gallery'} <ArrowUpRight size={16}/></Link><button className="nav-toggle" type="button" aria-label={menu?'Close menu':'Open menu'} aria-expanded={menu} onClick={()=>setMenu(!menu)}>{menu?<X/>:<Menu/>}</button></div>
  </div></header>
  <main id="main"><Routes><Route path="/" element={<Home/>}/><Route path="/alumni" element={<Directory/>}/><Route path="/alumni/:id" element={<ProfilePage/>}/><Route path="/years/:year" element={<BatchPage/>}/><Route path="/memories" element={<MemoriesPage/>}/><Route path="/memories/:id" element={<MemoryPage/>}/><Route path="/join" element={<AuthPage/>}/><Route path="/account" element={<AccountPage/>}/><Route path="/admin" element={<AdminPage/>}/><Route path="*" element={<div className="container section-space text-center"><BookOpen size={40}/><h1>That page is not in this yearbook.</h1><Link className="btn btn-primary mt-3" to="/">Back to the beginning</Link></div>}/></Routes></main>
  <footer className="site-footer"><div className="container-fluid shell-width footer-grid"><div><Link to="/" className="brand light"><span className="brand-mark"><img src="/brand-mark-light.svg" alt=""/></span><span className="brand-type"><strong>Alumni</strong><em>Gallery</em></span></Link><p>Every story belongs somewhere.<br/>Yours belongs here.</p></div><div><span className="footer-label">EXPLORE</span><Link to="/alumni">Find your people</Link><Link to="/years/2024">Browse yearbooks</Link><Link to="/memories">Read memories</Link></div><div><span className="footer-label">YOUR GALLERY</span><Link to={data.viewer?'/account':'/join'}>{data.viewer?'My space':'Join the gallery'}</Link>{data.viewer?.role!=='alumnus'&&data.viewer&&<Link to="/admin">Moderation</Link>}<p className="footer-note">A fictional product demo. Configure your school identity and production services before launch.</p></div></div><div className="container-fluid shell-width footer-bottom"><span>© Alumni Gallery</span><span>Made for the moments that stay.</span></div></footer>
 </div></Context.Provider>
}
export default function App(){return <BrowserRouter><Shell/></BrowserRouter>}
