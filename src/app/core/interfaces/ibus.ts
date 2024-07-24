export interface Ibus {
    _id ?: string;
    busNumber : string;
    departure : string;
    departureTime : string;
    destination : string;
    TotalSeat : number;
    charge : number;
    route :[{
     previousStation : string;
     currentStation : string;
     distance : number;
    }]
}
