const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "cdp",
  version: "1.0.0",
  role: 0,
  credits: "developer",
  description: "Get couple DP images",
  hasPrefix: false,
  aliases: ["getcdp", "cdp"],
  usage: "[cdp]",
  cooldown: 5,
};

module.exports.run = async function ({ api, event }) {
  const apiUrl = "https://aryanchauhanapi.onrender.com/v1/cdp/get";
  
  try {
    api.sendMessage(
      "⌛ Fetching couple DP images, please wait...",
      event.threadID
    );

    const response = await axios.get(apiUrl);
    const { male, female } = response.data;

    // Save the images locally
    const imageUrls = { male, female };
    const imagePaths = [];
    const imageKeys = Object.keys(imageUrls);

    for (const key of imageKeys) {
      const imageUrl = imageUrls[key];
      const imageResponse = await axios.get(imageUrl, { responseType: "arraybuffer" });
      const imagePath = path.join(__dirname, `${key}.jpeg`);
      fs.writeFileSync(imagePath, imageResponse.data);
      imagePaths.push(imagePath);
    }

    const attachments = imagePaths.map(imagePath => fs.createReadStream(imagePath));

    api.sendMessage(
      {
        body: "Here are your couple DP images!",
        attachment: attachments,
      },
      event.threadID,
      () => {
        imagePaths.forEach(imagePath => fs.unlinkSync(imagePath));
      }
    );
  } catch (error) {
    console.error("Error fetching couple DP:", error);
    api.sendMessage(
      "An error occurred while fetching the couple DP. Please try again later.",
      event.threadID
    );
  }
};
