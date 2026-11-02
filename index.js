import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

const app = express();
const PORT = Number(process.env.PORT || 3000);
const API_SECRET = process.env.API_SECRET || '';
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*';
const TELEGRAM_API = 'https://api.telegram.org';
const configuredTokens = (process.env.BOT_TOKENS || process.env.TELEGRAM_BOT_TOKEN || '')
  .split(',').map(x => x.trim()).filter(Boolean);

const positiveReactions = ['👍','❤','🔥','🥰','👏','😁','🎉','🤩','🙏','👌','🕊','😍','🐳','❤‍🔥','🌭','💯','🤣','⚡','🍌','🏆','😘','🍓','🍾','💋','😇','🤝','✍','🤗','🫡','🎅','🎄','☃','🆒','💘','🦄','😎'];
const negativeReactions = ['👎','🤔','🤯','😱','🤬','😢','🤮','💩','🤡','🥱','🥴','💔','🤨','😐','😈','😴','😭','😨','🙈','🙉','🙊','😡','🗿'];
const allReactions = [...new Set([...positiveReactions, ...negativeReactions, '🌚','🤓','👻','👨‍💻','👀','🎃','💅','🤪','🤷','👾'])];
const validEmoji = new Set(allReactions);

app.disable('x-powered-by');
app.use(helmet());
app.use(express.json({ limit: '32kb', strict: true }));
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');
  if (req.method === 'OPTIONS') return res.status(204).end();
  next();
});
app.use(rateLimit({ windowMs: 60_000, limit: 30, standardHeaders: 'draft-7', legacyHeaders: false }));

