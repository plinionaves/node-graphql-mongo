import { Card } from '../types'
import { models as db } from '../models'

export class CardsService {
  async create(card: Card) {
    const { firstDigits, lastDigits } = card

    const storedCard = await this.find(
      {
        firstDigits,
        lastDigits,
        user: card.user,
      },
      '_id',
    )

    if (storedCard) {
      return storedCard
    }

    return new db.Card(card).save()
  }

  find(conditions?: Record<string, any>, select?: string) {
    return db.Card.findOne(conditions).select(select)
  }

  findAll(conditions?: Record<string, string>, select?: string) {
    return db.Card.find(conditions).select(select)
  }
}
