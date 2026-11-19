import urllib.request
for u in ["http://127.0.0.1:8899/index.html","http://127.0.0.1:8899/gold-points.js"]:
    try:
        r=urllib.request.urlopen(u,timeout=5); print(u,r.status,len(r.read()))
    except Exception as e: print(u,"ERR",e)
