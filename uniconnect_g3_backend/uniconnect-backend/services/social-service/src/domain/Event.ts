export class Event {
  public id?: string;
  public title: string;
  public location: string;
  public date: string;
  public time: string;
  public duration: string;
  public description: string;
  public type: string;
  public imageUrl: string;

  constructor({
    id,
    title,
    location,
    date,
    time,
    duration,
    description,
    type,
    imageUrl,
  }: {
    id?: string;
    title: string;
    location: string;
    date: string;
    time: string;
    duration: string;
    description?: string;
    type: string;
    imageUrl?: string;
  }) {
    this.id = id;
    this.title = title;
    this.location = location;
    this.date = date;
    this.time = time;
    this.duration = duration;
    this.description = description || '';
    this.type = type;
    this.imageUrl = imageUrl || '';
  }
}
