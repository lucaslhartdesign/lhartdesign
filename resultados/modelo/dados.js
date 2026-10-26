/* DADOS DESTA PÁGINA. É o único arquivo que precisa ser editado para cada cliente.
   Os números abaixo são INVENTADOS (modelo: true). Troque tudo pelos dados reais e apague a linha "modelo: true".
   Guia completo dos campos: ../LEIA-ME.md  */
window.RESULTADOS = {
  modelo: true,

  cliente: { nome: 'Brasa & Ponto Burger', logo: '' },      // logo: caminho de uma imagem (opcional)
  saudacao: 'Oi, equipe do Brasa & Ponto',
  periodo: 'Outubro de 2026',
  periodoCurto: 'outubro',
  atualizado: '26/10/2026',
  comparadoCom: 'setembro',                                  // usado nos textos "18% a mais que setembro"
  tema: { cor: '#6e5fd6' },                                  // cor de destaque da página (opcional)

  /* O número grande da abertura: o resultado mais fácil de entender e mais importante do mês */
  destaque: {
    intro: 'Em outubro,',
    valor: 12480,
    frase: 'pessoas viram o seu restaurante na internet',
    variacao: 18,
    comparado: 'setembro',
    serie: [ { r: 'mai', v: 5200 }, { r: 'jun', v: 6100 }, { r: 'jul', v: 7400 }, { r: 'ago', v: 8300 }, { r: 'set', v: 10580 }, { r: 'out', v: 12480 } ]
  },
  resumo: 'Foi um mês bom: mais gente conheceu o Brasa & Ponto, mais gente pediu pelo app e o anúncio no Google ficou mais barato. O que ainda falta está na última parte da página.',
  situacao: { tom: 'bom', texto: 'Tudo no caminho certo' },   // tom: 'bom' ou 'atencao'

  /* Poucos números, os mais importantes, com uma frase simples explicando cada um */
  tituloNumeros: 'O mês em poucos números',
  numeros: [
    { rotulo: 'Pedidos pelo app', explicacao: 'Quantas vezes alguém pediu direto com você, sem pagar comissão para marketplace.', valor: 342, variacao: 24, serie: [120, 168, 205, 240, 276, 342] },
    { rotulo: 'Novos seguidores', explicacao: 'Pessoas que passaram a acompanhar o seu Instagram.', valor: 486, variacao: 9, serie: [210, 260, 340, 380, 446, 486] },
    { rotulo: 'Quanto custou cada visita do anúncio', explicacao: 'Quanto você pagou ao Google cada vez que alguém clicou no anúncio. Quanto menos, melhor.', valor: 0.84, formato: 'moeda', variacao: -12, menorMelhor: true, serie: [1.4, 1.3, 1.15, 1.02, 0.95, 0.84] }
  ],

  /* Um bloco por canal. Pode ter: metricas, grafico, ranking e a explicação "o que isso significa". Apague o que não usar. */
  tituloCanais: 'Canal por canal',
  subCanais: 'Cada lugar onde o seu restaurante aparece, explicado sem termos difíceis.',
  canais: [
    {
      titulo: 'Redes sociais', cor: '#d6479b',
      resumo: 'Postamos 18 vezes no Instagram e fizemos 6 vídeos curtos. Os vídeos de montagem do lanche foram os que mais chamaram atenção.',
      metricas: [ { rotulo: 'Pessoas que viram os posts', valor: 31200, variacao: 22 }, { rotulo: 'Pessoas que curtiram, comentaram ou salvaram', valor: 2840, variacao: 15 }, { rotulo: 'Cliques no link do cardápio', valor: 913, variacao: 31 } ],
      grafico: { tipo: 'linha', titulo: 'Pessoas alcançadas por mês', dados: [ { r: 'mai', v: 9800 }, { r: 'jun', v: 14200 }, { r: 'jul', v: 17900 }, { r: 'ago', v: 21500 }, { r: 'set', v: 25600 }, { r: 'out', v: 31200 } ] },
      ranking: { titulo: 'Posts que mais chamaram atenção', itens: [ { nome: 'Vídeo: montando o Brasa Burger', valor: 9400 }, { nome: 'Promoção de terça', valor: 5100 }, { nome: 'Bastidores da cozinha', valor: 3900 } ] },
      significa: 'Mais gente está conhecendo o restaurante antes de pedir. Vamos fazer mais vídeos de montagem, que é o que funciona melhor.'
    },
    {
      titulo: 'Google Ads (anúncios no Google)', cor: '#2f7ae5',
      resumo: 'Quando alguém busca "hambúrguer perto de mim", o seu restaurante aparece no topo. Ajustamos as palavras e os horários e o custo caiu.',
      metricas: [ { rotulo: 'Pessoas que viram o anúncio', valor: 18400, variacao: 14 }, { rotulo: 'Cliques no anúncio', valor: 1260, variacao: 19 }, { rotulo: 'Quanto foi investido', valor: 1058, formato: 'moeda', variacao: 4 }, { rotulo: 'Pedidos vindos do anúncio', valor: 96, variacao: 28 } ],
      grafico: { tipo: 'barras', titulo: 'Pedidos vindos do anúncio, mês a mês', dados: [ { r: 'jul', v: 44 }, { r: 'ago', v: 58 }, { r: 'set', v: 75 }, { r: 'out', v: 96 } ] },
      significa: 'Cada real investido está trazendo mais pedidos do que no começo. Nos próximos dias vamos testar um anúncio só para quem está perto do restaurante.'
    },
    {
      titulo: 'App de pedidos (Delivery e Mesa)', cor: '#16866a',
      resumo: 'O app está no ar. Os clientes montam o lanche na tela e pagam no Pix. Os pedidos da mesa pelo QR Code já representam uma parte boa do movimento.',
      metricas: [ { rotulo: 'Pedidos no mês', valor: 342, variacao: 24 }, { rotulo: 'Valor médio de cada pedido', valor: 58.9, formato: 'moeda', variacao: 11 }, { rotulo: 'Pedidos feitos da mesa', valor: 118, variacao: 40 } ],
      ranking: { titulo: 'Mais pedidos do mês', formato: 'numero', itens: [ { nome: 'Brasa Burger', valor: 121 }, { nome: 'Smash duplo', valor: 88 }, { nome: 'Batata rústica', valor: 74 }, { nome: 'Milkshake', valor: 52 } ] },
      significa: 'O valor médio do pedido subiu porque o cliente acrescenta ingredientes ao montar o lanche. É dinheiro que antes ficava na mesa.'
    }
  ],

  /* O que foi entregue, do mais recente para o mais antigo */
  tituloFeito: 'O que já fizemos juntos',
  feito: [
    { data: '22 de outubro', titulo: 'Montagem do lanche no app', detalhe: 'O cliente escolhe os ingredientes e vê o lanche se formar na tela, com o preço subindo.' },
    { data: '15 de outubro', titulo: 'Pedido pela mesa com QR Code', detalhe: 'Cada mesa tem o seu código. O pedido chega na cozinha já com o número da mesa.' },
    { data: '08 de outubro', titulo: 'Anúncio novo no Google', detalhe: 'Trocamos as palavras e os horários do anúncio e o custo de cada clique caiu.' },
    { data: '01 de outubro', titulo: 'Pix direto no app', detalhe: 'O pedido só entra na cozinha depois de pago, sem comprovante no WhatsApp.' }
  ],

  /* O que falta. status: 'andamento' (com progresso de 0 a 100), 'proximo' ou 'precisamos' (depende do cliente) */
  tituloProximos: 'O que vem agora',
  subProximos: 'O que estamos fazendo e o que precisamos de você.',
  proximos: [
    { status: 'precisamos', titulo: 'Fotos novas do cardápio', detalhe: 'Com fotos boas, o cliente pede mais. Se puder mandar 6 fotos dos pratos principais com a luz da janela, a gente cuida do resto.', quando: 'Até 5 de novembro' },
    { status: 'andamento', titulo: 'Vídeos curtos para o Instagram', detalhe: 'Gravando e editando 8 vídeos de montagem do lanche.', progresso: 60, quando: 'Novembro' },
    { status: 'proximo', titulo: 'Anúncio para quem está perto', detalhe: 'Um anúncio só para quem está até 3 km do restaurante, nos horários de almoço e jantar.', quando: 'Novembro' },
    { status: 'proximo', titulo: 'Cupom de primeira compra', detalhe: 'Um desconto para quem pede pelo app pela primeira vez, para trazer o cliente de volta.', quando: 'Dezembro' }
  ],

  recado: { texto: 'Estamos muito felizes com o mês. Qualquer dúvida sobre os números, é só chamar: a gente explica com calma.', assinatura: 'Lucas, Lhart Design' },
  contato: { whatsapp: '5511989304239', mensagem: 'Oi! Vi o relatório de outubro e quero conversar.', botao: 'Falar com a Lhart no WhatsApp' }
};
