// A página da Caixa no celular (20/11/2026). Servida por api/ops.js em /caixa?k=...
// Só HTML/CSS/JS puro, sem bibliotecas. ⚠ Sem crase nem "${" aqui dentro: o texto
// todo é uma template string.
// 21/11/2026: e-mail, "recusou" com o motivo, e o Painel (o que o PC está fazendo,
// piloto automático, atendente, buscar clientes novos, criar página de jogos/app).
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
header{position:sticky;top:0;z-index:5;background:rgba(22,24,38,.96);backdrop-filter:blur(8px);border-bottom:1px solid var(--linha);padding:12px 16px 10px 16px}
.topo{display:flex;align-items:center;gap:10px;justify-content:space-between}
h1{font-size:19px;margin:0;font-weight:800;letter-spacing:-.01em}
.pc{font-size:13px;font-weight:700;padding:5px 10px;border-radius:99px;background:var(--card2);white-space:nowrap}
.pc.on{color:var(--verde)}.pc.off{color:var(--vermelho)}
.sub{font-size:13px;color:var(--fraco);margin-top:6px;display:flex;gap:10px;flex-wrap:wrap;align-items:center}
.agora{font-size:13px;color:var(--txt);margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.chips{display:flex;gap:8px;margin-top:10px;overflow-x:auto}
.chip{border:1px solid var(--linha);background:transparent;color:var(--fraco);padding:7px 14px;border-radius:99px;font:600 14px system-ui;white-space:nowrap}
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
textarea,input,select{width:100%;background:#12141f;color:var(--txt);border:1px solid var(--linha);border-radius:12px;padding:10px 12px;font:15px/1.45 system-ui}
textarea{min-height:110px;resize:vertical}
input,select{min-height:46px}
textarea:focus,input:focus,select:focus{outline:2px solid var(--azul);border-color:transparent}
.botoes{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}
button.b{flex:1 1 auto;min-height:46px;border:0;border-radius:12px;padding:11px 14px;font:700 15px system-ui;background:var(--card2);color:var(--txt);cursor:pointer}
button.b.prim{background:var(--verde);color:var(--verde-tx);flex:1 1 100%}
button.b.mat{background:#2b2550;color:#e6dcff;flex:1 1 100%;text-align:left}
button.b.perigo{color:var(--vermelho);flex:0 1 auto}
button.b.liga{background:var(--txt);color:var(--bg)}
button.b:disabled{opacity:.5}
.estado{margin-top:10px;font-size:14px;padding:9px 12px;border-radius:10px;background:var(--card2);word-break:break-word}
.estado.ok{color:var(--verde)}.estado.erro{color:var(--vermelho)}.estado.fila{color:var(--amarelo)}
.dobra{margin-top:12px;border-top:1px solid var(--linha);padding-top:4px}
.dobra summary{cursor:pointer;color:var(--azul);font:600 14px system-ui;padding:8px 0;list-style:none}
.dobra summary::-webkit-details-marker{display:none}
.nota{font-size:13px;color:var(--fraco);margin-top:6px}
.linha{font-size:14px;color:var(--fraco);padding:4px 0;border-bottom:1px solid rgba(47,52,80,.5)}
.linha b{color:var(--txt);font-weight:700}
.seg{display:flex;gap:6px;margin-top:8px}
.seg button{flex:1;min-height:44px;border:1px solid var(--linha);background:transparent;color:var(--fraco);border-radius:12px;font:700 14px system-ui}
.seg button.ativo{background:var(--verde);color:var(--verde-tx);border-color:var(--verde)}
.link{display:block;margin-top:8px;color:var(--azul);word-break:break-all;font-weight:700}
.toast{position:fixed;left:16px;right:16px;bottom:calc(16px + env(safe-area-inset-bottom));background:var(--txt);color:var(--bg);padding:13px 16px;border-radius:14px;font-weight:700;text-align:center;transform:translateY(150%);transition:transform .25s;z-index:9}
.toast.v{transform:none}
@media (prefers-reduced-motion:reduce){.toast{transition:none}}
</style>
</head>
<body>
<header>
  <div class="topo"><h1>📥 Caixa</h1><span id="pc" class="pc">…</span></div>
  <div class="sub" id="sub">Carregando…</div>
  <div class="agora" id="agora"></div>
  <div class="chips"><button class="chip ativo" data-f="espera">Esperando você</button><button class="chip" data-f="todos">Todas</button><button class="chip" data-f="painel">⚙️ Painel</button></div>
</header>
<main id="lista"><div class="vazio">Carregando…</div></main>
<div class="toast" id="toast"></div>
<script>
(function(){
var K=new URLSearchParams(location.search).get('k')||'';
var API='/api/ops?k='+encodeURIComponent(K)+'&a=';
var filtro='espera', dados=null, resultados={}, meus={}, abertas={}, rascunhos={}, escrevendo={}, emails={};
var pag={tipo:'jogos',nome:'',idioma:'pt'};
try{meus=JSON.parse(localStorage.getItem('caixa_meus')||'{}')||{}}catch(e){meus={}}
function salvar(){try{localStorage.setItem('caixa_meus',JSON.stringify(meus))}catch(e){}}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function toast(t){var el=document.getElementById('toast');el.textContent=t;el.classList.add('v');clearTimeout(toast.t);toast.t=setTimeout(function(){el.classList.remove('v')},2600)}
function canal(c){c=String(c||'');if(c.indexOf('insta')>=0)return'<span class="tag ig">Instagram</span>';if(c.indexOf('mail')>=0)return'<span class="tag em">E-mail</span>';return'<span class="tag wa">WhatsApp</span>'}
function horas(h){if(!h)return'';var t=h<1?Math.round(h*60)+' min':(h<48?Math.round(h)+' h':Math.round(h/24)+' dias');return'<span class="horas'+(h>=6?' muito':'')+'">⏳ '+t+'</span>'}
function quando(ms){var d=new Date(ms);return('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2)}
function estado(){return(dados&&dados.dados&&dados.dados.estado)||{}}
var NOMES={enviar:'Resposta',escrever:'Sua resposta',material:'Material do app',rascunhar:'Nova resposta da IA',descartar:'Descarte',
  email:'E-mail',recusar:'Recusou',buscar:'Busca de clientes',pagina:'Página',piloto:'Piloto automático',atendente:'Atendente'};
var FEITO={enviar:'enviada',escrever:'enviada',material:'gerado e enviado',rascunhar:'escrita. Ela aparece aqui em instantes.',descartar:'feito',
  email:'enviado',recusar:'marcado',buscar:'começou',pagina:'pronta',piloto:'feito',atendente:'trocado'};

function ultimoDe(filtroFn){
  var ultimo=null;
  Object.keys(meus).forEach(function(id){var m=meus[id];if(filtroFn(m)&&(!ultimo||m.em>ultimo.em))ultimo=Object.assign({id:id},m)});
  if(!ultimo||Date.now()-ultimo.em>6*3600*1000)return null;
  return ultimo;
}
function caixaEstado(ultimo){
  if(!ultimo)return'';
  var r=resultados[ultimo.id];var nome=NOMES[ultimo.acao]||'Pedido';
  if(!r)return'<div class="estado fila">⏳ '+nome+' na fila. O PC pega em até 20 s.</div>';
  if(r.espera)return'<div class="estado fila">⏳ '+nome+' esperando o navegador do PC terminar o que está fazendo.</div>';
  if(r.ok){
    var extra='';
    if(ultimo.acao==='pagina'&&r.texto)extra='<a class="link" href="'+esc(r.texto)+'" target="_blank" rel="noopener">'+esc(r.texto)+'</a><div class="botoes"><button class="b" data-acao="copiar" data-v="'+esc(r.texto)+'">📋 Copiar o link</button><button class="b" data-acao="compartilhar" data-v="'+esc(r.texto)+'">↗️ Compartilhar</button></div>';
    else if(r.texto&&(ultimo.acao==='buscar'||ultimo.acao==='recusar'||ultimo.acao==='email'))extra='<div class="nota">'+esc(r.texto)+'</div>';
    return'<div class="estado ok">✅ '+nome+' '+(FEITO[ultimo.acao]||'feito')+' às '+esc(r.em)+'.'+extra+'</div>'}
  return'<div class="estado erro">⚠️ Não deu: '+esc(r.erro||'erro')+'</div>';
}
function estadoDe(phone){return caixaEstado(ultimoDe(function(m){return m.phone===phone}))}

function card(i){
  var est=estado();
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
  // 26/11/2026 — passar para o Diego/Denis: abre o WhatsApp do Lucas com o
  // resumo pronto; ele escolhe o contato. Nenhum número fica guardado.
  if(i.passagem&&i.passagem.texto){h+='<div class="botoes"><button class="b prim" data-acao="passar">📞 Passar para '+esc(i.passagem.quem||'o sócio')+'</button></div>'}
  // E-mail e "recusou": guardados numa dobra para o cartão não ficar enorme.
  var em=emails[i.phone]!=null?emails[i.phone]:(i.email||'');
  h+='<details class="dobra"'+(abertas['m'+i.phone]?' open':'')+' data-dobra="m'+esc(i.phone)+'"><summary>Mais: e-mail · recusou</summary>';
  h+='<div class="rot">✉️ Apresentação por e-mail</div>';
  if(est.email_ok===false)h+='<div class="nota">O e-mail do programa não está configurado no PC (Configurações → E-mail de apresentação).</div>';
  h+='<input type="email" inputmode="email" autocomplete="off" data-campo="email" placeholder="e-mail do cliente" value="'+esc(em)+'"><div class="botoes"><button class="b" data-acao="email">✉️ Mandar a apresentação por e-mail</button></div>';
  h+='<div class="rot">Recusou</div><div class="botoes"><button class="b" data-acao="recusar" data-tipo="robo">🤖 É robô</button><button class="b" data-acao="recusar" data-tipo="nao_quis">🙅 Não quis</button><button class="b" data-acao="recusar" data-tipo="sem_interesse">🚫 Sem interesse</button></div>';
  h+='<div class="nota">É robô: volta para a régua. Não quis: manda um obrigado com o site e encerra. Sem interesse: encerra sem mandar nada.</div></details>';
  h+=estadoDe(i.phone)+'</div>';
  return h;
}

function doPainel(acoes){return caixaEstado(ultimoDe(function(m){return!m.phone&&acoes.indexOf(m.acao)>=0}))}
function painel(){
  var est=estado();var at=est.atividade||{};
  var h='<div class="card"><div class="nome">▶ O que o PC está fazendo</div>';
  h+='<div class="disse">'+esc(at.agora||'—')+'</div>';
  if(at.proximos&&at.proximos.length){h+='<div class="rot">Depois</div>';at.proximos.forEach(function(p){h+='<div class="linha"><b>'+esc(p[0])+'</b> · '+esc(p[1])+'</div>'})}
  if(at.historico&&at.historico.length){h+='<div class="rot">Últimas ações</div>';at.historico.forEach(function(p){h+='<div class="linha"><b>'+esc(p[0])+'</b> · '+esc(p[1])+'</div>'})}
  h+='</div>';
  h+='<div class="card" data-p=""><div class="nome">🔁 Piloto automático</div><div class="nota">'+(est.piloto?'<b style="color:var(--verde)">Ligado.</b> ':'Desligado. ')+'A cada volta: responde quem falou (até quem disse não), cobra quem não respondeu, manda a 1ª mensagem para a base que nunca recebeu e devolve à fila quem ficou em silêncio. Robôs ficam de fora.</div>'+doPainel(['piloto']);
  h+='<div class="botoes"><button class="b '+(est.piloto?'perigo':'prim')+'" data-acao="piloto" data-tipo="'+(est.piloto?'desligar':'ligar')+'">'+(est.piloto?'Desligar o piloto':'Ligar o piloto')+'</button></div>';
  h+='<div class="rot">Respostas do atendente</div><div class="seg">';
  [['desligado','Desligado'],['sombra','Escreve e espera você'],['ligado','Responde sozinho']].forEach(function(m){h+='<button data-acao="atendente" data-tipo="'+m[0]+'" class="'+(est.atendente===m[0]?'ativo':'')+'">'+m[1]+'</button>'});
  h+='</div><div class="nota">Sozinho só sai o seguro (sim, pergunta simples, proposta, despedida de quem disse não). Preço, reunião e reclamação ficam com você.</div>'+doPainel(['atendente'])+'</div>';
  h+='<div class="card" data-p=""><div class="nome">🔎 Buscar clientes novos</div><div class="nota">Busca 50 empresas e já manda a 1ª mensagem para elas, como o botão do PC.</div><div class="botoes">';
  (est.buscas||[]).forEach(function(b){h+='<button class="b mat" data-acao="buscar" data-tipo="'+esc(b[0])+'">'+esc(b[1])+'</button>'});
  h+='</div>'+doPainel(['buscar'])+'</div>';
  h+='<div class="card" data-p=""><div class="nome">🔗 Criar página com o nome</div><div class="nota">Loja de jogos (loja + bot + pagamento automático) ou o app de pedidos do restaurante, com o nome que você digitar.</div>';
  h+='<div class="seg"><button data-acao="pag_tipo" data-tipo="jogos" class="'+(pag.tipo==='jogos'?'ativo':'')+'">🎮 Loja de jogos</button><button data-acao="pag_tipo" data-tipo="app" class="'+(pag.tipo==='app'?'ativo':'')+'">🍔 App de restaurante</button></div>';
  h+='<div class="rot">Nome</div><input data-campo="pag_nome" autocomplete="off" placeholder="Ex.: Coinsshop" value="'+esc(pag.nome)+'">';
  h+='<div class="rot">Idioma</div><select data-campo="pag_idioma"><option value="pt"'+(pag.idioma==='pt'?' selected':'')+'>Português</option><option value="en"'+(pag.idioma==='en'?' selected':'')+'>English</option>'+(pag.tipo==='jogos'?'<option value="es"'+(pag.idioma==='es'?' selected':'')+'>Español</option>':'')+'</select>';
  h+='<div class="botoes"><button class="b prim" data-acao="pagina">Criar a página</button></div>'+doPainel(['pagina'])+'</div>';
  return h;
}

function editando(){var a=document.activeElement;return a&&/^(TEXTAREA|INPUT|SELECT)$/.test(a.tagName)}

function desenhar(){
  if(!dados)return;
  var itens=(dados.dados&&dados.dados.itens)||[];
  var lista=filtro==='espera'?itens.filter(function(i){return i.esperando}):itens;
  var pcOn=dados.vivo&&(dados.agora-dados.vivo)<90000;
  var pc=document.getElementById('pc');
  pc.className='pc '+(pcOn?'on':'off');
  pc.textContent=pcOn?'🟢 PC ligado':'🔴 PC desligado'+(dados.vivo?' desde '+quando(dados.vivo):'');
  var est=estado();
  var n=itens.filter(function(i){return i.esperando}).length;
  document.getElementById('sub').innerHTML=n+' esperando você · lista de '+(dados.dados&&dados.dados.em?quando(dados.dados.em):'—')+(est.piloto?' · <b style="color:var(--verde)">piloto ligado</b>':'')+(est.pausado?' · <b style="color:var(--amarelo)">programa PAUSADO</b>':'')+(!pcOn?' · <b style="color:var(--vermelho)">o que você tocar espera o PC ligar</b>':'');
  document.getElementById('agora').textContent=est.atividade&&est.atividade.agora?'▶ '+est.atividade.agora:'';
  var el=document.getElementById('lista');
  if(editando())return; // não apaga o que você está digitando
  if(filtro==='painel'){el.innerHTML=painel();return}
  el.innerHTML=lista.length?lista.map(card).join(''):'<div class="vazio">'+(filtro==='espera'?'Ninguém esperando você agora. 🎉':'Nenhuma conversa nos últimos dias.')+'</div>';
}

function carregar(){
  if(document.hidden)return;
  fetch(API+'caixa_dados',{cache:'no-store'}).then(function(r){return r.json()}).then(function(j){
    if(!j||!j.ok)throw new Error('sem dados');dados=j;resultados=j.resultados||{};desenhar();
  }).catch(function(){document.getElementById('sub').textContent='Sem conexão com o site. Tentando de novo…'});
}

function mandar(item,acao,extra){
  var corpo=Object.assign({acao:acao,phone:item?item.phone:'',rascunho_id:item?((item.pronta&&item.pronta.id)||item.rascunho_id||null):null},extra||{});
  return fetch(API+'caixa_cmd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(corpo)})
    .then(function(r){return r.json()}).then(function(j){
      if(!j||!j.ok)throw new Error((j&&j.error)||'falhou');
      meus[j.id]={phone:item?item.phone:'',acao:acao,em:Date.now()};salvar();
      toast('Pedido enviado ao PC');desenhar();
    }).catch(function(e){toast('Não deu: '+e.message)});
}

function painelClique(b,acao){
  var tipo=b.getAttribute('data-tipo');
  if(acao==='pag_tipo'){pag.tipo=tipo;if(tipo==='app'&&pag.idioma==='es')pag.idioma='pt';desenhar();return}
  if(acao==='piloto'){if(!confirm(tipo==='ligar'?'Ligar o piloto automático? Ele responde, cobra e manda a 1ª mensagem sozinho.':'Desligar o piloto automático?'))return;mandar(null,'piloto',{tipo:tipo});return}
  if(acao==='atendente'){var t={desligado:'Desligar o atendente?',sombra:'Atendente escreve e espera você aprovar?',ligado:'Atendente responde sozinho o que é seguro?'}[tipo];if(!confirm(t))return;mandar(null,'atendente',{tipo:tipo});return}
  if(acao==='buscar'){if(!confirm('Buscar "'+b.textContent.trim()+'" e mandar a 1ª mensagem para quem a busca pegar?'))return;mandar(null,'buscar',{tipo:tipo});return}
  if(acao==='pagina'){var nm=(document.querySelector('input[data-campo="pag_nome"]')||{}).value||'';nm=nm.trim();
    if(!nm){toast('Digite o nome');return}pag.nome=nm;mandar(null,'pagina',{tipo:pag.tipo,nome:nm,idioma:pag.idioma});return}
}

document.addEventListener('click',function(ev){
  var chip=ev.target.closest('.chip');
  if(chip){filtro=chip.getAttribute('data-f');document.querySelectorAll('.chip').forEach(function(c){c.classList.toggle('ativo',c===chip)});desenhar();return}
  var b=ev.target.closest('[data-acao]');if(!b)return;
  var acao=b.getAttribute('data-acao');
  if(acao==='copiar'){var v=b.getAttribute('data-v');if(navigator.clipboard)navigator.clipboard.writeText(v).then(function(){toast('Link copiado')},function(){toast('Não consegui copiar')});return}
  if(acao==='compartilhar'){var v2=b.getAttribute('data-v');if(navigator.share)navigator.share({url:v2}).catch(function(){});else if(navigator.clipboard)navigator.clipboard.writeText(v2).then(function(){toast('Link copiado')});return}
  var c=b.closest('.card');
  if(filtro==='painel'||(c&&c.getAttribute('data-p')==='')){painelClique(b,acao);return}
  if(!c)return;
  var phone=c.getAttribute('data-p');
  var item=((dados&&dados.dados&&dados.dados.itens)||[]).filter(function(i){return i.phone===phone})[0];if(!item)return;
  if(acao==='conv'){abertas[phone]=!abertas[phone];desenhar();return}
  if(acao==='passar'){if(item.passagem&&item.passagem.texto){window.open('https://wa.me/?text='+encodeURIComponent(item.passagem.texto),'_blank')}return}
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
  if(acao==='email'){var em=((c.querySelector('input[data-campo="email"]')||{}).value||'').trim();
    if(!/^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$/.test(em)){toast('Esse e-mail não parece certo');return}
    if(!confirm('Mandar a apresentação por e-mail para '+em+'?'))return;
    mandar(item,'email',{para:em});return}
  if(acao==='recusar'){var tp=b.getAttribute('data-tipo');
    var pergunta={robo:item.nome+' era robô? Volta para a régua de follow-up.',nao_quis:item.nome+' não quis? Mando um obrigado com o site e encerro.',sem_interesse:item.nome+' sem interesse? Encerro sem mandar nada.'}[tp];
    if(!confirm(pergunta))return;mandar(item,'recusar',{tipo:tp});return}
});
document.addEventListener('toggle',function(ev){var d=ev.target;if(d.tagName==='DETAILS'&&d.getAttribute('data-dobra'))abertas[d.getAttribute('data-dobra')]=d.open},true);
document.addEventListener('input',function(ev){
  var t=ev.target;var campo=t.getAttribute('data-campo');
  if(campo==='pag_nome'){pag.nome=t.value;return}
  if(campo==='pag_idioma'){pag.idioma=t.value;return}
  var c=t.closest('.card');if(!c)return;var p=c.getAttribute('data-p');
  if(campo==='pronta')rascunhos[p]=t.value;else if(campo==='minha')escrevendo[p]=t.value||true;else if(campo==='email')emails[p]=t.value;
});
document.addEventListener('change',function(ev){if(ev.target.getAttribute('data-campo')==='pag_idioma')pag.idioma=ev.target.value});
document.addEventListener('focusout',function(ev){if(/^(TEXTAREA|INPUT|SELECT)$/.test(ev.target.tagName))setTimeout(desenhar,300)});
document.addEventListener('visibilitychange',carregar);
carregar();setInterval(carregar,10000);
})();
</script>
</body>
</html>`;
