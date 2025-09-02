const fs = require('fs');
const axios = require('axios');
const path = './config.env'; // Path to the configuration file
const FormData = require('form-data');
const dotenv = require('dotenv');

/**
 * Uploads a local file to empiretech.biz.id and returns the URL.
 * @param {string} filePath - The local path to the file to upload.
 * @returns {Promise<object>} The API response data.
 * @throws {Error} Throws an error if the file doesn't exist or the upload fails.
 */
async function empiretourl(filePath) {
    if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
    }

    const form = new FormData();
    const fileStream = fs.createReadStream(filePath);
    form.append('file', fileStream);
    
    const originalFileName = filePath.split('/').pop();
    form.append('originalFileName', originalFileName);

    try {
        const response = await axios.post('https://cdn.empiretech.biz.id/api/upload.php', form, {
            headers: {
                ...form.getHeaders()
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        });
        return response.data;
    } catch (error) {
        if (error.response) {
            throw new Error(`API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
        } else if (error.request) {
            throw new Error('No response received from the server.');
        } else {
            throw new Error(`Request Error: ${error.message}`);
        }
    }
}

/**
 * Fetches data from a URL and returns it as a buffer.
 * @param {string} url - The URL to fetch from.
 * @param {object} [options={}] - Optional axios request configuration.
 * @returns {Promise<Buffer|null>} The data as a buffer, or null on error.
 */
const getBuffer = async (url, options = {}) => {
    try {
        const response = await axios({
            method: 'GET',
            url: url,
            headers: {
                'DNT': 1,
                'Upgrade-Insecure-Request': 1
            },
            ...options,
            responseType: 'arraybuffer'
        });
        return response.data;
    } catch (error) {
        console.error(error);
        return null;
    }
};

/**
 * Filters a list of group participants to get only the admins.
 * @param {Array<object>} participants - An array of participant objects.
 * @returns {Array<string>} An array of admin JIDs.
 */
const getGroupAdmins = (participants) => {
    const admins = [];
    for (let participant of participants) {
        if (participant.admin !== null) {
            admins.push(participant.id);
        }
    }
    return admins;
};

/**
 * Generates a random number string and appends an extension.
 * @param {string} ext - The extension to append.
 * @returns {string} A random filename.
 */
const getRandom = (ext) => {
    return `${Math.floor(Math.random() * 10000)}${ext}`;
};

/**
 * Converts a number to a human-readable string (e.g., 1200 -> "1.2K").
 * @param {number} num - The number to convert.
 * @returns {string} The formatted string.
 */
const h2k = (num) => {
    const suffixes = ['', 'K', 'M', 'B', 'T', 'P', 'E'];
    const i = Math.floor(Math.log10(Math.abs(num)) / 3);
    if (i === 0) return num.toString();
    const scaledNum = (num / Math.pow(10, i * 3));
    const formattedNum = scaledNum.toFixed(1).replace(/\.0$/, '');
    return `${formattedNum}${suffixes[i]}`;
};

/**
 * Checks if a string is a valid URL.
 * @param {string} url - The string to check.
 * @returns {boolean} True if the string is a URL, false otherwise.
 */
const isUrl = (url) => {
    return /https?:\/\/(www\.)?[-a-zA-Z0-9@:%.+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%+.~#?&/=]*)/.test(url);
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
 * Converts seconds into a compact d/h/m/s format.
 * @param {number} seconds - The duration in seconds.
 * @returns {string} The formatted runtime string.
 */
const runtime = (seconds) => {
    seconds = Math.floor(seconds);
    const d = Math.floor(seconds / (3600 * 24));
    seconds %= (3600 * 24);
    const h = Math.floor(seconds / 3600);
    seconds %= 3600;
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);

    if (d > 0) return `${d}d ${h}h ${m}m ${s}s`;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
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
 * @returns {Promise<object|null>} The JSON data or null on error.
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
        console.error(error);
        return null;
    }
};

/**
 * Saves or updates a key-value pair in the ./config.env file.
 * @param {string} key - The configuration key to save.
 * @param {string} value - The value to associate with the key.
 */
const saveConfig = (key, value) => {
    let lines = fs.existsSync(path) ? fs.readFileSync(path, 'utf8').split('\n') : [];
    let keyExists = false;
    
    lines = lines.map(line => {
        if (line.startsWith(`${key}=`)) {
            keyExists = true;
            return `${key}=${value}`;
        }
        return line;
    });

    if (!keyExists) {
        lines.push(`${key}=${value}`);
    }

    fs.writeFileSync(path, lines.join('\n'), 'utf8');
    // Reload the environment variables after modification
    dotenv.config({ path });
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
    fetchJson,
    saveConfig,
    empiretourl
};
