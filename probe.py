import json,io
p=r"C:\Users\13957\Aurabot\qq-chats\gold-map\minerals.json"
d=json.load(open(p,encoding="utf-8"))
print("top:",list(d.keys()))
for k,v in d.items():
    print(k, type(v).__name__, (len(v) if hasattr(v,"__len__") else ""))
    if isinstance(v,dict):
        for k2,v2 in list(v.items())[:20]:
            print("   ",k2, type(v2).__name__, (len(v2) if hasattr(v2,"__len__") else v2))
