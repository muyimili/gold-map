# -*- coding: utf-8 -*-
import io, sys
p = r'C:\Users\13957\Aurabot\qq-chats\gold-map\index.html'
raw = open(p, 'rb').read()
t = raw.decode('utf-8-sig')
try:
    fixed = t.encode('gbk', 'strict').decode('utf-8', 'strict')
    print('GBK ROUNDTRIP OK')
    open(p, 'w', encoding='utf-8', newline='\n').write(fixed)
except Exception as e:
    print('FAIL', e)
    # 统计坏字符
    bad = [c for c in t if '\ue000' <= c <= '\uf8ff']
    print('private-use chars:', len(bad))
