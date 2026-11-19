import json,collections
p=r"C:\Users\13957\Aurabot\qq-chats\gold-map\minerals.json"
d=json.load(open(p,encoding="utf-8"))
kinds=d["kinds"]; names=d["names"]; pts=d["pts"]
print("scales",[s["t"] for s in d["scales"]])
print("uses",[s["t"] for s in d["uses"]])
cnt=collections.Counter()
for q in pts:
    for ki in q[2:5]:
        if ki>=0:
            t=kinds[ki]["t"]
            if "金" in t or "银" in t or "铂" in t:
                cnt[t]+=1
for t,c in cnt.most_common(20): print(t,c)
