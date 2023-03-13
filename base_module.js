var base = {
    communications: {
        getError: function(key) {
            return this.errors[key];
        },
        getMessage: function(key) {
            return this.messages[key];
        },
        messages: [],
        errors: {
            empty_url: [
                "Invalid subscribe format. No URL provided. Make sure to add the url to your subscribe request like following:",
                "/subscribe <subscribing-url>",
                "Enter /help command for more information."
            ]
        }
    }

}


module.exports = base;