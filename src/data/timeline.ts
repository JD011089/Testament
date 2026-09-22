export interface TimelineEra {
  id: string;
  eraNumber: number;
  title: string;
  subtitle: string;
  timeframe: string;
  summary: string;
  keyFigures: string[];
  definingMoment: string;
  questIds: string[];
}

export const TIMELINE_ERAS: TimelineEra[] = [
  {
    id: 'era-1',
    eraNumber: 1,
    title: 'Beginnings & Patriarchs',
    subtitle: 'From dust to a desert family of destiny',
    timeframe: 'c. 2000 – 1800 BC',
    summary: 'God calls one flawed desert wanderer (Abraham) and promises to build a nation that will bless the entire earth. Survives famine, intense family drama, and ends with Joseph in Egypt.',
    keyFigures: ['Abraham', 'Sarah', 'Isaac', 'Jacob', 'Joseph'],
    definingMoment: 'Joseph telling his treacherous brothers: "You meant evil, but God meant it for good."',
    questIds: ['joseph-journey']
  },
  {
    id: 'era-2',
    eraNumber: 2,
    title: 'The Exodus & The Wilderness',
    subtitle: 'From slave labor to free covenant men',
    timeframe: 'c. 1446 – 1406 BC',
    summary: 'After 400 years of brutal Egyptian slave labor, Moses leads an impossible escape through the Red Sea and receives the Ten Commandments in the Sinai desert.',
    keyFigures: ['Moses', 'Aaron', 'Miriam', 'Joshua'],
    definingMoment: 'Standing trapped at the Red Sea with chariots charging behind them: "The Lord will fight for you; you need only to be still."',
    questIds: ['moses-journey']
  },
  {
    id: 'era-3',
    eraNumber: 3,
    title: 'Kingdoms & Warriors',
    subtitle: 'From underdog tribes to golden empire',
    timeframe: 'c. 1050 – 930 BC',
    summary: 'Israel transitions from chaotic tribal warlords to a united nation. David slays Goliath, survives Saul’s manhunt, and forges the golden age of Jerusalem.',
    keyFigures: ['David', 'Jonathan', 'King Saul', 'Solomon'],
    definingMoment: 'David stepping out with 5 smooth stones and a sling against a 9-foot bronze giant.',
    questIds: ['david-journey']
  },
  {
    id: 'era-4',
    eraNumber: 4,
    title: 'The Crisis & Exile',
    subtitle: 'Corrupt rulers, fiery prophets & foreign captivity',
    timeframe: 'c. 930 – 538 BC',
    summary: 'Civil war splits the kingdom. Corrupt kings lead people into destruction. Tough prophets like Elijah call down fire on Mount Carmel, while Babylon sacks Jerusalem.',
    keyFigures: ['Elijah', 'Elisha', 'Isaiah', 'Jeremiah', 'Daniel'],
    definingMoment: 'Supernatural fire falling on Elijah’s water-soaked altar on Mount Carmel.',
    questIds: ['elijah-journey']
  },
  {
    id: 'era-5',
    eraNumber: 5,
    title: 'The Messiah & The Cross',
    subtitle: '400 years of silence broken by the carpenter',
    timeframe: 'c. 4 BC – 33 AD',
    summary: 'Jesus of Nazareth turns human power upside down: healing outcasts, challenging religious hypocrites, dying on a Roman cross for humanity’s debt, and rising from the grave.',
    keyFigures: ['Jesus', 'Simon Peter', 'John', 'Mary Magdalene'],
    definingMoment: 'Jesus restoring the broken Peter over a beach charcoal fire: "Do you love me? Feed my sheep."',
    questIds: ['peter-journey']
  },
  {
    id: 'era-6',
    eraNumber: 6,
    title: 'The Underground Movement',
    subtitle: 'Spreading like wildfire through the Roman Empire',
    timeframe: 'c. 33 – 100 AD',
    summary: 'A tiny group of working-class disciples and a converted bounty hunter (Paul) take on the might of Rome, singing hymns in dungeons and planting unstoppable brotherhoods.',
    keyFigures: ['Paul of Tarsus', 'Silas', 'Barnabas', 'Luke'],
    definingMoment: 'Paul and Silas singing at midnight with bloody backs in a Philippi dungeon before the earthquake.',
    questIds: ['paul-journey']
  }
];
