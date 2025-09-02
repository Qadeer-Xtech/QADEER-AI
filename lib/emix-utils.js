const axios = require('axios');

async function fetchEmix(emoji1, emoji2) {
    try {
        // Validate that two emojis are provided.
        if (!emoji1 || !emoji2) {
            throw new Error("Invalid emoji input. Please provide two emojis.");
        }

        // Construct the API URL with the encoded emojis.
        const apiUrl = `https://levanter.onrender.com/emix?q=${encodeURIComponent(emoji1)},${encodeURIComponent(emoji2)}`;

        // Make a GET request to the API.
        const response = await axios.get(apiUrl);

        // Check if the response contains the expected data structure.
        if (response.data && response.data.result) {
            return response.data.result; // Return the image URL
        } else {
            throw new Error("No valid image found in API response.");
        }
    } catch (error) {
        // Log the detailed error and throw a user-friendly error message.
        console.error("Error fetching emoji mix:", error.message);
        throw new Error("Failed to fetch emoji mix.");
    }
}

// Export the function for use in other modules.
module.exports = {
    fetchEmix
};
