export interface Ibus {
    _id ?: string;
    busNumber : string;
    departure : string;
    departureTime : string;
    destination : string;
    TotalSeat : number;
    charge : number;
    route : string;
    stops :[{
     station : string;
     distance : number;
     arrivalTime : string;
     stationName ? : string
    }]
}
