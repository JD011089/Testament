export interface CharacterMoment {
  id: string;
  order: number;
  title: string;
  passageReference: string;
  whatHappened: string; // 2-3 sentences
  humanAngle: string; // fear, bravado, failure, growth
  readerConnection: string; // tactical connection to modern life
  goDeeper: {
    culturalContext: string;
    crossReference?: string;
  };
}

export interface CharacterArc {
  id: string;
  name: string;
  tagline: string;
  bio: string;
  avatarIcon: string;
  moments: CharacterMoment[];
}

export const CHARACTER_ARCS: CharacterArc[] = [
  {
    id: 'peter',
    name: 'Peter',
    tagline: 'The bravado, the collapse, and the restoration',
    bio: 'A working-class commercial fisherman who promised more than his courage could deliver, fell to the lowest bottom, and was rebuilt into an unbreakable pillar.',
    avatarIcon: '⚓',
    moments: [
      {
        id: 'peter-1',
        order: 1,
        title: 'Leaving the Nets at Galilee',
        passageReference: 'Luke 5:1-11',
        whatHappened: 'After fishing all night without catching a single fish, Jesus tells Peter to cast his nets one more time into the deep. The nets tear from the overwhelming catch, and Peter falls to his knees in awe.',
        humanAngle: 'Peter felt totally unqualified: "Go away from me, Lord; I am a sinful man."',
        readerConnection: 'When God meets you in your exhaustion, your first instinct is to feel unworthy. He does not call the qualified; He qualifies the called.',
        goDeeper: {
          culturalContext: 'Commercial fishing on Galilee was licensed and heavily taxed by Rome. Walking away from boats and gear was a massive financial surrender.',
          crossReference: 'Echoes Isaiah 6:5 ("Woe to me, for I am ruined!").'
        }
      },
      {
        id: 'peter-2',
        order: 2,
        title: 'Stepping Onto the Waves',
        passageReference: 'Matthew 14:22-33',
        whatHappened: 'Seeing Jesus walking on the storm-tossed lake at 3am, Peter asks to come to Him on the water. He takes several steps before noticing the wind, panics, and begins to sink.',
        humanAngle: 'His bravado made him climb out of the boat, but his focus shifted from Christ to the roaring waves.',
        readerConnection: 'You only begin sinking when you start measuring the size of the waves instead of looking at who called you out.',
        goDeeper: {
          culturalContext: 'Ancient Jewish sailors regarded deep nighttime sea waters as the ultimate symbol of chaos and death.',
          crossReference: 'Echoes Psalm 69:1 ("Save me, O God, for the waters have come up to my neck").'
        }
      },
      {
        id: 'peter-3',
        order: 3,
        title: 'The Great Confession',
        passageReference: 'Matthew 16:13-20',
        whatHappened: 'Jesus asks His disciples who they believe He is. While others offer popular opinions, Peter declares with clarity: "You are the Messiah, the Son of the living God."',
        humanAngle: 'A flash of spiritual insight where Peter spoke with divine conviction beyond his formal education.',
        readerConnection: 'It is easy to repeat what crowds think about God; the real test is standing alone and declaring who He is to you.',
        goDeeper: {
          culturalContext: 'Caesarea Philippi was a center of pagan worship to Pan and the Roman Caesar. Confessing Jesus there was politically dangerous.',
          crossReference: 'Cross-ref: 1 Peter 2:4-6.'
        }
      },
      {
        id: 'peter-4',
        order: 4,
        title: 'The Mount of Transfiguration',
        passageReference: 'Mark 9:2-8',
        whatHappened: 'On a high mountain, Jesus is transfigured with radiant light alongside Moses and Elijah. Bewildered and terrified, Peter blurts out a plan to build three shelters.',
        humanAngle: 'Peter spoke simply because he did not know what else to say in the presence of awe.',
        readerConnection: 'When sacred moments leave you speechless, resist the urge to fill the holy silence with busy plans.',
        goDeeper: {
          culturalContext: 'Building booths echoes the Feast of Tabernacles (Sukkot), expecting the immediate arrival of the messianic kingdom.',
          crossReference: '2 Peter 1:16-18.'
        }
      },
      {
        id: 'peter-5',
        order: 5,
        title: 'Refusing the Footwashing',
        passageReference: 'John 13:6-10',
        whatHappened: 'During the Last Supper, Jesus kneels with a basin and towel to wash the disciples’ dusty feet. Peter recoils in protest, refusing to let his Lord serve him like a slave.',
        humanAngle: 'Pride disguised as humility — Peter hated seeing the one he revered doing the lowest work.',
        readerConnection: 'Sometimes the hardest spiritual discipline is not serving others, but allowing yourself to be served and cleansed.',
        goDeeper: {
          culturalContext: 'In Greco-Roman society, washing feet was so demeaning that even Jewish slaves were often legally exempt from doing it.',
          crossReference: 'Philippians 2:5-8.'
        }
      },
      {
        id: 'peter-6',
        order: 6,
        title: 'The Bold Midnight Vow',
        passageReference: 'Matthew 26:31-35',
        whatHappened: 'Jesus warns that all His disciples will scatter that very night. Peter loudly counters: "Even if all fall away on account of you, I never will!"',
        humanAngle: 'Pure human confidence unaware of its own breaking point under genuine terror.',
        readerConnection: 'Never make arrogant promises in the light that you will not have the stamina to keep in the dark.',
        goDeeper: {
          culturalContext: 'Peter was setting himself above the rest of the brotherhood, claiming superior loyalty.',
          crossReference: 'Proverbs 16:18.'
        }
      },
      {
        id: 'peter-7',
        order: 7,
        title: 'The Sword in Gethsemane',
        passageReference: 'John 18:10-11',
        whatHappened: 'When armed temple guards enter Gethsemane to arrest Jesus, Peter draws a short sword and slashes off the ear of Malchus. Jesus sternly commands him to put it away.',
        humanAngle: 'Misguided aggression trying to fight spiritual warfare with physical force.',
        readerConnection: 'Rage and impulsive fighting usually make a mess of God’s redemptive work. Put away the blade.',
        goDeeper: {
          culturalContext: 'A small concealed dagger (machaira) was often carried on pilgrimage roads against bandits.',
          crossReference: 'Zechariah 4:6.'
        }
      },
      {
        id: 'peter-8',
        order: 8,
        title: 'The Courtyard Denial',
        passageReference: 'Luke 22:54-62',
        whatHappened: 'Warming his hands over a courtyard charcoal fire, Peter is accused three times of knowing Jesus. In panic, he denies Him completely, the rooster crows, and Jesus looks straight at him.',
        humanAngle: 'Total collapse of self-image. Peter ran outside into the dark and wept bitterly.',
        readerConnection: 'Failure feels like the end of your calling, but honesty in your tears is the beginning of restoration.',
        goDeeper: {
          culturalContext: 'A servant girl in that culture carried zero legal authority, yet her question shattered Peter’s confidence.',
          crossReference: 'Mark 14:71.'
        }
      },
      {
        id: 'peter-9',
        order: 9,
        title: 'Running to the Empty Tomb',
        passageReference: 'John 20:3-10',
        whatHappened: 'Hearing Mary Magdalene’s report that the stone was rolled away, Peter sprints to the tomb. He steps right into the darkness and inspects the folded linen cloths.',
        humanAngle: 'Desperation and raw hope overriding his heavy cloak of recent guilt.',
        readerConnection: 'When hope whispers even the faintest possibility of life, run toward it without letting past guilt hold you back.',
        goDeeper: {
          culturalContext: 'Tomb robbery was a capital Roman crime, but grave robbers never neatly folded face coverings.',
          crossReference: 'Luke 24:12.'
        }
      },
      {
        id: 'peter-10',
        order: 10,
        title: 'Restoration by the Charcoal Fire',
        passageReference: 'John 21:15-19',
        whatHappened: 'Beside a new charcoal fire on the beach of Galilee, Jesus asks Peter three times: "Do you love me?" With each humble reply, Jesus commissions him: "Feed my sheep."',
        humanAngle: 'Three denials healed by three confessions of love. Peter was given back his purpose.',
        readerConnection: 'God does not disqualify you for failing under pressure; He asks if your heart still loves Him and tells you to get back to work.',
        goDeeper: {
          culturalContext: 'The smell of burning charcoal (anthrakia) only appears twice in John: at Peter’s denial and here at his restoration.',
          crossReference: '1 Peter 5:2.'
        }
      },
      {
        id: 'peter-11',
        order: 11,
        title: 'Standing Up at Pentecost',
        passageReference: 'Acts 2:14-41',
        whatHappened: 'Filled with the Holy Spirit, the man who cowered before a servant girl steps out onto the temple portico and boldly proclaims Jesus before thousands.',
        humanAngle: 'Transformed courage — from saving his own skin to risking his life for the Gospel.',
        readerConnection: 'The very area where you once showed your deepest weakness is where God often releases your greatest strength.',
        goDeeper: {
          culturalContext: 'Speaking to thousands from across the Mediterranean diaspora required courage to confront the same Sanhedrin that had condemned Jesus.',
          crossReference: 'Joel 2:28-32.'
        }
      }
    ]
  },
  {
    id: 'david',
    name: 'David',
    tagline: 'The shepherd, the outlaw, and the broken king',
    bio: 'An overlooked youngest son who fought lions in secret, lived as a hunted fugitive in caves, and learned that a broken and contrite heart matters more than a crown.',
    avatarIcon: '👑',
    moments: [
      {
        id: 'david-1',
        order: 1,
        title: 'Anointed in the Pasture',
        passageReference: '1 Samuel 16:1-13',
        whatHappened: 'Prophet Samuel visits Jesse’s home to anoint Israel’s next king. Seven tall brothers pass by, but God chooses the youngest boy tending sheep out in the dirt.',
        humanAngle: 'Overlooked by his own family, David learned faithfulness when nobody was watching.',
        readerConnection: 'Your hidden seasons are not wasted time; they are where God builds the quiet strength you will need later.',
        goDeeper: {
          culturalContext: 'Shepherding was the lowliest chore in a clan, assigned to the youngest son who had no inheritance status.',
          crossReference: 'Psalm 78:70-72.'
        }
      },
      {
        id: 'david-2',
        order: 2,
        title: 'Facing Goliath in the Valley',
        passageReference: '1 Samuel 17:40-49',
        whatHappened: 'While seasoned soldiers cower in their tents, David refuses King Saul’s heavy bronze armor and runs toward the giant with five brook stones and his shepherd’s sling.',
        humanAngle: 'Calm tactical clarity rooted in God’s proven past faithfulness.',
        readerConnection: 'Do not fight today’s battles wearing someone else’s expectations. Step up with what God has actually given you.',
        goDeeper: {
          culturalContext: 'Ancient slingers were feared artillery units in antiquity, but facing an infantry giant without armor required supreme nerve.',
          crossReference: 'Zechariah 4:6.'
        }
      },
      {
        id: 'david-3',
        order: 3,
        title: 'Covenant Brotherhood with Jonathan',
        passageReference: '1 Samuel 18:1-4',
        whatHappened: 'Crown prince Jonathan strips off his royal robe and sword and gives them to David, forging an unbreakable covenant of loyalty.',
        humanAngle: 'Unselfish brotherhood where two men pledged loyalty above political ambition.',
        readerConnection: 'Real friends celebrate your calling even when it costs them their own prestige.',
        goDeeper: {
          culturalContext: 'Giving one’s armor and weapons in ancient Near Eastern treaties signified total surrender of claim to the throne.',
          crossReference: 'Proverbs 18:24.'
        }
      },
      {
        id: 'david-4',
        order: 4,
        title: 'The Outlaws in the Cave of Adullam',
        passageReference: '1 Samuel 22:1-4',
        whatHappened: 'Fleeing King Saul’s death squads, David hides in the desert caves. Four hundred bankrupt, desperate, and discontented men gather to him looking for a leader.',
        humanAngle: 'Hunted and homeless, David chose to lead broken misfits instead of giving in to bitter despair.',
        readerConnection: 'When your plans collapse, look at the people around you in the ditch and build something noble together.',
        goDeeper: {
          culturalContext: 'Adullam was a natural limestone stronghold in the Judean foothills, inaccessible to royal chariots.',
          crossReference: 'Psalm 142.'
        }
      },
      {
        id: 'david-5',
        order: 5,
        title: 'Sparing King Saul in the Cave',
        passageReference: '1 Samuel 24:1-12',
        whatHappened: 'Saul enters the very cave where David is hiding. David’s men urge him to kill his pursuer, but David only cuts off a corner of Saul’s robe, conscience-stricken.',
        humanAngle: 'Restraint under supreme temptation: David refused to take by murder what God had promised to give in His time.',
        readerConnection: 'Just because an easy revenge opportunity opens up does not mean it is God’s will. Wait for His timing.',
        goDeeper: {
          culturalContext: 'Cutting the hem of a king’s garment was symbolic of stripping away his royal authority.',
          crossReference: 'Romans 12:19.'
        }
      },
      {
        id: 'david-6',
        order: 6,
        title: 'Dancing Before the Ark',
        passageReference: '2 Samuel 6:12-15',
        whatHappened: 'David brings the Ark of the Covenant into Jerusalem with unrestrained dancing and singing, wearing only a linen priestly tunic.',
        humanAngle: 'Unashamed worship without caring about royal dignity or public critique.',
        readerConnection: 'Never apologize for genuine gratitude to God just because cynical people think you should look more composed.',
        goDeeper: {
          culturalContext: 'Ancient Near Eastern kings always marched in heavy regal attire; David danced as a humble servant before the true King.',
          crossReference: 'Psalm 103.'
        }
      },
      {
        id: 'david-7',
        order: 7,
        title: 'The Rooftop Compromise',
        passageReference: '2 Samuel 11:1-17',
        whatHappened: 'In spring when kings go off to war, David stays home in Jerusalem. From his palace roof he sees Bathsheba, abuses his authority, and plots the murder of her husband Uriah.',
        humanAngle: 'The slow rot of complacency: isolated at the peak of success, the warrior gave in to darkness.',
        readerConnection: 'Your most dangerous moments are not when you are fighting for survival, but when you are comfortable and idle.',
        goDeeper: {
          culturalContext: 'Kings in the ancient Near East had absolute unchecked power over subjects’ wives; David acted like a pagan despot.',
          crossReference: 'James 1:14-15.'
        }
      },
      {
        id: 'david-8',
        order: 8,
        title: 'Broken Repentance Before Nathan',
        passageReference: '2 Samuel 12:1-13',
        whatHappened: 'Prophet Nathan confronts David with a story of a rich man stealing a poor man’s only lamb: "You are that man!" Broken to pieces, David confesses: "I have sinned against the Lord."',
        humanAngle: 'Total stripping of defense mechanisms. No excuses, no spin doctoring — only raw repentance.',
        readerConnection: 'When your sin is exposed, drop your defenses immediately. God cannot heal the excuses you defend.',
        goDeeper: {
          culturalContext: 'Speaking truth to an oriental monarch usually meant instant execution; Nathan risked his life to deliver God’s conviction.',
          crossReference: 'Psalm 51.'
        }
      },
      {
        id: 'david-9',
        order: 9,
        title: 'Fleeing Absalom’s Rebellion',
        passageReference: '2 Samuel 15:13-30',
        whatHappened: 'David’s own son Absalom leads a bloody coup. David flees barefoot up the Mount of Olives weeping, submitting to God’s mercy rather than destroying Jerusalem in war.',
        humanAngle: 'A father’s heartbreak: bearing the painful consequences of his past with deep humility.',
        readerConnection: 'Even in seasons of painful consequences, you can walk in quiet dignity and trust God to judge righteously.',
        goDeeper: {
          culturalContext: 'Walking barefoot with head covered was the universal sign of mourning and humiliation in ancient Israel.',
          crossReference: 'Psalm 3.'
        }
      },
      {
        id: 'david-10',
        order: 10,
        title: 'The Final Charge to Solomon',
        passageReference: '1 Kings 2:1-4',
        whatHappened: 'On his deathbed, David charges young Solomon: "Be strong, act like a man, and observe what the Lord your God requires." He finishes his race passing on wisdom.',
        humanAngle: 'Looking back over a turbulent life of battle and repentance, focusing on passing eternal truth.',
        readerConnection: 'The ultimate legacy is not the wealth you accumulate, but whether you taught the next generation to walk in truth.',
        goDeeper: {
          culturalContext: 'Dynastic successions were almost always violent bloodbaths; David established covenant obedience as the throne’s foundation.',
          crossReference: 'Joshua 1:7-8.'
        }
      }
    ]
  },
  {
    id: 'jesus',
    name: 'Jesus',
    tagline: 'The Servant King who stepped into our storm',
    bio: 'The Word made flesh who walked dusty Roman-occupied roads, touched the untouchable, felt our sorrow, and conquered death once and for all.',
    avatarIcon: '✝️',
    moments: [
      {
        id: 'jesus-1',
        order: 1,
        title: 'The Word Made Flesh',
        passageReference: 'John 1:1-14',
        whatHappened: 'The eternal Word through whom all things were made enters human history as a vulnerable infant, taking up residence among broken humanity.',
        humanAngle: 'God did not shout instructions from safe distance; He stepped directly into our mud and pain.',
        readerConnection: 'Whatever you are facing today, you are not praying to a distant idea. Jesus knows what cold nights and tired feet feel like.',
        goDeeper: {
          culturalContext: 'John uses "tabernacled among us" (eskenosen), echoing the ancient desert wilderness tent of God’s presence.',
          crossReference: 'Colossians 1:15-17.'
        }
      },
      {
        id: 'jesus-2',
        order: 2,
        title: 'Wilderness Temptation',
        passageReference: 'Matthew 4:1-11',
        whatHappened: 'After forty days of fasting in the desert, the tempter challenges Jesus to turn stones into bread, jump from the temple pinnacle, and seize worldly empires.',
        humanAngle: 'Enduring intense biological hunger and pressure without taking short cuts to power.',
        readerConnection: 'When you are drained and vulnerable, the enemy tempts you with immediate relief. Stand firm on God’s Word.',
        goDeeper: {
          culturalContext: 'Jesus answers every temptation with Deuteronomy, reliving Israel’s forty-year wilderness test and overcoming where they failed.',
          crossReference: 'Hebrews 4:15.'
        }
      },
      {
        id: 'jesus-3',
        order: 3,
        title: 'Calling the Disciples at the Sea',
        passageReference: 'Mark 1:16-20',
        whatHappened: 'Walking along the Sea of Galilee, Jesus calls ordinary working fishermen Simon, Andrew, James, and John: "Follow me, and I will make you fishers of men."',
        humanAngle: 'Inviting everyday working people into a global redemptive mission.',
        readerConnection: 'Jesus does not recruit religious celebrities. He meets you in your daily work and gives your labor eternal meaning.',
        goDeeper: {
          culturalContext: 'Rabbis waited for students to apply and pass rigorous tests; Jesus broke custom by personally seeking out working-class men.',
          crossReference: '1 Corinthians 1:26-29.'
        }
      },
      {
        id: 'jesus-4',
        order: 4,
        title: 'Sermon on the Mount: The Beatitudes',
        passageReference: 'Matthew 5:1-12',
        whatHappened: 'Sitting on the hillside, Jesus turns worldly priorities upside down: blessing the poor in spirit, the meek, the peacemakers, and those who mourn.',
        humanAngle: 'Announcing a revolutionary kingdom where heart posture matters more than external status.',
        readerConnection: 'Stop measuring your worth by worldly metrics of clout and dominance. In God’s kingdom, humility is true power.',
        goDeeper: {
          culturalContext: 'Roman society rewarded ruthless power and military conquest; Jesus declared the gentle inherit the earth.',
          crossReference: 'Psalm 37:11.'
        }
      },
      {
        id: 'jesus-5',
        order: 5,
        title: 'Calming the Sea of Galilee',
        passageReference: 'Mark 4:35-41',
        whatHappened: 'A flash squall floods the fishing boat while Jesus sleeps in the stern. Woken by terrified disciples, He commands the gale: "Peace! Be still!" and the lake falls flat calm.',
        humanAngle: 'Absolute peace resting in the Father, followed by sovereign authority over the elements.',
        readerConnection: 'The storm may be loud outside your boat, but Jesus is bigger than whatever is keeping you awake tonight.',
        goDeeper: {
          culturalContext: 'In Jewish cosmology, only Yahweh has authority to command the sea (Psalm 89:9, Psalm 107:29).',
          crossReference: 'Job 38:8-11.'
        }
      },
      {
        id: 'jesus-6',
        order: 6,
        title: 'Washing the Disciples’ Feet',
        passageReference: 'John 13:1-17',
        whatHappened: 'On the night He was betrayed, Jesus wraps a towel around His waist, pours water into a basin, and washes the dirty feet of the twelve disciples, including Judas.',
        humanAngle: 'Supreme power expressed as humble, gentle service to friends and betrayers alike.',
        readerConnection: 'Real leadership does not demand perks; it picks up a towel and serves the people around you.',
        goDeeper: {
          culturalContext: 'Foot washing was the lowest task in antiquity, reserved for non-Jewish slaves.',
          crossReference: 'Philippians 2:3-5.'
        }
      },
      {
        id: 'jesus-7',
        order: 7,
        title: 'Agony in Gethsemane',
        passageReference: 'Luke 22:39-46',
        whatHappened: 'Under ancient olive trees in the pitch dark, Jesus wrestles in prayer, sweating drops like blood: "Father, if you are willing, take this cup from me; yet not my will, but yours be done."',
        humanAngle: 'Facing immense emotional anguish and the horror of the cross, choosing obedience.',
        readerConnection: 'It is not a sin to tell God how heavy your burden feels, so long as you surrender with: "Your will be done."',
        goDeeper: {
          culturalContext: 'Hematidrosis is a documented clinical phenomenon where severe emotional anguish ruptures subcutaneous capillaries.',
          crossReference: 'Hebrews 5:7-8.'
        }
      },
      {
        id: 'jesus-8',
        order: 8,
        title: 'The Crucifixion at Golgotha',
        passageReference: 'Luke 23:32-46',
        whatHappened: 'Mocked, beaten, and nailed to Roman wood between two criminals, Jesus prays for His executioners: "Father, forgive them, for they know not what they do," before crying out: "It is finished."',
        humanAngle: 'Bearing the ultimate weight of human sin and darkness with pure, forgiving love.',
        readerConnection: 'There is no wound, guilt, or shame in your past that was not absorbed and paid for on that hill.',
        goDeeper: {
          culturalContext: 'Crucifixion was Rome’s most horrific punishment, specifically designed to publicize shame and agony.',
          crossReference: 'Isaiah 53:4-6.'
        }
      },
      {
        id: 'jesus-9',
        order: 9,
        title: 'The Empty Tomb and Victory',
        passageReference: 'John 20:1-18',
        whatHappened: 'On Sunday morning, Mary Magdalene finds the heavy stone rolled back and Jesus alive in the garden. Death has been swallowed up in victory.',
        humanAngle: 'The final triumph of light over darkness; calling Mary by name in the garden.',
        readerConnection: 'Whatever looks permanently dead and defeated in your life, Jesus has the final word over the grave.',
        goDeeper: {
          culturalContext: 'First-century women were not legally valid witnesses in court, proving the Gospel accounts were truthful history rather than invented myths.',
          crossReference: '1 Corinthians 15:54-57.'
        }
      },
      {
        id: 'jesus-10',
        order: 10,
        title: 'The Great Commission',
        passageReference: 'Matthew 28:16-20',
        whatHappened: 'On a mountain in Galilee, the risen Christ delivers His mandate: "All authority has been given to me. Go therefore and make disciples of all nations... and behold, I am with you always."',
        humanAngle: 'Entrusting the mission of the ages to ordinary disciples, with the promise of His constant presence.',
        readerConnection: 'You are never sent into your home, workplace, or community alone. He walks with you every single day.',
        goDeeper: {
          culturalContext: 'Jesus closes Matthew with the exact promise He began with: Immanuel — "God with us".',
          crossReference: 'Acts 1:8.'
        }
      }
    ]
  },
  {
    id: 'mary',
    name: 'Mary',
    tagline: 'Surrendered faith, maternal joy, and the pierced soul',
    bio: 'A young girl from an obscure village who answered God’s impossible calling with total surrender, treasured divine moments in her heart, and stood faithful at the cross.',
    avatarIcon: '🕊️',
    moments: [
      {
        id: 'mary-1',
        order: 1,
        title: 'The Annunciation in Nazareth',
        passageReference: 'Luke 1:26-38',
        whatHappened: 'Angel Gabriel appears in Nazareth announcing that young Mary will conceive the Son of God by the Holy Spirit. Despite the social risk of unwed pregnancy, she answers: "May your word to me be fulfilled."',
        humanAngle: 'Facing immense fear and public shame, choosing willing trust over self-preservation.',
        readerConnection: 'Saying yes to God often costs your reputation in the eyes of the crowd. Trust His purpose anyway.',
        goDeeper: {
          culturalContext: 'In first-century Jewish culture, an unexplained pregnancy during betrothal carried the death penalty by stoning under Deuteronomy 22.',
          crossReference: 'Isaiah 7:14.'
        }
      },
      {
        id: 'mary-2',
        order: 2,
        title: 'The Magnificat Song of Praise',
        passageReference: 'Luke 1:46-55',
        whatHappened: 'Visiting her cousin Elizabeth, Mary bursts into a theological song: "My soul glorifies the Lord... He has brought down rulers from their thrones and lifted up the humble."',
        humanAngle: 'Radical joy erupting from a humble young woman steeped in the ancient scriptures.',
        readerConnection: 'True worship is not about how polished you are; it is about recognizing how great God is to the humble.',
        goDeeper: {
          culturalContext: 'Mary’s song closely parallels Hannah’s prayer in 1 Samuel 2, showing her deep grasp of Israel’s redemptive history.',
          crossReference: '1 Samuel 2:1-10.'
        }
      },
      {
        id: 'mary-3',
        order: 3,
        title: 'Giving Birth in Bethlehem',
        passageReference: 'Luke 2:1-7',
        whatHappened: 'After a grueling eighty-mile journey from Nazareth to Bethlehem under Roman census decree, Mary gives birth in a cattle stable and lays her baby in a stone feeding trough.',
        humanAngle: 'Physical exhaustion in a crowded town with no comfort, holding the promised King.',
        readerConnection: 'God often brings His greatest promises to life in unglamorous, inconvenient circumstances.',
        goDeeper: {
          culturalContext: 'A "katalyma" (guest room) was packed with relatives; Jesus was likely born in the lower animal area of a family home.',
          crossReference: 'Micah 5:2.'
        }
      },
      {
        id: 'mary-4',
        order: 4,
        title: 'Simeon’s Prophecy of the Pierced Soul',
        passageReference: 'Luke 2:25-35',
        whatHappened: 'Presenting Jesus at the temple, aged Simeon blesses the child and warns Mary: "A sword will pierce your own soul too."',
        humanAngle: 'The sobering reminder that motherhood to the Messiah would include deep grief.',
        readerConnection: 'Walking with God does not exempt you from heartache; it guarantees that your tears will have redemptive weight.',
        goDeeper: {
          culturalContext: 'Mary and Joseph offered two turtledoves, the legal sacrifice designated for poor families unable to afford a lamb (Leviticus 12:8).',
          crossReference: 'John 19:25.'
        }
      },
      {
        id: 'mary-5',
        order: 5,
        title: 'Flight into Egypt Under Cover of Night',
        passageReference: 'Matthew 2:13-15',
        whatHappened: 'Warned in a dream that King Herod seeks to murder the baby, Joseph and Mary flee as refugees in the middle of the night to Egypt.',
        humanAngle: 'The terror of being hunted displaced refugees protecting an infant.',
        readerConnection: 'God protects His own in the middle of hostile political regimes. Keep moving in obedience.',
        goDeeper: {
          culturalContext: 'Alexandria and Lower Egypt had large Jewish expatriate communities where the family could safely assimilate.',
          crossReference: 'Hosea 11:1.'
        }
      },
      {
        id: 'mary-6',
        order: 6,
        title: 'Finding Twelve-Year-Old Jesus in the Temple',
        passageReference: 'Luke 2:41-52',
        whatHappened: 'After a full day’s travel home from Passover, Mary and Joseph realize Jesus is missing. After three days of frantic searching, they find Him discussing Torah with temple elders.',
        humanAngle: 'A mother’s panic and bewilderment: "Son, why have you treated us like this?"',
        readerConnection: 'There are times when you will not fully understand what God is doing; treasure His ways and keep walking.',
        goDeeper: {
          culturalContext: 'Pilgrim caravans traveled with women and children in front, men behind; it was easy to assume a child was with the other group.',
          crossReference: 'Malachi 3:1.'
        }
      },
      {
        id: 'mary-7',
        order: 7,
        title: 'The Wedding at Cana',
        passageReference: 'John 2:1-11',
        whatHappened: 'When the wine runs dry at a wedding, Mary brings the problem directly to Jesus and tells the servants: "Do whatever he tells you."',
        humanAngle: 'Quiet confidence in her Son’s compassion and power.',
        readerConnection: 'When resources run dry in your home, bring the need to Jesus and do whatever He tells you.',
        goDeeper: {
          culturalContext: 'Running out of wine at a wedding feast was a severe social catastrophe and grounds for legal lawsuits in ancient Galilee.',
          crossReference: 'Psalm 104:14-15.'
        }
      },
      {
        id: 'mary-8',
        order: 8,
        title: 'Standing at the Foot of the Cross',
        passageReference: 'John 19:25-27',
        whatHappened: 'While others flee, Mary stands right beneath the cross. In His dying agony, Jesus looks down at her and commits her care to John: "Woman, here is your son."',
        humanAngle: 'The sword piercing her soul as Simeon had foretold; seeing her Son murdered while He cares for her future.',
        readerConnection: 'When pain is at its highest, stay close. Faithful presence matters more than words.',
        goDeeper: {
          culturalContext: 'As a likely widow with no other adult support present, Mary would have faced destitution without Jesus arranging her care.',
          crossReference: 'Psalm 22:1.'
        }
      },
      {
        id: 'mary-9',
        order: 9,
        title: 'Praying in the Upper Room at Pentecost',
        passageReference: 'Acts 1:12-14; 2:1-4',
        whatHappened: 'Following the resurrection and ascension, Mary joins the apostles and Jesus’ brothers in constant prayer in Jerusalem, receiving the Holy Spirit at Pentecost.',
        humanAngle: 'Enduring from Bethlehem to the cross and standing as a pillar of the birth of the church.',
        readerConnection: 'Faithful endurance outlives the storms of life. Stay in prayer and watch God’s promises unfold.',
        goDeeper: {
          culturalContext: 'Jesus’ biological brothers (James, Jude) who previously doubted Him are now united in prayer alongside Mary.',
          crossReference: 'Joel 2:28-29.'
        }
      }
    ]
  },
  {
    id: 'paul',
    name: 'Paul',
    tagline: 'The persecutor, the missionary, and the chained champion',
    bio: 'A fiery Pharisee who hunted Christians until blinded by heaven’s light, turned into an unstoppable missionary across the Roman empire, and finished his race in chains with joy.',
    avatarIcon: '📜',
    moments: [
      {
        id: 'paul-1',
        order: 1,
        title: 'Consenting to Stephen’s Stoning',
        passageReference: 'Acts 7:58-8:3',
        whatHappened: 'Young Saul guards the coats of the men stoning Stephen to death, breathing threats and ravaging the early church from house to house.',
        humanAngle: 'Blinded by religious pride, convinced he was doing God’s work through hatred and violence.',
        readerConnection: 'No past is too dark for God’s grace. If He could redeem Saul, He can redeem anyone.',
        goDeeper: {
          culturalContext: 'Saul studied in Jerusalem under Gamaliel, the premier rabbinic legal scholar of the era.',
          crossReference: '1 Timothy 1:12-16.'
        }
      },
      {
        id: 'paul-2',
        order: 2,
        title: 'Blinded on the Damascus Road',
        passageReference: 'Acts 9:1-19',
        whatHappened: 'On the road to Damascus, a blinding light knocks Saul to the ground. A voice speaks: "Saul, Saul, why do you persecute me?" Three days later, scales fall from his eyes.',
        humanAngle: 'Total shattering of certainty. The hunter became the captive of Christ.',
        readerConnection: 'Sometimes God has to knock you off your high horse and blind your self-reliance so you can truly see.',
        goDeeper: {
          culturalContext: 'Jesus identifies Himself directly with His persecuted followers: persecuting them was persecuting Him.',
          crossReference: 'Galatians 1:11-16.'
        }
      },
      {
        id: 'paul-3',
        order: 3,
        title: 'Singing in the Philippian Stocks at Midnight',
        passageReference: 'Acts 16:22-34',
        whatHappened: 'Stripped, beaten with rods, and clamped in inner dungeon stocks, Paul and Silas spend midnight praying and singing hymns. An earthquake breaks their chains, and they lead the jailer to faith.',
        humanAngle: 'Refusing to let bleeding backs and cold stone floors extinguish their praise.',
        readerConnection: 'Your praise in the middle of suffering shakes foundations and shows watching people where real hope lives.',
        goDeeper: {
          culturalContext: 'Philippi was a Roman colony; beating Roman citizens without trial was a grave imperial violation, yet Paul chose mercy.',
          crossReference: 'Psalm 42:8.'
        }
      },
      {
        id: 'paul-4',
        order: 4,
        title: 'Confronting Philosophers on the Areopagus',
        passageReference: 'Acts 17:22-31',
        whatHappened: 'In intellectual Athens, Paul stands before Stoic and Epicurean scholars, quotes their own poets, and points them to the "Unknown God" who raised Jesus from the dead.',
        humanAngle: 'Engaging brilliant cultural critics with respect, clarity, and bold truth.',
        readerConnection: 'Do not be intimidated by secular culture. Meet people where they are and bridge them to the truth.',
        goDeeper: {
          culturalContext: 'Paul quoted Epimenides of Crete ("In him we live and move and have our being") and Aratus.',
          crossReference: 'Colossians 4:5-6.'
        }
      },
      {
        id: 'paul-5',
        order: 5,
        title: 'Tears and Farewell at Miletus',
        passageReference: 'Acts 20:17-38',
        whatHappened: 'Knowing he faces chains in Jerusalem, Paul gathers the Ephesian elders on the beach, weeping and urging them to protect the flock with selfless love.',
        humanAngle: 'Deep pastoral affection: "I consider my life worth nothing to me; my only aim is to finish the race."',
        readerConnection: 'Pour your life into people so deeply that saying goodbye brings tears of grateful brotherhood.',
        goDeeper: {
          culturalContext: 'Paul had labored three years in Ephesus, working with his own hands as a tentmaker so as not to burden them.',
          crossReference: '2 Corinthians 12:15.'
        }
      },
      {
        id: 'paul-6',
        order: 6,
        title: 'Shipwrecked in the Mediterranean Storm',
        passageReference: 'Acts 27:21-44',
        whatHappened: 'Trapped for two weeks in a hurricane-force gale (Euroclydon) with 276 starving passengers, prisoner Paul stands up and urges them to eat: "Not a hair from any head will perish."',
        humanAngle: 'Calm spiritual leadership steadying seasoned sailors in mortal terror.',
        readerConnection: 'When everyone around you is in panic, be the steady voice of faith who points people toward safety.',
        goDeeper: {
          culturalContext: 'Ancient grain ships were massive 100-foot vessels, but winter Mediterranean squalls were notoriously lethal.',
          crossReference: 'Psalm 107:23-30.'
        }
      },
      {
        id: 'paul-7',
        order: 7,
        title: 'Finishing the Race in Roman Chains',
        passageReference: '2 Timothy 4:6-8',
        whatHappened: 'Awaiting execution under Emperor Nero in a cold cell, Paul writes his final letter: "I have fought the good fight, I have finished the race, I have kept the faith."',
        humanAngle: 'Unbroken serenity at the end of an exhausting, glorious life.',
        readerConnection: 'Live in such a way that when you reach the finish line, you have no regrets and nothing left in the tank.',
        goDeeper: {
          culturalContext: 'The Mamertine prison in Rome was an underground stone cistern where condemned traitors awaited beheading.',
          crossReference: 'Philippians 1:21.'
        }
      }
    ]
  },
  {
    id: 'esther',
    name: 'Esther',
    tagline: 'An orphan girl, a Persian court, and the courage to speak',
    bio: 'An exiled Jewish orphan who rose to Queen of Persia, hid her heritage until crisis struck, and risked her life before the golden scepter for the salvation of her people.',
    avatarIcon: '👑',
    moments: [
      {
        id: 'esther-1',
        order: 1,
        title: 'An Orphan in the Persian Citadel',
        passageReference: 'Esther 2:5-9',
        whatHappened: 'Orphaned young and raised by her cousin Mordecai in Susa, Esther is taken into the imperial harem of King Ahasuerus during a royal search for a new queen.',
        humanAngle: 'Vulnerable in a foreign palace, winning respect through quiet grace and character.',
        readerConnection: 'You may find yourself in environments you did not choose. Conduct yourself with quiet integrity and grace.',
        goDeeper: {
          culturalContext: 'Susa was the winter capital of the vast Persian empire, which stretched from India to modern Ethiopia.',
          crossReference: 'Proverbs 11:16.'
        }
      },
      {
        id: 'esther-2',
        order: 2,
        title: 'Crowned as Queen of Persia',
        passageReference: 'Esther 2:15-18',
        whatHappened: 'When brought before King Ahasuerus, Esther asks for nothing extra beyond what the custodian prescribed. The king loves her above all others and sets the royal crown on her head.',
        humanAngle: 'Restraint and poise: not grabbing for lavish accessories, letting natural character shine.',
        readerConnection: 'Simplicity and inner character stand out far more than desperate attempts to impress the room.',
        goDeeper: {
          culturalContext: 'Esther kept her Jewish heritage secret under Mordecai’s wise counsel, protecting her future leverage.',
          crossReference: '1 Peter 3:3-4.'
        }
      },
      {
        id: 'esther-3',
        order: 3,
        title: 'Haman’s Genocidal Decree',
        passageReference: 'Esther 3:8-15',
        whatHappened: 'Grand vizier Haman convinces the king to issue an unalterable royal decree to annihilate all Jews throughout the empire on a single day, sealed with the king’s signet ring.',
        humanAngle: 'A sudden existential crisis threatening her entire family and heritage.',
        readerConnection: 'Evil schemes often look legally airtight and irreversible, but God is already orchestrating the countermove.',
        goDeeper: {
          culturalContext: 'Haman was an Agagite, a descendant of the Amalekite kings who had historically sought Israel’s destruction.',
          crossReference: 'Exodus 17:14-16.'
        }
      },
      {
        id: 'esther-4',
        order: 4,
        title: 'For Such a Time as This',
        passageReference: 'Esther 4:1-14',
        whatHappened: 'Mordecai sends a message through the eunuch Hathak urging Esther to plead before the king: "Who knows whether you have not come to the kingdom for such a time as this?"',
        humanAngle: 'Fear of execution: approaching the king unsummoned meant immediate death unless he extended the scepter.',
        readerConnection: 'Your position and influence are not for personal comfort; they are for the moment you need to stand up for others.',
        goDeeper: {
          culturalContext: 'Persian royal protocol had armed guards standing beside the throne with axes to execute uninvited petitioners instantly.',
          crossReference: 'Proverbs 24:11-12.'
        }
      },
      {
        id: 'esther-5',
        order: 5,
        title: 'The Fast and "If I Perish, I Perish"',
        passageReference: 'Esther 4:15-17',
        whatHappened: 'Esther resolves to act, asking all Jews in Susa to fast with her for three days: "I will go to the king, even though it is against the law. And if I perish, I perish."',
        humanAngle: 'Crossing the Rubicon: abandoning safety and surrendering her life for her people.',
        readerConnection: 'Courage is not the absence of fear; it is the decision that something else is far more important than your comfort.',
        goDeeper: {
          culturalContext: 'A three-day total fast (no food or water) was an intense spiritual act of repentance and pleading before God.',
          crossReference: 'Daniel 9:3.'
        }
      },
      {
        id: 'esther-6',
        order: 6,
        title: 'The Golden Scepter Extended',
        passageReference: 'Esther 5:1-8',
        whatHappened: 'On the third day, Esther dresses in royal robes and stands in the inner court. The king smiles, extends his golden scepter, and asks what she desires.',
        humanAngle: 'Heart pounding as she approached the throne, met by unmerited royal favor.',
        readerConnection: 'When you take bold steps in obedience to God, He goes before you and opens doors no man can shut.',
        goDeeper: {
          culturalContext: 'Esther did not blurt out her demand immediately; she wisely invited the king and Haman to a banquet first, building trust.',
          crossReference: 'Proverbs 21:1.'
        }
      },
      {
        id: 'esther-7',
        order: 7,
        title: 'The Unmasking at the Banquet',
        passageReference: 'Esther 7:1-6',
        whatHappened: 'At the second banquet, Esther reveals her identity and pleads for her people: "We have been sold to be destroyed." The shocked king asks who did this: "This vile Haman!"',
        humanAngle: 'Magnificent courage: speaking truth to power in the presence of her deadly enemy.',
        readerConnection: 'Do not stay silent when injustice strikes. When the time is right, speak plainly and clearly.',
        goDeeper: {
          culturalContext: 'Haman fell onto the couch where Esther was reclining, violating court protocol and sealing his immediate execution.',
          crossReference: 'Psalm 7:15-16.'
        }
      },
      {
        id: 'esther-8',
        order: 8,
        title: 'The Deliverance of Her People',
        passageReference: 'Esther 8:3-8; 9:20-22',
        whatHappened: 'Though the first decree cannot be revoked, Esther and Mordecai write a new decree authorizing the Jews to defend themselves, turning grief into celebration (Purim).',
        humanAngle: 'Watching terror and mourning transform into generational joy and security.',
        readerConnection: 'God can flip the script on situations that looked completely hopeless. Trust the author of the story.',
        goDeeper: {
          culturalContext: 'Purim is still celebrated annually with the reading of the Megillah (Scroll of Esther) in Jewish synagogues worldwide.',
          crossReference: 'Psalm 30:11.'
        }
      }
    ]
  }
];

export function getCharacterArc(id: string): CharacterArc | undefined {
  return CHARACTER_ARCS.find((c) => c.id === id);
}

const STORAGE_KEY = 'testament_followed_characters';

export function getFollowedCharacterIds(): string[] {
  try {
    if (typeof localStorage === 'undefined') return ['peter']; // Default follow Peter
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return ['peter'];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : ['peter'];
  } catch {
    return ['peter'];
  }
}

export function toggleFollowCharacter(id: string): boolean {
  try {
    const current = getFollowedCharacterIds();
    let updated: string[];
    let nowFollowing = false;
    if (current.includes(id)) {
      updated = current.filter((x) => x !== id);
      nowFollowing = false;
    } else {
      updated = [...current, id];
      nowFollowing = true;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return nowFollowing;
  } catch {
    return false;
  }
}
