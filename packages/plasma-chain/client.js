const request = require('request-promise');

class PlasmaChainClient {
  constructor(nodeUrl) {
    this.url = nodeUrl;
  }

  async applyTransaction(txRLP) {
    const options = {
      method: 'POST',
      uri: `${this.url}/apply_tx`,
      body: {
        data: txRLP
      },
      json: true
    };

    return request(options);
  }

  async submitBlock(blockRLP) {
    const options = {
      method: 'POST',
      uri: `${this.url}/submit_block`,
      body: {
        data: blockRLP
      },
      json: true
    };

    return request(options);
  }

  async getCurrentBlock() {
    const options = {
      method: 'GET',
      uri: `${this.url}/current_block`      
    };

    return request(options);
  }

  async getBlock(blockNum) {
    const options = {
      method: 'GET',
      uri: `${this.url}/block/${blockNum}`      
    };

    return request(options);
  }

  async getTransaction(blockNum, txIndex) {
    const options = {
      method: 'GET',
      uri: `${this.url}/block/${blockNum}/transaction/${txIndex}`
    };

    return request(options);
  }

  async getCurrentBlockNum() {
    const options = {
      method: 'GET',
      uri: `${this.url}/current_block_num`
    };

    return request(options);
  }  
}

module.exports = PlasmaChainClient;