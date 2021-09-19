const TelegramBot = require('node-telegram-bot-api');
const token_tg = "1953524348:AAGnDAeg5c1dLkAqWiQmy-cTPRwpyWAJlN4";
const passgen = require('passgen');
const bot = new TelegramBot(token_tg, {polling: true});

require('./test-connection-db');

const api = require('./api/client-api')

const {
    getMainDataFromMsg,
} = require("./utils/TelegramUtils")


bot.onText(/\/start/, (msg) => {
    console.log(msg)
    try {
        let msgInfo = getMainDataFromMsg(msg);
        let key = msg.text.replace("/start", '').trim();
        // let password = generatePassword();
        console.log(msgInfo)

        getUserByTelegramID(msg).then(user => {
            if (user) {
                processReturnedUser(msgInfo);
            } else {
                registerUser(msgInfo );
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
                 // bot.sendMessage(MANAGER_CHAT, `Зареєстрований новий користувач "${msgInfo.name + " " + msgInfo.last_name}" з ID"${msgInfo.chat}"`);
            }
            // if (key.includes("chat")) {
            //     let msgInfo = getMainDataFromMsg(msg);
            //     getUserByTelegramID(msg).then(user => {
            //         if (user.role.type === "manager") {
            //             api.request({
            //                 "url": "users",
            //                 "method": "PUT",
            //                 "id": user.id,
            //                 body: {support_receiver_telegram_id: key.split("_")[1]}
            //             }).then(() => {
            //                 return getUserByTelegramID(key.split("_")[1])
            //             }).then(client => {
            //                 return bot.sendMessage(msgInfo.chat, `Ви підключені до чату з користувачем *${client.name ? client.name : "" + " " + client.last_name ? client.last_name : ""}* ${client.phone ? "з номером +" + client.phone : ""}\n`, generateMessagingButtons())
            //             })
            //
            //         }
            //     })
            //     return;
            // }
            // if (key.includes("5f44102d479cca001db181d7")) {
            //     api.request({
            //         "url": "users",
            //         "method": "PUT",
            //         "id": user.id,
            //         body: {subscription: "5f44102d479cca001db181d7", days_of_subscription: 99999}
            //     })
            // }
         })
    }catch(e){
        console.log(e);
    }

})

function getUserByTelegramID(msg) {
    let chat;
    if (!msg.chat && !msg.from) {
        chat = msg;
    } else {
        chat = msg.hasOwnProperty('chat') ? msg.chat.id : msg.from.id;
    }
    return api.find(chat.id).then(users => {
        if (users.length > 0) {
            console.log(users)
            return users[0]
        }
    })/*.then(user => {
        if (user && user.days_of_subscription <= 0) {
            api.request({url: "subscriptions", method: "GET", filters: {"_sort": "price:ASC"}}).then(plans => {
                if (plans) {
                    let keyboard = createKeyboardOpts(plans.filter(plan => {
                        return !plan.name.includes("Тест")
                    }).map(plan => {
                        return {text: plan.name + " " + plan.price + " грн", url: plan.url}
                    }), 1);
                    bot.sendMessage(user.telegram_id, "Оу, в тебе закінчилась тестова підписка 😢\n" +
                        "Тобі необхідно обрати свій тариф та оплатити його щоб отримувати по 100 нових об'єктів!", keyboard)
                }
            })
            return null;
        } else {
            return user;
        }
    })*/
}
function processReturnedUser(msgInfo) {
    bot.sendMessage(msgInfo.chat, `Привіт, ${msgInfo.name} ${msgInfo.last_name}!\nЗ поверненням!`, {
        reply_markup: JSON.stringify({
            resize_keyboard: true,
            keyboard: [
                [{text: 'Свіжі квартири 🏢', callback_data: 'getFreshApartments'}, {
                    text: 'Збережені ❤️',
                    callback_data: 'liked'
                }],
                [{text: 'Налаштування ⚙', callback_data: 'settings'}, {
                    text: 'Придбати персональний підбір 🧞‍♂️',
                    callback_data: 'settings'
                }]
            ]
        })
    })
}

async function registerUser(msgInfo) {
    let apiw = new api(msgInfo);
    await apiw.save().then(res => {
        console.log("Успішно зареєстровано!")
    });
}

function sendGreetingMessage(msgInfo) {
    setTimeout(() => {
        bot.sendMessage(msgInfo.chat, `Тобі надано 2 дні тестової підписки ;)`).then(() => {
            bot.sendMessage(msgInfo.chat, `Ти з нами вперше - тому пропонуємо одразу обрати собі фільтри!`)
        })/*.then(() => {
            api.request({
                "url": "cities", "method": "GET"
            }).then(cities => {
                bot.sendMessage(msgInfo.chat, "Обери своє місто!", createKeyboardOpts(cities.map(city => {
                    return {text: city.name, callback_data: "set_city_first:" + city.id}
                }), 3))
            })
        })*/
    }, 5000)
}




function createKeyboardOpts(list, elementsPerSubArray, args) {
    let list1 = listToMatrix(list, elementsPerSubArray);
    if (args) {
        list1.push(args);
    }
    const opts = {
        parse_mode: "Markdown",
        reply_markup: JSON.stringify({
            resize_keyboard: true,
            inline_keyboard: list1
        })
    };
    return opts;
}

function listToMatrix(list, elementsPerSubArray) {
    var matrix = [], i, k;
    for (i = 0, k = -1; i < list.length; i++) {
        if (i % elementsPerSubArray === 0) {
            k++;
            matrix[k] = [];
        }
        matrix[k].push(list[i]);
    }

    return matrix;
}

