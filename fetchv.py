import urllib.request,re
u="https://planetgis.cn/maps/cn-kuangchan-2021/index.html"
req=urllib.request.Request(u,headers={"User-Agent":"Mozilla/5.0"})
h=urllib.request.urlopen(req,timeout=60).read().decode("utf-8","replace")
print("len",len(h))
srcs=re.findall(r'src="([^"]+)"',h)
print(srcs)
open(r"C:\Users\13957\Aurabot\qq-chats\gold-map\viewer.html","w",encoding="utf-8").write(h)
