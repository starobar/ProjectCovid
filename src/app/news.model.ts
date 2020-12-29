export class News{
    section: string;
    username: string;
    description: string;
    date: Date;

    constructor(section: string, username: string,
        description: string,
        date: Date){
            this.section = section;
            this.username = username;
            this.description = description;
            this.date = date;
        }
}

