import axios from 'axios';
import * as cheerio from 'cheerio';
import xml2js from 'xml2js';

import User from '../models/User.js';
import Guess from '../models/Guess.js';
import Prediction from '../models/Prediction.js';

const RSS_URL = 'https://www.minhngoc.net.vn/ket-qua-xo-so/dien-toan-vietlott/mega-6x45.html';

export const createUser = async (req, res) => {
  try {
    const { id } = req.body;
    
    if (!id) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    // Check if user already exists
    const existingUser = await User.findByPk(id);
    
    if (existingUser) {
      return res.status(200).json(existingUser);
    }
    
    // Create new user
    const newUser = await User.create({ id });
    return res.status(201).json(newUser);
  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).json({ message: 'Failed to create user', error: error.message });
  }
};

export const fetchRSSFeed = async (req, res) => {
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

    // console.log('Highest jackpot value:', highestJackpot);

    // Format the number with commas and đ symbol
    const formattedJackpot = highestJackpot.toLocaleString('en-US') + 'đ';

    const jackpotDate = $('#DT6X45_NGAY_QUAY_THUONG').text().trim();
    // console.log('Jackpot date:', jackpotDate);

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

export const fetchLotteryResults = async (req, res) => {
  try {
    const response = await axios.get(RSS_URL, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    const $ = cheerio.load(response.data);

    const lotteryDetails = [];

    // Extract ticket turn and draw date, ensure uniqueness, and sort descending
    $('td:contains("Kỳ vé")').each((index, element) => {
      const ticketTurn = $(element).find('#DT6X45_KY_VE').text().trim().split('#')[1]; // Extract the number after '#'
      const dateTextMatch = $(element).text().match(/Ngày quay thưởng\s*([\d/]+)/);
      const drawDate = dateTextMatch ? dateTextMatch[1].trim() : null;

      if (ticketTurn && drawDate) {
        if (!lotteryDetails.some(detail => detail.ticketTurn === ticketTurn)) {
          lotteryDetails.push({
            ticketTurn,
            drawDate,
          });
        }
      }
    });

    // Sort the ticket turns in descending order
    lotteryDetails.sort((a, b) => parseInt(b.ticketTurn) - parseInt(a.ticketTurn));

    // Retrieve only the 5 latest results
    const latestLotteryDetails = lotteryDetails.slice(0, 5);

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
    const lotteryData = latestLotteryDetails.map((detail, index) => ({
      ticketTurn: detail.ticketTurn,
      drawDate: detail.drawDate,
      resultNumbers: trimmedResultNumbers[index] || [],
      jackpotValue: jackpotValues[index]?.trim() || null,
    }));

    // console.log('Result number: ', resultNumbers);
    // console.log('Jackpot value: ', jackpotValues);

    // Send structured data as the response
    res.json(lotteryData);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch lottery results' });
  }
};

export const fetchPowerResults = async (req, res) => {
  try {
    const response = await axios.get('https://www.minhngoc.net.vn/ket-qua-xo-so/dien-toan-vietlott/power-6x55.html', {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    const $ = cheerio.load(response.data);

    const lotteryDetails = [];

    // Extract ticket turn and draw date, ensure uniqueness, and sort descending
    $('td:contains("Kỳ vé")').each((index, element) => {
      const ticketTurn = $(element).find('#DT6X45_KY_VE').text().trim().split('#')[1];
      const dateTextMatch = $(element).text().match(/Ngày quay thưởng\s*([\d/]+)/);
      const drawDate = dateTextMatch ? dateTextMatch[1].trim() : null;

      if (ticketTurn && drawDate) {
        if (!lotteryDetails.some(detail => detail.ticketTurn === ticketTurn)) {
          lotteryDetails.push({
            ticketTurn,
            drawDate,
          });
        }
      }
    });

    lotteryDetails.sort((a, b) => parseInt(b.ticketTurn) - parseInt(a.ticketTurn));
    const latestLotteryDetails = lotteryDetails.slice(0, 5);

    // Fetch Jackpot 1 and Jackpot 2 values
    const jackpot1Values = $('#DT6X55_G_JACKPOT')
      .text()
      .trim()
      .split('đ')
      .filter(Boolean)
      .map((value) => value + 'đ')
      .slice(0, 5);

    const jackpot2Values = $('#DT6X55_G_JACKPOT2')
      .text()
      .trim()
      .split('đ')
      .filter(Boolean)
      .map((value) => value + 'đ')
      .slice(0, 5);

    const resultNumbers = [];
    $('.result-number').each((index, element) => {
      const numbers = [];
      $(element)
        .find('li:not(.number_special) div')
        .each((i, numberElement) => {
          const number = $(numberElement).text().trim();
          if (number) {
            numbers.push(number);
          }
        });

      const specialNumber = $(element).find('.number_special div').text().trim();

      if (numbers.length === 6 && specialNumber) {
        resultNumbers.push({
          regularNumbers: numbers,
          specialNumber: specialNumber,
        });
      }
    });

    const trimmedResultNumbers = resultNumbers.slice(0, 5);

    const lotteryData = latestLotteryDetails.map((detail, index) => ({
      ticketTurn: detail.ticketTurn,
      drawDate: detail.drawDate,
      resultNumbers: trimmedResultNumbers[index]?.regularNumbers || [],
      specialNumber: trimmedResultNumbers[index]?.specialNumber || null,
      jackpot1Value: jackpot1Values[index]?.trim() || null,
      jackpot2Value: jackpot2Values[index]?.trim() || null,
    }));

    res.json(lotteryData);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch lottery results' });
  }
};


export const fetchNews = async () => {
  try {
    const url = 'https://vnexpress.net/tag/vietlott-780047'; 
    const response = await axios.get(url); 
    
    if (response.status === 200) {
      const data = response.data;
      const $ = cheerio.load(data); 
      
      const newsItems = [];
      $('.item-news.item-news-common').each((index, element) => {
        const titleElement = $(element).find('.title-news a');
        const descriptionElement = $(element).find('.description a');
        const imageElement = $(element).find('.thumb-art a img');
        
        const title = titleElement.attr('title') || titleElement.text();
        const link = titleElement.attr('href');
        const description = descriptionElement.text();
        
        let imageUrl = imageElement.data('src') || imageElement.attr('src');
        
        // If there's no 'src', check if 'data-src' exists and assign it to 'imageUrl'
        if (!imageUrl && imageElement.data('src')) {
          imageUrl = imageElement.data('src');
        }
        
        if (title && link && description && imageUrl) { // Ensure all data is valid
          newsItems.push({ title, link, description, imageUrl });
        }
      });
      return newsItems; // Return the news items
    } else {
      throw new Error(`Failed to fetch news. Status code: ${response.status}`);
    }
  } catch (error) {
    console.error('Error fetching news:', error);
    return []; // Return an empty array if error occurs
  }
};

export const saveGuess = async (req, res) => {
  const {userId, ticketType, ticketTurn, numbers} = req.body;

  if(!ticketType || !numbers || numbers.length === 0){
    return res.status(400).json({message: 'Ticket type and at least 1 number are required'})
  }

  try {
    const newGuess = await Guess.create({
      userId,
      ticketType, 
      ticketTurn,
      numbers,
    });

    res.status(201).json({message: 'Guess saved successfully'})
  } catch (error) {
    console.error('Error saving guess: ', error);
    console.log(error)
    res.status(500).json({message: 'Error saving guess'})
  }
}

export const getGuesses = async (req, res) => {
  const { userId, ticketType, ticketTurn } = req.query;
    console.log('Ticket type received:', ticketType);  // Should log 'megaSmall'
    console.log('Ticket turn received:', ticketTurn);  // Should log '01305'

    try {
        // Fetch guesses from the database based on ticketType and ticketTurn
        const guesses = await Guess.findAll({
            where: {
                userId,
                ticketType: ticketType,
                ticketTurn: ticketTurn
            },
            order: [['createdAt', 'DESC']],  // Sort guesses by creation date
            limit: 1
        });

        if (guesses.length > 0) {
            return res.status(200).json(guesses);
        } else {
            return res.status(200).json([]);  // Return empty array if no guesses
        }
    } catch (error) {
        console.error('Error fetching guesses:', error);
        console.log(error)
        return res.status(500).json({ message: 'Error fetching guesses' });
    }
};

export const getAllGuessesByType = async (req, res) => {
  const { ticketType } = req.query;
  console.log('Ticket type received:', ticketType);  // Should log the ticket type provided

  try {
    // Fetch all guesses from the database based on ticketType
    const guesses = await Guess.findAll({
      where: {
        ticketType: ticketType
      },
      order: [['createdAt', 'DESC']]  // Sort guesses by creation date
    });

    if (guesses.length > 0) {
      return res.status(200).json(guesses);
    } else {
      return res.status(200).json([]);  // Return empty array if no guesses found
    }
  } catch (error) {
    console.error('Error fetching all guesses by ticket type:', error);
    return res.status(500).json({ message: 'Error fetching guesses' });
  }
};


export const savePrediction = async (req, res) => {
  const { userId, ticketType, ticketTurn, predictedNumbers } = req.body;

  if (!ticketType || !predictedNumbers || predictedNumbers.length === 0) {
      return res.status(400).json({ message: 'Ticket type and at least 1 predicted number are required' });
  }

  try {
      await Prediction.create({
          userId,
          ticketType,
          ticketTurn,
          predictedNumbers,
      });

      res.status(201).json({ message: 'Prediction saved successfully' });
  } catch (error) {
      console.error('Error saving prediction: ', error);
      res.status(500).json({ message: 'Error saving prediction' });
  }
};

export const getPredictionHistory = async (req, res) => {
  const { ticketType } = req.query; 
  console.log('Ticket type received:', ticketType);

  try {
      // If ticketType is provided, filter predictions by it, else fetch all predictions
      const whereClause = ticketType ? { ticketType } : {};

      // Fetch predictions from the database
      const predictions = await Prediction.findAll({
          where: whereClause,
          order: [
              ['ticketTurn', 'DESC'],
              ['id', 'DESC']  // For multiple predictions of the same turn, get the latest
          ]
      });

      if (!predictions || predictions.length === 0) {
          return res.status(404).json({ message: 'No predictions found' });
      }

      res.status(200).json(predictions);

  } catch (error) {
      console.error('Error fetching prediction history: ', error);
      res.status(500).json({ message: 'Error fetching prediction history' });
  }
};

