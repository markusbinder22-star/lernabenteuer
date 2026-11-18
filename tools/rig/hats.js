import * as THREE from 'three';
const std=(c,o={})=>new THREE.MeshStandardMaterial({color:c,roughness:o.r??0.45,metalness:o.m??0,...(o.e?{emissive:o.e,emissiveIntensity:o.ei??0.4}:{})});
// all hats built around origin = top of head, +y up, +x forward
export const HATS={
 krone(){const g=new THREE.Group();const gold=std(0xffc531,{m:0.85,r:0.25});
  const band=new THREE.Mesh(new THREE.CylinderGeometry(0.075,0.08,0.05,24,1,true),gold);band.material.side=THREE.DoubleSide;g.add(band);
  for(let i=0;i<8;i++){const a=i/8*Math.PI*2;const sp=new THREE.Mesh(new THREE.ConeGeometry(0.018,0.05,8),gold);sp.position.set(Math.cos(a)*0.075,0.045,Math.sin(a)*0.075);g.add(sp);
   const b=new THREE.Mesh(new THREE.SphereGeometry(0.009,10,8),gold);b.position.set(Math.cos(a)*0.075,0.072,Math.sin(a)*0.075);g.add(b);}
  [[0xff2244,0],[0x22aaff,Math.PI/2],[0x33dd66,Math.PI],[0xaa44ff,-Math.PI/2]].forEach(([c,a])=>{const gem=new THREE.Mesh(new THREE.OctahedronGeometry(0.014),std(c,{r:0.1,m:0.2,e:c,ei:0.25}));gem.position.set(Math.cos(a)*0.081,0,Math.sin(a)*0.081);g.add(gem)});
  g.position.y=0.01;return g;},
 zauberhut(){const g=new THREE.Group();const m=std(0x4b2a9a,{r:0.7});const brim=new THREE.Mesh(new THREE.CylinderGeometry(0.15,0.15,0.012,32),m);g.add(brim);
  const pts=[];for(let i=0;i<=12;i++){const t=i/12;pts.push(new THREE.Vector2(0.085*(1-t)+0.004,t*0.24));}
  const cone=new THREE.Mesh(new THREE.LatheGeometry(pts,28),m);cone.rotation.z=0.25;cone.position.x=-0.01;g.add(cone);
  const band=new THREE.Mesh(new THREE.CylinderGeometry(0.087,0.087,0.025,28),std(0xffc531,{m:0.7,r:0.3}));band.position.y=0.015;g.add(band);
  for(let i=0;i<5;i++){const st=new THREE.Mesh(new THREE.OctahedronGeometry(0.012),std(0xffe066,{e:0xffcc00,ei:0.8}));const t=0.25+i*0.13;st.position.set(-0.01+Math.sin(0.25)*-t*0.24+0.05*Math.cos(i*2),t*0.2,0.06*(1-t)*Math.sign(Math.sin(i*1.7+0.3))+0.02);g.add(st);}
  return g;},
 piratenhut(){const g=new THREE.Group();const m=std(0x1d1d24,{r:0.8});const brim=new THREE.Mesh(new THREE.CylinderGeometry(0.15,0.15,0.014,3),m);brim.rotation.y=Math.PI/6;g.add(brim);
  const top=new THREE.Mesh(new THREE.SphereGeometry(0.09,24,12,0,Math.PI*2,0,Math.PI/2),m);top.scale.set(1,0.9,1);g.add(top);
  const trim=new THREE.Mesh(new THREE.TorusGeometry(0.13,0.006,6,3),std(0xffc531,{m:0.8,r:0.3}));trim.rotation.x=Math.PI/2;trim.rotation.z=Math.PI/6;trim.position.y=0.008;g.add(trim);
  const sk=new THREE.Mesh(new THREE.SphereGeometry(0.02,12,10),std(0xf4f0e6));sk.position.set(0.085,0.04,0);g.add(sk);return g;},
 wikingerhelm(){const g=new THREE.Group();const met=std(0xb8c0c8,{m:0.9,r:0.3});const dome=new THREE.Mesh(new THREE.SphereGeometry(0.1,28,14,0,Math.PI*2,0,Math.PI/2),met);g.add(dome);
  const band=new THREE.Mesh(new THREE.TorusGeometry(0.1,0.01,8,32),std(0x9a6a2a,{m:0.6,r:0.4}));band.rotation.x=Math.PI/2;g.add(band);
  const ridge=new THREE.Mesh(new THREE.TorusGeometry(0.1,0.008,8,32,Math.PI),std(0x9a6a2a,{m:0.6,r:0.4}));ridge.rotation.y=Math.PI/2;g.add(ridge);
  for(const s of [1,-1]){const c=new THREE.CatmullRomCurve3([new THREE.Vector3(0,0.03,0.09*s),new THREE.Vector3(0,0.07,0.16*s),new THREE.Vector3(0.02,0.15,0.18*s)]);const h=new THREE.Mesh(new THREE.TubeGeometry(c,16,0.018,10),std(0xf3ead2,{r:0.5}));g.add(h);}
  g.position.y=-0.02;return g;},
 blumenkranz(){const g=new THREE.Group();const ring=new THREE.Mesh(new THREE.TorusGeometry(0.1,0.012,8,32),std(0x3c9a3c,{r:0.7}));ring.rotation.x=Math.PI/2;g.add(ring);
  const cols=[0xff6fa8,0xffe14d,0xffffff,0xff8a3d,0xb07cff];for(let i=0;i<10;i++){const a=i/10*Math.PI*2;const f=new THREE.Group();
   for(let p=0;p<5;p++){const pe=new THREE.Mesh(new THREE.SphereGeometry(0.012,8,6),std(cols[i%5],{r:0.6}));pe.scale.set(1,0.4,1);const b=p/5*Math.PI*2;pe.position.set(Math.cos(b)*0.013,0,Math.sin(b)*0.013);f.add(pe);}
   const c=new THREE.Mesh(new THREE.SphereGeometry(0.008,8,6),std(0xffcc00));f.add(c);f.position.set(Math.cos(a)*0.1,0.012,Math.sin(a)*0.1);f.rotation.set(0.4*Math.cos(a),0,0.4*Math.sin(a));g.add(f);}
  return g;},
 fliegerbrille(){const g=new THREE.Group();const strap=new THREE.Mesh(new THREE.TorusGeometry(0.105,0.012,8,40),std(0x6b3f1f,{r:0.8}));strap.rotation.x=Math.PI/2;strap.scale.set(1,1.15,1);g.add(strap);
  for(const s of [1,-1]){const ring=new THREE.Mesh(new THREE.TorusGeometry(0.032,0.01,10,24),std(0xc89b3c,{m:0.9,r:0.25}));ring.position.set(0.1,0.0,0.045*s);ring.rotation.y=Math.PI/2+0.3*s;g.add(ring);
   const gl=new THREE.Mesh(new THREE.CircleGeometry(0.03,24),new THREE.MeshPhysicalMaterial({color:0x88ccff,roughness:0.05,metalness:0.2,transparent:true,opacity:0.75}));gl.position.copy(ring.position);gl.rotation.y=Math.PI/2+0.3*s;g.add(gl);}
  g.rotation.z=-0.35;g.position.set(-0.01,-0.02,0);return g;},
 schal(){const g=new THREE.Group();const m=std(0xd8262f,{r:0.85});const ring=new THREE.Mesh(new THREE.TorusGeometry(0.115,0.035,12,36),m);ring.rotation.x=Math.PI/2;ring.scale.set(1,1.1,1);g.add(ring);
  for(let i=0;i<4;i++){const st=new THREE.Mesh(new THREE.TorusGeometry(0.115,0.037,6,36,0.18),std(0xffffff,{r:0.85}));st.rotation.x=Math.PI/2;st.rotation.z=i*1.6;g.add(st);}
  const tail=new THREE.Mesh(new THREE.BoxGeometry(0.05,0.14,0.022),m);tail.position.set(-0.11,-0.07,0.07);tail.rotation.set(0.2,0.3,-0.35);g.add(tail);
  return g;},
};
// anchor: [bone, x,y,z offset (model coords, relative to bind pivot), rotZ, scale]
export const ANCHOR={krone:['head',0.15,0.43,0,0.15,2.0],zauberhut:['head',0.13,0.42,0,0.15,2.1],piratenhut:['head',0.14,0.42,0,0.15,2.1],wikingerhelm:['head',0.14,0.38,0,0.15,2.2],blumenkranz:['head',0.14,0.445,0,0.2,2.0],fliegerbrille:['head',0.2,0.33,0,0.05,2.2],schal:['body',0.12,-0.06,0,-0.12,1.55]};
