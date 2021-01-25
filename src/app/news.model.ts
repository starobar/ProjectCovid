export class News{
    section: string;
    countryName: string;
    username: string;
    description: string;
    date: any;

    constructor(section: string, countryName: string, username: string,
        description: string,
        date: any){
            this.section = section;
            this.countryName = countryName;
            this.username = username;
            this.description = description;
            this.date = date;
        }
}

