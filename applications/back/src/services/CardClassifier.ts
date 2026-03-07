export enum CardCategory {
  THREAT = 'THREAT',           
  LAND = 'LAND',               
  INTERACTION = 'INTERACTION', 
  CARD_ADVANTAGE = 'CARD_ADVANTAGE', 
  RAMP = 'RAMP',               
  UTILITY = 'UTILITY'          
}

export interface MinimalCard {
  name: string;
  type_line: string;
  oracle_text?: string;
}

export class CardClassifier {
  classify(card: MinimalCard): CardCategory {
    const type = card.type_line.toLowerCase();
    const text = (card.oracle_text || '').toLowerCase();

    // 1. Check Land
    if (type.includes('land')) return CardCategory.LAND;

    // 2. Check Interaction (Pilar 4)
    const interactionKeywords = [
      'counter target', 'destroy target', 'exile target', 
      'deals', 'damage to target', 'return target', 'tap target'
    ];
    if (interactionKeywords.some(kw => text.includes(kw))) {
      return CardCategory.INTERACTION;
    }

    // 3. Check Card Advantage (Pilar 5)
    const drawKeywords = ['draw', 'look at the top', 'reveal the top', 'scry'];
    if (drawKeywords.some(kw => text.includes(kw))) {
      return CardCategory.CARD_ADVANTAGE;
    }

    // 4. Check Ramp (Pilar 6)
    if (text.includes('add {') || text.includes('search your library for a land')) {
      return CardCategory.RAMP;
    }

    // 5. Default to Threat if it's a Creature
    if (type.includes('creature')) return CardCategory.THREAT;

    return CardCategory.UTILITY;
  }
}
