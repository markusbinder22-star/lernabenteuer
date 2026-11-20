from load import load
import numpy as np
j,prim,att,idx=load()
P=att['POSITION'].astype(np.float64); x,y,z=P[:,0],P[:,1],P[:,2]; az=np.abs(z)
def sm(v,a,b):  # smoothstep from a to b (a<b → rising, a>b → falling)
    t=np.clip((v-a)/(b-a),0,1); return t*t*(3-2*t)
W = sm(az,0.10,0.15)*sm(x,0.13,0.07)*sm(y,-0.20,-0.15)*sm(y,0.12,0.07)
A = sm(az,0.145,0.185)*sm(x,0.06,0.12)*sm(y,-0.26,-0.215)*sm(y,-0.04,-0.08)*(1-W)
L = sm(y,-0.29,-0.36)*sm(x,-0.08,-0.02)*sm(az,0.0,0.07)*(1-A)
T = sm(x,0.02,-0.10)*sm(y,-0.06,-0.14)*(1-L)*(1-W)
H = sm(y,-0.03,0.06)*(1-W)*(1-A)
B = np.clip(1-(W+A+L+T+H),0,1)
# bones: 0 body 1 head 2 wingL 3 wingR 4 armL 5 armR 6 legL 7 legR 8 tail1 9 tail2 10 tail3
pos = z>0
tail_t = np.clip((-x-0.0)/0.42,0,1)  # 0 at base, 1 at tip
t1 = T*np.clip(1-np.abs(tail_t-0.15)/0.3,0,1)
t2 = T*np.clip(1-np.abs(tail_t-0.5)/0.3,0,1)
t3 = T*np.clip(1-np.abs(tail_t-0.85)/0.3,0,1)
ts=t1+t2+t3+1e-9; t1,t2,t3=T*t1/ts,T*t2/ts,T*t3/ts
cols=np.stack([B,H,W*pos,W*~pos,A*pos,A*~pos,L*pos,L*~pos,t1,t2,t3],1)
cols/=cols.sum(1,keepdims=True)
order=np.argsort(-cols,1)[:,:4]
wts=np.take_along_axis(cols,order,1); wts/=wts.sum(1,keepdims=True)
order.astype(np.uint16).tofile('skin_idx.bin'); wts.astype(np.float32).tofile('skin_w.bin')
print('done',[round(float(c.sum())) for c in cols.T])
