import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User";

@Entity('device')
export class Device {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  deviceType: string;

  @Column()
  deviceModel: string;

  @Column()
  deviceVendor: string;

  @Column()
  osName: string;

  @Column()
  osVersion: string;

  @Column()
  browserName: string;

  @Column()
  browserVersion: string;

  @Column()
  userAgent: string;

  @Column()
  uniqueDeviceId: string;

  @Column()
  ip: string;

  @Column()
  country: string;

  @Column()
  city: string;

  @Column()
  latitude: number;

  @Column()
  longitude: number;

  @Column()
  region: string;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;
}
