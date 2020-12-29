//////////////Summary data///////////////////////////////////////
export class SummaryData{
    Global: GlobalData | undefined;
    Countries: Array<CountryData> | undefined;
    Date: Date | undefined;
}

export class GlobalData{
    NewConfirmed: number | undefined;
    TotalConfirmed: number | undefined;
    NewDeaths: number | undefined;
    TotalDeaths: number | undefined;
    NewRecovered: number | undefined;
    TotalRecovered: number | undefined;
}

export class CountryData extends GlobalData {
    Country: any | undefined;
    CountryCode: string | undefined;
    Slug: string | undefined;
    Date: String;
}

////////////////////Day One////////////////////////////////////

export class DayOneData{
    CountryDayOneData: Array<CountryDayData> | undefined;
}

export class CountryDayData{
    Country: string | undefined;
    Confirmed: number | undefined;
    Deaths: number;
    Recovered: number | undefined;
    Date: String;
}

////////////////////World Data/////////////////////////////////////////////

export class WorldData{
    WorldDailyData: Array<WorldDayData> | undefined;
}

export class WorldDayData{
    NewConfirmed: number;
    TotalConfirmed: number;
    NewDeaths: number;
    TotalDeaths: number;
    NewRecovered: number;
    TotalRecovered: number;
}