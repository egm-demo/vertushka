import re, pathlib
D = pathlib.Path(__file__).parent
rd = lambda n: (D / n).read_text(encoding='utf-8')
s = rd('base.html')

def rep(a, b, n=1):
    global s
    assert s.count(a) == n, (a[:70], s.count(a))
    s = s.replace(a, b)

def cut(start, end, new):
    global s
    i, j = s.index(start), s.index(end)
    assert i < j and s.count(start) == 1 and s.count(end) == 1, (start[:40], end[:40])
    s = s[:i] + new + s[j:]

# --- css
rep(':root{--stage:#06080b}', ':root{--stage:#06080b;--bg:#141c16;--panel:#1a241c;--card:#223024;--ink:#e6eedd;--muted:#a3b5a0;--accent:#b5d86a;--accent-ink:#17200f;--border:#2f3f31;--track:#46584a;--cur:#b5d86a;--rad:6px;--font:"Segoe UI Variable Text","Segoe UI",system-ui,sans-serif}')
s, n = re.subn(r'\[data-theme=\w+\]\{[^\n]*\n', '', s); assert n == 3, n
rep('font:14px/1.35 "Segoe UI Variable Text","Segoe UI",system-ui,sans-serif;', 'font:14px/1.35 var(--font);')
s = s.replace('border-radius:6px', 'border-radius:var(--rad)')
rep('</style>', rd('extra.css') + '</style>')
# --- html
rep('<nav class="tabs" id="tabs"></nav>', '''<div class="vpick">
    <button class="icon" id="vPrev" title="Предыдущая (Shift+V)"><svg viewBox="0 0 24 24"><path d="M15.4 7.4L14 6l-6 6 6 6 1.4-1.4L10.8 12z"/></svg></button>
    <button class="chip big" id="vBtn" title="Все визуализации">Столбики ▾</button>
    <button class="icon" id="vNext" title="Следующая (V)"><svg viewBox="0 0 24 24"><path d="M8.6 16.6L10 18l6-6-6-6-1.4 1.4 4.6 4.6z"/></svg></button>
    <button class="chip" id="autoTab" title="Менять визуализацию каждые 25 секунд (A)">Авто</button>
  </div><div class="grow"></div>''')
rep('<div class="dots" id="themes" title="Оформление"></div>', '<button class="chip" id="thBtn" title="Оформление">Тема</button>')
rep('<canvas id="cv"></canvas>', '<canvas id="glc"></canvas><canvas id="cv"></canvas>')
rep('<div class="list" id="list"></div>', '''<div class="svcs"><div class="svt">Звук из сервиса</div><div class="svb"><button class="btn" data-svc="vk">VK Музыка</button><button class="btn" data-svc="ya">Яндекс</button><button class="btn" data-svc="sp">Spotify</button></div></div>
    <div class="list" id="list"></div>''')
rep('<div class="toast" id="toast"></div>', '''<div class="pop" id="vPop"></div><div class="pop" id="thPop"></div>
<div class="modal" id="svc"><div class="mbox"><h2 id="svcT"></h2>
  <ol><li>Нажми «Открыть» и включи там музыку.</li><li>Вернись сюда и нажми «Подключить звук».</li><li>В окне Chrome выбери вкладку с музыкой и включи внизу «Также поделиться звуком вкладки». Если музыка играет в отдельной программе, выбери «Весь экран» и включи «Также поделиться системным звуком».</li></ol>
  <p class="mnote">Музыка играет в самом сервисе, а Вертушка слушает звук и рисует под него. Название трека, перемотка и список остаются в сервисе.</p>
  <div class="acts"><button class="btn" id="svcOpen"></button><button class="btn pri" id="svcGo">Подключить звук</button><button class="btn" id="svcX">Закрыть</button></div></div></div>
<div class="toast" id="toast"></div>''')
# --- js
rep('src.connect(analyser);analyser.connect(actx.destination);', 'src.connect(analyser);src.connect(actx.destination);const mz=actx.createGain();mz.gain.value=0;analyser.connect(mz);mz.connect(actx.destination);')
rep('const live=!!analyser&&!audio.paused;', 'const live=!!analyser&&(!audio.paused||!!cap);')
s, n = re.subn(r'const THEME_PAL=\{.*?\};', 'const THEME_PAL={};', s); assert n == 1
rep("{id:'ice',name:'лёд',s:[[18,58,130],[0,150,208],[120,230,240],[240,255,255]]}];", "{id:'ice',name:'лёд',s:[[18,58,130],[0,150,208],[120,230,240],[240,255,255]]},{id:'neon',name:'неон',s:[[60,0,160],[255,0,170],[0,230,255],[255,255,255]]},{id:'dusk',name:'закат',s:[[60,16,90],[214,50,90],[255,150,60],[255,236,170]]}];")
rep("PS[i]='rgb('+PR[i]+','+PG[i]+','+PB[i]+')'}}", "PS[i]='rgb('+PR[i]+','+PG[i]+','+PB[i]+')'}palDirty=true}")
rep('const sw=640,sh=256;', 'const sw=1280,sh=512;')
rep('sg.drawImage(S.c,-2,0);', 'sg.drawImage(S.c,-3,0);')
rep('sg.fillRect(sw-2,y,2,1)}', 'sg.fillRect(sw-3,y,3,1)}')
cut('let vizIdx=0,auto=false,autoT=0,vnT;', '/* ---------- теги ID3 ---------- */', rd('viz2d.js') + rd('gl.js') + rd('games.js') + rd('core.js'))
rep('cur=i;audio.src=t.url;renum();', 'cur=i;dropCapture();seedRoll();audio.src=t.url;renum();')
rep('function toggle(){if(cur<0){', 'function toggle(){if(cap){dropCapture();return}if(cur<0){')
rep("$('#stop').onclick=()=>stopAll();", "$('#stop').onclick=()=>{dropCapture();stopAll()};")
cut("const THEMES=[['arbuz'", "$('#palBtn').onclick=()=>setPal(palIdx+1);", rd('ui.js'))
rep("if(e.ctrlKey||e.altKey||e.metaKey)return;const c=e.code;let ok=true;", "if(e.ctrlKey||e.altKey||e.metaKey)return;const c=e.code;let ok=true;if(c==='Escape'){closePops();$('#svc').classList.remove('open');return}if(gameKey(c,true)){e.preventDefault();return}")
rep('/* ---------- запуск ---------- */', rd('services.js') + '/* ---------- запуск ---------- */')
rep("setViz(LS.get('viz',0),true)", "setViz(Math.max(0,VIZ.findIndex(v=>v.name===LS.get('vizn','Столбики'))),true)")
rep('get actx(){return actx}};', 'get actx(){return actx},attachStream,dropCapture,get cap(){return cap},get glScale(){return glScale},get glOn(){return glOn},glc,THEMES,get vizIdx(){return vizIdx},get dpr(){return dpr}};')
(D.parent / 'Vertushka.html').write_text(s, encoding='utf-8', newline='\n')
print('built', len(s), 'bytes')
