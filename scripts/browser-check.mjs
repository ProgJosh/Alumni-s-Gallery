import { chromium } from 'playwright-core';
import { mkdir } from 'node:fs/promises';
const browser=await chromium.launch({executablePath:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',headless:true});
await mkdir('artifacts',{recursive:true});
const errors=[];
const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});
await page.screenshot({path:'artifacts/home-desktop.png',fullPage:true});
await page.screenshot({path:'artifacts/home-desktop-view.jpg',type:'jpeg',quality:55});
await page.getByRole('link',{name:'Alumni',exact:true}).click();
await page.getByPlaceholder('Search by name or motto').fill('Maya');
await page.waitForTimeout(400);
if(!(await page.getByText('1 alumni to discover').isVisible()))throw new Error('Directory search failed');
await page.getByRole('link',{name:/Maya Chen/}).click();
await page.getByRole('heading',{name:'Maya Chen'}).waitFor({timeout:10000});
await page.screenshot({path:'artifacts/profile-desktop.png',fullPage:true});
await page.reload({waitUntil:'networkidle'});
await page.getByRole('heading',{name:'Maya Chen'}).waitFor({timeout:10000});
await page.goto('http://127.0.0.1:5173/join',{waitUntil:'networkidle'});
await page.getByRole('tab',{name:'Sign in'}).click();
await page.getByPlaceholder('you@example.com').fill('admin@example.test');
await page.getByPlaceholder('••••••••••••').fill('AdminDemo2026!');
await page.getByRole('button',{name:'Sign in',exact:true}).click();
await page.getByRole('heading',{name:/Welcome back/}).waitFor({timeout:10000});
await page.goto('http://127.0.0.1:5173/admin',{waitUntil:'networkidle'});
await page.getByRole('heading',{name:'The review desk.'}).waitFor({timeout:10000});
await page.getByRole('button',{name:'Years & programs'}).click();
await page.getByRole('heading',{name:'Featured memories'}).waitFor({timeout:10000});
await page.screenshot({path:'artifacts/admin-desktop.png',fullPage:true});
const mobile=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});
mobile.on('pageerror',e=>errors.push(e.message));
await mobile.emulateMedia({reducedMotion:'reduce'});
await mobile.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});
await mobile.screenshot({path:'artifacts/home-mobile.png',fullPage:true});
await mobile.screenshot({path:'artifacts/home-mobile-view.jpg',type:'jpeg',quality:55});
await mobile.getByRole('button',{name:'Open menu'}).click();
if(!(await mobile.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:'Memories'}).isVisible()))throw new Error('Mobile menu failed');
await mobile.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:'Memories'}).click();
await mobile.getByRole('heading',{name:'Moments that stayed.'}).waitFor({timeout:10000});
await mobile.screenshot({path:'artifacts/memories-mobile.png',fullPage:true});
await browser.close();
if(errors.length)throw new Error(errors.join('\n'));
console.log('Browser checks passed: desktop search/profile/refresh, mobile menu/navigation, reduced motion.');




