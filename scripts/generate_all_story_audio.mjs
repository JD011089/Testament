import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
import fs from 'fs';
import path from 'path';

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || 'sk_b2c386ca902d917f5618a6a3c012dc885c8b3ef55c61e41e';
const ELEVENLABS_ADAM_VOICE_ID = 'pNInz6obpgDQGcFmaJgB'; // Adam: Cinematic Baritone

function normalizeScriptureForSpeech(text) {
  return text
    .replace(/\b(\d?[A-Za-z]+(?:\s+[A-Za-z]+)?)\s+(\d+):(\d+)\b/g, '$1 $2 verse $3')
    .replace(/(\d+):(\d+)/g, '$1 verse $2')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/_{1,2}(.*?)_{1,2}/g, '$1')
    .replace(/`{1,3}(.*?)`{1,3}/g, '$1')
    .replace(/^#+\s+/gm, '')
    .replace(/^\s*[-*•]\s+/gm, '')
    .replace(/\.{3,}/g, ', ')
    .replace(/—/g, ', ')
    .replace(/--+/g, ', ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function run() {
  const outputDir = path.resolve('public/audio/stories');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('Generating audio for Morning Briefing...');
  const morningText = `Today's 3-Minute Morning Briefing. Act 1: Real Moment. Moses stood at the edge of the Red Sea with six hundred iron chariots charging behind him. He had no army, just a shepherd's staff, and a command to be still. Act 2: Truth for the Pocket. The Lord will fight for you; you need only to be still. Exodus 14:14. Act 3: Your Call Today. When an unexpected crisis or stressful message arrives today, do not react with impulsive anger or panic. Take three deep breaths, stand firm, and let the Lord fight the battle.`;

  await generateFile(path.join('public/audio', 'morning_briefing.mp3'), morningText);

  // Generate key story acts
  const storyAudios = [
    {
      file: 'david-journey_david-act-1.mp3',
      text: `David: The Outlaw and The Giant. Act 1: Psychological Warfare in the Valley. Two armies camped on opposing limestone ridges. Between them: a nine-foot veteran mercenary bellowing insults across the ravine for forty straight mornings. In ancient warfare, champions would duel to the death so thousands didn't have to butcher each other blindly. The Philistines brought their ultimate weapon: Goliath, armored in bronze scales weighing over 120 pounds. David looks at Saul and says: Let no man lose heart on account of this Philistine; your servant will go and fight him. Scripture says: You come against me with sword and spear and javelin, but I come against you in the name of the Lord Almighty. 1 Samuel 17:45.`
    },
    {
      file: 'david-journey_david-act-2.mp3',
      text: `David: The Outlaw and The Giant. Act 2: The Cave of Outlaws. Saul's jealousy explodes. He throws spears at David's head, sends death squads to his house, and forces David into exile. David flees into the barren desert canyon of Adullam. Four hundred desperate, indebted, and bitter men gather around him in the cave. David does not form a bandit gang; he trains them in brotherhood, discipline, and reverence for God. Scripture: My flesh and my heart may fail, but God is the strength of my heart and my portion forever. Psalm 73:26.`
    },
    {
      file: 'david-journey_david-act-3.mp3',
      text: `David: The Outlaw and The Giant. Act 3: The Midnight Cave and Withholding the Spear. King Saul enters the very cave where David and his men are hiding in the dark. David's men whisper: God has delivered your enemy into your hands! Kill him now and take the throne! David creeps forward, cuts off a corner of Saul's robe, but his conscience is struck. He refuses to strike the king. Scripture: The Lord forbid that I should do such a thing to my master, the Lord's anointed. 1 Samuel 24:6. David chose honor over shortcuts.`
    },
    {
      file: 'joseph-journey_joseph-act-1.mp3',
      text: `Joseph: From The Pit To The Palace. Act 1: The Dry Cistern at Dothan. Joseph's older brothers strip his ornate coat and throw him into a deep stone cistern in the blistering desert heat. They sell him for twenty pieces of silver to Midianite slave traders. Scripture: The Lord was with Joseph so that he prospered, and he lived in the house of his Egyptian master. Genesis 39:2.`
    },
    {
      file: 'joseph-journey_joseph-act-2.mp3',
      text: `Joseph: From The Pit To The Palace. Act 2: The Prison of Integrity. Falsely accused by Potiphar's wife, Joseph is thrown into Pharaoh's dungeon. Even in chains, Joseph manages the prison with total excellence. He interprets the dreams of the royal cupbearer and baker, waiting patiently for God's appointed time. Scripture: Do not interpretations belong to God? Tell me your dreams. Genesis 40:8.`
    },
    {
      file: 'joseph-journey_joseph-act-3.mp3',
      text: `Joseph: From The Pit To The Palace. Act 3: The Grain Storehouse. Seven years of global famine strike. Joseph is now Prime Minister of Egypt. His starving brothers bow before him, terrified of retribution. Joseph weeps and says: You intended to harm me, but God intended it for good to accomplish what is now being done, the saving of many lives. Genesis 50:20.`
    },
    {
      file: 'moses-journey_moses-act-1.mp3',
      text: `Moses: The Reluctant Liberator. Act 1: The Burning Bush. A fugitive shepherd in the Midian desert encounters a bush blazing with fire that is not consumed. God commands Moses: Take off your sandals, for the place where you are standing is holy ground. Moses makes excuses, but God reveals His eternal name: I AM WHO I AM. Exodus 3:14.`
    },
    {
      file: 'moses-journey_moses-act-2.mp3',
      text: `Moses: The Reluctant Liberator. Act 2: Midnight Passover. After nine catastrophic plagues, Pharaoh's heart remains hardened. On the night of the final judgment, God instructs Israel to place the blood of the lamb on their doorposts. At midnight, the chains of four hundred years of slavery are shattered. Exodus 12:13.`
    },
    {
      file: 'moses-journey_moses-act-3.mp3',
      text: `Moses: The Reluctant Liberator. Act 3: The Impossible Stand at the Red Sea. Trapped between towering mountain cliffs and the Red Sea, with Pharaoh's elite chariot cavalry charging from behind. Moses raises his wooden staff. The east wind roars, towering oceanic walls part, and Israel walks through on dry ground. Exodus 14:14.`
    },
    {
      file: 'elijah-journey_elijah-act-1.mp3',
      text: `Elijah: The Lone Firebrand. Act 1: The Drought and the Ravens at Cherith. Elijah confronts King Ahab, declaring that neither dew nor rain will fall except at his word. God commands Elijah to hide by the brook Cherith, where ravens bring him bread and meat every morning and evening. 1 Kings 17:4.`
    },
    {
      file: 'elijah-journey_elijah-act-2.mp3',
      text: `Elijah: The Lone Firebrand. Act 2: The Consuming Fire on Mount Carmel. One man of God against four hundred and fifty prophets of Baal. Elijah drenches the altar with four jars of water three times over. He prays one simple prayer. Supernatural fire crashes from heaven, consuming the sacrifice, the wood, the stones, and the dust. 1 Kings 18:38.`
    },
    {
      file: 'elijah-journey_elijah-act-3.mp3',
      text: `Elijah: The Lone Firebrand. Act 3: The Gentle Whisper Under the Broom Tree. Exhausted and facing death threats from Jezebel, Elijah runs into the desert and crashes under a broom tree. God sends an angel with baked bread and water, lets him sleep, and speaks not in the wind or earthquake, but in a still, gentle whisper. 1 Kings 19:12.`
    },
    {
      file: 'peter-journey_peter-act-1.mp3',
      text: `Peter: The Restored Fisherman. Act 1: Stepping Onto the Waves. In the fourth watch of the night, during a violent storm on the Sea of Galilee, Jesus walks on the water. Peter calls out: Lord, if it is you, tell me to come. Peter steps out of the boat and walks on the waves until fear grips him. Jesus catches him: You of little faith, why did you doubt? Matthew 14:31.`
    },
    {
      file: 'peter-journey_peter-act-2.mp3',
      text: `Peter: The Restored Fisherman. Act 2: The Charcoal Fire. In the High Priest's courtyard, warming his hands by the fire as Jesus is beaten inside. Three times Peter denies even knowing Him. The rooster crows. Jesus turns and looks straight at Peter. Peter runs into the darkness, weeping bitterly. Luke 22:61.`
    },
    {
      file: 'peter-journey_peter-act-3.mp3',
      text: `Peter: The Restored Fisherman. Act 3: Breakfast on the Shore. By the Sea of Tiberias around another charcoal fire, the risen Christ asks Peter three times: Simon, son of John, do you love me? Three confessions of love replace three denials. Jesus commissions him: Feed my sheep. John 21:17.`
    },
    {
      file: 'paul-journey_paul-act-1.mp3',
      text: `Paul: The Converted Bounty Hunter. Act 1: Blinded on Damascus Road. Saul, breathing threats and murder against Christians, is thrown to the dirt by a blinding celestial light. A voice thunders: Saul, Saul, why do you persecute me? Three days of darkness transform an ideological extremist into God's chosen vessel. Acts 9:4.`
    },
    {
      file: 'paul-journey_paul-act-2.mp3',
      text: `Paul: The Converted Bounty Hunter. Act 2: Midnight in the Philippi Dungeon. Beaten with rods and locked in heavy wooden stocks in the innermost Roman cell. At midnight, Paul and Silas pray and sing hymns to God. A violent earthquake shakes the foundations, doors fly open, and chains break loose. Acts 16:25.`
    },
    {
      file: 'paul-journey_paul-act-3.mp3',
      text: `Paul: The Converted Bounty Hunter. Act 3: Shipwreck on Malta. A violent two-week storm wrecks the grain ship on an offshore reef. An angel assures Paul: Not a single life will be lost. All two hundred and seventy-six men swim safely ashore. Paul shakes a venomous viper into the campfire, completely unharmed. Acts 27:24.`
    }
  ];

  for (const item of storyAudios) {
    const dest = path.join(outputDir, item.file);
    await generateFile(dest, item.text);
  }

  console.log('ALL AUDIO ASSETS GENERATED SUCCESSFULLY!');
}

async function generateFile(dest, text) {
  if (fs.existsSync(dest) && fs.statSync(dest).size > 5000) {
    console.log(`Skipping existing: ${dest} (${fs.statSync(dest).size} bytes)`);
    return;
  }

  const cleanText = normalizeScriptureForSpeech(text);
  console.log(`Generating: ${dest}...`);

  // Try ElevenLabs first
  if (ELEVENLABS_API_KEY) {
    try {
      const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_ADAM_VOICE_ID}`, {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: cleanText,
          model_id: 'eleven_turbo_v2_5',
          voice_settings: {
            stability: 0.45,
            similarity_boost: 0.85,
            style: 0.20,
            use_speaker_boost: true
          }
        })
      });

      if (res.ok) {
        const arrayBuf = await res.arrayBuffer();
        fs.writeFileSync(dest, Buffer.from(arrayBuf));
        console.log(`✓ Completed with ElevenLabs Adam: ${dest} (${fs.statSync(dest).size} bytes)`);
        return;
      } else {
        console.warn(`ElevenLabs HTTP ${res.status}: ${await res.text()}`);
      }
    } catch (err) {
      console.warn('ElevenLabs generation failed, using EdgeTTS fallback:', err.message);
    }
  }

  // Backup fallback
  return new Promise((resolve, reject) => {
    try {
      const tts = new MsEdgeTTS();
      tts.setMetadata('en-US-ChristopherNeural', OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3).then(() => {
        const { audioStream } = tts.toStream(cleanText);
        const writeStream = fs.createWriteStream(dest);
        audioStream.pipe(writeStream);
        writeStream.on('finish', () => {
          console.log(`✓ Completed with fallback: ${dest} (${fs.statSync(dest).size} bytes)`);
          try { tts.close(); } catch { /* ignore */ }
          resolve();
        });
        writeStream.on('error', (e) => {
          try { tts.close(); } catch { /* ignore */ }
          reject(e);
        });
        audioStream.on('error', (e) => {
          try { tts.close(); } catch { /* ignore */ }
          reject(e);
        });
      }).catch(reject);
    } catch (err) {
      reject(err);
    }
  });
}

run().catch(console.error);
