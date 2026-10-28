/* PÁGINA 1: APP (Lhart Delivery e Pedido na Mesa). Código de acesso: app-delivery.
   Tudo abaixo é EXEMPLO com números inventados (modelo: true). Troque pelos dados reais e apague a linha "modelo: true".
   Guia completo dos campos: ../LEIA-ME.md  */
window.RESULTADOS = {
  modelo: true,

  cliente: { nome: 'App de pedidos', logo: '' },
  saudacao: 'Oi, equipe do restaurante',
  periodo: 'Outubro de 2026',
  periodoCurto: 'outubro',
  atualizado: '26/10/2026',
  comparadoCom: 'setembro',
  tema: { cor: '#16866a' },

  destaque: {
    intro: 'Em outubro,',
    valor: 342,
    frase: 'pedidos chegaram direto pelo seu app, sem comissão para marketplace',
    variacao: 24,
    comparado: 'setembro',
    serie: [ { r: 'mai', v: 120 }, { r: 'jun', v: 168 }, { r: 'jul', v: 205 }, { r: 'ago', v: 240 }, { r: 'set', v: 276 }, { r: 'out', v: 342 } ]
  },
  resumo: 'O app já faz parte da rotina do restaurante: mais gente pede pelo celular, paga no Pix e o valor de cada pedido subiu. Abaixo está o que mais funcionou e o que vamos melhorar.',
  situacao: { tom: 'bom', texto: 'App no ar e funcionando bem' },

  tituloNumeros: 'O app em poucos números',
  numeros: [
    { rotulo: 'Pedidos pelo app', explicacao: 'Quantas vezes alguém pediu direto com você.', valor: 342, variacao: 24, serie: [120, 168, 205, 240, 276, 342] },
    { rotulo: 'Valor médio de cada pedido', explicacao: 'Quanto cada cliente gasta, em média, em um pedido.', valor: 58.9, formato: 'moeda', variacao: 11, serie: [46, 49, 51, 53, 53, 58.9] },
    { rotulo: 'Pedidos pagos no Pix', explicacao: 'Pedidos que chegaram na cozinha já pagos, sem comprovante no WhatsApp.', valor: 81, formato: 'percentual', variacao: 6, serie: [58, 64, 70, 74, 76, 81] }
  ],

  tituloCanais: 'Parte por parte do app',
  subCanais: 'Cada função do app e o que ela está trazendo para o restaurante.',
  canais: [
    {
      titulo: 'Delivery (entrega)', cor: '#16866a',
      resumo: 'O cliente pede, paga no Pix e acompanha o motoboy no mapa. A cozinha só recebe o pedido depois de pago.',
      metricas: [ { rotulo: 'Entregas feitas', valor: 224, variacao: 18 }, { rotulo: 'Tempo médio até a entrega, em minutos', valor: 34, variacao: -9, menorMelhor: true }, { rotulo: 'Entregas confirmadas com o código', valor: 97, formato: 'percentual', variacao: 3 } ],
      grafico: { tipo: 'barras', titulo: 'Entregas por mês', dados: [ { r: 'jul', v: 121 }, { r: 'ago', v: 158 }, { r: 'set', v: 190 }, { r: 'out', v: 224 } ] },
      significa: 'As entregas estão mais rápidas e quase todas são confirmadas com o código do cliente. Menos "cadê meu pedido?" no WhatsApp.'
    },
    {
      titulo: 'Pedido na mesa (QR Code e NFC)', cor: '#6e5fd6',
      resumo: 'Cada mesa tem o seu código. O cliente aponta o celular, pede e paga sem esperar o garçom.',
      metricas: [ { rotulo: 'Pedidos feitos da mesa', valor: 118, variacao: 40 }, { rotulo: 'Mesas usando o sistema', valor: 12 } ],
      ranking: { titulo: 'Mesas que mais pediram', itens: [ { nome: 'Mesa 4', valor: 19 }, { nome: 'Mesa 7', valor: 16 }, { nome: 'Mesa 2', valor: 14 } ] },
      significa: 'O salão atende mais gente com a mesma equipe, porque o garçom só serve.'
    },
    {
      titulo: 'Montador de lanche (adicionais)', cor: '#d4912a',
      resumo: 'O cliente monta o lanche na tela e vê o preço subir a cada ingrediente.',
      metricas: [ { rotulo: 'Pedidos com adicionais', valor: 63, formato: 'percentual', variacao: 17 }, { rotulo: 'Adicionais por pedido', valor: 2.4, variacao: 21 } ],
      ranking: { titulo: 'Adicionais mais escolhidos', itens: [ { nome: 'Bacon crocante', valor: 142 }, { nome: 'Cheddar', valor: 117 }, { nome: 'Ovo frito', valor: 76 } ] },
      significa: 'É daqui que vem o aumento no valor médio do pedido: o cliente acrescenta ingredientes porque vê o lanche se formar.'
    }
  ],

  tituloFeito: 'O que já fizemos no app',
  feito: [
    { data: '22 de outubro', titulo: 'Montagem do lanche', detalhe: 'O cliente escolhe os ingredientes e vê o lanche se formar na tela.' },
    { data: '15 de outubro', titulo: 'Pedido pela mesa', detalhe: 'QR Code em cada mesa, com o número da mesa já no pedido.' },
    { data: '01 de outubro', titulo: 'Pix direto no app', detalhe: 'O pedido só entra na cozinha depois de pago.' }
  ],

  tituloProximos: 'O que vem agora',
  subProximos: 'O que estamos fazendo e o que precisamos de você.',
  proximos: [
    { status: 'precisamos', titulo: 'Fotos novas do cardápio', detalhe: 'Mande 6 fotos dos pratos principais, com luz de janela. Com foto boa o cliente pede mais.', quando: 'Até 5 de novembro' },
    { status: 'andamento', titulo: 'Adesivos NFC nas mesas', detalhe: 'Preparando os links de cada mesa para gravar nos adesivos.', progresso: 40, quando: 'Novembro' },
    { status: 'proximo', titulo: 'Cupom de primeira compra', detalhe: 'Um desconto para quem pede pelo app pela primeira vez.', quando: 'Dezembro' }
  ],

  recado: { texto: 'O app está cada vez mais redondo. Qualquer dúvida sobre os números, é só chamar: a gente explica com calma.', assinatura: 'Lucas, Lhart Design' },
  contato: { whatsapp: '5511989304239', mensagem: 'Oi! Vi o relatório do app e quero conversar.', botao: 'Falar com a Lhart no WhatsApp' }
};
