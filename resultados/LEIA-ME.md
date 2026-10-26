# Página de resultados do cliente: guia para quem vai editar

Uma página bonita e tranquila para o cliente ver **o que a Lhart já fez, os resultados do mês e o que falta**. Cada cliente tem a sua pasta. O visual é sempre o mesmo; **o conteúdo fica em um único arquivo, o `dados.js`**.

```
resultados/
  LEIA-ME.md          este guia
  resultados.css      visual (não mexer sem pedido do Lucas)
  resultados.js       desenha a página a partir do dados.js (não mexer sem pedido do Lucas)
  modelo/             pasta modelo, com dados INVENTADOS (modelo: true)
    index.html
    dados.js          ← o que se edita
  <cliente-xxxx>/     uma pasta por cliente (copie a "modelo")
```

## Como criar a página de um cliente novo

1. Copie a pasta `modelo` para `resultados/<nome-do-cliente>-<4 letras ou números aleatórios>` (ex.: `brasa-ponto-k7m2`). O sufixo aleatório serve para o endereço não ser adivinhado: a página não aparece em buscadores (`noindex`), mas quem tem o link vê.
2. Abra só o `dados.js` da pasta nova e troque os dados pelos reais.
3. **Apague a linha `modelo: true`** (ela mostra a faixa "página de exemplo").
4. Confira abrindo o `index.html` direto no navegador (funciona sem servidor) e no tamanho de celular (390 px).
5. Publicar só com **OK explícito do Lucas**: `git add resultados/<pasta>` e `git push origin main` no repositório do site (`lhart-design-deploy`). A página fica em `https://lhartdesign.com/resultados/<pasta>/`.

## Como o cliente entra pelo site

O site tem a **Área do cliente** (`cliente.html`, link no rodapé de todas as páginas). O cliente digita o **código de acesso** e vai direto para a página dele. **O código é o nome da pasta** (ex.: `brasa-ponto-k7m2`); letras maiúsculas, acentos e espaços digitados a mais são corrigidos sozinhos. Se a pasta não existir, aparece uma mensagem simples e o botão de WhatsApp. Para dar acesso a um cliente, mande a ele o código (ou o link direto `lhartdesign.com/resultados/<pasta>/`). Para tirar o acesso, apague ou renomeie a pasta. Não existe senha: a proteção é o código difícil de adivinhar, então não coloque nesta página nada que o cliente não possa ver.

## Regras de conteúdo

- **Tom:** calmo, direto, em português simples. Fale com o dono do restaurante, não com um técnico. Troque termos por explicações: "cliques", "alcance" e "custo por clique" precisam de uma frase dizendo o que significam ("quantas vezes alguém clicou no anúncio").
- **Sempre diga o que o número significa para o cliente** (campo `significa` e `explicacao`) e o que vamos fazer a partir dele.
- **Nunca invente número.** Use só dados que o Lucas passou ou que saíram de relatórios reais (Google Ads, Instagram, o painel do app). Se não houver dado, apague o bloco em vez de preencher com estimativa.
- **Seja honesto com o que caiu.** Número ruim entra com explicação e plano ("caiu 8% por causa do feriado; vamos testar X").
- Não coloque senhas, chaves, dados de cartão nem dados pessoais de clientes finais do restaurante.
- Frases curtas. Uma ideia por frase. Sem exclamação em excesso.

## Campos do `dados.js`

Tudo é opcional, menos `cliente.nome` e `periodo`. **Se um bloco estiver vazio ou for apagado, a seção some sozinha** (a barra de cima ajusta os links).

