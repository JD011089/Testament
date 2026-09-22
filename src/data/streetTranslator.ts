export interface StreetTranslation {
  id: string;
  ancientPhrase: string;
  literalBiblicalContext: string;
  streetTranslation: string;
  whyItMattersToday: string;
  category: 'Body & Action' | 'Grief & Emotion' | 'Law & Politics' | 'Faith & Weapons';
}

export const STREET_TRANSLATIONS: StreetTranslation[] = [
  {
    id: 'gird-loins',
    ancientPhrase: 'Gird up your loins',
    literalBiblicalContext: 'Men wore long flowing robes. If you had to run, fight, or do hard labor, you reached between your legs, pulled the hem of the robe up, and tucked it into your leather belt.',
    streetTranslation: 'Tucking your shirt in, tightening your work belt, and getting ready to throw down or do heavy manual labor without tripping.',
    whyItMattersToday: 'When life gets chaotic, stop lounging. Mentally strap in and get ready to handle business.',
    category: 'Body & Action'
  },
  {
    id: 'tear-clothes',
    ancientPhrase: 'Tearing one’s garments',
    literalBiblicalContext: 'Gripping the collar of your tunic with both hands and violently ripping it down the chest upon hearing devastating news, blasphemy, or tragedy.',
    streetTranslation: 'Slamming your fist straight through drywall or dropping to your knees in total raw agony because the pain inside is too big to contain.',
    whyItMattersToday: 'The Bible never tells men to suppress their grief or pretend to be stoic robots. Deep loss deserves real expression.',
    category: 'Grief & Emotion'
  },
  {
    id: 'sackcloth-ashes',
    ancientPhrase: 'Sitting in sackcloth and ashes',
    literalBiblicalContext: 'Stripping off comfortable linen, wearing coarse prickly goat-hair bags, and dumping charcoal dust over your head.',
    streetTranslation: 'Sitting in your garage in dirty sweatpants with the lights off after getting fired or getting served divorce papers—hitting absolute rock bottom with zero ego left.',
    whyItMattersToday: 'A visual demonstration that pride has died. You can’t fake being tough when you are sitting in the ashes.',
    category: 'Grief & Emotion'
  },
  {
    id: 'cast-lots',
    ancientPhrase: 'Casting lots',
    literalBiblicalContext: 'Marked stones or pottery shards tossed from a jar or bowl to make a high-stakes decision (e.g. dividing territory or picking a replacement apostle).',
    streetTranslation: 'Rolling dice or flipping a coin so that human manipulation and office politics can’t rig the outcome.',
    whyItMattersToday: 'Taking human ego and bribery off the table and asking God to direct the outcome.',
    category: 'Law & Politics'
  },
  {
    id: 'sanhedrin',
    ancientPhrase: 'The Sanhedrin',
    literalBiblicalContext: 'The 71-member supreme ruling council of Jewish elders, high priests, and legal experts under Roman oversight in Jerusalem.',
    streetTranslation: 'The Supreme Court, City Hall, and a cutthroat political mafia all rolled into one boardroom.',
    whyItMattersToday: 'Understanding why Jesus and the apostles faced ruthless legal threats—they were exposing institutional corruption.',
    category: 'Law & Politics'
  },
  {
    id: 'horn-salvation',
    ancientPhrase: 'Horn of salvation',
    literalBiblicalContext: 'The curved horns of a bull or ram, which were ancient symbols of raw, unstoppable physical military power.',
    streetTranslation: 'An armored battering ram or high-caliber defense system that shatters whatever is holding you hostage.',
    whyItMattersToday: 'God’s power isn’t a gentle suggestion; it’s an unstoppable force.',
    category: 'Faith & Weapons'
  },
  {
    id: 'anoint-oil',
    ancientPhrase: 'Anointing with oil',
    literalBiblicalContext: 'Pouring fragrant olive oil over someone’s head to dedicate them for battle, healing, or kingship.',
    streetTranslation: 'Pinning five stars on a general’s uniform or stamping an official executive seal that says: "This man has authority."',
    whyItMattersToday: 'You don’t have to fight for credit when God has already set His seal on your life.',
    category: 'Faith & Weapons'
  },
  {
    id: 'heap-coals',
    ancientPhrase: 'Heaping burning coals on their head',
    literalBiblicalContext: 'An Egyptian ritual where a repentant person carried a pan of coals on their head, or the ancient custom of giving an enemy coals to restart their home fire in cold weather.',
    streetTranslation: 'Killing your haters with unexpected generosity until their conscience burns with shame for how they treated you.',
    whyItMattersToday: 'Never stoop to their level. When someone does you dirty, retaliate with overwhelming excellence and kindness.',
    category: 'Law & Politics'
  }
];
