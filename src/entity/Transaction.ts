import { Column, Entity, PrimaryGeneratedColumn } from "typeorm"

@Entity()
export class Transaction {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  sender: string;

  @Column()
  receiver: string;

  @Column()
  blockNumber: string;

  @Column()
  blockHash: string;

  @Column()
  transactionHash: string;

  @Column()
  gasPrice: string;

  @Column()
  value: string;
}
