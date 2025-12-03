const axios = require('axios');
const fs = require('fs-extra');
const { get } = require('uzair-mtx-downloader'); // Assuming this is a custom module

module.exports = {
  config: {
    name: 'linkAutoDownload',
    version: '1.3.0',
    hasPermssion: 0,
    credits: 'uzairrajput',
    description: 'Automatically detects links in messages and downloads the file.',
    commandCategory: 'Utilities',
    usages: '',
    cooldowns: 5
  },

  // This is empty, probably because this module mainly works via handleEvent
  run: async function({ events, args }) {},

  handleEvent: async function({ api, event, args }) {
    // Extract message body
    const message = event.body ? event.body : '';
    const lowerCaseMessage = message.toLowerCase();

    // Only proceed if message contains 'https://'
    if (lowerCaseMessage.includes('https://')) {
      // Show a loading reaction
      api.setMessageReaction('📿', event.messageID, () => {}, true);

      // Download info via the downloader module
      const { alldown } = require('uzair-mtx-downloader');
      const downloadInfo = await alldown(message);

      console.log(downloadInfo);

      // Extract low-res URL, high-res URL, and title
      const { low, high, title } = downloadInfo.data;

      // Show a success reaction
      api.setMessageReaction('✅', event.messageID, () => {}, true);

      // Fetch the high-res file via axios
      const fileBuffer = (await axios.get(high, { responseType: 'arraybuffer' })).data;

      // Save the file locally
      fs.writeFileSync(__dirname + '/cache/auto.mp4', Buffer.from(fileBuffer, 'utf-8'));

      // Send message with attachment
      api.sendMessage({
        body: `✨❁ ━━ ━[ 𝑺𝑯𝑨𝑨𝑵 ]━ ━━ ❁✨\n\ntitle: ${title}\n\n`,
        attachment: fs.createReadStream(__dirname + '/cache/auto.mp4')
      }, event.threadID, event.messageID);
    }
  }
};