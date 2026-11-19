import urllib.request,os,time
u="https://planetgis.cn/maps/cn-kuangchan-2021/js/app.js"
out=r"C:\Users\13957\Aurabot\qq-chats\gold-map\app.js"
for attempt in range(3):
    try:
        req=urllib.request.Request(u,headers={"User-Agent":"Mozilla/5.0"})
        r=urllib.request.urlopen(req,timeout=60)
        cl=r.headers.get("Content-Length")
        print("CL",cl,"attempt",attempt)
        buf=bytearray()
        while True:
            c=r.read(65536)
            if not c: break
            buf+=c
            if cl and len(buf)%(1<<20)<65536: print("  ",len(buf),"/",cl)
        open(out,"wb").write(buf)
        print("done",len(buf)); break
    except Exception as e:
        print("fail",type(e).__name__,e); time.sleep(2)
