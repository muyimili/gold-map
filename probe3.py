import json,sys
p=r"C:\Users\13957\Aurabot\qq-chats\gold-map\minerals.json"
d=json.load(open(p,encoding="utf-8"))
print(json.dumps(d["meta"],ensure_ascii=False))
print([ (g["key"],g["label"],g["n"]) for g in d["groups"]])
print([ (k["t"],k["g"],k["n"]) for k in d["kinds"] if "金" in k["t"] or "银" in k["t"] or "铂" in k["t"]][:40])
print("pts0",d["pts"][0], "len",len(d["pts"][0]))
