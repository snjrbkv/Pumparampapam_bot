const { Telegraf } = require("telegraf");
const { message } = require("telegraf/filters");
const BOT_TOKEN = "7328134904:AAFdKJqXbJHvD_zt6Vmq17qjQivmgYBmUEc";
const bot = new Telegraf(BOT_TOKEN);
bot.start((ctx) => ctx.reply("Welcome somsa"));
bot.launch();
