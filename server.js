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

    let validUsers = response.data.results.filter(user => user.wagered && user.avatar && user.username);

    // Fill up with dummy users if there are fewer than 10
    while (validUsers.length < 10) {
      validUsers.push({
        username: "-",
        avatar: "questionmark.jpg",
        wagered: 0,
        prize: "None",
      });
    }

    // Sort the valid users by 'wagered' in descending order
    validUsers = validUsers.sort((a, b) => b.wagered - a.wagered);

    // Add prizes based on the place
    validUsers = validUsers.map((user, index) => {
      switch (index) {
        case 0:
          user.prize = 500;
          break;
        case 1:
          user.prize = 250;
          break;
        case 2:
          user.prize = 125;
          break;
        case 3:
          user.prize = 75;
          break;
        case 4:
          user.prize = 50;
          break;
        default:
          user.prize = 0;
          break;
      }
      return user;
    });

    // Limit the results to top 10 users (already done with filler users)
    const topUsers = validUsers.slice(0, 10);

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
