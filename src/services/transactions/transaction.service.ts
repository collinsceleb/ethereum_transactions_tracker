import axios, { AxiosRequestConfig } from "axios";
import { RpcConnectionManager } from "../../connection-manager/rpcConnectionManager";
import { HttpException } from "../../exceptions/HttpException";
import { Transaction } from "../../entity/Transaction";
import { AppDataSource } from "../../data-source";

class TransactionService {
  private rpcEndpoints = ['https://eth.public-rpc.com'];

  private rpcConnectionManager = new RpcConnectionManager(this.rpcEndpoints);

  async getEthBlockNumber() {
    const payload = {
      jsonrpc: '2.0',
      method: 'eth_blockNumber',
      params: [],
      id: 1,
    };

    // Periodic health check
    setInterval(async () => {
      await this.rpcConnectionManager.healthCheck();
    }, 60000); // every 60 seconds

    try {
      const ethBlockNumber = await this.rpcConnectionManager.makeRequest('', 'POST', payload);
      return ethBlockNumber
      console.log('ethBlockNumber:', ethBlockNumber);
    } catch (error) {
      throw new HttpException(400, 'No data returned');
      // console.error('Error:', error);
    }
  }

  async getEthBlockByNumber() {
    const getBlockNumber = await this.getEthBlockNumber();
    const blockNumber = getBlockNumber.result
    console.log('getBlockNumber:', blockNumber);


    const payload = {
      jsonrpc: '2.0',
      method: 'eth_getBlockByNumber',
      params: [blockNumber, true],
      id: 1,
    };

    // Periodic health check
    setInterval(async () => {
      await this.rpcConnectionManager.healthCheck();
    }, 60000); // every 60 seconds

    try {
      const ethBlockNumber = await this.rpcConnectionManager.makeRequest('', 'POST', payload);
      const ethBlockNumberResponseData = JSON.stringify(ethBlockNumber);
      const parseData = JSON.parse(ethBlockNumberResponseData);
      const transactionsData = ethBlockNumber.result.transactions;
       for (let index = 0; index < transactionsData.length; index++) {
         console.log('sender: ', parseData.result.transactions[index]['from']);
         const transaction = new Transaction()
         transaction.sender = parseData.result.transactions[index]['from'];
         transaction.receiver = parseData.result.transactions[index]['to'];
         transaction.blockHash = parseData.result.transactions[index]['blockHash'];
         transaction.blockNumber = parseData.result.transactions[index]['blockNumber'];
         transaction.gasPrice = parseInt(parseData.result.transactions[index]['gasPrice'], 16).toString();
         transaction.value = parseInt(parseData.result.transactions[index]['value'], 16).toString();
          transaction.transactionHash = parseData.result.transactions[index]['hash'];
         await AppDataSource.manager.save(transaction)
       }
      // console.log('parseData:', parseData);
    } catch (error) {
      throw new HttpException(400, 'No data returned');
      // console.error('Error:', error);
    }
  }
}

export default TransactionService
