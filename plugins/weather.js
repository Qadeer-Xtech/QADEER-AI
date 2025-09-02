// weather.js
const axios = require('axios');
const config = require('../config');
const { cmd } = require('../command');

cmd({
    pattern: 'weather',
    desc: 'Get weather information for a location',
    category: 'other',
    filename: __filename,
    use: '<city name>'
}, async (client, message, m, { from, q, reply }) => {

    // React to the message to indicate processing
    await client.sendMessage(m.key.remoteJid, {
        react: {
            text: '🌤',
            key: m.key
        }
    });

    try {
        // Check if a city name is provided
        if (!q) {
            return reply('❗ Please provide a city name. Usage: .weather [city name]');
        }

        // Use the API key from your config or a default one
        const apiKey = config.OPENWEATHER_API_KEY || '2d61a72574c11c4f36173b627f8cb177';
        const cityName = q;
        const apiUrl = `http://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=metric&appid=${apiKey}`;

        const response = await axios.get(apiUrl);
        const weatherData = response.data;

        // Format the weather information
        const resultText = `
> 🌍 *Weather Information for ${weatherData.name}, ${weatherData.sys.country}* 🌍
> 🌡️ *Temperature*: ${weatherData.main.temp}°C
> 🌡️ *Feels Like*: ${weatherData.main.feels_like}°C
> 🌡️ *Min Temp*: ${weatherData.main.temp_min}°C
> 🌡️ *Max Temp*: ${weatherData.main.temp_max}°C
> 💧 *Humidity*: ${weatherData.main.humidity}%
> ☁️ *Weather*: ${weatherData.weather[0].main}
> 🌫️ *Description*: ${weatherData.weather[0].description}
> 💨 *Wind Speed*: ${weatherData.wind.speed} m/s
> 🔽 *Pressure*: ${weatherData.main.pressure} hPa

> *© 𝙿𝙾𝚆𝙴𝚁𝙴𝙳 𝙱𝚈 𝚀𝙰𝙳𝙴𝙴𝚁 𝙺𝙷𝙰𝙽*
`;
        return reply(resultText);

    } catch (error) {
        console.log(error);
        if (error.response && error.response.status === 404) {
            return reply('🚫 City not found. Please check the spelling and try again.');
        }
        return reply('⚠️ An error occurred while fetching the weather information. Please try again later.');
    }
});
