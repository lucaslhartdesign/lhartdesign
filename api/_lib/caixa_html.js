// A página da Caixa no celular (20/11/2026). Servida por api/ops.js em /caixa?k=...
// Só HTML/CSS/JS puro, sem bibliotecas. ⚠ Sem crase nem "${" aqui dentro: o texto
// todo é uma template string.
module.exports = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="robots" content="noindex,nofollow">
<meta name="referrer" content="no-referrer">
<meta name="theme-color" content="#161826">
<title>Caixa no celular</title>
<style>
:root{--bg:#161826;--card:#1f2235;--card2:#262a40;--linha:#2f3450;--txt:#f1f1f5;--fraco:#a3a7ba;
--verde:#4be39a;--verde-tx:#0d1a13;--azul:#7aa7ff;--amarelo:#ffcf5c;--vermelho:#ff6b6b;--roxo:#b58cff}
*{box-sizing:border-box}
html,body{margin:0;background:var(--bg);color:var(--txt);font:16px/1.45 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;-webkit-text-size-adjust:100%}
header{position:sticky;top:0;z-index:5;background:rgba(22,24,38,.96);backdrop-filter:blur(8px);border-bottom:1px solid var(--linha);padding:12px 16px calc(10px) 16px}
.topo{display:flex;align-items:center;gap:10px;justify-content:space-between}
h1{font-size:19px;margin:0;font-weight:800;letter-spacing:-.01em}
.pc{font-size:13px;font-weight:700;padding:5px 10px;border-radius:99px;background:var(--card2);white-space:nowrap}
.pc.on{color:var(--verde)}.pc.off{color:var(--vermelho)}
.sub{font-size:13px;color:var(--fraco);margin-top:6px;display:flex;gap:10px;flex-wrap:wrap;align-items:center}
.chips{display:flex;gap:8px;margin-top:10px}
.chip{border:1px solid var(--linha);background:transparent;color:var(--fraco);padding:7px 14px;border-radius:99px;font:600 14px system-ui}
.chip.ativo{background:var(--txt);color:var(--bg);border-color:var(--txt)}
main{padding:12px 16px 90px;max-width:720px;margin:0 auto}
.vazio{text-align:center;color:var(--fraco);padding:60px 10px}
.card{background:var(--card);border:1px solid var(--linha);border-radius:16px;padding:14px;margin:0 0 12px}
.card.espera{border-color:rgba(255,207,92,.45)}
.cab{display:flex;justify-content:space-between;gap:8px;align-items:flex-start}
.nome{font-weight:800;font-size:17px;line-height:1.25;word-break:break-word}
.meta{font-size:12.5px;color:var(--fraco);margin-top:3px}
.tag{display:inline-block;font-size:11.5px;font-weight:700;padding:2px 8px;border-radius:99px;background:var(--card2);color:var(--fraco);margin-right:4px}
.tag.wa{color:var(--verde)}.tag.ig{color:var(--roxo)}.tag.em{color:var(--azul)}
.horas{font-size:12.5px;font-weight:800;color:var(--amarelo);white-space:nowrap}
.horas.muito{color:var(--vermelho)}
.disse{margin:12px 0 0;padding:10px 12px;background:var(--card2);border-radius:12px;font-size:15px;white-space:pre-wrap;word-break:break-word}
.pt{color:var(--fraco);font-size:13.5px;font-style:italic;margin-top:6px;white-space:pre-wrap}
.ver{background:none;border:0;color:var(--azul);font:600 13.5px system-ui;padding:8px 0 0}
.conv{margin-top:8px;display:none}.conv.aberta{display:block}
.msg{max-width:88%;padding:8px 11px;border-radius:12px;margin:6px 0;font-size:14px;white-space:pre-wrap;word-break:break-word}
.msg.cliente{background:var(--card2)}.msg.voce{background:#20412f;margin-left:auto}
.msg small{display:block;color:var(--fraco);font-size:11px;margin-top:3px}
.rot{font-size:12px;font-weight:800;color:var(--fraco);text-transform:uppercase;letter-spacing:.06em;margin:14px 0 6px}
textarea{width:100%;min-height:110px;resize:vertical;background:#12141f;color:var(--txt);border:1px solid var(--linha);border-radius:12px;padding:10px 12px;font:15px/1.45 system-ui}
textarea:focus{outline:2px solid var(--azul);border-color:transparent}
.botoes{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}
button.b{flex:1 1 auto;min-height:46px;border:0;border-radius:12px;padding:11px 14px;font:700 15px system-ui;background:var(--card2);color:var(--txt);cursor:pointer}
button.b.prim{background:var(--verde);color:var(--verde-tx);flex:1 1 100%}
button.b.mat{background:#2b2550;color:#e6dcff;flex:1 1 100%;text-align:left}
button.b.perigo{color:var(--vermelho);flex:0 1 auto}
button.b:disabled{opacity:.5}
.estado{margin-top:10px;font-size:14px;padding:9px 12px;border-radius:10px;background:var(--card2)}
.estado.ok{color:var(--verde)}.estado.erro{color:var(--vermelho)}.estado.fila{color:var(--amarelo)}
.toast{position:fixed;left:16px;right:16px;bottom:calc(16px + env(safe-area-inset-bottom));background:var(--txt);color:var(--bg);padding:13px 16px;border-radius:14px;font-weight:700;text-align:center;transform:translateY(150%);transition:transform .25s;z-index:9}
.toast.v{transform:none}
@media (prefers-reduced-motion:reduce){.toast{transition:none}}
</style>
</head>
<body>
<header>
  <div class="topo"><h1>📥 Caixa</h1><span id="pc" class="pc">…</span></div>
  <div class="sub" id="sub">Carregando…</div>
  <div class="chips"><button class="chip ativo" data-f="espera">Esperando você</button><button class="chip" data-f="todos">Todas</button></div>
</header>
<main id="lista"><div class="vazio">Carregando…</div></main>
<div class="toast" id="toast"></div>
<script>
(function(){
var K=new URLSearchParams(location.search).get('k')||'';
var API='/api/ops?k='+encodeURIComponent(K)+'&a=';
var filtro='espera', dados=null, resultados={}, meus={}, abertas={}, rascunhos={}, escrevendo={};
try{meus=JSON.parse(localStorage.getItem('caixa_meus')||'{}')||{}}catch(e){meus={}}
function salvar(){try{localStorage.setItem('caixa_meus',JSON.stringify(meus))}catch(e){}}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function toast(t){var el=document.getElementById('toast');el.textContent=t;el.classList.add('v');clearTimeout(toast.t);toast.t=setTimeout(function(){el.classList.remove('v')},2600)}
function canal(c){c=String(c||'');if(c.indexOf('insta')>=0)return'<span class="tag ig">Instagram</span>';if(c.indexOf('mail')>=0)return'<span class="tag em">E-mail</span>';return'<span class="tag wa">WhatsApp</span>'}
function horas(h){if(!h)return'';var t=h<1?Math.round(h*60)+' min':(h<48?Math.round(h)+' h':Math.round(h/24)+' dias');return'<span class="horas'+(h>=6?' muito':'')+'">⏳ '+t+'</span>'}
function quando(ms){var d=new Date(ms);return('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2)}

function estadoDe(phone){
  var ultimo=null;
  Object.keys(meus).forEach(function(id){var m=meus[id];if(m.phone===phone&&(!ultimo||m.em>ultimo.em))ultimo=Object.assign({id:id},m)});
  if(!ultimo||Date.now()-ultimo.em>6*3600*1000)return'';
  var r=resultados[ultimo.id];
  var nome={enviar:'Resposta',escrever:'Sua resposta',material:'Material do app',rascunhar:'Nova resposta da IA',descartar:'Descarte'}[ultimo.acao]||'Pedido';
  if(!r)return'<div class="estado fila">⏳ '+nome+' na fila. O PC pega em até 20 s.</div>';
  if(r.espera)return'<div class="estado fila">⏳ '+nome+' esperando o navegador do PC terminar o que está fazendo.</div>';
  if(r.ok){var feito={enviar:'enviada',escrever:'enviada',material:'gerado e enviado',rascunhar:'escrita. Ela aparece aqui em instantes.',descartar:'feito'}[ultimo.acao]||'feito';
    return'<div class="estado ok">✅ '+nome+' '+feito+' às '+esc(r.em)+'.</div>'}
  return'<div class="estado erro">⚠️ Não deu: '+esc(r.erro||'erro')+'</div>';
}

function card(i){
  var h='<div class="card'+(i.esperando?' espera':'')+'" data-p="'+esc(i.phone)+'">';
  h+='<div class="cab"><div><div class="nome">'+esc(i.nome)+'</div><div class="meta">'+canal(i.canal)+(i.pais?'<span class="tag">'+esc(i.pais)+'</span>':'')+esc(i.cidade||'')+'</div></div>'+(i.esperando?horas(i.horas):'')+'</div>';
  if(i.ultima){h+='<div class="disse">'+esc(i.ultima)+(i.ultima_pt?'<div class="pt">🇧🇷 '+esc(i.ultima_pt)+'</div>':'')+'</div>'}
  if(i.conversa&&i.conversa.length>1){
    h+='<button class="ver" data-acao="conv">'+(abertas[i.phone]?'Esconder a conversa':'Ver a conversa ('+i.conversa.length+')')+'</button><div class="conv'+(abertas[i.phone]?' aberta':'')+'">';
    i.conversa.forEach(function(m){h+='<div class="msg '+(m.quem==='voce'?'voce':'cliente')+'">'+esc(m.msg)+(m.pt?'<div class="pt">'+esc(m.pt)+'</div>':'')+'<small>'+(m.quem==='voce'?'você':'cliente')+(m.quando?' · '+esc(m.quando):'')+'</small></div>'});
    h+='</div>'}
  if(i.pronta){
    var t=rascunhos[i.phone]!=null?rascunhos[i.phone]:i.pronta.texto;
    h+='<div class="rot">Resposta pronta (pode editar)</div><textarea data-campo="pronta">'+esc(t)+'</textarea>'+(i.pronta.pt?'<div class="pt">🇧🇷 '+esc(i.pronta.pt)+'</div>':'');
    h+='<div class="botoes"><button class="b prim" data-acao="enviar">✅ Enviar esta resposta</button><button class="b" data-acao="rascunhar">🤖 Outra da IA</button><button class="b perigo" data-acao="descartar">Descartar</button></div>';
  }else{
    h+='<div class="botoes"><button class="b prim" data-acao="rascunhar">🤖 Escrever a resposta com a IA</button></div>';
  }
  if(i.materiais&&i.materiais.length){
    h+='<div class="rot">Gerar com o app e enviar</div><div class="botoes">';
    i.materiais.forEach(function(m){h+='<button class="b mat" data-acao="material" data-tipo="'+esc(m.tipo)+'">⚡ '+esc(m.rotulo)+'</button>'});
    h+='</div>'}
  if(escrevendo[i.phone]){
    h+='<div class="rot">Sua resposta</div><textarea data-campo="minha" placeholder="Escreva no idioma do cliente">'+esc(escrevendo[i.phone]===true?'':escrevendo[i.phone])+'</textarea><div class="botoes"><button class="b prim" data-acao="escrever">📤 Enviar a minha</button></div>';
  }else{
    h+='<div class="botoes"><button class="b" data-acao="abrir_escrever">✍️ Escrever a minha</button></div>';
  }
  h+=estadoDe(i.phone)+'</div>';
  return h;
}

function desenhar(){
  if(!dados)return;
  var itens=(dados.dados&&dados.dados.itens)||[];
  var lista=filtro==='espera'?itens.filter(function(i){return i.esperando}):itens;
  var pcOn=dados.vivo&&(dados.agora-dados.vivo)<90000;
  var pc=document.getElementById('pc');
  pc.className='pc '+(pcOn?'on':'off');
  pc.textContent=pcOn?'🟢 PC ligado':'🔴 PC desligado'+(dados.vivo?' desde '+quando(dados.vivo):'');
  var est=(dados.dados&&dados.dados.estado)||{};
  var n=itens.filter(function(i){return i.esperando}).length;
  document.getElementById('sub').innerHTML=n+' esperando você · lista de '+(dados.dados&&dados.dados.em?quando(dados.dados.em):'—')+(est.pausado?' · <b style="color:var(--amarelo)">programa PAUSADO</b>':'')+(!pcOn?' · <b style="color:var(--vermelho)">o que você tocar espera o PC ligar</b>':'');
  var el=document.getElementById('lista');
  if(document.activeElement&&document.activeElement.tagName==='TEXTAREA')return; // não apaga o que você está digitando
  el.innerHTML=lista.length?lista.map(card).join(''):'<div class="vazio">'+(filtro==='espera'?'Ninguém esperando você agora. 🎉':'Nenhuma conversa nos últimos dias.')+'</div>';
}

function carregar(){
  if(document.hidden)return;
  fetch(API+'caixa_dados',{cache:'no-store'}).then(function(r){return r.json()}).then(function(j){
    if(!j||!j.ok)throw new Error('sem dados');dados=j;resultados=j.resultados||{};desenhar();
  }).catch(function(){document.getElementById('sub').textContent='Sem conexão com o site. Tentando de novo…'});
}

function mandar(item,acao,extra){
  var corpo=Object.assign({acao:acao,phone:item.phone,rascunho_id:(item.pronta&&item.pronta.id)||item.rascunho_id||null},extra||{});
  return fetch(API+'caixa_cmd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(corpo)})
    .then(function(r){return r.json()}).then(function(j){
      if(!j||!j.ok)throw new Error((j&&j.error)||'falhou');
      meus[j.id]={phone:item.phone,acao:acao,em:Date.now()};salvar();
      toast('Pedido enviado ao PC');desenhar();
    }).catch(function(e){toast('Não deu: '+e.message)});
}

document.addEventListener('click',function(ev){
  var chip=ev.target.closest('.chip');
  if(chip){filtro=chip.getAttribute('data-f');document.querySelectorAll('.chip').forEach(function(c){c.classList.toggle('ativo',c===chip)});desenhar();return}
  var b=ev.target.closest('[data-acao]');if(!b)return;
  var c=b.closest('.card');if(!c)return;
  var phone=c.getAttribute('data-p');
  var item=((dados&&dados.dados&&dados.dados.itens)||[]).filter(function(i){return i.phone===phone})[0];if(!item)return;
  var acao=b.getAttribute('data-acao');
  if(acao==='conv'){abertas[phone]=!abertas[phone];desenhar();return}
  if(acao==='abrir_escrever'){escrevendo[phone]=true;desenhar();var t=document.querySelector('.card[data-p="'+CSS.escape(phone)+'"] textarea[data-campo="minha"]');if(t)t.focus();return}
  if(acao==='enviar'){var tx=(c.querySelector('textarea[data-campo="pronta"]')||{}).value||'';tx=tx.trim();
    if(!tx){toast('A resposta está vazia');return}
    if(!confirm('Enviar esta resposta para '+item.nome+'?'))return;
    mandar(item,'enviar',{texto:tx});delete rascunhos[phone];return}
  if(acao==='escrever'){var m=(c.querySelector('textarea[data-campo="minha"]')||{}).value||'';m=m.trim();
    if(!m){toast('Escreva a resposta primeiro');return}
    if(!confirm('Enviar a sua resposta para '+item.nome+'?'))return;
    mandar(item,'escrever',{texto:m});delete escrevendo[phone];return}
  if(acao==='material'){if(!confirm('Gerar "'+b.textContent.replace('⚡','').trim()+'" e ENVIAR para '+item.nome+'?'))return;
    mandar(item,'material',{tipo:b.getAttribute('data-tipo')});return}
  if(acao==='rascunhar'){mandar(item,'rascunhar');return}
  if(acao==='descartar'){if(!confirm('Descartar a resposta pronta de '+item.nome+'?'))return;mandar(item,'descartar');return}
});
document.addEventListener('input',function(ev){
  var t=ev.target;if(t.tagName!=='TEXTAREA')return;var c=t.closest('.card');if(!c)return;var p=c.getAttribute('data-p');
  if(t.getAttribute('data-campo')==='pronta')rascunhos[p]=t.value;else escrevendo[p]=t.value||true;
});
document.addEventListener('focusout',function(ev){if(ev.target.tagName==='TEXTAREA')setTimeout(desenhar,300)});
document.addEventListener('visibilitychange',carregar);
carregar();setInterval(carregar,10000);
})();
</script>
</body>
</html>`;
