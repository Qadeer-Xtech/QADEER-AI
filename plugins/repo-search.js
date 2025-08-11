const axios = require("axios");
const { cmd } = require("../command");

cmd({
  pattern: "srepo",
  desc: "Fetch information about a GitHub repository.",
  category: "search",
  react: "🍃",
  filename: __filename,
  use: ".srepo owner/repo"
}, async (conn, m, { q, from }) => {
  try {
    const repoName = q;
    if (!repoName) {
      const replyText = "❌ Please provide a GitHub repository in the format `owner/repo`.\n\n*Example:* .srepo qadeer1245/sakona-md";
      return await conn.sendMessage(from, { text: replyText }, { quoted: m });
    }

    await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });
    
    const apiUrl = `https://api.github.com/repos/${repoName}`;
    const { data } = await axios.get(apiUrl);

    let responseMsg = `*📁 GitHub Repository Info*\n\n` +
                      `*📌 Name:* ${data.name}\n` +
                      `*🔗 URL:* ${data.html_url}\n` +
                      `*👤 Owner:* ${data.owner.login}\n` +
                      `*⭐ Stars:* ${data.stargazers_count.toLocaleString()}\n` +
                      `*🍴 Forks:* ${data.forks_count.toLocaleString()}\n` +
                      `*👀 Watchers:* ${data.watchers_count.toLocaleString()}\n` +
                      `*📅 Created:* ${new Date(data.created_at).toLocaleDateString('en-GB')}\n` +
                      `*📝 Description:* ${data.description || "No description"}\n\n` +
                      `> *© 𝙿𝙾𝚆𝙴𝚁𝙴𝙳 𝙱𝚈 𝚀𝙰𝙳𝙴𝙴𝚁 𝙺𝙷𝙰𝙽*`;

    await conn.sendMessage(from, {
      image: { url: data.owner.avatar_url },
      caption: responseMsg
    }, { quoted: m });

  } catch (error) {
    console.error("GitHub API Error:", error);
    let errorText;
    if (error.response && error.response.status === 404) {
      errorText = "❌ Repository not found. Please check the `owner/repo` format and spelling.";
    } else {
      errorText = `❌ Error fetching repository data: ${error.message}`;
    }
    await conn.sendMessage(from, { text: errorText }, { quoted: m });
  }
});
