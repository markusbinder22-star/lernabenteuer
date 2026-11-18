import json,struct,numpy as np
def load(p='/mnt/project-files/Kivalu.glb'):
    f=open(p,'rb').read()
    l=struct.unpack('<I',f[12:16])[0]
    j=json.loads(f[20:20+l]); off=20+l+8
    prim=j['meshes'][0]['primitives'][0]
    def acc(i):
        a=j['accessors'][i]; bv=j['bufferViews'][a['bufferView']]
        n={'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4}[a['type']]
        dt={5126:np.float32,5125:np.uint32,5123:np.uint16}[a['componentType']]
        st=off+bv.get('byteOffset',0)+a.get('byteOffset',0)
        return np.frombuffer(f[st:st+a['count']*n*np.dtype(dt).itemsize],dtype=dt).reshape(-1,n) if n>1 else np.frombuffer(f[st:st+a['count']*np.dtype(dt).itemsize],dtype=dt)
    return j,prim,{k:acc(v) for k,v in prim['attributes'].items()},acc(prim['indices'])
