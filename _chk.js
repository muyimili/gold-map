
const map = L.map('map', {zoomControl:false, attributionControl:false, preferCanvas:true}).setView([34.5, 108], 5);

L.tileLayer('https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', {
  subdomains:['1','2','3','4'], maxZoom: 18, className:'darktile'
}).addTo(map);

/* ── WGS84 → GCJ-02（高德底图是火星坐标） ── */
const GCJ_A=6378245.0, GCJ_EE=0.00669342162296594323;
function outOfChina(lng,lat){return lng<72.004||lng>137.8347||lat<0.8293||lat>55.8271;}
function tLat(x,y){
  let r=-100+2*x+3*y+0.2*y*y+0.1*x*y+0.2*Math.sqrt(Math.abs(x));
  r+=(20*Math.sin(6*x*Math.PI)+20*Math.sin(2*x*Math.PI))*2/3;
  r+=(20*Math.sin(y*Math.PI)+40*Math.sin(y/3*Math.PI))*2/3;
  r+=(160*Math.sin(y/12*Math.PI)+320*Math.sin(y*Math.PI/30))*2/3;
  return r;
}
function tLng(x,y){
  let r=300+x+2*y+0.1*x*x+0.1*x*y+0.1*Math.sqrt(Math.abs(x));
  r+=(20*Math.sin(6*x*Math.PI)+20*Math.sin(2*x*Math.PI))*2/3;
  r+=(20*Math.sin(x*Math.PI)+40*Math.sin(x/3*Math.PI))*2/3;
  r+=(150*Math.sin(x/12*Math.PI)+300*Math.sin(x/30*Math.PI))*2/3;
  return r;
}
function toGcj(lng,lat){
  if(outOfChina(lng,lat)) return [lng,lat];
  let dLat=tLat(lng-105,lat-35), dLng=tLng(lng-105,lat-35);
  const rad=lat/180*Math.PI; let magic=Math.sin(rad); magic=1-GCJ_EE*magic*magic;
  const sq=Math.sqrt(magic);
  dLat=(dLat*180)/((GCJ_A*(1-GCJ_EE))/(magic*sq)*Math.PI);
  dLng=(dLng*180)/(GCJ_A/sq*Math.cos(rad)*Math.PI);
  return [lng+dLng, lat+dLat];
}

/* ── 数据：全国矿产地公开名录，金/银/砂金/铂矿共 2 万余处 ── */
const D = window.GOLD_DATA;
const SC = D.scales, US = D.uses, NM = D.names;
const KIND_STYLE = {
  '金矿':   {c:'#ffd66b', cls:'k1', label:'岩金'},
  '砂金':   {c:'#7ee0a8', cls:'k2', label:'砂金'},
  '银矿':   {c:'#cbd5e1', cls:'k3', label:'银矿'},
  '铂矿':   {c:'#a78bfa', cls:'k4', label:'铂矿'}
};
function kindStyle(t){
  for(const k in KIND_STYLE) if(t.indexOf(k)>=0) return KIND_STYLE[k];
  return {c:'#94a3b8', cls:'k3', label:'其他'};
}
const RAD = [6,5.5,4.5,3.5,2.6,2.2,2,2.4];

const kindsOn = {'岩金':true,'砂金':true,'银矿':true,'铂矿':true,'其他':true};

const pts = D.pts.map(p=>{
  const [la,lo,ni,sc,us,kd] = p;
  const name = NM[ni] || '(未具名)';
  const st = kindStyle(kd);
  return {lat:la, lng:lo, name, sc, us, kd, st};
});
const total = pts.length;

const renderer = L.canvas({padding:0.5});
const layerAll = L.layerGroup();
const cs = [];
for(let i=0;i<pts.length;i++){
  const p = pts[i];
  const cm = L.circleMarker([p.lat,p.lng], {
    radius: RAD[p.sc] ?? 2.4,
    color: p.st.c, weight: 0.6, opacity: .95,
    fillColor: p.st.c, fillOpacity: .55,
    renderer
  });
  cm._p = p;
  cm.bindPopup(`<div class="pop"><h4>${p.name}</h4>
    <div style="color:#8fb3dd;font-size:12px;margin-bottom:5px">
      ${p.kd} · ${SC[p.sc]||'未标注'} · ${US[p.us]||'未标注'}<br>
      约 ${p.lat.toFixed(3)}, ${p.lng.toFixed(3)}（精度约百米，公开名录坐标）</div></div>`, {maxWidth:260});
  cm.addTo(layerAll);
  cs.push(cm);
}
layerAll.addTo(map);
document.getElementById('cnt').textContent = ' · ' + total.toLocaleString() + ' 处';

