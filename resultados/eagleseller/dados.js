/* PÁGINA DO EAGLESELLER (código de acesso: eagleseller).
   DADOS DESTA PÁGINA. É o único arquivo que precisa ser editado para cada cliente.
   Números reais, posição de 26/10/2026: pedidos e vendas vêm do painel da loja (só pedidos pagos e entregues);
   anúncios vêm do Google Ads; páginas vêm do Search Console.
   Guia completo dos campos: ../LEIA-ME.md  */
window.RESULTADOS = {

  cliente: { nome: 'EagleSeller', logo: '' },      // logo: caminho de uma imagem (opcional)
  saudacao: 'Oi, Rafael',
  periodo: 'Outubro de 2026 (até o dia 26)',
  periodoCurto: 'outubro',
  atualizado: '26/10/2026',
  tema: { cor: '#6e5fd6' },                                  // cor de destaque da página (opcional)

  /* O número grande da abertura: o resultado mais fácil de entender e mais importante do mês */
  destaque: {
    intro: 'Em outubro, até o dia 26, a loja vendeu',
    valor: 2913.49,
    formato: 'moeda',
    frase: 'em 50 pedidos pagos e entregues, para 33 clientes diferentes'
  },
  resumo: 'A loja começou a vender no fim de setembro, por isso não comparamos outubro com setembro: seria comparar um mês inteiro com poucos dias. Dos 33 clientes de outubro, 10 compraram mais de uma vez. O ponto de atenção é que a quantidade de pedidos por semana caiu no meio do mês, e mais da metade do valor veio de cinco pedidos de Aion 2. O que ainda falta está na última parte da página.',
  situacao: { tom: 'atencao', texto: 'Bom mês, com um ponto de atenção' },   // tom: 'bom' ou 'atencao'

  /* Poucos números, os mais importantes, com uma frase simples explicando cada um */
  tituloNumeros: 'O mês em poucos números',
  numeros: [
    { rotulo: 'Pedidos pagos e entregues', explicacao: 'Pedidos que o cliente pagou no Pix e a equipe entregou. Não entram pedidos que expiraram sem pagamento nem os reembolsados.', valor: 50 },
    { rotulo: 'Clientes diferentes que compraram', explicacao: 'Quantas pessoas fizeram pelo menos uma compra no mês, contadas pelo e-mail do pedido.', valor: 33 },
    { rotulo: 'Clientes que compraram mais de uma vez', explicacao: 'Dos 33 clientes do mês, quantos voltaram e fizeram um segundo pedido. É a prova de que a experiência de compra funciona.', valor: 10 },
    { rotulo: 'Valor médio de cada pedido', explicacao: 'Total vendido dividido pelo número de pedidos. Dois pedidos grandes (R$ 800 e R$ 400) puxam essa média para cima.', valor: 58.27, formato: 'moeda' }
  ],

  /* Um bloco por canal. Pode ter: metricas, grafico, ranking e a explicação "o que isso significa". Apague o que não usar. */
  tituloCanais: 'Canal por canal',
  subCanais: 'Cada lugar de onde vêm as vendas, explicado sem termos difíceis.',
  canais: [
    {
      titulo: 'A loja (eagleseller.com.br)', cor: '#16866a',
      resumo: 'Vendas de outubro até o dia 26, separadas por período do mês e por jogo. Diablo 4 tem a maior quantidade de pedidos, mas de valor pequeno. Aion 2 tem poucos pedidos e o maior valor.',
      metricas: [
        { rotulo: 'Pedidos pagos e entregues', valor: 50 },
        { rotulo: 'Tempo médio entre o pagamento e a entrega marcada pela equipe', valor: '30 min', formato: 'texto' },
        { rotulo: 'Pedidos que expiraram sem pagamento', valor: 5 },
        { rotulo: 'Pedidos reembolsados', valor: 2 }
      ],
      grafico: { tipo: 'barras', titulo: 'Vendas por período do mês (em reais)', formato: 'moeda',
                 dados: [ { r: '1 a 7', v: 538.89 }, { r: '8 a 14', v: 460.57 }, { r: '15 a 21', v: 121.93 }, { r: '22 a 26', v: 1792.10 } ] },
      ranking: { titulo: 'Vendas por jogo (em reais)', formato: 'moeda',
                 itens: [ { nome: 'Aion 2 (5 pedidos)', valor: 1660.00 }, { nome: 'Diablo 4 (34 pedidos)', valor: 805.22 }, { nome: 'Wardogs (4 pedidos)', valor: 269.37 }, { nome: 'Path of Exile 2 (7 pedidos)', valor: 178.90 } ] },
      significa: 'Os pedidos foram 15, 18, 6 e 11 em cada período. A terceira semana foi a mais fraca, e o último período, com só cinco dias, ficou forte por causa de dois pedidos grandes de Aion 2. Isso mostra que o valor do mês depende de poucos pedidos grandes. O plano é levar mais gente para o Aion 2 e para os produtos de maior valor.'
    },
    {
      titulo: 'Google Ads (anúncios no Google)', cor: '#2f7ae5',
      resumo: 'Os anúncios aparecem quando alguém pesquisa, por exemplo, "kinah aion 2". O orçamento total é de R$ 42,70 por dia, dividido entre as campanhas. Só o Aion 2 está gerando cliques com regularidade. Os outros jogos têm pouca gente pesquisando em português.',
      metricas: [
        { rotulo: 'Vezes que o anúncio apareceu', valor: 293 },
        { rotulo: 'Cliques no anúncio (quantas vezes alguém clicou)', valor: 46 },
        { rotulo: 'Custo médio de cada clique', valor: 1.07, formato: 'moeda' },
        { rotulo: 'Quanto foi investido até agora', valor: 49.20, formato: 'moeda' }
      ],
      significa: 'Cada clique custa pouco, mas ainda não temos uma venda ligada diretamente a um anúncio. Vamos apontar o anúncio do Aion 2 direto para o produto "1 milhão de Kinah - Global", para o cliente chegar onde compra, e reforçar a verba onde há cliques. Antes disso precisamos da sua aprovação, no fim da página.'
    },
    {
      titulo: 'Aparecer no Google sem pagar', cor: '#d6479b',
      resumo: 'Trabalhamos para a loja aparecer na pesquisa normal do Google, sem anúncio. Enviamos as páginas, escrevemos 16 guias de compra e deixamos o rodapé com links para todos os jogos. O Google leva de 2 a 6 semanas para mostrar essas páginas.',
      metricas: [
        { rotulo: 'Páginas enviadas ao Google', valor: 76 },
        { rotulo: 'Guias de compra escritos', valor: 16 },
        { rotulo: 'Páginas que o Google já mostra, das 16 que conhece', valor: '3 de 16', formato: 'texto' },
        { rotulo: 'Venda que veio da pesquisa normal', valor: 400, formato: 'moeda' }
      ],
      significa: 'O Google já leu as páginas, mas por enquanto só mostra 3 das 16. Já aconteceu uma venda de R$ 400 vinda da pesquisa normal, sem anúncio. Vamos pedir ao Google que releia as páginas principais de cada jogo e acompanhar o crescimento nas próximas semanas.'
    }
  ],

  /* O que foi entregue, do mais recente para o mais antigo */
  tituloFeito: 'O que já fizemos juntos',
  feito: [
    { data: '26 de outubro', titulo: 'Escolha do servidor na hora de comprar', detalhe: 'Nos jogos com muitos servidores, abre uma janela para o cliente escolher onde vai receber o item, com o total de cada servidor. Há um campo opcional para o nick no jogo, só para quando for diferente do nome do pedido. A equipe cria servidor novo no painel, em todos os produtos de uma vez.' },
    { data: '26 de outubro', titulo: 'Cashback por compras', detalhe: 'Cada compra paga soma 1%. Ao chegar em 5%, o cliente ganha um cupom de uso único, válido por 60 dias; depois de usado, o contador volta a zero. O cliente vê quantas compras já tem na conta, no carrinho e no pedido, e o programa é anunciado na página inicial. A equipe ajusta os valores no painel.' },
    { data: '26 de outubro', titulo: 'Compra mais curta', detalhe: 'Botão "Comprar agora" direto para o pagamento, com produto, preço e botão na primeira tela do celular.' },
    { data: '26 de outubro', titulo: 'Produto sem estoque', detalhe: 'Em vez de vender o que não tem, o botão vira "Fale com a equipe" (abre o chat ou o WhatsApp). Servidor ou liga passou a ser escolha obrigatória antes de comprar.' },
    { data: '26 de outubro', titulo: 'Entrada da equipe fora do site público', detalhe: 'O login da equipe saiu do rodapé e passou para um endereço reservado, sem link em nenhuma página e fora do Google.' },
    { data: '25 de outubro', titulo: 'Quantidade de 100 em 100 no carrinho', detalhe: 'Os botões + e − respeitam o passo de cada item e avisam quando o número digitado é ajustado.' },
    { data: '25 de outubro', titulo: 'Rodapé e cartão do link', detalhe: 'Rodapé com todos os jogos e guias como links, e texto próprio no cartão que aparece quando o link da loja é enviado no Discord e no WhatsApp.' },
    { data: '23 de outubro', titulo: 'Chat sem mensagens repetidas', detalhe: 'A mesma mensagem não aparece mais duas ou três vezes na conversa.' },
    { data: '23 de outubro', titulo: 'De onde veio cada pedido', detalhe: 'No painel, cada pedido mostra se o cliente veio por anúncio, pesquisa, rede social ou direto, com a campanha e a palavra pesquisada.' },
    { data: '22 de outubro', titulo: 'Ícone da águia e campanhas ajustadas', detalhe: 'Ícone próprio da loja na aba do navegador e na pesquisa do Google, e ajuste dos anúncios com novas palavras e lista de buscas bloqueadas.' },
    { data: '21 de outubro', titulo: 'Efeitos animados na página inicial', detalhe: 'Fundo com luzes e partículas que acompanham o mouse, sem atrapalhar a leitura.' },
    { data: '20 de outubro', titulo: 'Página para fornecedores', detalhe: 'Página redesenhada para quem quer vender para a loja, com o botão do Discord de fornecedores e contagem dos cliques.' }
  ],

  /* O que falta. status: 'andamento' (com progresso de 0 a 100), 'proximo' ou 'precisamos' (depende do cliente) */
  tituloProximos: 'O que vem agora',
  subProximos: 'O que estamos fazendo e o que precisamos de você.',
  proximos: [
    { status: 'precisamos', titulo: 'Aprovar o anúncio direto no produto do Aion 2', detalhe: 'Apontar o anúncio para "1 milhão de Kinah - Global" em vez da página do jogo. O Google analisa o anúncio de novo depois da troca.', quando: 'Assim que você responder' },
    { status: 'precisamos', titulo: 'Decidir a margem do cashback', detalhe: 'O cupom de cashback soma com o desconto por volume. Se preferir mais margem, desligamos essa soma ou diminuímos o teto de 5%. Ambos se ajustam no painel.', quando: 'Assim que você responder' },
    { status: 'precisamos', titulo: 'Uma compra de teste com conta de cliente', detalhe: 'Para conferir o cashback em uso real, do pedido pago até o cupom liberado. Pode ser uma compra pequena.', quando: 'Quando puder' },
    { status: 'andamento', titulo: 'Verificação do anunciante no Google', detalhe: 'Documentos enviados em 20 de outubro. O Google responde de 1 a 10 dias.', quando: 'Resposta do Google' },
    { status: 'proximo', titulo: 'Pedir ao Google que releia as páginas principais', detalhe: 'Path of Exile 2, Diablo 4 e WoW, para acelerar a aparição na pesquisa normal.', quando: 'Próximos dias' },
    { status: 'proximo', titulo: 'Reforçar a verba onde há cliques', detalhe: 'Acompanhar alguns dias a compra mais curta e o cashback no Aion 2 e mover verba das campanhas sem volume de pesquisa.', quando: 'Próximos dias' }
  ],

  recado: { texto: 'Os números de outubro mostram clientes que voltam a comprar e um jogo, o Aion 2, com pedidos de valor alto. O trabalho agora é levar mais gente até ele e manter a loja simples de comprar. Qualquer dúvida sobre os números, é só chamar: a gente explica com calma.', assinatura: 'Lucas, Lhart Design' },
  contato: { whatsapp: '5511989304239', mensagem: 'Oi! Vi a página de resultados de outubro do EagleSeller e quero conversar.', botao: 'Falar com a Lhart no WhatsApp' }
};
