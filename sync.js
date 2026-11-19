/* ══════ 共享标记同步（远程桶 + 本地兜底） ══════ */
(function(){
  var BIN = 'ff808181a09d98f701a1f44c757e6686';
  var API = 'https://api.restful-api.dev/objects/' + BIN;
  var dirty = false, pushing = false, pulling = false;

  function okList(a){ return Array.isArray(a) ? a.filter(function(m){
    return m && typeof m.lat === 'number' && typeof m.lng === 'number' && m.id;
  }) : []; }

  function mergeInto(arr){
    var have = {}, del = {};
    (window.__getDel ? window.__getDel() : []).forEach(function(id){ del[id] = 1; });
    marks.forEach(function(m){ have[m.id] = 1; });
    var n = 0;
    okList(arr).forEach(function(m){
      if(have[m.id] || del[m.id]) return;
      marks.push({id:String(m.id), name:m.name||'点', note:m.note||'',
                  lat:+m.lat, lng:+m.lng, o:m.o||'', t:m.t||Date.now()});
      have[m.id] = 1; n++;
    });
    return n;
  }

  /* 带超时的 fetch，服务偶尔抽风，超时就当失败 */
  function req(url, opt, ms){
    var ctl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var o = opt || {};
    if(ctl){ o.signal = ctl.signal; }
    var timer = setTimeout(function(){ if(ctl) ctl.abort(); }, ms || 8000);
    return fetch(url, o).then(function(r){ clearTimeout(timer); return r; },
                              function(e){ clearTimeout(timer); throw e; });
  }

  function pull(tries){
    if(pulling) return; pulling = true;
    req(API + '?t=' + Date.now(), {cache:'no-store'}, 8000).then(function(r){
      return r.json();
    }).then(function(o){
      pulling = false;
      var remote = (o && o.data && Array.isArray(o.data.marks)) ? o.data.marks : [];
      var rdel = (o && o.data && Array.isArray(o.data.del)) ? o.data.del : [];
      if(rdel.length){
        var before = marks.length;
        marks = marks.filter(function(m){ return rdel.indexOf(m.id) < 0; });
        if(marks.length !== before){ saveMarks(); drawMarks(); renderList(); }
        if(window.__getDel) rdel.forEach(function(id){ window.__addDel(id); });
      }
      if(!remote.length){ if(marks.length) push(true); return; }
      var n = mergeInto(remote);
      if(n){ saveMarks(); drawMarks(); renderList(); }
      if(marks.length > remote.length) push(true);
    }).catch(function(){
      pulling = false;
      tries = (tries||0) + 1;
      if(tries <= 3) setTimeout(function(){ pull(tries); }, 1500 * tries);
    });
  }

  function push(force, tries){
    if(pushing) return;
    if(!force && !dirty) return;
    pushing = true;
    var dl = window.__getDel ? window.__getDel() : [];
    var body = JSON.stringify({name:'goldmap-marks', data:{marks:marks, del:dl}});
    req(API, {method:'PUT', headers:{'Content-Type':'application/json'}, body:body}, 9000)
      .then(function(r){
        pushing = false;
        if(r.ok){ dirty = false; } else { retryPush(tries); }
      })
      .catch(function(){ pushing = false; retryPush(tries); });
  }

  function retryPush(tries){
    tries = (tries||0) + 1;
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