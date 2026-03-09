export interface GrammarTopic {
  id: string;
  title: string;
  titleTr: string;
  phase: number;
  description: string;
}

export const GRAMMAR_TOPICS: GrammarTopic[] = [
  // Phase 1 — Foundation
  {
    id: 'alphabet',
    title: 'Turkish Alphabet & Pronunciation',
    titleTr: 'Türk Alfabesi',
    phase: 1,
    description: '29 letters, 8 vowels, voiced/voiceless consonants',
  },
  {
    id: 'vowel-harmony',
    title: 'Vowel Harmony',
    titleTr: 'Ünlü Uyumu',
    phase: 1,
    description:
      'Back vowels (a, ı, o, u) and front vowels (e, i, ö, ü) in suffixes',
  },
  {
    id: 'consonant-mutation',
    title: 'Consonant Mutation',
    titleTr: 'Ünsüz Değişimi',
    phase: 1,
    description: 'How consonants change when adding suffixes (p→b, t→d, k→ğ, ç→c)',
  },
  {
    id: 'present-tobe',
    title: 'Present Tense "To Be"',
    titleTr: 'Şimdiki Zaman "olmak"',
    phase: 1,
    description: 'Personal suffixes: -ım/-im/-um/-üm, değil for negatives',
  },
  {
    id: 'aorist',
    title: 'Present Simple (Aorist) Tense',
    titleTr: 'Geniş Zaman',
    phase: 1,
    description: 'Habitual actions with -r/-ar/-er suffixes',
  },
  {
    id: 'basic-questions',
    title: 'Basic Questions',
    titleTr: 'Temel Sorular',
    phase: 1,
    description: 'Yes/no questions with mı/mi/mu/mü particle',
  },
  // Phase 2 — Building
  {
    id: 'past-tense',
    title: 'Past Simple Tense',
    titleTr: 'Geçmiş Zaman',
    phase: 2,
    description: 'Past tense with -dı/-di/-du/-dü and -tı/-ti/-tu/-tü',
  },
  {
    id: 'present-continuous',
    title: 'Present Continuous (-yor)',
    titleTr: 'Şimdiki Zaman (-yor)',
    phase: 2,
    description: 'Ongoing actions with -yor suffix, vowel replacement rules',
  },
  {
    id: 'case-markers',
    title: 'Case Markers',
    titleTr: 'Hal Ekleri',
    phase: 2,
    description:
      'Accusative (-ı), dative (-e/-a), locative (-de/-da), ablative (-den/-dan)',
  },
  {
    id: 'genitive-possessive',
    title: 'Genitive & Possessive',
    titleTr: 'İyelik Ekleri',
    phase: 2,
    description: 'Possessive markers and var/yok existential',
  },
  {
    id: 'question-words',
    title: 'Question Words',
    titleTr: 'Soru Kelimeleri',
    phase: 2,
    description: 'Ne, nerede, nasıl, kaç, kim, neden, ne zaman',
  },
  {
    id: 'numbers-measurements',
    title: 'Numbers and Measurements',
    titleTr: 'Sayılar ve Ölçüler',
    phase: 2,
    description: 'Counting, prices, weights, time expressions',
  },
  // Phase 3 — Fluency
  {
    id: 'future-tense',
    title: 'Future Tense',
    titleTr: 'Gelecek Zaman',
    phase: 3,
    description: 'Future with -ecek/-acak suffix',
  },
  {
    id: 'modal-suffixes',
    title: 'Modal Suffixes',
    titleTr: 'Kip Ekleri',
    phase: 3,
    description:
      'Can (-ebil/-abil), must (-meli/-malı), want to (istiyor), need to (lazım/gerekiyor)',
  },
  {
    id: 'conjunctions',
    title: 'Conjunctions',
    titleTr: 'Bağlaçlar',
    phase: 3,
    description: 'Ve, ama, çünkü, ile, ya da, hem...hem, ne...ne',
  },
  {
    id: 'conditionals',
    title: 'Conditional Sentences',
    titleTr: 'Koşul Cümleleri',
    phase: 3,
    description: 'Real and unreal conditionals with -sa/-se suffix',
  },
  {
    id: 'passive-voice',
    title: 'Passive Voice',
    titleTr: 'Edilgen Çatı',
    phase: 3,
    description: 'Passive constructions in present and past tense',
  },
  {
    id: 'reported-speech',
    title: 'Reported Speech (-miş)',
    titleTr: 'Aktarma (-miş)',
    phase: 3,
    description: 'Reported/hearsay past tense with -miş suffix',
  },
];