function safeEqual(a, b) {
  let mismatch = a.length ^ b.length;
  const n = Math.max(a.length, b.length);
  for (let i = 0; i < n; i++) mismatch |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return mismatch === 0;
}
function authenticate(req, res, next) {
  if (!API_SECRET) return res.status(503).json({ ok:false, error:'Server not configured: set API_SECRET in host environment variables.' });
  const supplied = req.get('x-api-key') || req.get('authorization')?.replace(/^Bearer\s+/i, '') || '';
  if (!safeEqual(supplied, API_SECRET)) return res.status(401).json({ ok:false, error:'Unauthorized. Send X-API-Key or Authorization: Bearer <key>.' });
  next();
}
function csv(value) {
  if (Array.isArray(value)) return value.map(String).map(s => s.trim()).filter(Boolean);
  if (value === undefined || value === null || value === '') return [];
  return String(value).split(',').map(s => s.trim()).filter(Boolean);
}
function pickReaction(mode) {
  const pool = mode === 'positive' ? positiveReactions : mode === 'negative' ? negativeReactions : allReactions;
  return pool[Math.floor(Math.random() * pool.length)];
}
function validChatId(value) {
  return /^-?\d+$/.test(String(value)) || /^@[A-Za-z0-9_]{5,}$/.test(String(value));
}
async function telegram(token, method, payload, timeoutMs = 12000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${TELEGRAM_API}/bot${token}/${method}`, {
      method: 'POST', headers: {'content-type':'application/json'}, body: JSON.stringify(payload), signal: controller.signal
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.ok) throw Object.assign(new Error(data.description || `Telegram API error (${response.status})`), { telegramCode: data.error_code || response.status, parameters: data.parameters });
    return data.result;
  } finally { clearTimeout(timeout); }
}
async function findMessageId(tokens, chatId) {
  for (const token of tokens) {
    try {
      // Telegram's negative offset retrieves updates from the end. This only works
      // when the bot has updates for the target chat and no webhook is configured.
      const updates = await telegram(token, 'getUpdates', { offset: -1, limit: 100, timeout: 0 });
      for (let i = updates.length - 1; i >= 0; i--) {
        const u = updates[i];
        const m = u.channel_post || u.message || u.edited_channel_post || u.edited_message;
        if (m?.chat && String(m.chat.id) === String(chatId)) return m.message_id;
      }
    } catch { /* try the next configured bot */ }
  }
  throw new Error(`No recent bot update found for chat ${chatId}. Pass message_id manually or ensure the bot receives updates.`);
}

app.get('/', (_req, res) => res.json({
  ok:true, name:'Karan Xploit | Telegram Reaction API', developer:'Karan Xploit', version:'5.0.0', status:'online',
  endpoints:{health:'GET /health', single:'POST /api/reaction', bulk:'POST /api/reactions'},
  modes:['positive','negative','mix'],
  note:'Use only with bots and chats you own or are authorized to manage.'
}));
app.get('/health', (_req, res) => res.json({ ok:true, service:'telegram-reaction-api', configured:Boolean(API_SECRET && configuredTokens.length), bot_count:configuredTokens.length }));

// Single reaction: {chat_id, message_id, emoji, is_big?}
app.post('/api/reaction', authenticate, async (req, res) => {
  const { chat_id, message_id, emoji='👍', is_big=false } = req.body || {};
  const tokens = csv(req.body?.token || req.body?.tokens).length ? csv(req.body?.token || req.body?.tokens) : configuredTokens;
  if (!tokens.length) return res.status(503).json({ok:false,error:'Set BOT_TOKENS or TELEGRAM_BOT_TOKEN in environment variables.'});
  if (tokens.length !== 1) return res.status(400).json({ok:false,error:'Single endpoint accepts one bot token. Use /api/reactions for multiple bots.'});
  if (chat_id === undefined || !validChatId(chat_id)) return res.status(400).json({ok:false,error:'chat_id is required and must be a numeric ID or @channel_username.'});
  if (!Number.isSafeInteger(Number(message_id)) || Number(message_id) < 1) return res.status(400).json({ok:false,error:'message_id must be a positive integer.'});
  if (typeof emoji !== 'string' || !validEmoji.has(emoji)) return res.status(400).json({ok:false,error:'Unsupported emoji. Use a standard reaction emoji supported by Telegram.'});
  if (typeof is_big !== 'boolean') return res.status(400).json({ok:false,error:'is_big must be true or false.'});
  try {
    const result = await telegram(tokens[0], 'setMessageReaction', {chat_id, message_id:Number(message_id), reaction:[{type:'emoji',emoji}], is_big});
    return res.json({ok:true, chat_id:String(chat_id), message_id:Number(message_id), emoji, result});
  } catch (err) {
    return res.status(err.telegramCode === 429 ? 429 : 502).json({ok:false,error:err.message || 'Telegram API request failed.',telegram_error_code:err.telegramCode,parameters:err.parameters});
  }
});

// Legacy-compatible bulk endpoint: multiple tokens/chats/message IDs and positive/negative/mix.
// Example JSON: {chat:["@yourchannel"], message:[123], reaction:"mix"}
app.post('/api/reactions', authenticate, async (req, res) => {
  const body = req.body || {};
  const tokens = csv(body.tokens || body.token).length ? csv(body.tokens || body.token) : configuredTokens;
  const chats = csv(body.chat_ids || body.chat);
  let messages = csv(body.message_ids || body.message);
  const mode = String(body.reaction || body.react || 'mix').toLowerCase();
  const explicitEmoji = body.emoji;
  if (!tokens.length) return res.status(400).json({ok:false,error:'Provide token/tokens or configure BOT_TOKENS.'});
  if (tokens.some(t => !/^\d{5,}:[A-Za-z0-9_-]{20,}$/.test(t))) return res.status(400).json({ok:false,error:'One or more bot tokens have an invalid format.'});
  if (!chats.length || chats.some(c => !validChatId(c))) return res.status(400).json({ok:false,error:'Provide valid chat/chat_ids values.'});
  if (explicitEmoji !== undefined && (typeof explicitEmoji !== 'string' || !validEmoji.has(explicitEmoji))) return res.status(400).json({ok:false,error:'Unsupported emoji. Choose a supported Telegram reaction emoji.'});
  if (!['positive','negative','mix'].includes(mode) && explicitEmoji === undefined) return res.status(400).json({ok:false,error:'reaction must be positive, negative, mix, or provide a supported emoji field.'});
  if (messages.some(m => !/^\d+$/.test(m) || Number(m) < 1)) return res.status(400).json({ok:false,error:'message/message_ids must contain positive message IDs.'});
  let targets;
  if (!messages.length) {
    const found = [];
    for (const chat of chats) {
      try { found.push({chat_id:chat, message_id:String(await findMessageId(tokens, chat))}); }
      catch (e) { found.push({chat_id:chat, error:e.message}); }
    }
    targets = found.filter(x => x.message_id);
    if (!targets.length) return res.status(400).json({ok:false,error:'Could not auto-detect a recent message. Supply message_ids manually.',lookup:found});
  } else {
    targets = chats.flatMap(chat_id => messages.map(message_id => ({chat_id,message_id})));
  }
  const combos = [];
  for (const token of tokens) for (const target of targets) {
    combos.push({token,chat_id:target.chat_id,message_id:target.message_id,emoji:explicitEmoji || pickReaction(mode)});
  }
  if (combos.length > 20) return res.status(400).json({ok:false,error:'This request exceeds the 20-operation safety limit. Split it into smaller requests.'});
  const results = await Promise.all(combos.map(async c => {
    try {
      const result = await telegram(c.token,'setMessageReaction',{chat_id:c.chat_id,message_id:Number(c.message_id),reaction:[{type:'emoji',emoji:c.emoji}],is_big:body.is_big === true});
      return {chat_id:c.chat_id,message_id:Number(c.message_id),emoji:c.emoji,ok:true,result};
    } catch (e) { return {chat_id:c.chat_id,message_id:Number(c.message_id),emoji:c.emoji,ok:false,error:e.message,telegram_error_code:e.telegramCode}; }
  }));
  return res.status(results.some(r=>!r.ok) ? 207 : 200).json({ok:results.every(r=>r.ok),mode,requested:results.length,succeeded:results.filter(r=>r.ok).length,failed:results.filter(r=>!r.ok).length,results});
});

// Legacy GET form is supported for convenience, but still requires the API key.
app.get('/api/reactions', authenticate, (req, res, next) => {
  req.body = {token:req.query.token,tokens:req.query.tokens,chat:req.query.chat,chat_ids:req.query.chat_ids,message:req.query.message,message_ids:req.query.message_ids,reaction:req.query.reaction || req.query.react,emoji:req.query.emoji,is_big:req.query.is_big === 'true'};
  next();
}, async (req,res) => {
  // Redirect users to POST so credentials/tokens are not placed in URLs/logs.
  return res.status(405).json({ok:false,error:'Use POST /api/reactions with a JSON body. Do not put bot tokens in URL query parameters.'});
});
app.use((_req,res)=>res.status(404).json({ok:false,error:'Endpoint not found.'}));
app.use((err,_req,res,_next)=>{
  if (err instanceof SyntaxError && 'body' in err) return res.status(400).json({ok:false,error:'Invalid JSON body.'});
  console.error('Unhandled server error:',err?.message || 'unknown');
  return res.status(500).json({ok:false,error:'Internal server error.'});
});
app.listen(PORT,'0.0.0.0',()=>console.log(`🚀 Karan Xploit | Telegram Reaction API v5 listening on port ${PORT}`));
