import { traderResponse } from './trader-response.interface';

export interface stallResponde {
  id: string;
  number: number;
  area: string;
  location: string;
  floor: number;
  market: marketProps;
  trader?: traderResponse;
  category: categoryProps;
  taxZone: taxZone;
}

interface categoryProps {
  id: number;
  name: string;
}

interface marketProps {
  id: number;
  name: string;
}

interface taxZone {
  id: number;
  name: string;
}
