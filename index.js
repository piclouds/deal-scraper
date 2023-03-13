const { Telegraf } = require('telegraf')
const cmod = require('./base_module')
const Scraper = require('./components/scraper')
// const Seeker = require('./models/seeker');
// const User = require('./models/user');
// const getUserServices = require('./user-services');



// Set token
process.env['BOT_TOKEN'] = "5353208283:AAEN9STFsUq5FgQ8dmHGGIbrfNGuFIyTTCc";
process.env['prod'] = true;
process.env['version'] = "1.0.0";

// Create Telegraf instance
const bot = new Telegraf(process.env.BOT_TOKEN);

// Once the conversation begins, create user and send welcome message.
bot.start((ctx) => {
    // let user = getUserServices().newUser(ctx.update.message.from.username, ctx.update.message.from.id, ctx.update.message.from.first_name);

    ctx.reply(`Hello ${user.first_name},\nWelcome to Deal Finder. You can subscribe to a search 
    results page on Kijiji, (and soon facebook market) by making a search on these websites, configuring
     search terms and filters, and then using the search URL to subscribe and get notified of any new item(s)
      for that search result.`)
});

// Once user enters subscribe command
bot.command('subscribe', ctx => {
    // Get user id
    let userId = ctx.update.message.from.id;
    // // Create/get user
    // let user = getUserServices().newUser(ctx.update.message.from.username, userId, ctx.update.message.from.first_name);

    // Split user input
    const inputSplit = ctx.update.message.text.split(' ');
    

    // Extract URL
    let url = inputSplit[1]?.trim();
    // let url = ctx.update.message.text.substring(10).trim();

    // Handle errors in case of null or empty url
    if (url === null || url === '') {
        let errorMessages = cmod.communications.getError('empty_url');
        for (let errorMsg of errorMessages)
            ctx.reply(errorMsg);

        return;
    }

    // Create Scraper instance
    const scraper = new Scraper(url, (inputSplit.length < 3) ? 'Random Scraper' : inputSplit);

    // Subscribe to Scraper's data$ observable
    // Subscribe to seeker's updates
    scraper.data$.subscribe((latest) => {
        let i = 0;
        for (let item of latest) {
            ctx.reply(`
            ${item.title}\n${item.desc} \n\n ${item.price} \n\n Visit: (${item.url})
            `);
        }
    })
    // Add to user's seekers list

})


// Start the bot
bot.launch()