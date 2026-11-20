// Eigene 3D-Modelle (three.js) für Figuren, die es in den Kenney-Bausätzen nicht gibt.
import * as THREE from 'three';
const M = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: o.r ?? 0.4, metalness: o.m ?? 0, emissive: o.e ?? 0x000000, emissiveIntensity: o.ei ?? 1, transparent: !!o.t, opacity: o.t ?? 1 });
const steel = () => M(0xc4ccd6, { m: 0.92, r: 0.28 });
const darkSteel = () => M(0x5a626e, { m: 0.85, r: 0.35 });
const brass = () => M(0xd9a441, { m: 0.9, r: 0.3 });
const mesh = (g, m, p = [0, 0, 0], r = [0, 0, 0], s = [1, 1, 1]) => { const o = new THREE.Mesh(g, m); o.position.set(...p); o.rotation.set(...r); o.scale.set(...s); return o; };

// Blechritter: rundlicher Blechsoldat mit Helm, roten Augenschlitzen und Federbusch
export function blechritter(pose = {}) {
  const g = new THREE.Group(); const t = pose.t || 0; const heat = pose.heat || 0;
  const bodyMat = heat ? M(0xd8a080, { m: 0.7, r: 0.35, e: 0xff4a10, ei: heat }) : steel();
  const body = new THREE.Group(); g.add(body); body.position.y = 0.5 + Math.abs(Math.sin(t * Math.PI * 2)) * 0.03;
  const torso = mesh(new THREE.CapsuleGeometry(0.27, 0.22, 8, 24), bodyMat, [0, 0, 0], [0, 0, 0], [1, 1, 0.9]); body.add(torso);
  const belt = mesh(new THREE.TorusGeometry(0.265, 0.035, 10, 32), brass(), [0, -0.08, 0], [Math.PI / 2, 0, 0], [1, 0.9, 1]); body.add(belt);
  for (let i = 0; i < 5; i++) body.add(mesh(new THREE.SphereGeometry(0.022, 10, 8), brass(), [0.25, 0.12 - i * 0.07, 0.08 * Math.sin(i)], [0, 0, 0]));
  // Kette quer über die Brust
  for (let i = 0; i < 9; i++) { const a = -0.8 + i * 0.2; body.add(mesh(new THREE.TorusGeometry(0.03, 0.009, 6, 12), darkSteel(), [0.22 * Math.cos(a) + 0.06, 0.18 * Math.sin(a) + 0.02, 0.22], [0, 0, a + (i % 2) * 1.57])); }
  // Kopf mit Helm
  const head = new THREE.Group(); head.position.y = 0.36; body.add(head);
  head.add(mesh(new THREE.SphereGeometry(0.22, 28, 20), bodyMat, [0, 0, 0], [0, 0, 0], [1, 1.05, 0.95]));
  head.add(mesh(new THREE.BoxGeometry(0.06, 0.07, 0.3), M(0x1a1a22, { r: 0.6 }), [0.2, 0.0, 0]));
  for (const z of [-0.07, 0.07]) head.add(mesh(new THREE.SphereGeometry(0.026, 12, 10), M(0xff2a10, { e: 0xff2a10, ei: 2.2 }), [0.215, 0.0, z]));
  head.add(mesh(new THREE.TorusGeometry(0.2, 0.025, 8, 32, Math.PI), brass(), [0, 0.03, 0], [0, Math.PI / 2, 0]));
  const plume = new THREE.Group(); plume.position.set(-0.02, 0.2, 0); head.add(plume);
  for (let i = 0; i < 5; i++) plume.add(mesh(new THREE.SphereGeometry(0.05 - i * 0.004, 12, 10), M(0xd8262f, { r: 0.8 }), [-i * 0.045, 0.04 + Math.sin(i * 0.7) * 0.05 - i * 0.012, 0]));
  // Arme mit Schild und Lanze
  const armL = new THREE.Group(); armL.position.set(0.02, 0.1, 0.3); body.add(armL);
  armL.add(mesh(new THREE.CapsuleGeometry(0.06, 0.14, 6, 12), bodyMat, [0.05, -0.08, 0], [0, 0, 0.6]));
  armL.add(mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.04, 24), M(0x2a4a9a, { m: 0.4, r: 0.4 }), [0.12, -0.12, 0.05], [Math.PI / 2, 0, 0]));
  armL.add(mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.05, 6), brass(), [0.12, -0.12, 0.08], [Math.PI / 2, 0, 0]));
  const armR = new THREE.Group(); armR.position.set(0.02, 0.1, -0.3); body.add(armR); armR.rotation.z = -0.3 + Math.sin(t * Math.PI * 2) * 0.25;
  armR.add(mesh(new THREE.CapsuleGeometry(0.06, 0.14, 6, 12), bodyMat, [0.05, -0.08, 0], [0, 0, 0.5]));
  armR.add(mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.85, 8), M(0x6a4420, { r: 0.7 }), [0.14, 0.1, 0], [0, 0, -0.15]));
  armR.add(mesh(new THREE.ConeGeometry(0.045, 0.14, 12), steel(), [0.2, 0.55, 0], [0, 0, -0.15]));
  // Beine
  for (const [z, ph] of [[0.12, 0], [-0.12, Math.PI]]) {
    const leg = new THREE.Group(); leg.position.set(0, 0.32, z); g.add(leg); leg.rotation.z = Math.sin(t * Math.PI * 2 + ph) * 0.45;
    leg.add(mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.24, 14), darkSteel(), [0, -0.14, 0]));
    leg.add(mesh(new THREE.BoxGeometry(0.2, 0.08, 0.13), M(0x2a2a30, { m: 0.5, r: 0.4 }), [0.04, -0.28, 0]));
  }
  if (pose.broken) { g.children.forEach((c, i) => { c.position.x += (i - 1) * 0.15; c.position.y -= 0.2; c.rotation.z += i * 0.7; }); }
  return g;
}
// Blechdrohne: Messingkugel mit Propeller und rotem Auge
export function drohne(pose = {}) {
  const g = new THREE.Group(); const t = pose.t || 0;
  g.add(mesh(new THREE.SphereGeometry(0.3, 32, 24), brass()));
  g.add(mesh(new THREE.TorusGeometry(0.3, 0.03, 10, 40), darkSteel(), [0, 0, 0], [Math.PI / 2, 0, 0]));
  g.add(mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.06, 24), darkSteel(), [0.27, 0.02, 0], [0, 0, Math.PI / 2]));
  g.add(mesh(new THREE.SphereGeometry(0.1, 20, 16), M(0xff2a10, { e: 0xff2010, ei: 1.8, r: 0.1 }), [0.3, 0.02, 0]));
  g.add(mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.18, 10), darkSteel(), [0, 0.36, 0]));
  const prop = new THREE.Group(); prop.position.y = 0.45; prop.rotation.y = t * Math.PI; g.add(prop);
  for (let i = 0; i < 3; i++) prop.add(mesh(new THREE.BoxGeometry(0.42, 0.015, 0.07), steel(), [Math.cos(i * 2.09) * 0.21, 0, Math.sin(i * 2.09) * 0.21], [0.25, -i * 2.09, 0]));
  for (const z of [0.12, -0.12]) { g.add(mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.22, 8), darkSteel(), [0.05, -0.36, z], [0, 0, 0.3])); g.add(mesh(new THREE.ConeGeometry(0.03, 0.08, 8), darkSteel(), [0.09, -0.48, z], [0, 0, Math.PI])); }
  return g;
}
// Baron Ketterich: Erfinder mit Zylinder, Monokel, Schnurrbart und langem Mantel
export function ketterich(pose = {}) {
  const g = new THREE.Group(); const skin = M(0xf0c8a0, { r: 0.6 }); const coat = M(0x2f3a5a, { r: 0.55 }); const red = M(0x9a1a2a, { r: 0.5 });
  const pts = []; for (let i = 0; i <= 16; i++) { const t = i / 16; pts.push(new THREE.Vector2(0.18 + 0.2 * Math.sin(Math.PI * (0.15 + t * 0.7)) - t * 0.06, t * 0.75)); }
  g.add(mesh(new THREE.LatheGeometry(pts, 32), coat, [0, 0.12, 0]));
  g.add(mesh(new THREE.CylinderGeometry(0.2, 0.26, 0.06, 32), red, [0, 0.5, 0])); // Weste/Gürtel
  for (let i = 0; i < 3; i++) g.add(mesh(new THREE.SphereGeometry(0.02, 10, 8), brass(), [0.33 - i * 0.02, 0.6 - i * 0.1, 0]));
  for (const z of [0.09, -0.09]) g.add(mesh(new THREE.CapsuleGeometry(0.05, 0.1, 6, 12), M(0x222226, { r: 0.4, m: 0.3 }), [0.02, 0.07, z]));
  const head = new THREE.Group(); head.position.set(0.02, 1.02, 0); g.add(head); head.rotation.z = pose.headTilt || 0;
  head.add(mesh(new THREE.SphereGeometry(0.2, 32, 24), skin, [0, 0, 0], [0, 0, 0], [1, 1.08, 1]));
  head.add(mesh(new THREE.SphereGeometry(0.06, 16, 12), M(0xe8a888, { r: 0.6 }), [0.19, -0.02, 0])); // Nase
  for (const z of [0.08, -0.08]) { head.add(mesh(new THREE.SphereGeometry(0.035, 14, 10), M(0xffffff, { r: 0.3 }), [0.17, 0.06, z])); head.add(mesh(new THREE.SphereGeometry(0.018, 10, 8), M(0x1a1010), [0.2, 0.06, z])); }
  head.add(mesh(new THREE.BoxGeometry(0.02, 0.025, 0.09), M(0x3a2a20), [0.19, 0.12, 0.085], [0, 0, pose.angry ? -0.4 : 0.15]));
  head.add(mesh(new THREE.BoxGeometry(0.02, 0.025, 0.09), M(0x3a2a20), [0.19, 0.12, -0.085], [0, 0, pose.angry ? -0.4 : 0.15]));
  head.add(mesh(new THREE.TorusGeometry(0.045, 0.008, 8, 24), brass(), [0.205, 0.06, -0.08], [0, Math.PI / 2, 0])); // Monokel
  for (const s of [1, -1]) head.add(mesh(new THREE.CapsuleGeometry(0.025, 0.12, 6, 12), M(0x4a3020, { r: 0.8 }), [0.19, -0.08, 0.08 * s], [s * 1.2, 0, 0.2])); // Schnurrbart
  const hat = new THREE.Group(); hat.position.y = 0.17; head.add(hat); hat.rotation.z = -0.1;
  hat.add(mesh(new THREE.CylinderGeometry(0.27, 0.27, 0.025, 32), M(0x1a1a20, { r: 0.5 })));
  hat.add(mesh(new THREE.CylinderGeometry(0.16, 0.17, 0.32, 32), M(0x1a1a20, { r: 0.5 }), [0, 0.16, 0]));
  hat.add(mesh(new THREE.CylinderGeometry(0.172, 0.172, 0.06, 32), red, [0, 0.05, 0]));
  hat.add(mesh(new THREE.TorusGeometry(0.05, 0.015, 8, 6), brass(), [0.17, 0.12, 0], [0, Math.PI / 2, 0])); // Zahnrad am Hut
  // Arme
  const arm = (z, up) => { const a = new THREE.Group(); a.position.set(0.02, 0.8, z); g.add(a); a.rotation.z = up ? 2.2 : -0.15; a.rotation.x = z > 0 ? -0.2 : 0.2;
    a.add(mesh(new THREE.CapsuleGeometry(0.06, 0.3, 6, 12), coat, [0, -0.2, 0])); a.add(mesh(new THREE.SphereGeometry(0.06, 12, 10), M(0xf4f0e6, { r: 0.5 }), [0, -0.4, 0])); return a; };
  arm(0.27, pose.point); arm(-0.27, pose.scared);
  if (pose.scared) head.position.y -= 0.03;
  return g;
}
// Zwerg Bruno
export function bruno() {
  const g = new THREE.Group();
  g.add(mesh(new THREE.SphereGeometry(0.3, 28, 20), M(0x6a3a1a, { r: 0.7 }), [0, 0.35, 0], [0, 0, 0], [1, 1.1, 1]));
  g.add(mesh(new THREE.SphereGeometry(0.2, 28, 20), M(0xf0c0a0, { r: 0.6 }), [0.04, 0.78, 0]));
  g.add(mesh(new THREE.SphereGeometry(0.05, 12, 10), M(0xe09080), [0.23, 0.76, 0]));
  for (const z of [0.07, -0.07]) g.add(mesh(new THREE.SphereGeometry(0.025, 10, 8), M(0x1a1010), [0.2, 0.83, z]));
  g.add(mesh(new THREE.ConeGeometry(0.2, 0.42, 20), M(0xe8e0d0, { r: 0.9 }), [0.13, 0.5, 0], [0, 0, Math.PI + 0.25]));
  g.add(mesh(new THREE.SphereGeometry(0.22, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2), M(0xb0b8c0, { m: 0.85, r: 0.3 }), [0.02, 0.86, 0]));
  g.add(mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.06, 16), brass(), [0.2, 0.98, 0], [0, 0, Math.PI / 2]));
  g.add(mesh(new THREE.CircleGeometry(0.05, 16), M(0xfff4c0, { e: 0xffe080, ei: 1.5 }), [0.235, 0.98, 0], [0, Math.PI / 2, 0]));
  for (const z of [0.12, -0.12]) g.add(mesh(new THREE.BoxGeometry(0.16, 0.12, 0.12), M(0x2a1a10, { r: 0.6 }), [0.03, 0.06, z]));
  const pick = new THREE.Group(); pick.position.set(0.1, 0.45, -0.28); pick.rotation.z = 0.5; g.add(pick);
  pick.add(mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.6, 8), M(0x7a4a20), [0, 0, 0]));
  pick.add(mesh(new THREE.TorusGeometry(0.15, 0.025, 8, 16, Math.PI), steel(), [0, 0.28, 0], [0, 0, 0]));
  return g;
}
// Herzglut: glühender Feuerkristall in Messingfassung
export function herzglut() {
  const g = new THREE.Group();
  g.add(mesh(new THREE.IcosahedronGeometry(0.3, 1), M(0xffa020, { e: 0xff5a00, ei: 2.2, r: 0.15 })));
  g.add(mesh(new THREE.IcosahedronGeometry(0.2, 0), M(0xfff0a0, { e: 0xffd060, ei: 3, r: 0.1 })));
  for (let i = 0; i < 3; i++) g.add(mesh(new THREE.TorusGeometry(0.36, 0.02, 8, 48), brass(), [0, 0, 0], [i * 1.05, i * 0.7, 0]));
  return g;
}
// Kristallgruppe (Minen/Frost/Glut)
export function kristalle(pose = {}) {
  const g = new THREE.Group(); const c = pose.color ?? 0x56d0ff;
  const m = M(c, { e: c, ei: 0.55, r: 0.08, m: 0.1, t: 0.92 });
  [[0, 0.5, 0, 0.12, 1.0, 0], [0.18, 0.34, 0.05, 0.09, 0.7, -0.45], [-0.17, 0.3, 0.06, 0.08, 0.6, 0.5], [0.07, 0.22, -0.14, 0.07, 0.45, -0.3], [-0.06, 0.2, 0.16, 0.06, 0.4, 0.3]]
    .forEach(([x, y, z, r, h, rz]) => { const o = new THREE.Group(); o.position.set(x, 0, z); o.rotation.z = rz; g.add(o); o.add(mesh(new THREE.CylinderGeometry(r, r, h, 6), m, [0, h / 2, 0])); o.add(mesh(new THREE.ConeGeometry(r, r * 2.2, 6), m, [0, h + r * 1.1, 0])); });
  g.add(mesh(new THREE.DodecahedronGeometry(0.22, 0), M(0x4a4048, { r: 0.9 }), [0, 0.02, 0], [0, 0, 0], [1.5, 0.45, 1.2]));
  return g;
}
// Verziertes Drachenei
export function drachenei(pose = {}) {
  const g = new THREE.Group(); const pts = []; for (let i = 0; i <= 24; i++) { const t = i / 24, a = t * Math.PI; pts.push(new THREE.Vector2(Math.sin(a) * 0.25 * (1 - 0.18 * t), -Math.cos(a) * 0.34)); }
  g.add(mesh(new THREE.LatheGeometry(pts, 40), M(pose.color ?? 0x9a3ad8, { r: 0.25, m: 0.3 })));
  for (let i = 0; i < 3; i++) g.add(mesh(new THREE.TorusGeometry(0.245 - Math.abs(i - 1) * 0.04, 0.012, 8, 48), brass(), [0, -0.12 + i * 0.12, 0], [Math.PI / 2, 0, 0]));
  for (let i = 0; i < 8; i++) g.add(mesh(new THREE.OctahedronGeometry(0.022), M(0x56ffd0, { e: 0x30ffb0, ei: 0.8 }), [Math.cos(i * 0.785) * 0.25, 0, Math.sin(i * 0.785) * 0.25]));
  return g;
}
// Kristallkugel
export function kugel() {
  const g = new THREE.Group();
  g.add(mesh(new THREE.SphereGeometry(0.28, 40, 30), new THREE.MeshPhysicalMaterial({ color: 0xbfe8ff, roughness: 0.02, metalness: 0, transmission: 0.6, thickness: 0.4, transparent: true, opacity: 0.85, emissive: 0x3060a0, emissiveIntensity: 0.4 }), [0, 0.36, 0]));
  g.add(mesh(new THREE.SphereGeometry(0.1, 20, 16), M(0xff60e0, { e: 0xff40c0, ei: 1.5 }), [0, 0.36, 0]));
  g.add(mesh(new THREE.CylinderGeometry(0.16, 0.22, 0.12, 6), brass(), [0, 0.06, 0]));
  return g;
}
// Ballon für die Himmelsfestung
export function ballon() {
  const g = new THREE.Group(); const pts = []; for (let i = 0; i <= 30; i++) { const t = i / 30, a = t * Math.PI; pts.push(new THREE.Vector2(Math.sin(a) * 1.0 * (1 - 0.25 * t), -Math.cos(a) * 1.3)); }
  const b = mesh(new THREE.LatheGeometry(pts, 48), M(0x7a2a2a, { r: 0.6 }), [0, 0, 0], [0, 0, Math.PI / 2], [1, 1.8, 1]); g.add(b);
  for (let i = 0; i < 6; i++) g.add(mesh(new THREE.TorusGeometry(1.0 - Math.abs(i - 2.5) * 0.08, 0.03, 8, 48), darkSteel(), [-1.6 + i * 0.64, 0, 0], [0, Math.PI / 2, 0]));
  for (let i = 0; i < 3; i++) g.add(mesh(new THREE.TorusGeometry(0.45, 0.08, 10, 6), brass(), [2.4, 0.2 - i * 0.2, 0], [0, Math.PI / 2, i * 0.4]));
  return g;
}
export const CUSTOM = { blechritter, drohne, ketterich, bruno, herzglut, kristalle, drachenei, kugel, ballon };
