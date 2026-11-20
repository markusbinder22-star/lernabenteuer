// Pose generators: return {bone:{rx,ry,rz,s,dx,dy,dz}} for phase t in [0,1)
const S=Math.sin,C=Math.cos,P2=Math.PI*2;
const tailSway=(t,a=0.25,ph=0)=>({tail1:{ry:a*0.5*S(P2*t+ph)},tail2:{ry:a*S(P2*t+ph-0.6)},tail3:{ry:a*1.3*S(P2*t+ph-1.2)}});
const wing=(a,s=1,spread=0)=>({wingL:{rx:-a-spread,s},wingR:{rx:a+spread,s}});
export const ANIMS={
 idle:{n:8,fps:8,f:t=>({body:{dy:0.006*S(P2*t)},head:{rz:0.04*S(P2*t+0.5),rx:0.03*S(P2*t)},armL:{rz:0.08*S(P2*t)},armR:{rz:0.08*S(P2*t)},...tailSway(t,0.18),...wing(0.15+0.12*S(P2*t))})},
 run:{n:8,fps:14,f:t=>{const a=S(P2*t);return{body:{rz:-0.13,dy:0.025*Math.abs(C(P2*t))-0.008},legL:{rz:0.13+0.75*a},legR:{rz:0.13-0.75*a},armL:{rz:-0.6*a+0.2},armR:{rz:0.6*a+0.2},head:{rz:0.08+0.05*C(2*P2*t)},...tailSway(t,0.3),...wing(0.25+0.1*C(2*P2*t))}}},
 jump:{n:2,fps:6,f:t=>({body:{rz:0.08},legL:{rz:0.55+0.1*t},legR:{rz:0.35+0.1*t},armL:{rz:0.3,rx:-0.5},armR:{rz:0.3,rx:0.5},head:{rz:0.12},tail1:{rz:-0.25},tail2:{rz:-0.2},tail3:{rz:-0.2},...wing(0.9+0.2*t)})},
 fall:{n:2,fps:6,f:t=>({body:{rz:-0.05},legL:{rz:-0.25},legR:{rz:0.15},armL:{rz:0.2,rx:-0.8-0.1*t},armR:{rz:0.2,rx:0.8+0.1*t},head:{rz:-0.05},tail1:{rz:0.2},tail2:{rz:0.2},...wing(1.2-0.2*t,1.05)})},
 flutter:{n:6,fps:20,f:t=>({body:{rz:0.05,dy:0.01*S(P2*t)},legL:{rz:0.4},legR:{rz:0.2},armL:{rz:0.4,rx:-0.4},armR:{rz:0.4,rx:0.4},head:{rz:0.1},...tailSway(t,0.15),...wing(0.3+1.1*(0.5+0.5*S(P2*t)),1.15)})},
 fly:{n:8,fps:12,f:t=>({body:{rz:-0.55,dy:0.02*S(P2*t)},head:{rz:0.45},legL:{rz:-0.5},legR:{rz:-0.7},armL:{rz:0.6},armR:{rz:0.5},tail1:{rz:0.15,ry:0.1*S(P2*t)},tail2:{rz:0.1,ry:0.15*S(P2*t-0.5)},tail3:{ry:0.2*S(P2*t-1)},...wing(0.2+1.2*(0.5+0.5*S(P2*t)),1.7)})},
 fire:{n:6,fps:12,f:t=>{const i=Math.round(t*6);const back=i<2?(i+1)/2:0;const fw=i>=2?1:0;const sh=fw?0.02*S(i*2.3):0;return{body:{rz:0.1*back-0.08*fw},head:{rz:0.3*back-0.22*fw+sh,dx:0.02*fw},armL:{rz:0.3*back-0.2*fw},armR:{rz:0.3*back-0.2*fw},legL:{rz:0.1},legR:{rz:-0.1},...tailSway(0.25,0.2),...wing(0.3+0.6*back+0.7*fw)}}},
 hurt:{n:2,fps:6,f:t=>({body:{rz:0.3,dy:0.01},head:{rz:0.25,rx:0.1*(t?1:-1)},armL:{rz:0.4,rx:-0.7},armR:{rz:0.4,rx:0.7},legL:{rz:0.4},legR:{rz:-0.2},...wing(1.0)})},
 cheer:{n:8,fps:10,f:t=>{const a=S(P2*t);return{body:{dy:0.02*Math.abs(a)},head:{rz:0.1+0.05*a,rx:0.06*a},armL:{rz:0.5,rx:-0.9-0.25*a},armR:{rz:0.5,rx:0.9-0.25*a},...tailSway(t,0.4),...wing(0.4+0.9*(0.5+0.5*S(2*P2*t)))}}},
 climb:{n:4,fps:8,f:t=>{const a=S(P2*t);return{body:{rz:0.25},head:{rz:0.15},armL:{rz:1.0+0.35*a,rx:-0.3},armR:{rz:1.0-0.35*a,rx:0.3},legL:{rz:0.5+0.4*a},legR:{rz:0.5-0.4*a},tail1:{rz:-0.3},tail2:{rz:-0.2},...wing(0.5)}}},
};
export const ORDER=['idle','run','jump','fall','flutter','fly','fire','hurt','cheer','climb'];
export const POSES={
 sad:{body:{rz:0.05},head:{rz:-0.28,rx:0.05},armL:{rz:-0.2},armR:{rz:-0.2},tail1:{rz:0.25},tail2:{rz:0.2},tail3:{rz:0.15},wingL:{rx:0.25},wingR:{rx:-0.25}},
 proud:{body:{rz:0.06},head:{rz:0.18},armL:{rz:0.2,rx:-0.2},armR:{rz:0.2,rx:0.2},tail1:{ry:0.3},tail2:{ry:0.3},tail3:{ry:0.4},wingL:{rx:-1.0,s:1.1},wingR:{rx:1.0,s:1.1}},
 adult:{body:{rz:0.03},head:{rz:0.08},wingL:{rx:-0.9,s:1.9},wingR:{rx:0.9,s:1.9},tail1:{ry:0.2},tail2:{ry:0.2},tail3:{ry:0.2}},
 old:{body:{rz:0.12},head:{rz:-0.12},wingL:{rx:-0.35,s:1.8},wingR:{rx:0.35,s:1.8},armL:{rz:0.1},armR:{rz:0.1},tail1:{rz:0.15}},
 shock:{body:{rz:0.15},head:{rz:0.3},armL:{rz:0.4,rx:-0.9},armR:{rz:0.4,rx:0.9},wingL:{rx:-1.2},wingR:{rx:1.2},tail1:{rz:-0.2}},
};
