import { Istation } from "./istation";

export interface Iroute {
    _id : string;
    routeName: string;
    departure? : string;
    destination? : string;
    stations: [Istation];

}