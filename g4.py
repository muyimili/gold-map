s=open(r"C:\Users\13957\Aurabot\qq-chats\gold-map\app.js",encoding="utf-8",errors="replace").read()
i=s.find("wgs84ToGcj02")
j=s.find("function wgs84ToGcj02")
print(s[j-1200:j+1500])
