╔══════════════════════════════════════════════════════════════╗
║          🚀  K A R A N   X P L O I T  🛡️                  ║
║             TELEGRAM REACTION API 🤖🔥                      ║
╚══════════════════════════════════════════════════════════════╝

👑 DEVELOPER : KARAN XPLOIT
⚡ PROJECT   : Telegram Reaction API — Advanced v5
🧰 STACK     : Node.js • Express • Telegram Bot API
☁️ HOSTING   : Render / any compatible Node.js host

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌟 ABOUT THIS PROJECT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Welcome to the ⚡ Karan Xploit Telegram Reaction API!
This Node.js API lets you apply Telegram reactions to messages
using a bot you control and chats where you have permission.

💥 FEATURES
  ✅ Single custom emoji reaction
  ✅ Positive 🙂 / Negative 👎 / Mix 🎲 reaction modes
  ✅ Multiple bot tokens and chat targets (request safety limit applies)
  ✅ Manual message IDs
  ✅ Best-effort recent-message lookup 🔎
  ✅ API-key authentication 🔐
  ✅ Request validation and rate limiting 🛡️
  ✅ Health-check endpoint 💚
  ✅ Render deployment configuration ☁️
  ✅ Clean JSON responses 📦

⚠️ IMPORTANT
Telegram permissions and supported reactions depend on the target chat
and the Telegram Bot API. Automatic message lookup may not work if a
webhook is configured or the bot has not received an update. Supplying
the message ID manually is usually more reliable.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📁 PROJECT FILES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📄 index.js       — API server and reaction endpoints
📄 package.json   — project details and dependencies
📄 .env.example   — example environment configuration
📄 render.yaml    — Render deployment blueprint
📄 README.md      — GitHub project documentation
📄 README.txt     — stylish plain-text guide

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧩 REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔹 Node.js 20+ (Node.js 22 recommended)
🔹 Telegram bot created with @BotFather
🔹 Bot added to the target chat/channel with required permissions
🔹 Hosting that supports Node.js web services

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚙️ RUN LOCALLY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1️⃣ Install Node.js on your computer or development environment.
2️⃣ Open the project folder and install dependencies:

   npm install

3️⃣ Copy .env.example to a new file named .env.
4️⃣ Open .env and set your values:

   BOT_TOKENS=YOUR_TELEGRAM_BOT_TOKEN
   API_SECRET=MAKE_THIS_A_LONG_RANDOM_SECRET
   ALLOWED_ORIGIN=*
   PORT=3000

🔐 Keep your real .env file private. Never upload it to a public
GitHub repository. Do not share your Telegram bot token or API secret.

5️⃣ Start the API:

   npm start

6️⃣ Check the service in your browser:

   http://localhost:3000/health

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌐 DEPLOY WITH RENDER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1️⃣ Push the project files to your GitHub repository.
2️⃣ Sign in to Render and choose New + → Blueprint or Web Service.
3️⃣ Connect your repository.
4️⃣ Use these commands if asked:

   Build Command : npm install
   Start Command : npm start

5️⃣ Add environment variables in Render:

   BOT_TOKENS  = your real Telegram bot token(s)
   API_SECRET  = a long, unique secret
   ALLOWED_ORIGIN = *  (change this if you have a frontend)

6️⃣ Deploy 🚀 and open:

   https://YOUR-SERVICE.onrender.com/health

The free hosting plan may sleep when inactive or have other limits.
Check the provider's current plan details.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔑 API AUTHENTICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Send the API secret in either header:

   X-API-Key: YOUR_API_SECRET

OR:

   Authorization: Bearer YOUR_API_SECRET

Do not put secrets or bot tokens inside URLs, screenshots, or public code.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔥 ENDPOINTS & EXAMPLES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💚 Health check: GET /health
ℹ️ API information: GET /
🎯 Apply one chosen reaction: POST /api/reaction

Example JSON body:

   {
     "chat_id": "@yourchannel",
     "message_id": 123,
     "emoji": "🔥",
     "is_big": false
   }

🎲 Apply reaction modes to authorized targets: POST /api/reactions

Example JSON body:

   {
     "chat": ["@yourchannel"],
     "message": [123],
     "reaction": "mix"
   }

Available modes: 🙂 positive | 👎 negative | 🎲 mix
For multiple bots, set BOT_TOKENS as a comma-separated list. Each bulk
request is limited to 20 bot/chat/message combinations. Use the API
only for chats and bots you own or are authorized to manage.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧯 TROUBLESHOOTING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ 401 Unauthorized: check the API key header and API_SECRET.
❌ Telegram API error: check token, chat ID, message ID, permissions,
   and whether the chat allows the chosen reaction.
❌ Automatic lookup fails: provide message IDs manually. getUpdates
   lookup can fail when a webhook is configured or the bot has no update.
❌ Service not responding: check hosting logs and environment variables.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🛡️ SECURITY & RESPONSIBLE USE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔒 Never publish real bot tokens, passwords, or API secrets.
🔒 Keep .env private and make sure it is ignored by Git.
🔒 Use a strong, unique API_SECRET.
🤝 Do not spam or automate unwanted activity.
✅ Only use bots, chats, and messages you own or can manage.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💙 MADE WITH FOCUS BY KARAN XPLOIT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⭐ If you find this project useful, star the repository on GitHub!
🧠 Improve it, test it responsibly, and keep your secrets safe.

© 2026 Karan Xploit
