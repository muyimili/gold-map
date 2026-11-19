import json,collections
src=r"C:\Users\13957\Aurabot\qq-chats\gold-map\minerals.json"
d=json.load(open(src,encoding="utf-8"))
kinds=d["kinds"]; names=d["names"]; pts=d["pts"]
scales=[s["t"] for s in d["scales"]]; uses=[s["t"] for s in d["uses"]]
def isgold(t):
    return ("金矿" in t) or ("砂金" in t) or ("银矿" in t) or ("铂矿" in t)
gold_idx={i:k["t"] for i,k in enumerate(kinds) if isgold(k["t"])}
print("kinds",len(gold_idx))
namepool=[]; nidx={}
def nid(s):
    if s not in nidx:
        nidx[s]=len(namepool); namepool.append(s)
    return nidx[s]
keep=[]
for p in pts:
    hit=None
    for ki in p[2:5]:
        t=gold_idx.get(ki)
        if t:
            hit=t; break
    if not hit: continue
    lon=p[0]/1000.0; lat=p[1]/1000.0
    if not(70<lon<140 and 15<lat<55): continue
    nm=names[p[11]] if 0<=p[11]<len(names) else ""
    keep.append([round(lat,3),round(lon,3),nid(nm),p[5],p[6],hit])
print("kept",len(keep),"names",len(namepool))
out={"scales":scales,"uses":uses,"names":namepool,"pts":keep}
s=json.dumps(out,ensure_ascii=False,separators=(",",":"))
open(r"C:\Users\13957\Aurabot\qq-chats\gold-map\gold-points.js","w",encoding="utf-8").write("window.GOLD_DATA="+s+";")
print("size KB",len(s.encode())//1024)
print(collections.Counter(k[5] for k in keep))
print(collections.Counter(scales[k[3]] for k in keep))
print(collections.Counter(uses[k[4]] for k in keep))
print(keep[:5])
