import { Iuser } from "./iuser";

export interface IuserGetApiResponse {
    message : string;
    data : Iuser[] | Iuser
}