function applyFilter(){
  for(const cm of cs){
    const on = kindsOn[cm._p.st.label];
    if(on){ if(!layerAll.hasLayer(cm)) layerAll.addLayer(cm); }
    else { if(layerAll.hasLayer(cm)) layerAll.removeLayer(cm); }
  }
}

/* ── 底部矿种筛选 chips ── */
const chips = document.getElementById('chips');
Object.keys(kindsOn).forEach(k=>{
  const s = document.createElement('span');
  const found = Object.keys(KIND_STYLE).find(x=>KIND_STYLE[x].label===k);
  const cls = (KIND_STYLE[found]||{cls:'k3'}).cls;
  s.className='chip '+cls+(kindsOn[k]?' on':'');
  s.textContent = k;
  s.onclick=()=>{
    kindsOn[k]=!kindsOn[k];
    s.classList.toggle('on', kindsOn[k]);
    applyFilter();
  };
  chips.appendChild(s);
});

/* ── 定位 ── */
let me=null, acc=null;
const locbox = document.getElementById('locbox');
document.getElementById('btn').onclick = ()=>{
  if(!navigator.geolocation){ locbox.textContent='这个浏览器没有定位能力'; return; }
  locbox.innerHTML = '正在定位…手机上 GPS 要几秒，电脑靠 WiFi 定位误差会大得多';
  navigator.geolocation.watchPosition(pos=>{
    const {latitude:la, longitude:lo, accuracy:ac} = pos.coords;
    if(!me){
      me = L.circleMarker([la,lo],{radius:7,color:'#fff',weight:2,fillColor:'#4da3ff',fillOpacity:1}).addTo(map)
            .bindPopup('你在这儿');
      acc = L.circle([la,lo],{radius:ac,color:'#4da3ff',weight:1,fillOpacity:.1,fillColor:'#4da3ff'}).addTo(map);
      map.setView([la,lo], Math.max(map.getZoom(),12));
    } else {
      me.setLatLng([la,lo]);
      acc.setLatLng([la,lo]).setRadius(ac);
    }
    let best=null, bd=1e18;
    for(const p of pts){
      const R=6371, dLat=(p.lat-la)*Math.PI/180, dLng=(p.lng-lo)*Math.PI/180;
      const a = Math.sin(dLat/2)**2 + Math.cos(la*Math.PI/180)*Math.cos(p.lat*Math.PI/180)*Math.sin(dLng/2)**2;
      const d = 2*R*Math.asin(Math.sqrt(a));
      if(d<bd){bd=d;best=p;}
    }
    locbox.innerHTML = `定位 <b>${la.toFixed(5)}, ${lo.toFixed(5)}</b> · 精度 <b>±${Math.round(ac)} 米</b><br>
      最近的金矿点：<b>${best.name}</b>（${best.kd}）直线约 <b>${bd.toFixed(1)} 公里</b>
      <span style="color:#6f88a8">（名录坐标精度约百米，能给你方向，不能当矿口位置）</span>`;
  }, err=>{
    const m = {1:'你拒绝了定位权限', 2:'拿不到位置信号', 3:'定位超时了'};
    locbox.textContent = (m[err.code]||'定位失败') + ' · ' + err.message;
  }, {enableHighAccuracy:true, maximumAge:2000, timeout:15000});
};

/* ── 矿点总开关 ── */
let showMines = true;
document.getElementById('btn2').onclick = ()=>{
  showMines = !showMines;
  if(showMines) layerAll.addTo(map); else map.removeLayer(layerAll);
  document.getElementById('btn2').textContent = showMines ? '隐藏矿点' : '显示矿点';
};

/* ══════ 我的标记（只存本机浏览器，不上传） ══════ */
var MK_KEY = 'goldmap.marks.v1';
var marks = [];
try { marks = JSON.parse(localStorage.getItem(MK_KEY) || '[]') || []; } catch(e){ marks = []; }

var markLayer = L.layerGroup().addTo(map);
var adding = false;

function saveMarks(){
  try { localStorage.setItem(MK_KEY, JSON.stringify(marks)); }
  catch(e){ alert('存不下了，可能是隐私模式或者空间满了'); }
}

function drawMarks(){
  markLayer.clearLayers();
  marks.forEach(function(m){
    L.marker([m.lat, m.lng], {
      icon: L.divIcon({
        className:'',
        html:'<div style="width:16px;height:16px;border-radius:50%;background:#ff5c8a;border:2px solid #fff;box-shadow:0 0 0 2px rgba(255,92,138,.45)"></div>',
        iconSize:[16,16], iconAnchor:[8,8]
      })
    }).addTo(markLayer).bindPopup(
      '<div class="pop"><h4>'+m.name+'</h4>'+
      '<div style="color:#8fb3dd;font-size:12px">'+(m.note ? m.note+'<br>' : '')+
      m.lat+', '+m.lng+'</div></div>', {maxWidth:240});
  });
}

