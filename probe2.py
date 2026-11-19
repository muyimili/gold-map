import json
p=r"C:\Users\13957\Aurabot\qq-chats\gold-map\minerals.json"
d=json.load(open(p,encoding="utf-8"))
print(json.dumps(d["meta"],ensure_ascii=False)[:800])
for k in ["groups","kinds","scales","uses","geos","gens","provinces","cities"]:
    print(k,len(d[k]),d[k][:6])
print("names",len(d["names"]),d["names"][:3])
print("pts",len(d["pts"]),d["pts"][:3])
