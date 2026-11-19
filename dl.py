import urllib.request, gzip, io, json, os
url="https://planetgis.cn/maps/cn-kuangchan-2021/data/minerals.json"
out=r"C:\Users\13957\Aurabot\qq-chats\gold-map\minerals.json"
# 先看旧文件结尾
old=open(out,"rb").read()
print("old size",len(old),"tail",old[-40:])
req=urllib.request.Request(url,headers={"User-Agent":"Mozilla/5.0","Accept-Encoding":"gzip"})
with urllib.request.urlopen(req,timeout=180) as r:
    raw=r.read()
    if r.headers.get("Content-Encoding")=="gzip":
        raw=gzip.decompress(raw)
print("downloaded",len(raw))
try:
    d=json.loads(raw.decode("utf-8"))
    print("parse OK, top keys:",list(d.keys()))
    open(out,"wb").write(raw)
    print("saved")
except Exception as e:
    print("parse fail",e)
