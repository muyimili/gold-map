import json,io
src=r"C:\Users\13957\Aurabot\qq-chats\gold-map\minerals.json"
d=json.load(open(src,encoding="utf-8"))
kinds=d["kinds"]; names=d["names"]; pts=d["pts"]
scales=[s["t"] for s in d["scales"]]; uses=[s["t"] for s in d["uses"]]
provs=d["provinces"]; cities=d["cities"]
# golden kinds
gold_idx={}
for i,k in enumerate(kinds):
    t=k["t"]
    if t in ("金矿","砂金","银矿","铂矿") or ("金" in t and len(t)<=8 and t not in ("金红石","金刚石")):
        gold_idx[i]=t
print("gold kind idx",gold_idx)
keep=[]
namepool=[]; nidx={}
def nid(s):
    if s not in nidx:
        nidx[s]=len(namepool); namepool.append(s)
    return nidx[s]
for p in pts:
    hit=None
    for ki in p[2:5]:
        if ki in gold_idx: hit=gold_idx[ki]; break
    if not hit: continue
    lon=p[0]/1000.0; lat=p[1]/1000.0
    if not(70<lon<140 and 15<lat<55): continue
    nm=names[p[11]] if 0<=p[11]<len(names) else ""
    keep.append([round(lat,3),round(lon,3),nid(nm),p[5],p[6],p[9],p[10],hit])
print("kept",len(keep),"names",len(namepool))
out={"scales":scales,"uses":uses,
     "provs":[x["n"] for x in provs],"cities":[x["n"] for x in cities],
     "names":namepool,"pts":keep}
s=json.dumps(out,ensure_ascii=False,separators=(",",":"))
open(r"C:\Users\13957\Aurabot\qq-chats\gold-map\gold-points.js","w",encoding="utf-8").write("window.GOLD_DATA="+s+";")
print("size",len(s.encode()))
import collections
print(collections.Counter(k[7] for k in keep))
print(collections.Counter(scales[k[3]] for k in keep))