var mkbox = document.getElementById('marks');
var mklist = document.getElementById('mklist');

function renderList(){
  if(mkChip) mkChip.textContent = '📍 我的标记 ' + marks.length;
  if(!marks.length){
    mklist.innerHTML = '<div class="mktip">还没有标记。点右边「✚ 添加标记」，再点地图上你要标的地方。</div>';
    return;
  }
  mklist.innerHTML = '';
  marks.slice().reverse().forEach(function(m){
    var d = document.createElement('div');
    d.className = 'mk';
    d.innerHTML = '<u data-del="'+m.id+'">删</u><b>'+m.name+'</b>'+
      '<i>'+(m.note || '（无备注）')+' · '+m.lat+', '+m.lng+'</i>';
    d.onclick = function(ev){
      if(ev.target.dataset.del){
        var id = ev.target.dataset.del;
        if(confirm('删掉「'+m.name+'」？')){
          marks = marks.filter(function(x){ return x.id !== id; });
          saveMarks(); drawMarks(); renderList();
        }
        return;
      }
      map.flyTo([m.lat, m.lng], 15);
      markLayer.eachLayer(function(l){
        var ll = l.getLatLng();
        if(ll.lat===m.lat && ll.lng===m.lng) l.openPopup();
      });
    };
    mklist.appendChild(d);
  });
}

var btn3 = document.getElementById('btn3');
var addhint = document.getElementById('addhint');
btn3.onclick = function(){
  adding = !adding;
  btn3.classList.toggle('on', adding);
  btn3.textContent = adding ? '取消添加' : '✚ 添加标记';
  addhint.classList.toggle('show', adding);
  map.getContainer().style.cursor = adding ? 'crosshair' : '';
  if(adding) mkbox.classList.remove('show');
};

function openMarkDialog(latlng){
  var name = prompt('给这个点起个名字', '我的点');
  if(name === null) return;
  var note = prompt('备注（可以留空）', '');
  if(note === null) note = '';
  var m = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2,6),
    name: (name||'').trim() || '我的点',
    note: (note||'').trim(),
    lat: +latlng.lat.toFixed(5),
    lng: +latlng.lng.toFixed(5),
    t: Date.now()
  };
  marks.push(m);
  saveMarks(); drawMarks(); renderList();
  map.flyTo([m.lat, m.lng], Math.max(map.getZoom(), 14));
}

map.on('click', function(e){
  if(!adding) return;
  adding = false;
  btn3.classList.remove('on');
  btn3.textContent = '✚ 添加标记';
  addhint.classList.remove('show');
  map.getContainer().style.cursor = '';
  openMarkDialog(e.latlng);
});

document.getElementById('mkclose').onclick = function(){ mkbox.classList.remove('show'); };

document.getElementById('mkexp').onclick = function(){
  if(!marks.length){ alert('还没有标记可以导出'); return; }
  var blob = new Blob([JSON.stringify({v:1, marks:marks}, null, 1)], {type:'application/json'});
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'my-marks-' + new Date().toISOString().slice(0,10) + '.json';
  a.click();
  setTimeout(function(){ URL.revokeObjectURL(a.href); }, 3000);
};

var mkfile = document.getElementById('mkfile');
document.getElementById('mkimp').onclick = function(){ mkfile.click(); };
mkfile.onchange = function(){
  var f = mkfile.files[0]; if(!f) return;
  var r = new FileReader();
  r.onload = function(){
    try{
      var j = JSON.parse(r.result);
      var arr = Array.isArray(j) ? j : (j.marks || []);
      if(!arr.length) throw new Error('里面没有标记');
      var have = {};
      marks.forEach(function(m){ have[m.id] = 1; });
      var n = 0;
      arr.forEach(function(m){
        if(!m || typeof m.lat !== 'number' || typeof m.lng !== 'number') return;
        if(m.id && have[m.id]) return;
        marks.push({
          id: m.id || (Date.now().toString(36)+Math.random().toString(36).slice(2,6)),
          name: m.name || '我的点',
          note: m.note || '',
          lat: m.lat, lng: m.lng,
          t: m.t || Date.now()
        });
        n++;
      });
      saveMarks(); drawMarks(); renderList();
      alert('导入 ' + n + ' 条');
    }catch(err){ alert('文件读不了：' + err.message); }
    mkfile.value = '';
  };
  r.readAsText(f);
};

/* 底部加一个「我的标记」chip 开关列表 */
var mkChip = document.createElement('span');
mkChip.className = 'chip';
mkChip.style.borderColor = '#b53b6b';
mkChip.style.color = '#ff9ec2';
mkChip.textContent = '📍 我的标记';
chips.appendChild(mkChip);
mkChip.onclick = function(){
  renderList();
  mkbox.classList.toggle('show');
};

drawMarks();
renderList();
