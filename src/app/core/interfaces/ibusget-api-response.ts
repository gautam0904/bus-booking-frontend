import { Ibus } from "./ibus";

export interface IbusgetApiResponse {
    message : string;
    data : Ibus[] | Ibus
}
