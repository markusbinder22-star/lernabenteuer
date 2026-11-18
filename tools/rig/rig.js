import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
export const BONES=['body','head','wingL','wingR','armL','armR','legL','legR','tail1','tail2','tail3'];
const PIV={body:[0.12,-0.25,0],head:[0.12,0.0,0],wingL:[0.05,-0.02,0.11],wingR:[0.05,-0.02,-0.11],armL:[0.17,-0.12,0.13],armR:[0.17,-0.12,-0.13],legL:[0.14,-0.30,0.08],legR:[0.14,-0.30,-0.08],tail1:[0.0,-0.27,0],tail2:[-0.14,-0.36,-0.08],tail3:[-0.28,-0.41,-0.2]};
const PAR={head:'body',wingL:'body',wingR:'body',armL:'body',armR:'body',legL:'body',legR:'body',tail1:'body',tail2:'tail1',tail3:'tail2'};
export async function loadKivalu(url='k.glb'){
  const g=await new GLTFLoader().loadAsync(url);
  let src;g.scene.traverse(o=>{if(o.isMesh)src=o});
  const geo=src.geometry;
  const [ib,wb]=await Promise.all([fetch('skin_idx.bin').then(r=>r.arrayBuffer()),fetch('skin_w.bin').then(r=>r.arrayBuffer())]);
  geo.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(new Uint16Array(ib),4));
  geo.setAttribute('skinWeight',new THREE.Float32BufferAttribute(new Float32Array(wb),4));
  const bones={};
  for(const n of BONES){const b=new THREE.Bone();b.name=n;bones[n]=b;}
  for(const n of BONES){const p=PIV[n];const pp=PAR[n]?PIV[PAR[n]]:[0,0,0];bones[n].position.set(p[0]-pp[0],p[1]-pp[1],p[2]-pp[2]);if(PAR[n])bones[PAR[n]].add(bones[n]);}
  const mesh=new THREE.SkinnedMesh(geo,src.material);
  mesh.add(bones.body);mesh.updateMatrixWorld(true);
  mesh.bind(new THREE.Skeleton(BONES.map(n=>bones[n])));
  const root=new THREE.Group();root.add(mesh);
  for(const n of BONES){bones[n].userData.p0=bones[n].position.clone();}
  return {root,mesh,bones,material:src.material};
}
// pose: {bone:{rx,ry,rz,s,dx,dy,dz}}
export function applyPose(k,pose){
  for(const n of BONES){const b=k.bones[n];const q=pose[n]||{};b.rotation.set(q.rx||0,q.ry||0,q.rz||0);b.scale.setScalar(q.s||1);b.position.copy(b.userData.p0);b.position.x+=q.dx||0;b.position.y+=q.dy||0;b.position.z+=q.dz||0;}
}
