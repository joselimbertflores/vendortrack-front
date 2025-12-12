import { Trader } from './trader.model';

interface stallProps {
  id: string;
  number: number;
  area: string;
  location?: string;
  floor: number;
  market: string;
  category: string;
  taxZone: string;
  trader?: Trader;
}
export class Stall {
  id: string;
  number: number;
  area: string;
  location?: string;
  floor: number;
  market: string;
  category: string;
  taxZone: string;
  trader?: Trader;
  constructor({
    id,
    number,
    area,
    location,
    market,
    trader,
    category,
    taxZone,
    floor,
  }: stallProps) {
    this.id = id;
    this.number = number;
    this.area = area;
    this.location = location;
    this.market = market;
    this.trader = trader;
    this.category = category;
    this.taxZone = taxZone;
    this.floor = floor;
  }
}
