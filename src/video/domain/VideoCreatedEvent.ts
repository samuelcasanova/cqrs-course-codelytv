import { type Event } from '../../shared/domain/Event'

export class VideoCreatedEvent implements Event {
  public created = new Date()
  constructor (public readonly id: string, public readonly title: string) { }
}