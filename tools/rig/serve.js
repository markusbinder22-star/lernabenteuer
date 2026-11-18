// tiny static server + playwright driver: node serve.js page.html [args json]
const {chromium}=require('playwright');const fs=require('fs');const http=require('http');const path=require('path');
const root=process.env.ROOT||__dirname;
const types={'.js':'text/javascript','.mjs':'text/javascript','.html':'text/html','.json':'application/json','.png':'image/png','.bin':'application/octet-stream','.glb':'model/gltf-binary'};
const srv=http.createServer((q,res)=>{let u=decodeURIComponent(q.url.split('?')[0]);
 if(q.method==='POST'){let b=[];q.on('data',c=>b.push(c));q.on('end',()=>{const p=path.join(process.env.OUT||'out',u);fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,Buffer.concat(b));res.end('ok')});return;}
 const p=path.join(root,u);res.setHeader('Content-Type',types[path.extname(p)]||'application/octet-stream');fs.createReadStream(p).on('error',()=>{res.statusCode=404;res.end()}).pipe(res)}).listen(0,async()=>{
 const port=srv.address().port;
 const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--js-flags=--max-old-space-size=4096']});
 const pg=await b.newPage();pg.on('console',m=>console.log('[pg]',m.text()));pg.on('pageerror',e=>console.log('[err]',e.message));
 await pg.goto(`http://localhost:${port}/${process.argv[2]}?${encodeURIComponent(process.argv[3]||'{}')}`);
 await pg.waitForFunction('window.DONE',{timeout:3600000,polling:500});
 await b.close();srv.close();});
