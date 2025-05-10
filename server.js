const express = require('express');
const axios = require('axios');
const cors = require('cors'); // Import CORS package

const app = express();
const PORT = 3000;

// Enable CORS for all origins (or specify origins as needed)
app.use(cors()); // This line allows all origins to access your proxy server

// Root route for "/"
app.get('/', (req, res) => {
  res.send('Welcome to the Proxy Server! Use /leaderboard to get data.');
});

// Proxy route for "/leaderboard"
app.get('/leaderboard', async (req, res) => {
  try {
    const response = await axios.get('https://api.rain.gg/v1/affiliates/leaderboard', {
      headers: {
        'x-api-key': '0171fa32-067c-4d60-a296-d0b04862cda8',
        accept: 'application/json',
      },
      params: {
        start_date: '2025-05-10T00:00:00.00Z',
        end_date: '2025-05-24T00:00:00.00Z',
        type: 'wagered',
        code: 'jonji',
      },
    });

    // Log the raw API response for debugging
    console.log("Raw API Response:", response.data.results);

    if (!response.data.results || response.data.results.length === 0) {
      return res.status(404).json({ error: "No leaderboard data found" });
    }

    // Map the fields correctly
    const validUsers = response.data.results.filter(user => user.wagered && user.avatar && user.username);

    // Sort the valid users by 'wagered' in descending order
    const sortedUsers = validUsers.sort((a, b) => b.wagered - a.wagered);

    // Limit the results to top 10 users
    const topUsers = sortedUsers.slice(0, 10);

    console.log("Top Users:", topUsers);

    // Send the top 10 users as response
    res.json({ results: topUsers });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Failed to fetch leaderboard data' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
