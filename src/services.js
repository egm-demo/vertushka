/* ---------- звук из VK Музыки, Яндекс Музыки, Spotify ---------- */
const SVC={vk:['VK Музыка','https://vk.com/audio'],ya:['Яндекс Музыка','https://music.yandex.ru/'],sp:['Spotify','https://open.spotify.com/']};
let cap=null,svcCur='vk';
function paintCap(){document.querySelectorAll('[data-svc]').forEach(b=>b.classList.toggle('pri',!!cap&&cap.name===SVC[b.dataset.svc][0]));
  if(cap){$('#nTitle').textContent='Звук из: '+cap.name;$('#nArtist').textContent='Вертушка слушает. «Стоп» отключает';$('#playPath').setAttribute('d','M6 6h12v12H6z');document.title=cap.name+' · Вертушка'}
  else{showNow();$('#playPath').setAttribute('d',audio.paused?PLAY:PAUSE)}}
function attachStream(stream,name){dropCapture();initAudio();if(actx.state==='suspended')actx.resume();audio.pause();
  const node=actx.createMediaStreamSource(stream);node.connect(analyser);cap={stream,node,name};
  stream.getAudioTracks().forEach(tr=>tr.addEventListener('ended',()=>{if(cap&&cap.stream===stream)dropCapture()}));paintCap()}
function dropCapture(){if(!cap)return;try{cap.node.disconnect()}catch(e){}cap.stream.getTracks().forEach(t=>t.stop());cap=null;paintCap()}
async function connectService(){const name=SVC[svcCur][0];
  if(!navigator.mediaDevices||!navigator.mediaDevices.getDisplayMedia){toast('Нужен Chrome или Edge на компьютере');return}
  let stream;try{stream=await navigator.mediaDevices.getDisplayMedia({video:true,audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false},systemAudio:'include'})}
  catch(e){if(e.name!=='NotAllowedError'&&e.name!=='AbortError')toast('Не получилось: '+e.message);return}
  if(!stream.getAudioTracks().length){stream.getTracks().forEach(t=>t.stop());toast('Звук не пришёл. В окне выбора включи «Также поделиться звуком»');return}
  attachStream(stream,name);$('#svc').classList.remove('open');toast('Подключено: '+name)}
document.querySelectorAll('[data-svc]').forEach(b=>b.onclick=()=>{svcCur=b.dataset.svc;const [n]=SVC[svcCur];$('#svcT').textContent=n+' в Вертушке';$('#svcOpen').textContent='Открыть '+n;$('#svc').classList.add('open')});
const isChrome=()=>{const u=navigator.userAgentData;if(u&&u.brands)return u.brands.some(b=>b.brand==='Google Chrome')&&!u.brands.some(b=>/Edge|Opera|Yandex/i.test(b.brand));return /Chrome\//.test(navigator.userAgent)&&!/Edg\/|OPR\/|YaBrowser/.test(navigator.userAgent)};
$('#svcOpen').onclick=()=>{if(!isChrome()){const l=location.href;try{navigator.clipboard.writeText(l)}catch(e){}toast('Вертушка открыта не в Google Chrome. Открой её в Chrome (ссылка скопирована), иначе звук сервиса не подключится');return}window.open(SVC[svcCur][1],'_blank','noopener')};
$('#svcGo').onclick=connectService;$('#svcX').onclick=()=>$('#svc').classList.remove('open');
$('#svc').addEventListener('pointerdown',e=>{if(e.target.id==='svc')e.target.classList.remove('open')});

