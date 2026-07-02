const { redactPII, cosineSimilarity, generateMockAnalysis } = require('../src/services/AiService');

describe('AiService Unit Tests', () => {
  
  describe('redactPII', () => {
    test('should redact email addresses', () => {
      const text = 'Mój email to test@example.com, napisz do mnie.';
      expect(redactPII(text)).toBe('Mój email to [EMAIL], napisz do mnie.');
    });

    test('should redact PESEL numbers (11 digits)', () => {
      const text = 'Mój pesel to 12345678901.';
      expect(redactPII(text)).toBe('Mój pesel to [PESEL].');
    });

    test('should redact telephone numbers', () => {
      const text = 'Zadzwoń na 123-456-789 lub +48 987 654 321.';
      expect(redactPII(text)).toContain('[TELEFON]');
    });

    test('should redact common Polish names', () => {
      const text = 'Jan poszedł do sklepu z Anna.';
      expect(redactPII(text)).toContain('[IMIĘ]');
    });
  });

  describe('cosineSimilarity', () => {
    test('should return 1 for identical vectors', () => {
      const vA = [1, 2, 3];
      const vB = [1, 2, 3];
      expect(cosineSimilarity(vA, vB)).toBeCloseTo(1.0, 5);
    });

    test('should return 0 for orthogonal vectors', () => {
      const vA = [1, 0];
      const vB = [0, 1];
      expect(cosineSimilarity(vA, vB)).toBe(0);
    });

    test('should handle mismatching vector lengths by returning 0', () => {
      const vA = [1, 2];
      const vB = [1, 2, 3];
      expect(cosineSimilarity(vA, vB)).toBe(0);
    });

    test('should handle empty/null inputs by returning 0', () => {
      expect(cosineSimilarity(null, [1])).toBe(0);
      expect(cosineSimilarity([1], null)).toBe(0);
    });
  });

  describe('generateMockAnalysis', () => {
    test('should detect pain correctly when user mentions it', () => {
      const noteData = {
        content: 'Ból: boli mnie kolano',
        ammout_sleep: 8,
        ammout_of_water: 2
      };
      const result = generateMockAnalysis(noteData);
      expect(result.porada2.text).toContain('ból');
    });

    test('should NOT detect pain when user selects No Pain / brak bólu', () => {
      const noteData = {
        content: 'Ból: No Pain',
        ammout_sleep: 8,
        ammout_of_water: 2
      };
      const result = generateMockAnalysis(noteData);
      const advices = [result.porada1, result.porada2, result.porada3].filter(Boolean);
      const containsPainAdvice = advices.some(adv => adv.category === 'ból');
      expect(containsPainAdvice).toBe(false);
    });

    test('should rotate stress advice when primary option is marked ineffective', () => {
      const noteData = {
        content: 'Stres: wysoki poziom stresu w pracy',
        ammout_sleep: 8,
        ammout_of_water: 2
      };
      
      // Let's specify that the first stress advice was ineffective
      const ineffectiveAdvice = [{
        advicetext: "Wysoki poziom stresu. Spróbuj ćwiczeń głębokiego oddychania (metoda 4-7-8) przez 5 minut dziennie.",
        category: "stres"
      }];
      
      const result = generateMockAnalysis(noteData, ineffectiveAdvice);
      
      // The advice should NOT be the first option (breathing), it should be option 2 (spacer) or 3 (melisa)
      expect(result.porada1.text).not.toContain("głębokiego oddychania");
      expect(result.porada1.text).toContain("spacer");
    });
  });
});
