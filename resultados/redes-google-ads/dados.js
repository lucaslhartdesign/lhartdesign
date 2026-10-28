/* PÁGINA 2: REDES SOCIAIS E GOOGLE ADS. Código de acesso: redes-google-ads.
   Tudo abaixo é EXEMPLO com números inventados (modelo: true). Troque pelos dados reais e apague a linha "modelo: true".
   Guia completo dos campos: ../LEIA-ME.md  */
window.RESULTADOS = {
  modelo: true,

  cliente: { nome: 'Redes sociais e Google Ads', logo: '' },
  saudacao: 'Oi, tudo bem?',
  periodo: 'Outubro de 2026',
  periodoCurto: 'outubro',
  atualizado: '26/10/2026',
  comparadoCom: 'setembro',
  tema: { cor: '#6e5fd6' },

  destaque: {
    intro: 'Em outubro,',
    valor: 49600,
    frase: 'pessoas viram os seus posts e anúncios',
    variacao: 20,
    comparado: 'setembro',
    serie: [ { r: 'mai', v: 15400 }, { r: 'jun', v: 21900 }, { r: 'jul', v: 28300 }, { r: 'ago', v: 34100 }, { r: 'set', v: 41300 }, { r: 'out', v: 49600 } ]
  },
  resumo: 'Mais gente conheceu a marca neste mês e o anúncio no Google ficou mais barato. Os vídeos curtos foram o que mais chamou atenção, então vamos fazer mais deles.',
  situacao: { tom: 'bom', texto: 'Crescendo mês a mês' },

  tituloNumeros: 'O mês em poucos números',
  numeros: [
    { rotulo: 'Novos seguidores', explicacao: 'Pessoas que passaram a acompanhar o perfil neste mês.', valor: 486, variacao: 9, serie: [210, 260, 340, 380, 446, 486] },
    { rotulo: 'Cliques no link (perfil e anúncios)', explicacao: 'Pessoas que saíram das redes e foram para o seu site, app ou WhatsApp.', valor: 2173, variacao: 24, serie: [820, 1100, 1390, 1650, 1750, 2173] },
    { rotulo: 'Quanto custou cada clique no anúncio', explicacao: 'Quanto você pagou ao Google cada vez que alguém clicou. Quanto menos, melhor.', valor: 0.84, formato: 'moeda', variacao: -12, menorMelhor: true, serie: [1.4, 1.3, 1.15, 1.02, 0.95, 0.84] }
  ],

  tituloCanais: 'Canal por canal',
  subCanais: 'Cada lugar onde a sua marca aparece, explicado sem termos difíceis.',
  canais: [
    {
      titulo: 'Instagram', cor: '#d6479b',
      resumo: 'Postamos 18 vezes e fizemos 6 vídeos curtos. Os vídeos mostrando o produto sendo feito foram os que mais chamaram atenção.',
      metricas: [ { rotulo: 'Pessoas que viram os posts', valor: 31200, variacao: 22 }, { rotulo: 'Pessoas que curtiram, comentaram ou salvaram', valor: 2840, variacao: 15 }, { rotulo: 'Cliques no link do perfil', valor: 913, variacao: 31 } ],
      grafico: { tipo: 'linha', titulo: 'Pessoas alcançadas por mês', dados: [ { r: 'mai', v: 9800 }, { r: 'jun', v: 14200 }, { r: 'jul', v: 17900 }, { r: 'ago', v: 21500 }, { r: 'set', v: 25600 }, { r: 'out', v: 31200 } ] },
      ranking: { titulo: 'Posts que mais chamaram atenção', itens: [ { nome: 'Vídeo: bastidores', valor: 9400 }, { nome: 'Promoção da semana', valor: 5100 }, { nome: 'Antes e depois', valor: 3900 } ] },
      significa: 'Mais gente conhece a marca antes de comprar. Vídeos curtos com o produto sendo feito funcionam melhor que foto parada.'
    },
    {
      titulo: 'Google Ads (anúncios no Google)', cor: '#2f7ae5',
      resumo: 'Quando alguém procura o seu tipo de produto no Google, o seu anúncio aparece no topo. Ajustamos as palavras e os horários e o custo caiu.',
      metricas: [ { rotulo: 'Pessoas que viram o anúncio', valor: 18400, variacao: 14 }, { rotulo: 'Cliques no anúncio', valor: 1260, variacao: 19 }, { rotulo: 'Quanto foi investido', valor: 1058, formato: 'moeda', variacao: 4 }, { rotulo: 'Contatos e pedidos vindos do anúncio', valor: 96, variacao: 28 } ],
      grafico: { tipo: 'barras', titulo: 'Contatos e pedidos vindos do anúncio', dados: [ { r: 'jul', v: 44 }, { r: 'ago', v: 58 }, { r: 'set', v: 75 }, { r: 'out', v: 96 } ] },
      significa: 'Cada real investido está trazendo mais resultado do que no começo. No próximo mês vamos testar um anúncio só para quem está perto.'
    },
    {
      titulo: 'Google Meu Negócio (o mapa do Google)', cor: '#16866a',
      resumo: 'É a ficha do seu negócio que aparece quando alguém busca no Google ou no mapa. Atualizamos fotos, horário e respondemos as avaliações.',
      metricas: [ { rotulo: 'Pessoas que viram a ficha', valor: 6900, variacao: 18 }, { rotulo: 'Pedidos de rota (como chegar)', valor: 312, variacao: 12 }, { rotulo: 'Ligações pela ficha', valor: 74, variacao: 8 } ],
      significa: 'Muita gente decide pela ficha no mapa. Por isso fotos boas e avaliações respondidas importam tanto.'
    }
  ],

  tituloFeito: 'O que já fizemos juntos',
  feito: [
    { data: '24 de outubro', titulo: '6 vídeos curtos publicados', detalhe: 'Gravamos e editamos vídeos mostrando o produto sendo feito.' },
    { data: '08 de outubro', titulo: 'Anúncio novo no Google', detalhe: 'Trocamos as palavras e os horários e o custo de cada clique caiu.' },
    { data: '02 de outubro', titulo: 'Ficha do Google atualizada', detalhe: 'Fotos novas, horário correto e avaliações respondidas.' }
  ],

  tituloProximos: 'O que vem agora',
  subProximos: 'O que estamos fazendo e o que precisamos de você.',
  proximos: [
    { status: 'precisamos', titulo: 'Fotos e vídeos novos do produto', detalhe: 'Mande o que tiver gravado na semana. Qualquer vídeo de bastidor ajuda.', quando: 'Até 5 de novembro' },
    { status: 'andamento', titulo: '8 vídeos curtos para o Instagram', detalhe: 'Gravando e editando a próxima sequência.', progresso: 60, quando: 'Novembro' },
    { status: 'proximo', titulo: 'Anúncio para quem está perto', detalhe: 'Um anúncio só para quem está a até 3 km, nos horários de maior movimento.', quando: 'Novembro' }
  ],

  recado: { texto: 'Estamos felizes com o ritmo. Qualquer dúvida sobre os números, é só chamar: a gente explica com calma.', assinatura: 'Lucas, Lhart Design' },
  contato: { whatsapp: '5511989304239', mensagem: 'Oi! Vi o relatório de redes sociais e Google Ads e quero conversar.', botao: 'Falar com a Lhart no WhatsApp' }
};
