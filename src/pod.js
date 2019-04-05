import '@babel/polyfill';
import dotenv from 'dotenv';
import say from 'say';
import PlaySound from 'play-sound';
import WebSocketClient from './websocket';

const player = PlaySound({});

dotenv.config();

console.log('Launched');

const sleep = msec => new Promise((resolve) => {
  setTimeout(() => resolve(), msec);
});

const onApproaching = (code) => {
  const text = `${code} is now approaching to this pod.`;
  console.log(text);
  say.speak(text, null, 1.0, async (speakErr) => {
    if (speakErr) {
      console.error(speakErr);
    }
    await sleep(process.env.APPROACHING_BEFORE_SLEEP_MSEC);
    player.play('./assets/enter.mp3', (ringErr) => {
      if (ringErr) {
        console.error(ringErr);
      }
    });
  });
};

const onLeaved = (code) => {
  const text = `${code} is leaved from this pod.`;
  console.log(text);
  say.speak(text, null, 1.0, async (speakErr) => {
    if (speakErr) {
      console.error(speakErr);
    }
    await sleep(process.env.APPROACHING_BEFORE_SLEEP_MSEC);
    player.play('./assets/leave.mp3', (ringErr) => {
      if (ringErr) {
        console.error(ringErr);
      }
    });
  });
};

const url = `${process.env.API_ENDPOINT}?token=${process.env.POD_TOKEN}`;

const wsc = new WebSocketClient();

wsc.open(url, {
  origin: 'http://localhost',
});

wsc.onopen = () => {
  console.log('Coming API connected.');
  const text = 'This pod is connected to server!';
  say.speak(text, null, 1.0, (speakErr) => {
    if (speakErr) {
      console.error(speakErr);
    }
  });
};

wsc.onmessage = (data) => {
  const json = JSON.parse(data);
  switch (json.type) {
    case 'APPROACHING': onApproaching(json.code); break;
    case 'LEAVED': onLeaved(json.code); break;
    default: break;
  }
};
