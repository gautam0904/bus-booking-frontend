export interface Iroute {
    _id : string;
    routeName: string;
    departure? : string;
    destination? : string;
    stations: [{
        station: string;
        order: string;
        distance: number;
    }];
}