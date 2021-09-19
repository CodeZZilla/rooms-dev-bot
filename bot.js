const TelegramBot = require('node-telegram-bot-api');
const token_tg = "1953524348:AAGnDAeg5c1dLkAqWiQmy-cTPRwpyWAJlN4";
const passgen = require('passgen');
const bot = new TelegramBot(token_tg, {polling: true});

function getMainDataFromMsg(msg) {
    let chat = msg.hasOwnProperty('chat') ? msg.chat.id : msg.from.id;
    let name = msg.hasOwnProperty('chat') ? msg.chat.first_name : msg.from.first_name;
    let last_name = msg.hasOwnProperty('chat') ? msg.chat.last_name : msg.from.last_name;
    return {chat: chat, name: name ? name : "Анонім ;)", last_name: last_name ? last_name : ""}
}

bot.onText(/\/start/, (msg) => {
    console.log(msg)
    console.log(msg)
    try {
        var msgInfo = getMainDataFromMsg(msg);
        let key = msg.text.replace("/start", '').trim();
        let password = passgen.create(20);
        console.log(key)
        getUserByTelegramID(msg).then(user => {
            if (user) {
                processReturnedUser(msgInfo);
            } else {
                registerUser(msgInfo, password);
                bot.sendMessage(msgInfo.chat, `Привіт, ${msgInfo.name} ${msgInfo.last_name}!\nЦе 🤖 компанії РУМС!\nТут ти зможеш: 
                        \n▫️обрати необхідні тобі фільтри для персональних підбірок
                        \n▫️тримати зв'зок із персональним помічником
                        \n▫️отримувати сповіщення про появу нових об'єктів за твоїми фільтрами ;)
                        \n▫️пожалітися нам у підтримку, або попросити перевірити власника житла, або квартиру.
                        \nНадішліть Ваш номер, щоб ми могли вас верифікувати, будь ласка. 
                        `).then(res => {
                        return bot.sendMessage(msgInfo.chat, `Ми пропонуємо почитати що таке РУМС, та чим ми займаємося у [оглядовій статті](https://teletype.in/@rooms_ua/NGUnJgEUi)`, {parse_mode: "Markdown"})
                    }
                )
                sendGreetingMessage(msgInfo);
                bot.sendMessage(MANAGER_CHAT, `Зареєстрований новий користувач "${msgInfo.name + " " + msgInfo.last_name}" з ID"${msgInfo.chat}"`);
            }
            if (key.includes("chat")) {
                let msgInfo = getMainDataFromMsg(msg);
                getUserByTelegramID(msg).then(user => {
                    if (user.role.type === "manager") {
                        api.request({
                            "url": "users",
                            "method": "PUT",
                            "id": user.id,
                            body: {support_receiver_telegram_id: key.split("_")[1]}
                        }).then(() => {
                            return getUserByTelegramID(key.split("_")[1])
                        }).then(client => {
                            return bot.sendMessage(msgInfo.chat, `Ви підключені до чату з користувачем *${client.name ? client.name : "" + " " + client.last_name ? client.last_name : ""}* ${client.phone ? "з номером +" + client.phone : ""}\n`, generateMessagingButtons())
                        })

                    }
                })
                return;
            }
            if (key.includes("5f44102d479cca001db181d7")) {
                api.request({
                    "url": "users",
                    "method": "PUT",
                    "id": user.id,
                    body: {subscription: "5f44102d479cca001db181d7", days_of_subscription: 99999}
                })
            }
        })
    } catch (e) {
        console.log(e);
    }

});
