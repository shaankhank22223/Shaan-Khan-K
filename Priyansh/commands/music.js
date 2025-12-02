const axios = require("axios");
const yts = require("yt-search");

// 🔐 Credits Lock Check
function checkCredits() {
    const correctCredits = "ARIF-BABU";
    if (module.exports.config.credits !== correctCredits) {
        throw new Error("❌ Credits Locked By ARIF-BABU");
    }
}

const baseApiUrl = async () => {
    const base = await axios.get(`https://raw.githubusercontent.com/Mostakim0978/D1PT0/refs/heads/main/baseApiUrl.json`);
    return base.data.api;
};

(async () => {
    global.apis = {
        diptoApi: await baseApiUrl()
    };
})();

async function getStreamFromURL(url, pathName) {
    const response = await axios.get(url, { responseType: "stream" });
    response.data.path = pathName;
    return response.data;
}

function getVideoID(url) {
    const regex = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))((\w|-){11})(?:\S+)?$/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

module.exports.config = {
    name: "music",
    version: "1.1.0",
    credits: "ARIF-BABU", // 🔐 DO NOT CHANGE
    hasPermssion: 0,
    cooldowns: 5,
    description: "YouTube video ko URL ya name se MP3 me download karein",
    commandCategory: "media",
    usages: "[YouTube URL ya song ka naam]"
};

module.exports.run = async function({ api, args, event }) {
    try {
        checkCredits(); // 🔐 Credits Validation Added

        let videoID, searchMsg;
        const url = args[0];

        if (url && (url.includes("youtube.com") || url.includes("youtu.be"))) {
            videoID = getVideoID(url);
            if (!videoID) {
                return api.sendMessage("❌ Galat YouTube URL!", event.threadID, event.messageID);
            }
        } else {
            const query = args.join(" ");
            if (!query) return api.sendMessage("❌ Song ka naam ya YouTube link do!", event.threadID, event.messageID);

            searchMsg = await api.sendMessage(`✅ Apki Request Jari Hai Please Wait: "${query}"`, event.threadID);
            const result = await yts(query);
            const videos = result.videos.slice(0, 30);
            const selected = videos[Math.floor(Math.random() * videos.length)];
            videoID = selected.videoId;
        }

        const { data: { title, downloadLink } } = await axios.get(`${global.apis.diptoApi}/ytDl3?link=${videoID}&format=mp3`);

        if (searchMsg?.messageID) api.unsendMessage(searchMsg.messageID);

        const shortLink = (await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(downloadLink)}`)).data;

        return api.sendMessage({
            body: ` »»𝑶𝑾𝑵𝑬𝑹««★™  »»𝑺𝑯𝑨𝑨𝑵 𝑲𝑯𝑨𝑵««
          🥀𝒀𝑬 𝑳𝑶 𝑩𝑨𝑩𝒀 𝑨𝑷𝑲𝑰💞: ${title}\n📥 Download: ${shortLink}`,
            attachment: await getStreamFromURL(downloadLink, `${title}.mp3`)
        }, event.threadID, event.messageID);

    } catch (err) {
        console.error(err);
        return api.sendMessage("⚠️ Error: " + (err.message || "Kuch galat ho gaya!"), event.threadID, event.messageID);
    }
};