import urllib.request
u="https://planetgis.cn/maps/cn-kuangchan-2021/js/app.js"
req=urllib.request.Request(u,headers={"User-Agent":"Mozilla/5.0"})
b=urllib.request.urlopen(req,timeout=120).read()
print("len",len(b))
open(r"C:\Users\13957\Aurabot\qq-chats\gold-map\app.js","wb").write(b)
