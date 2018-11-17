import dotenv from 'dotenv';
import say from 'say';
import PlaySound from 'play-sound';

import WebSocketClient from './websocket';

const player = PlaySound({});

dotenv.config();

const onApproaching = (code) => {
  const text = `${code} is now approaching to this pod.`;
  console.log(text);
  say.speak(text, 'Alex', 1.0, (speakErr) => {
    if (speakErr) {
      console.error(speakErr);
    }
    player.play('./assets/ring.mp3', (ringErr) => {
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
};

wsc.onmessage = (data) => {
  const json = JSON.parse(data);
  switch (json.type) {
    case 'APPROACHING': onApproaching(json.code); break;
    default: break;
  }
};
