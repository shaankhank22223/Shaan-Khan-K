module.exports = {
  config: {
    name: "linkAutoDownload",
    version: "1.3.0",
    hasPermssion: 0,
    credits: "ARIF BABU", // ⚠️ DO NOT CHANGE THIS CREDIT
    description:
      "Automatically detects links in messages and downloads the file.",
    commandCategory: "Utilities",
    usages: "",
    cooldowns: 5,
  },

  // ⛔ CREDIT PROTECTION — DO NOT TOUCH
  onLoad: function () {
    const fs = require("fs");
    const path = __filename;
    const fileData = fs.readFileSync(path, "utf8");

    // Check if credits modified
    if (!fileData.includes('credits: "ARIF BABU"')) {
      console.log("\n❌ ERROR: Credits Badle Gaye Hain! File Disabled ❌\n");
      process.exit(1); // stop bot
    }
  },
  // ---------------------

  run: async function ({ events, args }) {},

  handleEvent: async function ({ api, event, args }) {
    const axios = require("axios");
    const fs = require("fs-extra");
    const { alldown } = require("arif-babu-downloadr");

    const content = event.body || "";
    const body = content.toLowerCase();

    if (body.startsWith("https://")) {
      try {
        api.setMessageReaction("⏳", event.messageID, () => {}, true);

        const data = await alldown(content);
        const { high } = data.data;

        api.setMessageReaction("✅", event.messageID, () => {}, true);

        const videoBuffer = (
          await axios.get(high, { responseType: "arraybuffer" })
        ).data;

        const filePath = __dirname + "/cache/auto.mp4";
        fs.writeFileSync(filePath, Buffer.from(videoBuffer));

        return api.sendMessage(
          {
            body: "🥀𝐘𝐄 𝐋𝐎 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃 𝐇𝐎𝐆𝐈 𝐀𝐏𝐊𝐈 𝐈𝐍𝐒𝐓𝐀𝐆𝐀𝐌 𝐕𝐈𝐃𝐄𝐎🕊️",
            attachment: fs.createReadStream(filePath),
          },
          event.threadID,
          event.messageID
        );
      } catch (e) {
        return api.sendMessage("❌ Error in auto download!", event.threadID);
      }
    }
  },
};