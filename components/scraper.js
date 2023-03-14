const axios = require('axios');
const HTMLParser = require('node-html-parser');
const rxjs = require('rxjs');
// const Item = require('./item');
const { randomUUID } = require('crypto'); // Added in: node v14.17.0
const { Console } = require('console');

class Scraper {
    constructor(url, name = "Random Scraper", latest_ad_ids = [], id = randomUUID(), frequency = 60000) {
        this.url = url;
        this.latest = latest_ad_ids;
        this.id = id;
        this.frequency = frequency;
        this.name = name;

        // Data subject to notify changes
        this.data$ = new rxjs.BehaviorSubject([]);

        // Request latest items
        this.getLatestItems();

        // Start interval schedule
        this.scheduleRef = this.activateSchedule();

        console.log("Now scraping on " + this.url);

    }

    activateSchedule() {
        console.log("Activating Schedule!");
        return setInterval(() => {
            this.getLatestItems();
        }, this.frequency);
        // }, 300000);
    }

    getLatestItems() {
        // Request html from url
        axios.get(this.url)
            // On data
            .then(async res => {
                // Parse to HTML
                let html = HTMLParser.parse(res.data);
                // Get individual ads
                let listingItems = html.querySelectorAll('.regular-ad');

                // Items to item objects
                const myItems = []
                for (let item of listingItems) {
                    myItems.push(this.parseItem(item));
                    // setTimeout(1000)
                    // await this.sleep(1000);
                }
                // myItems.sort((a, b) => b.date - a.date);
                console.log("Loaded " + myItems.length + " items.");

                // if no pre-loaded items
                if (this.latest === null || this.latest === undefined || this.latest.length === 0) {
                    // load all items found
                    console.log("No pre-loads on this scraper. Loading now...")

                    // send to observable
                    let top5 = myItems.slice(0, 5);
                    this.data$.next((myItems.length > 5) ? top5 : myItems);
                    this.latest = myItems.map(item => item.id);
                    return;
                }

                // if pre-loaded items
                //      find new ones and load items
                // Check for new items
                // console.log("Getting latest items...")

                const nonExisting = myItems.filter(item => !this.latest.includes(item.id))

                // If there are no new items
                if (nonExisting.length === 0) {
                    // console.log("Seeker found no new items for " + )
                    return;
                }

                // call next and re assign to latest property
                this.data$.next(nonExisting);
                this.latest = myItems.map(item => item.id);
            })
            .catch(error => {
                console.error("=======================[ERROR]=======================")
                console.error(error)
                return [];
            })
    }


    parseItem(item) {
        // itemData['location'] = dateLocationItem.childNodes[1];
        // #mainPageContent > div.layout-3 > div.col-2 > main > div:nth-child(2) > div:nth-child(38) > div > div.info > div > div.location > span.date-posted

        const itemData = {}

        // Get date-location element
        const dateLocationElement = item.querySelector('.location');
        // Get title element
        const titleElement = item.querySelector('.title');
        // console.log(dateLocationElement)
        // console.log(titleElement)
        itemData['id'] = item.getAttribute('data-listing-id');
        itemData['url'] = "https://www.kijiji.ca" + titleElement.querySelector('a').getAttribute('href');
        itemData['title'] = titleElement.rawText.trim();
        itemData['price'] = item.querySelector('.price').rawText.trim();
        itemData['desc'] = item.querySelector('.description').rawText.trim();
        // itemData['location'] = dateLocationElement.querySelector('span').rawText.trim();
        // itemData['date'] = (dateLocationElement.querySelector('.date-posted') == null) ? 'NULL' : dateLocationElement.querySelector('.date-posted').rawText.trim();
        // console.log(dateLocationElement.querySelector('.date-posted'))
        // console.log("**********************")
        itemData['date'] = dateLocationElement.querySelector('.date-posted')?.rawText.trim();
        const date = new Date();
        if (itemData.date) {
            if (itemData.date.includes("minute")) {
                date.setMinutes(date.getMinutes() - parseInt(itemData.date));
            } else if (itemData.date.includes("hour")) {
                date.setHours(date.getHours() - parseInt(itemData.date));
            } else if (itemData.date.includes("day")) {
                date.setDate(date.getDate() - parseInt(itemData.date));
            }
            itemData.date = date;
        }
        // console.log(itemData['id']);

        return itemData;
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}


module.exports = Scraper;