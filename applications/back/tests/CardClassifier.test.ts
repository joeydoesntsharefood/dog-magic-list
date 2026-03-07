import { describe, it, expect, beforeEach } from 'vitest';
import { CardClassifier, CardCategory } from '../src/services/CardClassifier';

describe('US03.1: CardClassifier - Inteligência de Categorização', () => {
  let classifier: CardClassifier;

  beforeEach(() => {
    classifier = new CardClassifier();
  });

  it('deve classificar Counterspell como INTERAÇÃO (Pilar 4)', () => {
    const card = {
      name: 'Counterspell',
      type_line: 'Instant',
      oracle_text: 'Counter target spell.'
    };
    const category = classifier.classify(card);
    expect(category).toBe(CardCategory.INTERACTION);
  });

  it('deve classificar Divination como VANTAGEM DE CARTA (Pilar 5)', () => {
    const card = {
      name: 'Divination',
      type_line: 'Sorcery',
      oracle_text: 'Draw two cards.'
    };
    const category = classifier.classify(card);
    expect(category).toBe(CardCategory.CARD_ADVANTAGE);
  });

  it('deve classificar Sol Ring como RAMP (Pilar 6)', () => {
    const card = {
      name: 'Sol Ring',
      type_line: 'Artifact',
      oracle_text: '{T}: Add {C}{C}.'
    };
    const category = classifier.classify(card);
    expect(category).toBe(CardCategory.RAMP);
  });

  it('deve classificar uma criatura genérica como THREAT/STAPLE (Pilar 1)', () => {
    const card = {
      name: 'Colossal Dreadmaw',
      type_line: 'Creature — Dinosaur',
      oracle_text: 'Trample'
    };
    const category = classifier.classify(card);
    expect(category).toBe(CardCategory.THREAT);
  });
});
