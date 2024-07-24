import { IbookingSeat } from "./ibooking-seat";

export interface IbookingSeatgetApiResponse {
  message: string;
  data : IbookingSeat | IbookingSeat[];
}
