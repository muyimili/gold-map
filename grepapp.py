import re
s=open(r"C:\Users\13957\Aurabot\qq-chats\gold-map\app.js",encoding="utf-8",errors="replace").read()
for m in re.finditer(r"pts",s):
    a=max(0,m.start()-300); print("-----"); print(s[a:m.start()+400])
