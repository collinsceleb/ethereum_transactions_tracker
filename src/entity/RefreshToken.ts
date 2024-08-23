import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User";
import { Device } from "./Device";

@Entity()
export class RefreshToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  token: string;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @OneToOne(() => Device)
  @JoinColumn()
  device: Device;

  @Column({ default: false })
  isActive: boolean;

  @Column({ default: false })
  isRevoked: boolean;

  @Column( { default: new Date() })
  expiresAt: Date;
}

