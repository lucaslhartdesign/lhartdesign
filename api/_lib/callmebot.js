// CallMeBot (aviso no WhatsApp do Lucas). 18/11/2026: a variável na Vercel foi criada
// como CHAVE_CALLMEBOT, e o código só lia CALLMEBOT_KEY + CALLMEBOT_PHONE — o
// WhatsApp nunca saía. Aceita os dois nomes; sem telefone configurado, usa o
// WhatsApp da Lhart (o mesmo do site), que é o número que cadastra a chave.
const LHART = '5511989304239';
const chave = () => String(process.env.CALLMEBOT_KEY || process.env.CHAVE_CALLMEBOT || process.env.CALLMEBOT_APIKEY || '').trim();
const telefone = () => String(process.env.CALLMEBOT_PHONE || process.env.TELEFONE_CALLMEBOT || process.env.CALLMEBOT_TELEFONE || LHART).replace(/\D/g, '');
const ligado = () => !!chave();
const url = (texto) => 'https://api.callmebot.com/whatsapp.php?phone=' + encodeURIComponent(telefone()) +
  '&text=' + encodeURIComponent(texto) + '&apikey=' + encodeURIComponent(chave());
module.exports = { chave, telefone, ligado, url };