| Campo | O que é |
|---|---|
| `modelo` | `true` mostra a faixa de exemplo. Apague a linha nos dados reais. |
| `cliente` | `{ nome, logo }`. `logo` é o caminho de uma imagem (opcional). |
| `saudacao`, `periodo`, `periodoCurto`, `atualizado` | Textos de abertura e data. `periodoCurto` é usado no título da aba ("outubro"). |
| `comparadoCom` | Mês de comparação ("setembro"), usado em "18% a mais que setembro". |
| `tema` | `{ cor: '#6e5fd6' }` troca a cor de destaque da página. |
| `destaque` | O **número grande da abertura**: `{ intro, valor, frase, variacao, comparado, serie, formato }`. Escolha o resultado mais fácil de entender e mais importante. `serie` é uma lista `{ r: 'mai', v: 5200 }` com 3 a 8 meses e desenha a curva. |
| `resumo` | 2 ou 3 frases com o balanço do mês. |
| `situacao` | `{ tom: 'bom' ou 'atencao', texto }`, a etiqueta "Tudo no caminho certo". |
| `numeros` | De 3 a 5 números principais: `{ rotulo, explicacao, valor, formato, variacao, menorMelhor, serie, cor }`. |
| `canais` | Um bloco por canal (redes sociais, Google Ads, app, site...), veja abaixo. |
| `feito` | O que foi entregue: `{ data, titulo, detalhe }`, do mais recente para o mais antigo. |
| `proximos` | O que falta, veja abaixo. |
| `recado` | `{ texto, assinatura }`, a mensagem final. |
| `contato` | `{ whatsapp: '5511989304239', mensagem, botao }`. |
| `tituloNumeros`, `tituloCanais`, `tituloFeito`, `tituloProximos` e `sub...` | Trocam os títulos e subtítulos das seções. |

**`formato`** de um valor: `'numero'` (padrão, vira `12.480`), `'moeda'` (`R$ 58,90`), `'percentual'` (`12%`) ou `'texto'`.
**`variacao`**: número em porcentagem em relação ao período anterior (`18` = subiu 18%, `-12` = caiu 12%). Para custos, onde cair é bom, use `menorMelhor: true` (a seta fica verde quando cai).

### `canais`: exemplo de um bloco

```js
{
  titulo: 'Google Ads (anúncios no Google)', cor: '#2f7ae5',
  resumo: 'O que fizemos neste canal, em linguagem simples.',
  metricas: [ { rotulo: 'Cliques no anúncio', valor: 1260, variacao: 19 } ],
  grafico: { tipo: 'barras',                       // 'barras' (poucas coisas) ou 'linha' (evolução no tempo)
             titulo: 'Pedidos vindos do anúncio, mês a mês',
             dados: [ { r: 'jul', v: 44 }, { r: 'ago', v: 58 } ] },
  ranking: { titulo: 'Posts que mais chamaram atenção', itens: [ { nome: 'Vídeo da montagem', valor: 9400 } ] },
  significa: 'O que isso quer dizer para o restaurante e o que vamos fazer agora.'
}
```

Para **adicionar ou tirar canais**, é só acrescentar ou apagar blocos na lista `canais`. Ideias de canais: Redes sociais (Instagram, TikTok), Google Ads, Google Meu Negócio (como as pessoas acham o restaurante no mapa), App de pedidos (Delivery e Mesa), Site, WhatsApp. Use o que fizer sentido para o cliente.

### `proximos`: o que falta

```js
{ status: 'precisamos', titulo: 'Fotos novas do cardápio', detalhe: '...', quando: 'Até 5 de novembro' }
{ status: 'andamento',  titulo: '...', detalhe: '...', progresso: 60, quando: 'Novembro' }
{ status: 'proximo',    titulo: '...', detalhe: '...', quando: 'Dezembro' }
```

- `precisamos` (vermelho suave): depende do cliente. Diga **exatamente o que mandar e até quando**.
- `andamento` (âmbar): estamos fazendo; `progresso` de 0 a 100 desenha a barra.
- `proximo` (lavanda): já planejado.

## Atualizar todo mês

1. Duplique o `dados.js` do mês anterior para ter histórico (ex.: `dados-2026-10.js` fora da pasta publicada, ou use o Git).
2. Atualize `periodo`, `atualizado`, `comparadoCom`, `destaque`, `numeros`, `canais`.
3. Passe as entregas novas de `proximos` para `feito` e escreva os próximos passos.
4. Releia o `resumo` e o `recado`: tudo precisa bater com os números.

## Para quem for mexer no visual

- `resultados.css`: tokens de cor no topo (`--tinta`, `--lavanda`, `--menta`, `--ambar`). Fontes: Bricolage Grotesque (títulos e números) e Atkinson Hyperlegible (texto), carregadas no `index.html`.
- `resultados.js`: um `window.RESULTADOS` entra e sai a página. Gráficos são SVG gerados no próprio arquivo (sem biblioteca externa). Respeita `prefers-reduced-motion` e tem versão de impressão (Ctrl+P gera um PDF limpo para mandar ao cliente).
- Mudou o CSS ou o JS? Suba o número em `?v=` no `index.html` de cada cliente para o navegador não usar a versão antiga.
