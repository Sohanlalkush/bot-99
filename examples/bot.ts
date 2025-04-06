// index.ts
import { BaileysClass } from '../lib/baileys.js';
import QRCode from 'qrcode';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import { ensureSessionDir, restoreSessionsFromDB, backupDb } from '../sessionHandler';

const sessionsDir = path.resolve('./bot_sessions');
const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  next();
});

let status = 'disconnected';
let qrCodeSvg = '';
let botBaileys: BaileysClass;

// 👇 move bot logic to a function
async function startBot() {
  botBaileys = new BaileysClass({});

  botBaileys.on('auth_failure', (error: any) => console.log("ERROR BOT: ", error));

  botBaileys.on('qr', (qr: string) => {
    QRCode.toDataURL(qr, (err, url) => {
      if (err) throw err;
      console.log("NEW QR CODE: ", url);
    });

    QRCode.toString(qr, { type: 'svg' }).then(svg => {
      qrCodeSvg = svg;
      status = 'waiting for scan';
    });
  });

  botBaileys.on('ready', () => {
    console.log('READY BOT');
    status = 'connected';
    qrCodeSvg = '';
    setTimeout(() => {
      backupDb(sessionsDir);
    }, 10000); // 10000 milliseconds = 10 seconds
  });

  let awaitingResponse = false;

  botBaileys.on('message', async (message: any) => {
    console.log(message);

    if (!awaitingResponse) {
      await botBaileys.sendPoll(message.from, 'Welcome to Pharmalite! Please choose a service or type the corresponding number:\n\n ' +
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
        case '1️⃣ e-learning':
          await botBaileys.sendText(message.from,
            '*Pharmalite E-learning:*\n' +
            'Explore a range of resources tailored for B Pharma students:\n\n' +
            '- *B Pharma Books*: https://www.pharmalite.in/p/b-pharma-books.html\n' +
            '- *B Pharma Video Lectures*: https://www.pharmalite.in/p/select-sem.html?fn=video-lecture\n' +
            '- *B Pharma Syllabus*: https://www.pharmalite.in/p/select-sem.html?fn=syllabus\n\n' +
            'Type *0* to go back to the main menu.'
          );
          break;
        case '2':
        case '2️⃣ blog':
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
}

// ✅ Connect Mongo first, then run `startBot`
  mongoose.connect(process.env.MONGO_URI!)
  .then(async () => {
    console.log('MongoDB connected');
    await ensureSessionDir(sessionsDir);
    await restoreSessionsFromDB(sessionsDir);

    await startBot(); // 👈 Only now start the bot
  })
  .catch((err: unknown) => {
    console.error('MongoDB connection failed:', err);
    process.exit(1);
  });

// ✅ REST API endpoints
app.get('/status', (req, res) => {
  res.send(`<h1>Status: ${status}</h1>${qrCodeSvg}`);
});

app.post('/cnnel', async (req, res) => {
  const { receiver, message } = req.body;

  if (!receiver || !message) {
    return res.status(400).json({ error: 'Invalid request format. Please provide receiver and message.' });
  }

  try {
    await botBaileys.sendText(receiver, message);
    res.status(200).json({ success: 'Message sent successfully.' });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
