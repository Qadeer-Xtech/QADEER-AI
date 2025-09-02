const axios = require('axios');

/**
 * Fetches data from a URL and returns it as a buffer.
 * @param {string} url - The URL to fetch from.
 * @param {object} [options={}] - Optional axios request configuration.
 * @returns {Promise<Buffer|undefined>} The data as a buffer, or undefined on error.
 */
const getBuffer = async (url, options = {}) => {
    try {
        const response = await axios({
            method: 'get',
            url,
            headers: {
                'DNT': 1,
                'Upgrade-Insecure-Request': 1,
            },
            ...options,
            responseType: 'arraybuffer'
        });
        return response.data;
    } catch (error) {
        console.log(error);
    }
};

/**
 * Filters a list of group participants to get only the admins.
 * @param {Array<object>} participants - An array of participant objects.
 * @returns {Array<string>} An array of admin JIDs.
 */
const getGroupAdmins = (participants = []) => {
    return participants
        .filter(p => p.admin)
        .map(p => p.jid || p.id);
};

/**
 * Generates a random number string and appends an extension.
 * @param {string} ext - The extension to append (e.g., '.jpg').
 * @returns {string} A random filename.
 */
const getRandom = (ext) => {
    return `${Math.floor(Math.random() * 10000)}${ext}`;
};

/**
 * Converts a number to a human-readable string (e.g., 1200 -> "1.2K").
 * @param {number} bytes - The number to convert.
 * @returns {string} The formatted string.
 */
const h2k = (bytes) => {
    if (bytes === 0) return '0';
    const suffixes = ['', 'K', 'M', 'B', 'T', 'P', 'E'];
    const i = Math.floor(Math.log10(Math.abs(bytes)) / 3) | 0;
    if (i === 0) return bytes.toString();
    const result = (bytes / Math.pow(10, i * 3)).toFixed(1);
    return `${result.replace(/\.0$/, '')}${suffixes[i]}`;
};

/**
 * Checks if a string is a valid URL.
 * @param {string} url - The string to check.
 * @returns {boolean} True if the string is a URL, false otherwise.
 */
const isUrl = (url) => {
    const regex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%.+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%+.~#?&/=]*)/gi;
    return url.match(regex);
};

/**
 * Converts a JavaScript object to a pretty-printed JSON string.
 * @param {object} obj - The object to convert.
 * @returns {string} The formatted JSON string.
 */
const Json = (obj) => {
    return JSON.stringify(obj, null, 2);
};

/**
 * Converts seconds into a human-readable D/H/M/S format.
 * @param {number} seconds - The duration in seconds.
 * @returns {string} The formatted runtime string.
 */
const runtime = (seconds) => {
    seconds = Number(seconds);
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor(seconds % (3600 * 24) / 3600);
    const m = Math.floor(seconds % 3600 / 60);
    const s = Math.floor(seconds % 60);

    const dDisplay = d > 0 ? d + (d === 1 ? " day, " : " days, ") : "";
    const hDisplay = h > 0 ? h + (h === 1 ? " hour, " : " hours, ") : "";
    const mDisplay = m > 0 ? m + (m === 1 ? " minute, " : " minutes, ") : "";
    const sDisplay = s > 0 ? s + (s === 1 ? " second" : " seconds") : "";
    return (dDisplay + hDisplay + mDisplay + sDisplay).trim().replace(/,$/, ''); // remove trailing comma
};

/**
 * Pauses execution for a specified number of milliseconds.
 * @param {number} ms - The number of milliseconds to sleep.
 * @returns {Promise<void>}
 */
const sleep = async (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Fetches JSON data from a URL.
 * @param {string} url - The URL to fetch JSON from.
 * @param {object} [options={}] - Optional axios request configuration.
 * @returns {Promise<object|string>} The JSON data or the error object.
 */
const fetchJson = async (url, options = {}) => {
    try {
        const response = await axios({
            method: 'GET',
            url: url,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36'
            },
            ...options
        });
        return response.data;
    } catch (error) {
        return error;
    }
};

module.exports = {
    getBuffer,
    getGroupAdmins,
    getRandom,
    h2k,
    isUrl,
    Json,
    runtime,
    sleep,
    fetchJson
};
