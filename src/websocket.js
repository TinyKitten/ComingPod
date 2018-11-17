import WebSocket from 'ws';

class WebSocketClient {
  constructor() {
    this.number = 0; // Message number
    this.autoReconnectInterval = 5 * 1000; // ms
  }

  open(url, opts) {
    this.url = url;
    this.opts = opts;
    this.instance = new WebSocket(this.url, opts);
    this.instance.on('open', () => {
      this.onopen();
    });
    this.instance.on('message', (data, flags) => {
      this.number += 1;
      this.onmessage(data, flags, this.number);
    });
    this.instance.on('close', (e) => {
      switch (e.code) {
        case 1000: // CLOSE_NORMAL
          console.log('WebSocket: closed');
          break;
        default: // Abnormal closure
          this.reconnect(e);
          break;
      }
      this.onclose(e);
    });
    this.instance.on('error', (e) => {
      switch (e.code) {
        case 'ECONNREFUSED':
          this.reconnect(e);
          break;
        default:
          this.onerror(e);
          break;
      }
    });
  }

  send(data, option) {
    try {
      this.instance.send(data, option);
    } catch (e) {
      this.instance.emit('error', e);
    }
  }

  reconnect(e) {
    console.log(`WebSocketClient: retry in ${this.autoReconnectInterval}ms`, e);
    this.instance.removeAllListeners();

    setTimeout(() => {
      console.log('WebSocketClient: reconnecting...');
      this.open(this.url, this.opts);
    }, this.autoReconnectInterval);
  }

  // eslint-disable-next-line class-methods-use-this
  onopen(e) {
    console.log('WebSocketClient: open', e);
  }

  // eslint-disable-next-line class-methods-use-this
  onmessage(data, flags, number) {
    console.log('WebSocketClient: message', data, flags, number);
  }

  // eslint-disable-next-line class-methods-use-this
  onerror(e) {
    console.log('WebSocketClient: error', e);
  }

  // eslint-disable-next-line class-methods-use-this
  onclose(e) {
    console.log('WebSocketClient: closed', e);
  }
}

export default WebSocketClient;
