const { Client } = require('discord.js-selfbot-v13');
const fs = require('fs');

const SLASH_CHANNEL_ID = '1392282520644751491';
const RANDOM_CHANNEL_ID = '1392286505434873938';

const COMMANDS = [
  { botId: '761562078095867916', command: 'up', interval: 2 * 60 * 60 + 10 },
  { botId: '302050872383242240', command: 'bump', interval: 2 * 60 * 60 + 30 },
  { botId: '903541413298450462', command: 'up', interval: 1 * 60 * 60 + 10 },
];

// tokens.txt を読み込む
const tokens = fs.readFileSync('tokens.txt', 'utf-8')
  .split('\n')
  .map(line => line.trim())
  .filter(Boolean);

// ランダム文字列を生成
function generateRandomString(length = 10) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

// 各トークンでクライアントを起動
tokens.forEach((token, index) => {
  const client = new Client();
  client.login(token);

  client.on('ready', async () => {
    console.log(`[${index}] Logged in as ${client.user.tag}`);

    const slashChannel = await client.channels.fetch(SLASH_CHANNEL_ID);
    const randomChannel = await client.channels.fetch(RANDOM_CHANNEL_ID);

    // スラッシュコマンド送信ループ
    for (const cmd of COMMANDS) {
      setInterval(async () => {
        try {
          console.log(`[${client.user.tag}] Sending /${cmd.command} to ${cmd.botId}`);
          const result = await slashChannel.sendSlash(cmd.botId, cmd.command);
          
          if (result?.flags?.has?.('LOADING')) {
            console.log(`[${client.user.tag}] Waiting for response...`);
            await new Promise((resolve, reject) => {
              const timeout = setTimeout(() => reject('timeout'), 15 * 60 * 1000);
              client.on('messageUpdate', (_, m) => {
                if (_.id === result.id) {
                  clearTimeout(timeout);
                  resolve(m);
                }
              });
            });
          }
        } catch (e) {
          console.error(`[${client.user.tag}] Slash command error:`, e.message);
        }
      }, cmd.interval * 1000);
    }

    // ランダム文字列送信ループ（5秒ごと）
    setInterval(async () => {
      try {
        const message = generateRandomString(10);
        await randomChannel.send(message);
        console.log(`[${client.user.tag}] Sent random message: ${message}`);
      } catch (e) {
        console.error(`[${client.user.tag}] Random message error:`, e.message);
      }
    }, 5000);
  });
});
