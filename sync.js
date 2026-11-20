/* ===== 共享标记同步（Supabase） ===== */
(function(){
  var BASE = 'https://zorqwowcutmambgsbeum.supabase.co/rest/v1/';
  var KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvcnF3b3djdXRtYW1iZ3NiZXVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTUwODA4NTYsImV4cCI6MjExMDY1Njg1Nn0.qc3icZ7WGuuzPnnJeuldqZNPZTjq9MhdUDOJ4z0cR58';
  var HDR  = { apikey: KEY, Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };
  var dirty = false, pushing = false, pulling = false;
  var pushed = {};          // 已推送过的 id，避免每轮重复写
  var pushedDel = {};       // 已推送过的删除 id

  function req(url, opt, ms){
    var ctl = (typeof AbortController !== 'undefined') ? new AbortController() : null;
    var o = opt || {};
    o.headers = Object.assign({}, HDR, o.headers || {});
    if(ctl) o.signal = ctl.signal;
    var timer = setTimeout(function(){ if(ctl) ctl.abort(); }, ms || 9000);
    return fetch(url, o).then(function(r){ clearTimeout(timer); return r; },
                             function(e){ clearTimeout(timer); throw e; });
  }

  function okList(a){
    return Array.isArray(a) ? a.filter(function(m){
      return m && typeof m.lat === 'number' && typeof m.lng === 'number' && m.id;
    }) : [];
  }

  function mergeInto(arr){
    var have = {}, del = {};
    (window.__getDel ? window.__getDel() : []).forEach(function(id){ del[id] = 1; });
    marks.forEach(function(m){ have[m.id] = 1; });
    var n = 0;
    okList(arr).forEach(function(m){
      if(have[m.id] || del[m.id]) return;
      marks.push({ id: String(m.id), name: m.name || '标记', note: m.note || '',
                   res: m.res || '',
                   lat: +m.lat, lng: +m.lng, o: m.o || '', t: m.t || Date.now() });
      have[m.id] = 1; n++;
    });
    return n;
  }

  /* 拉：别人的点 + 别人删掉的 id */
  function pull(tries){
    if(pulling) return; pulling = true;
    Promise.all([
      req(BASE + 'marks?select=*&limit=3000&order=t.desc', { cache:'no-store' }, 9000).then(function(r){ return r.ok ? r.json() : []; }),
      req(BASE + 'mark_del?select=*&limit=3000', { cache:'no-store' }, 9000).then(function(r){ return r.ok ? r.json() : []; })
    ]).then(function(res){
      pulling = false;
      var remote = res[0], rdel = res[1];
      var changed = false;
      if(Array.isArray(rdel) && rdel.length){
        var ids = rdel.map(function(d){ return String(d.id); });
        var before = marks.length;
        marks = marks.filter(function(m){ return ids.indexOf(m.id) < 0; });
        if(marks.length !== before){ saveMarks(); drawMarks(); renderList(); changed = true; }
        if(window.__addDel) ids.forEach(function(id){ window.__addDel(id); });
      }
      var n = mergeInto(remote);
      if(n){ saveMarks(); drawMarks(); renderList(); }
      if(changed || n) { /* 已经刷新过界面 */ }
    }).catch(function(){
      pulling = false;
      tries = (tries || 0) + 1;
      if(tries <= 3) setTimeout(function(){ pull(tries); }, 1500 * tries);
    });
  }

  /* 推：本地新点 + 本地删除 */
  function push(force, tries){
    if(pushing) return;
    if(!force && !dirty) return;
    pushing = true;
    var dl  = window.__getDel ? window.__getDel() : [];
    var newMarks = marks.filter(function(m){ return !pushed[m.id]; });
    var newDel   = dl.filter(function(id){ return !pushedDel[id]; });

    var jobs = [];
    if(newMarks.length){
      var rows = newMarks.map(function(m){
        return { id: String(m.id), name: m.name || '', note: m.note || '', res: m.res || '',
                 lat: +m.lat, lng: +m.lng, o: m.o || '', t: +(m.t || Date.now()) };
      });
      jobs.push(req(BASE + 'marks', {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
        body: JSON.stringify(rows)
      }, 12000).then(function(r){
        if(r.ok) newMarks.forEach(function(m){ pushed[m.id] = 1; });
        return r.ok;
      }));
    }
    if(newDel.length){
      var drows = newDel.map(function(id){ return { id: String(id), t: Date.now() }; });
      jobs.push(req(BASE + 'mark_del', {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
        body: JSON.stringify(drows)
      }, 12000).then(function(r){
        if(r.ok) newDel.forEach(function(id){ pushedDel[id] = 1; });
        return r.ok;
      }));
    }
    if(!jobs.length){ pushing = false; dirty = false; return; }

    Promise.all(jobs).then(function(rs){
      pushing = false;
      if(rs.every(function(x){ return x; })) dirty = false;
      else retryPush(tries);
    }).catch(function(){ pushing = false; retryPush(tries); });
  }

  function retryPush(tries){
    tries = (tries || 0) + 1;
    if(tries <= 4) setTimeout(function(){ dirty = true; push(true, tries); }, 1200 * tries);
  }

  /* 每次本地保存后推一次（1.2 秒内多次只推一次） */
  var rawSave = window.saveMarks;
  window.saveMarks = function(){
    rawSave.apply(null, arguments);
    dirty = true;
    setTimeout(function(){ push(); }, 1200);
  };

  setInterval(function(){ if(!document.hidden) pull(); }, 15000);
  window.addEventListener('online', function(){ push(true); });
  pull();
})();
