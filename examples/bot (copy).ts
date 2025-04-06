import { BaileysClass } from '../lib/baileys.js'; // Import the Baileys class
import QRCode from 'qrcode'; // Import QRCode module
import express from 'express'; // Import express
import bodyParser from 'body-parser'; // Import body-parser
import cors from 'cors'; // Import cors

const app = express(); // Initialize express app
app.use(bodyParser.json()); // Use body-parser middleware to parse JSON requests
app.use(cors()); // Use cors middleware to allow cross-origin requests

app.use((req, res, next) => { 
  res.setHeader('Access-Control-Allow-Origin', '*'); // Set headers to allow any origin
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE'); // Allow certain methods
  next(); // Move to the next middleware
});

const botBaileys = new BaileysClass({}); // Initialize Baileys bot instance

botBaileys.on('auth_failure', async (error) => console.log("ERROR BOT: ", error)); // Handle auth failure event
botBaileys.on('qr', (qr) => {
    QRCode.toDataURL(qr, (err, url) => {
        if (err) throw err;
        console.log("NEW QR CODE: ", url); // Generate QR code and log as URL
    });
});
botBaileys.on('ready', async () => console.log('READY BOT')); // Handle bot ready event

let awaitingResponse = false; // Variable to check if bot is awaiting response

botBaileys.on('message', async (message) => {
    console.log(message);
    if (!awaitingResponse) {
        await botBaileys.sendPoll(message.from, 'Select an option', {
            options: ['text', 'media', 'file', 'sticker','audio'],
            multiselect: false
        });
        awaitingResponse = true;
    } else {
        const command = message.body.toLowerCase().trim();
        switch (command) {
            case 'text':
                await botBaileys.sendText(message.from, 'Hello world ');
                break;
            case 'media':
                await botBaileys.sendMedia(message.from, 'https://www.w3schools.com/w3css/img_lights.jpg', 'Hello world');
                break;
            case 'file':
                await botBaileys.sendFile(message.from, 'https://github.com/pedrazadixon/sample-files/raw/main/sample_pdf.pdf');
                break;
            case 'sticker':
                await botBaileys.sendSticker(message.from, 'https://gifimgs.com/animations/anime/dragon-ball-z/Goku/goku_34.gif', { pack: 'User', author: 'Me' });
                break;
            default:
                await botBaileys.sendText(message.from, 'Sorry, I did not understand that command. Please select an option from the poll.');
                break;
        }
        awaitingResponse = false;
    }
});

let status = 'disconnected'; // Default status
let qrCodeSvg = ''; // Placeholder for QR code SVG

botBaileys.on('qr', async (qr) => {
    qrCodeSvg = await QRCode.toString(qr, { type: 'svg' }); // Generate QR code as SVG
    status = 'waiting for scan';
});

botBaileys.on('ready', () => {
    status = 'connected';
    qrCodeSvg = ''; // Clear QR code once connected
});

app.get('/status', (req, res) => {
    res.send(`<h1>Status: ${status}</h1>${qrCodeSvg}`);
});

app.post('/cnnel', async (req, res) => {
  const { receiver, message } = req.body;

  if (!receiver || !message ) {
    return res.status(400).json({ error: 'Invalid request format. Please provide receiver and message.text.' });
  }
  try {
    await botBaileys.sendText(receiver, message);
    res.status(200).json({ success: 'Message sent successfully.' });
  } 
    catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});