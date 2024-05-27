import { RpcConnectionManager } from "../../connection-manager/rpcConnectionManager";
import { HttpException } from "../../exceptions/HttpException";
import { Transaction } from "../../entity/Transaction";
import { AppDataSource } from "../../data-source";
import Container, { Service } from "typedi";
import { Event } from "../../common/interfaces/event";
import { EventEmitterService } from "../../eventEmitter";
import { createClient, RedisClientType } from "redis";

Container.set([{id: 'EventEmitterService', value: new EventEmitterService()}]);
@Service()
class TransactionService {
  private rpcEndpoints = ['https://rpc.ankr.com/eth', 'https://eth.llamarpc.com', 'https://ethereum-rpc.publicnode.com'];

  private rpcConnectionManager = new RpcConnectionManager(this.rpcEndpoints);
  private static redisClient: RedisClientType;
  private static cacheKey: string
  static async init() {
    this.redisClient = createClient();
    this.redisClient.on('error', (err: any) => {
      console.error('Redis error:', err);
    });
    await this.redisClient.connect();
  }

  async fetchEthBlockNumber() {
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
      TransactionService.init()
      const ethBlockNumber = await this.rpcConnectionManager.makeRequest('', 'POST', payload);
      TransactionService.cacheKey = "blockNumber"
      TransactionService.redisClient.set(TransactionService.cacheKey, 30, ethBlockNumber);
      return ethBlockNumber;
    } catch (error) {
      throw new HttpException(400, error);
      // console.error('Error:', error);
    }
  }

  async fetchEthBlockByNumber() {
    const getBlockNumber = await this.fetchEthBlockNumber();
    const blockNumber = getBlockNumber.result;

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
      TransactionService.init()
      const transaction = await this.rpcConnectionManager.makeRequest('', 'POST', payload);
      // const ethBlockNumberResponseData = JSON.stringify(ethBlockNumber);
      // const parseData = JSON.parse(ethBlockNumberResponseData);
      TransactionService.cacheKey = 'blockByNumber';
      TransactionService.redisClient.set(TransactionService.cacheKey, 30, transaction);
      const transactionsData = transaction.result.transactions;
      for (let index = 0; index < transactionsData.length; index++) {
        const event: Event = {
          type: 'transaction',
          sender: transactionsData[index]['from'],
          receiver: transactionsData[index]['to'],
          amount: parseInt(transactionsData[index]['value'], 16).toString(),
        };
        console.log(event);

        await EventEmitterService.emitEvent(event);
        // const transaction = new Transaction();
        // transaction.sender = transactionsData[index]['from'];
        // transaction.receiver = transactionsData[index]['to'];
        // transaction.blockHash = transactionsData[index]['blockHash'];
        // transaction.blockNumber = transactionsData[index]['blockNumber'];
        // transaction.gasPrice = parseInt(transactionsData[index]['gasPrice'], 16).toString();
        // transaction.value = parseInt(transactionsData[index]['value'], 16).toString();
        // transaction.transactionHash = transactionsData[index]['hash'];
        // await AppDataSource.manager.save(transaction);
      }
      return transactionsData;
    } catch (error) {
      throw new HttpException(400, error);
      // console.error('Error:', error);
    }
  }
}

export default TransactionService
