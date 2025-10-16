import { IsNumber, IsPositive } from 'class-validator';

export enum WalletCategory {
  JUNIOR = 'JUNIOR',
  MID = 'MID',
  SENIOR = 'SENIOR'
}

export class WalletTopUpDto {
  @IsNumber()
  @IsPositive()
  amount!: number;
}
