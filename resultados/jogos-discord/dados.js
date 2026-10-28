/* PÁGINA 3: SITES DE JOGOS, ANÚNCIOS E BOT DO DISCORD. Código de acesso: jogos-discord.
   Tudo abaixo é EXEMPLO com números inventados (modelo: true). Troque pelos dados reais e apague a linha "modelo: true".
   Não sei os números reais destes projetos: quem preencher precisa usar só dados verdadeiros.
   Guia completo dos campos: ../LEIA-ME.md  */
window.RESULTADOS = {
  modelo: true,

  cliente: { nome: 'Sites de jogos, anúncios e bot do Discord', logo: '' },
  saudacao: 'Oi, tudo bem?',
  periodo: 'Outubro de 2026',
  periodoCurto: 'outubro',
  atualizado: '26/10/2026',
  comparadoCom: 'setembro',
  tema: { cor: '#6e5fd6' },

  destaque: {
    intro: 'Em outubro,',
    valor: 8450,
    frase: 'pessoas visitaram as lojas e sites de jogos',
    variacao: 16,
    comparado: 'setembro',
    serie: [ { r: 'mai', v: 3100 }, { r: 'jun', v: 4200 }, { r: 'jul', v: 5300 }, { r: 'ago', v: 6200 }, { r: 'set', v: 7280 }, { r: 'out', v: 8450 } ]
  },
  resumo: 'As visitas e as vendas cresceram, e o bot do Discord está atendendo boa parte das dúvidas sozinho. Abaixo está o que funcionou e o que vem a seguir.',
  situacao: { tom: 'bom', texto: 'Tudo no caminho certo' },

  tituloNumeros: 'O mês em poucos números',
  numeros: [
    { rotulo: 'Vendas no mês', explicacao: 'Quantas compras foram concluídas nos sites e lojas.', valor: 212, variacao: 19, serie: [88, 110, 139, 160, 178, 212] },
    { rotulo: 'Pessoas no servidor do Discord', explicacao: 'Membros ativos da comunidade.', valor: 3820, variacao: 7, serie: [2400, 2750, 3000, 3300, 3560, 3820] },
    { rotulo: 'Quanto custou cada visita vinda de anúncio', explicacao: 'Quanto foi gasto em anúncios para cada pessoa que chegou ao site. Quanto menos, melhor.', valor: 0.62, formato: 'moeda', variacao: -9, menorMelhor: true, serie: [0.9, 0.84, 0.77, 0.7, 0.68, 0.62] }
  ],

  tituloCanais: 'Parte por parte',
  subCanais: 'Cada frente do trabalho e o que ela está trazendo.',
  canais: [
    {
      titulo: 'Sites e lojas de jogos', cor: '#2f7ae5',
      resumo: 'Os sites recebem visitas, mostram os produtos e levam a pessoa até a compra. Melhoramos a velocidade e o caminho até pagar.',
      metricas: [ { rotulo: 'Visitas no mês', valor: 8450, variacao: 16 }, { rotulo: 'Visitas que viraram compra', valor: 2.5, formato: 'percentual', variacao: 8 }, { rotulo: 'Compras concluídas', valor: 212, variacao: 19 } ],
      grafico: { tipo: 'linha', titulo: 'Visitas por mês', dados: [ { r: 'mai', v: 3100 }, { r: 'jun', v: 4200 }, { r: 'jul', v: 5300 }, { r: 'ago', v: 6200 }, { r: 'set', v: 7280 }, { r: 'out', v: 8450 } ] },
      ranking: { titulo: 'Produtos mais vendidos', itens: [ { nome: 'Produto A', valor: 74 }, { nome: 'Produto B', valor: 51 }, { nome: 'Produto C', valor: 38 } ] },
      significa: 'Mais gente chegando e uma parte maior dela comprando. O próximo passo é melhorar a página dos produtos mais vendidos.'
    },
    {
      titulo: 'Anúncios (ads)', cor: '#d6479b',
      resumo: 'Anúncios que levam gente interessada em jogos para as lojas. Cortamos o que não dava resultado e reforçamos o que dava.',
      metricas: [ { rotulo: 'Pessoas que viram os anúncios', valor: 41800, variacao: 21 }, { rotulo: 'Cliques nos anúncios', valor: 3340, variacao: 17 }, { rotulo: 'Quanto foi investido', valor: 2070, formato: 'moeda', variacao: 6 } ],
      grafico: { tipo: 'barras', titulo: 'Compras vindas de anúncios', dados: [ { r: 'jul', v: 49 }, { r: 'ago', v: 61 }, { r: 'set', v: 78 }, { r: 'out', v: 96 } ] },
      significa: 'O investimento subiu pouco e as compras vindas dos anúncios subiram bem mais. Vamos manter o que está dando resultado.'
    },
    {
      titulo: 'Bot do Discord', cor: '#16866a',
      resumo: 'O bot responde dúvidas, abre atendimentos e avisa a equipe quando precisa de uma pessoa. Atende a comunidade o dia todo.',
      metricas: [ { rotulo: 'Atendimentos resolvidos pelo bot', valor: 1480, variacao: 26 }, { rotulo: 'Atendimentos passados para a equipe', valor: 190, variacao: -11, menorMelhor: true }, { rotulo: 'Comandos usados', valor: 9300, variacao: 13 } ],
      ranking: { titulo: 'O que mais pedem ao bot', itens: [ { nome: 'Status do pedido', valor: 520 }, { nome: 'Como comprar', valor: 410 }, { nome: 'Suporte', valor: 300 } ] },
      significa: 'A equipe perde menos tempo com perguntas repetidas e a comunidade recebe resposta na hora.'
    }
  ],

  tituloFeito: 'O que já fizemos',
  feito: [
    { data: '23 de outubro', titulo: 'Novas respostas no bot do Discord', detalhe: 'O bot passou a responder o status do pedido sem a equipe.' },
    { data: '12 de outubro', titulo: 'Site mais rápido', detalhe: 'Reduzimos o tempo de carregamento das páginas de produto.' },
    { data: '03 de outubro', titulo: 'Anúncios reorganizados', detalhe: 'Cortamos o que não trazia compra e reforçamos o que trazia.' }
  ],

  tituloProximos: 'O que vem agora',
  subProximos: 'O que estamos fazendo e o que precisamos de você.',
  proximos: [
    { status: 'precisamos', titulo: 'Lista dos produtos mais vendidos', detalhe: 'Mande a lista atualizada e as imagens para melhorarmos as páginas deles.', quando: 'Até 5 de novembro' },
    { status: 'andamento', titulo: 'Painel de vendas do site', detalhe: 'Montando um painel simples para acompanhar vendas e visitas.', progresso: 50, quando: 'Novembro' },
    { status: 'proximo', titulo: 'Campanha de fim de ano', detalhe: 'Anúncios e posts para a época de maior venda.', quando: 'Dezembro' }
  ],

  recado: { texto: 'Bom mês para a comunidade e para as vendas. Qualquer dúvida sobre os números, é só chamar: a gente explica com calma.', assinatura: 'Lucas, Lhart Design' },
  contato: { whatsapp: '5511989304239', mensagem: 'Oi! Vi o relatório de sites de jogos, anúncios e bot do Discord e quero conversar.', botao: 'Falar com a Lhart no WhatsApp' }
};
