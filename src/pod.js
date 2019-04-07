import '@babel/polyfill';
import OpenJTalk from 'openjtalk';
import dotenv from 'dotenv';
import PlaySound from 'play-sound';
import WebSocketClient from './websocket';

const player = PlaySound({});
const mei = new OpenJTalk();

dotenv.config();

console.log('Launched');

const talkAsync = sentence => new Promise((resolve, reject) => {
  mei.talk(sentence, (err) => {
    if (err) {
      return reject(err);
    }
    return resolve();
  });
});

const playAsync = path => new Promise((resolve, reject) => {
  player.play(path, (err) => {
    if (err) {
      return reject(err);
    }
    return resolve();
  });
});

const sleep = msec => new Promise((resolve) => {
  setTimeout(() => resolve(), msec);
});

const onApproaching = async (code) => {
  const text = `${code}はこのポッドに接近中です。`;
  console.log(text);
  await talkAsync(text).catch(console.error);
  await sleep(process.env.APPROACHING_BEFORE_SLEEP_MSEC);
  await playAsync('./assets/enter.mp3').catch(console.error);
};

const onLeaved = async (code) => {
  const text = `${code}はこのポッドから離れました。`;
  console.log(text);
  await talkAsync(text).catch(console.error);
  await sleep(process.env.APPROACHING_BEFORE_SLEEP_MSEC);
  await playAsync('./assets/leave.mp3').catch(console.error);
};

const url = `${process.env.API_ENDPOINT}?token=${process.env.POD_TOKEN}`;

const wsc = new WebSocketClient();

wsc.open(url, {
  origin: 'http://localhost',
});

wsc.onopen = async () => {
  console.log('Coming API connected.');
  await playAsync('./assets/connected.mp3').catch(console.error);
};

wsc.onmessage = (data) => {
  const json = JSON.parse(data);
  switch (json.type) {
    case 'APPROACHING': onApproaching(json.code); break;
    case 'LEAVED': onLeaved(json.code); break;
    default: break;
  }
};
