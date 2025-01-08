const axios = require('axios');
const cheerio = require('cheerio');
const xml2js = require('xml2js');

const RSS_URL = 'https://www.minhngoc.net.vn/ket-qua-xo-so/dien-toan-vietlott.html';

const fetchRSSFeed = async (req, res) => {
  try {
    const response = await axios.get(RSS_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const $ = cheerio.load(response.data);

    // Find all jackpot elements and get the highest value
    let highestJackpot = 0;
    $('*[id*="DT6X45_G_JACKPOT"]').each((index, element) => {
      const value = $(element).text().trim();
      const numericValue = parseInt(value.replace(/[^0-9]/g, ''));
      if (numericValue > highestJackpot) {
        highestJackpot = numericValue;
      }
    });

    console.log('Highest jackpot value:', highestJackpot);

    // Format the number with commas and đ symbol
    const formattedJackpot = highestJackpot.toLocaleString('en-US') + 'đ';

    const jackpotDate = $('#DT6X45_NGAY_QUAY_THUONG').text().trim();
    console.log('Jackpot date:', jackpotDate);

    const rssFeed = {
      rss: {
        $: { version: '2.0' },
        channel: [{
          title: ['Vietlott Jackpot'],
          link: [RSS_URL],
          description: ['Latest Vietlott Jackpot Value'],
          item: [{
            title: ['Current Jackpot'],
            description: [`Jackpot Value: ${formattedJackpot}\nDraw Date: ${jackpotDate}`],
            pubDate: [new Date().toUTCString()]
          }]
        }]
      }
    };

    const builder = new xml2js.Builder();
    const xml = builder.buildObject(rssFeed);
    res.header('Content-Type', 'application/rss+xml');
    res.send(xml);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error generating RSS feed');
  }
};

const fetchLotteryResults = async (req, res) => {
  try {
    const response = await axios.get(RSS_URL, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    const $ = cheerio.load(response.data);

    // Fetch ticket turns and associated dates
    let lotteryDetails = [];
    $('td:contains("Kỳ vé")').each((index, element) => {
      // Extract ticket turn and draw date
      const ticketTurn = $(element).find('#DT6X45_KY_VE').text().trim().split('#')[1]; // Extract the number after '#'
      const dateText = $(element).text().split('Ngày quay thưởng')[1]?.trim(); // Extract the date part

      if (ticketTurn && dateText) {
        lotteryDetails.push({
          ticketTurn,
          drawDate: dateText,
        });
      }
    });

    // Sort ticket turns in descending order (latest first)
    lotteryDetails = lotteryDetails
      .sort((a, b) => b.ticketTurn.localeCompare(a.ticketTurn)) // Sort by ticket turn number (descending)
      .slice(0, 5); // Take only the top 5 most recent tickets

    // Log the sorted results for debugging
    console.log('Sorted Lottery Details (Ticket Turn & Date):', lotteryDetails);

    // Fetch jackpot values
    const jackpotValues = $('#DT6X45_G_JACKPOT')
      .text()
      .trim()
      .split('đ')
      .filter(Boolean)
      .map((value) => value + 'đ')
      .slice(0, 5);

    // Fetch result numbers for each ticket turn
    const resultNumbers = [];
    $('.result-number').each((index, element) => {
      const numbers = [];
      $(element)
        .find('div')
        .each((i, numberElement) => {
          const number = $(numberElement).text().trim();
          if (number) {
            numbers.push(number);
          }
        });
      if (numbers.length === 6) {
        resultNumbers.push(numbers);
      }
    });

    // Trim result numbers to match the first 5 ticket turns
    const trimmedResultNumbers = resultNumbers.slice(0, 5);

    // Combine data into a structured array
    const lotteryData = lotteryDetails.map((detail, index) => ({
      ticketTurn: detail.ticketTurn,
      drawDate: detail.drawDate,
      resultNumbers: trimmedResultNumbers[index] || [],
      jackpotValue: jackpotValues[index]?.trim() || null,
    }));

    // Send structured data as the response
    res.json(lotteryData);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch lottery results' });
  }
};

module.exports = { fetchRSSFeed, fetchLotteryResults };
