module.exports.config = {
    name: "enrile",
    version: "1.0.0",
    role: 0,
    credits: "Rized",
    description: "Generate an Enrile-style image",
    hasPrefix: false,
    aliases: ["enrile"],
    usage: "[enrile <text>]",
    cooldown: 5
};

const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.run = async function({ api, event, args }) {
    try {
        const text = args.join(" ");
        if (!text) {
            api.sendMessage("Usage: enrile <text>", event.threadID);
            return;
        }

        const encodedText = encodeURIComponent(text);
        const url = `https://api-canvass.vercel.app/enrile?text=${encodedText}`;
        const imagePath = path.join(__dirname, "enrile_image.png");

        api.sendMessage("Generating your Enrile-style image, please wait...", event.threadID);

        const response = await axios({
            url: url,
            method: 'GET',
            responseType: 'stream'
        });

        const writer = fs.createWriteStream(imagePath);
        response.data.pipe(writer);

        writer.on('finish', async () => {
            try {
                await api.sendMessage({
                    attachment: fs.createReadStream(imagePath)
                }, event.threadID);

                fs.unlinkSync(imagePath);
            } catch (sendError) {
                console.error('Error sending image:', sendError);
                api.sendMessage("An error occurred while sending the image.", event.threadID);
            }
        });

        writer.on('error', (err) => {
            console.error('Stream writer error:', err);
            api.sendMessage("An error occurred while processing the request.", event.threadID);
        });
    } catch (error) {
        console.error('Error:', error);
        api.sendMessage("An error occurred while processing the request.", event.threadID);
    }
};
