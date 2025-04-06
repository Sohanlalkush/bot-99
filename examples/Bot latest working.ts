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

let awaitingResponse = false;

botBaileys.on('message', async (message) => {
    console.log(message);

    if (!awaitingResponse) {
        // Send the custom poll with service options
        await botBaileys.sendPoll(message.from, 'Welcome to Pharmalite! Please choose a service or typing the corresponding number:\n\n ' +
            'Type *0* at any time to go back to the main menu.',
            {
                options: ['1️⃣ E-learning', '2️⃣ Blog', '3️⃣ Pharma Jobs', '4️⃣ Pharmalite AI', '5️⃣ GPAT Help (Sponsored)', '6️⃣ YouTube', '7️⃣ Social Media'],
                multiselect: false
            }
        );
        awaitingResponse = true;
    } else {
        const command = message.body.toLowerCase().trim();
        switch (command) {
            case '1':
                case'1️⃣ e-learning':
                await botBaileys.sendText(message.from,
                    '*Pharmalite E-learning:*\n' +
                    'Explore a range of resources tailored for B Pharma students:\n\n' +
                    '- *B Pharma Books*: https://www.pharmalite.in/p/b-pharma-books.html\n' +
                    '- *B Pharma Video Lectures*: https://www.pharmalite.in/p/select-sem.html?fn=video-lecture\n' +
                    '- *B Pharma Syllabus*: https://www.pharmalite.in/p/select-sem.html?fn=syllabus\n\n' +
                    'Type *0* to go back to the main menu.'
                );
                break;
            case '2️⃣ blog':
            case '2':
                await botBaileys.sendText(message.from,
                    '*Pharmalite Blog:*\n' +
                    'Stay updated with the latest insights and news in the pharma industry:\n' +
                    '- *Visit the Blog*: https://blog.pharmalite.in\n\n' +
                    'Type *0* to go back to the main menu.'
                );
                break;
            case '3':
            case '3️⃣ pharma jobs':
                await botBaileys.sendText(message.from,
                    '*Pharma Jobs:*\n' +
                    'Looking for your next opportunity in the pharma industry? Check out the latest job openings:\n' +
                    '- *Browse Jobs*: https://jobs.pharmalite.in\n\n' +
                    'Type *0* to go back to the main menu.'
                );
                break;
            case '4':
            case '4️⃣ pharmalite ai':
                await botBaileys.sendText(message.from,
                    '*Pharmalite AI:*\n' +
                    'Experience AI-driven solutions for your education and career needs:\n' +
                    '- *Explore AI Solutions*: https://ai.pharmalite.in\n\n' +
                    'Type *0* to go back to the main menu.'
                );
                break;
            case '5':
            case '5️⃣ gpat help (Sponsored)':
                await botBaileys.sendText(message.from,
                    '*GPAT Help (Sponsored):*\n' +
                    'Preparing for GPAT? Get valuable study materials and support:\n' +
                    '- *Join GPAT Help*: https://t.me/blackApps_bot\n\n' +
                    'Type *0* to go back to the main menu.'
                );
                break;
            case '6':
            case '6️⃣ youtube':
                await botBaileys.sendText(message.from,
                    '*Pharmalite YouTube:*\n' +
                    'Watch educational videos and tutorials to enhance your knowledge:\n' +
                    '- *Watch Now*: https://youtube.com/@pharmalite\n\n' +
                    'Type *0* to go back to the main menu.'
                );
                break;
            case '7':
            case '7️⃣ social media':
                await botBaileys.sendText(message.from,
                    '*Pharmalite Social Media:*\n' +
                    'Stay connected with Pharmalite across all major social media platforms:\n\n' +
                    '- *Instagram*: https://instagram.com/pharmalite.in/\n' +
                    '- *LinkedIn*: https://www.linkedin.com/company/pharmalite-in\n' +
                    '- *Twitter*: https://twitter.com/pharmalite_in\n' +
                    '- *Facebook*: https://facebook.com/pharmalite.in/\n' +
                    '- *WhatsApp*: https://whatsapp.com/channel/0029Vaehs87AzNc3KC94uT3d\n' +
                    '- *Telegram*: https://PharmaLite.t.me/\n\n' +
                    'Type *0* to go back to the main menu.'
                );
                break;
            case '0':
                // Reset the state and go back to the main menu
                awaitingResponse = false;
                await botBaileys.sendText(message.from,
                    'Welcome back to the main menu. Please choose a service by typing the corresponding number.'
                );
                break;
            default:
                await botBaileys.sendText(message.from,
                    'Sorry, I did not understand that command. Please select an option from the poll or type *0* to go back to the main menu.'
                );
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