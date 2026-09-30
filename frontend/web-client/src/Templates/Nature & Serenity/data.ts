export interface ValueItem {
  title: string;
  description: string;
  icon: string;
}

export interface TimelineMilestone {
  year: string;
  title: string;
  description: string;
  image: string;
  aspect: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  image: string;
  type: 'image' | 'video';
  aspect: 'landscape' | 'portrait' | 'square';
}

export interface StoryCard {
  title: string;
  date: string;
  image?: string;
  description: string;
  category: string;
}

export interface PlaceCard {
  name: string;
  reflection: string;
  image: string;
}

export interface JoyItem {
  title: string;
  description: string;
  icon: string;
}

export interface GratitudeNote {
  title: string;
  reflection: string;
  pinnedAngle: string; // CSS rotation angle
}

export interface VitalDetails {
  birthDate: string;
  birthPlace: string;
  deathDate?: string | null;
  status: 'Living' | 'Deceased';
  lifespan: string;
  currentAge?: string;
  nationality: string;
  profession: string;
}

export interface BiographyChapter {
  id: string;
  chapterNumber: string;
  era: string;
  title: string;
  subtitle: string;
  image: string;
  quote?: string;
  paragraphs: string[];
  keyHighlights: string[];
}

export interface ContactInfo {
  name: string;
  studioName: string;
  addressLine1: string;
  cityStateZip: string;
  country: string;
  email: string;
  secondaryEmail: string;
  phone: string;
  visitingHours: string;
  socials: {
    platform: string;
    handle: string;
    url: string;
  }[];
}

export const BIO_DATA = {
  fullName: "Aveline Thorne",
  tagline: "Finding the rhythm of the soul in the quiet whispers of the forest.",
  avatarImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=700&q=80", // Serene rustic portrait
  heroBg: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1920&q=80", // Misty deep pine forest
  
  // Vital details (Birth / Death details for biographical template)
  vitalDetails: {
    birthDate: "April 14, 1988",
    birthPlace: "Mendocino County, California, USA",
    deathDate: null, // Supports "Present" for living or date for historical memorial biographies
    status: "Living",
    lifespan: "1988 – Present",
    currentAge: "38 years",
    nationality: "American",
    profession: "Botanical Illustrator & Wilderness Chronicler"
  } as VitalDetails,

  // Location details
  location: "Mendocino Coast & Sierra Nevada, California, USA",

  // Introduction
  shortIntro: "I am a botanical illustrator, conservationist, and wilderness chronicler. My life is dedicated to listening to the ancient pine woodlands, sketching the delicate anatomy of wild flora, and guiding others back to the peaceful sanctuary of the earth.",
  introGreeting: "Welcome to my living archive—an enduring record of quiet contemplation, slow craft, and sacred communion with the natural world.",
  
  aboutSummary: "For over two decades, my home has been where the damp earth meets the redwood roots. Raised in the secluded wilderness of Northern California, I learned to identify birds by their flight patterns before I knew the names of constellations. Today, I combine artistic precision with ecological advocacy, handcrafting natural inks from wild walnuts and river clays to paint the portraits of endangered alpine species.",
  
  values: [
    {
      title: "Deep Ecology",
      description: "Believing that humans are not rulers of nature, but a quiet thread woven into its intricate tapestry.",
      icon: "Leaf"
    },
    {
      title: "Radical Simplicity",
      description: "Living with intention, stripping away the noise to make space for genuine wonder and quietude.",
      icon: "Compass"
    },
    {
      title: "Creative Reverence",
      description: "Treating every botanical sketch as an act of devotion, capturing the soul of wild things.",
      icon: "PenTool"
    }
  ],

  hobbies: [
    "Handcrafting organic pigments from berries & minerals",
    "Wild mushroom foraging & forest botany walks",
    "Analog soundscapes of early morning birdsong",
    "Reading naturalist poetry beneath cedar canopies",
    "Restoring local wetlands and planting wildflower corridors"
  ],

  journey: [
    {
      year: "1988",
      title: "Rooted in the Redwoods",
      description: "Born and raised in a rustic cabin amidst the fog-shrouded forests of Mendocino. My early days were spent collecting fern spores, sketching moss, and keeping a daily handmade field journal.",
      image: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=800&q=80", // Forest cabin scene
      aspect: "portrait"
    },
    {
      year: "2010",
      title: "The Botanical Canvas",
      description: "Studied Environmental Studies and Classical Scientific Illustration in Seattle. Perfected the meticulous craft of dry-brush watercolor and microscopic plant dissection under the guidance of master naturalists.",
      image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=80", // Sketchbook with watercolors
      aspect: "landscape"
    },
    {
      year: "2016",
      title: "Alpine Sanctuary",
      description: "Spent four years in the high meadows of Switzerland, collaborating with alpine parks to document endangered high-altitude flora. Living in a remote valley taught me the profound language of seasonal silence.",
      image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80", // Serene alpine peaks
      aspect: "landscape"
    },
    {
      year: "2021",
      title: "Lakeside Solace",
      description: "Settled by a quiet glacial lake in the Sierra Nevada. Hand-built a small wooden studio using fallen cedar logs. Here, my husband and I began our family, teaching our young daughter the names of lichen and rain patterns.",
      image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80", // Wooden cozy cabin
      aspect: "portrait"
    },
    {
      year: "Present Day",
      title: "The Serene Chronicle",
      description: "Publishing hand-bound collections of forest chronicles, teaching slow botanical art as a meditation technique, and establishing community seed banks to protect rare native wildflowers.",
      image: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=800&q=80", // Old leather books
      aspect: "landscape"
    }
  ] as TimelineMilestone[],

  gallery: [
    {
      id: "gal-1",
      title: "Damp Redwood Canopy in Morning Fog",
      category: "Landscape",
      image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80",
      type: "image",
      aspect: "landscape"
    },
    {
      id: "gal-2",
      title: "Detailed Study of Dryopteris Fern",
      category: "Botanical Detail",
      image: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=800&q=80",
      type: "image",
      aspect: "portrait"
    },
    {
      id: "gal-3",
      title: "Lakeside Studio Workspace at Golden Hour",
      category: "Atmosphere",
      image: "https://images.unsplash.com/photo-1452802447250-470a88ac82bc?auto=format&fit=crop&w=800&q=80",
      type: "image",
      aspect: "square"
    },
    {
      id: "gal-4",
      title: "A Gathering of Wild Walnut and Oak Galls",
      category: "Still Life",
      image: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80",
      type: "image",
      aspect: "portrait"
    },
    {
      id: "gal-5",
      title: "Quiet Stream Flowing Through Ancient Rocks",
      category: "Nature's Rhythm",
      image: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=1200&q=80",
      type: "video", // This will render with a custom beautiful glassmorphic play button
      aspect: "landscape"
    },
    {
      id: "gal-6",
      title: "Wildflowers and Pressed Foliage",
      category: "Botanical Detail",
      image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80",
      type: "image",
      aspect: "square"
    }
  ] as GalleryItem[],

  stories: [
    {
      title: "The Solace of Midnight Rain",
      date: "October 14, 2024",
      image: "https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?auto=format&fit=crop&w=800&q=80", // Rain on forest leaf
      description: "Waking up at 2:00 AM under a linen canvas tent to the deep, resonant drumming of mountain rain. In that cold forest air, I felt the comforting realization that the earth knows exactly how to heal itself.",
      category: "Journal Entry"
    },
    {
      title: "Finding the Winter Anemone",
      date: "February 3, 2025",
      image: "https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=800&q=80", // Snow cabin pine
      description: "Trekking through the crisp, white snow banks of Tahoe only to discover a tiny, delicate purple blossom pushing through a granite fissure. A silent lesson in gentleness conquering hardship.",
      category: "Field Notes"
    },
    {
      title: "The Quiet Heritage of Moss",
      date: "May 19, 2025",
      image: "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=800&q=80", // Velvet mossy forest log
      description: "Spending an entire afternoon sitting on an old oak log with my six-year-old niece, tracing the soft velvet topography of moss. Pass on the reverence, and you pass on the legacy of survival.",
      category: "Personal Reflection"
    }
  ] as StoryCard[],

  reflections: {
    peace: "The fragrance of fresh pine needles after a heavy thunderstorm, the crackle of cedar firewood, and the complete silence of morning mist hovering above the lakeside water.",
    lessons: "The forest never competes; it collaborates. The tall pine shelters the young fern, and the decaying leaf feeds the sapling. Slowing down isn't a retreat—it is the only way to genuinely listen.",
    philosophy: "To tread lightly with bare feet, to draw with absolute honesty, to live by the cycle of the sun, and to leave every woodland a little deeper than we found it.",
    quotes: [
      {
        text: "In all things of nature, there is something of the marvelous.",
        author: "Aristotle"
      },
      {
        text: "The clearest way into the Universe is through a forest wilderness.",
        author: "John Muir"
      }
    ],
    grateful: "The grace of high sight that lets me witness the invisible capillary networks inside a leaf; the quiet strength of my companion; the pure icy mountain spring water that flows behind our cedar studio."
  },

  seasons: [
    {
      emoji: "🌱",
      name: "Spring",
      symbol: "Childhood & Wild Roots",
      desc: "A season of pure discovery. Wandering barefoot across alpine valleys, filling leather journals with graphite doodles, and learning that the soil has a song if you lean down close enough."
    },
    {
      emoji: "☀",
      name: "Summer",
      symbol: "Ecology & Wandering",
      desc: "Years of scientific precision and vast horizons. Climbing granite peaks at dawn to map rare blooms, sleeping under meteor showers, and finding a voice in the union of science and art."
    },
    {
      emoji: "🍂",
      name: "Autumn",
      symbol: "Family & Deep Canopy",
      desc: "Building our wooden sanctuary, cradling my child under old branches, and understanding that shedding one's leaves is not a loss, but a quiet preparation for a deeper rebirth."
    },
    {
      emoji: "❄",
      name: "Winter",
      symbol: "Reflection & Legacy",
      desc: "Gathering beside the stone fireplace, indexing thirty years of illustrated botanicals, and sharing the medicine of slow living and ink-making with those seeking calm in a hurried world."
    }
  ],

  places: [
    {
      name: "The Redwood Circle",
      reflection: "An ancient, sacred fairy ring of redwoods behind our cabin. Standing inside this giant wooden cathedral, the wind is reduced to a soft whisper, and time itself seems to stand still.",
      image: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=800&q=80"
    },
    {
      name: "Sapphire Alpine Tarn",
      reflection: "A tiny glacial lake tucked away at 9,000 feet in the mountains. Its waters are a pristine, shocking turquoise, reflecting the cold granite sky like a highly polished mirror.",
      image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80"
    },
    {
      name: "The Moss Porch",
      reflection: "My favorite spot on our self-built cabin. The porch steps dip directly into the crystal water. It's where I sit every morning with a wooden mug of cedar-needle tea to watch the ducks dive.",
      image: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=800&q=80"
    },
    {
      name: "Wildflower Meadow",
      reflection: "A high mountain valley that ignites into a riot of lupines, fireweeds, and paintbrush in June. The fragrance alone is enough to cure any quiet sorrow of the mind.",
      image: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&w=800&q=80"
    }
  ] as PlaceCard[],

  joys: [
    {
      title: "Morning Pine Tea",
      description: "Brewing fresh white pine needles gathered from our courtyard, warming cold fingers around a clay cup.",
      icon: "CupSoda"
    },
    {
      title: "Pressing Wild Ferns",
      description: "The slow, quiet tactile ritual of arranging lace-like fronds between thick, heavy maple boards.",
      icon: "BookOpen"
    },
    {
      title: "Analog Journaling",
      description: "The scratch of steel dip pens on heavy cotton rag paper, documenting the daily rain and soil temperature.",
      icon: "Feather"
    },
    {
      title: "Sound Mapping",
      description: "Sitting silently with an old reel-to-reel tape deck to record the crackle of autumn leaves and stream flows.",
      icon: "Radio"
    },
    {
      title: "Dusk Forest Walks",
      description: "Slowing our pace to match the evening deer, walking until our eyes adjust to the soft forest starlight.",
      icon: "Footprints"
    },
    {
      title: "Listening to Rain",
      description: "Lying beneath our pine rafters, letting the steady rhythmic thrum of rain on tin clear our modern thoughts.",
      icon: "CloudRain"
    }
  ] as JoyItem[],

  gratitude: [
    {
      title: "Ancient Guardians",
      reflection: "Grateful for the towering 500-year-old sugar pines that encircle our home, absorbing the high winds and giving us sweet pollen in the spring.",
      pinnedAngle: "-rotate-2"
    },
    {
      title: "Tactile Artistry",
      reflection: "Deeply thankful for the gift of healthy hands and eyesight, allowing me to paint the molecular veins of a spruce needle.",
      pinnedAngle: "rotate-3"
    },
    {
      title: "Lakeside Silence",
      reflection: "For a space where there are no car horns, sirens, or artificial sirens—only the wind through the bullrushes.",
      pinnedAngle: "-rotate-1"
    },
    {
      title: "Generations of Wonder",
      reflection: "For my daughter, who already knows that wood-sorrel is sour and that lichen only grows where the air is perfectly pure.",
      pinnedAngle: "rotate-2"
    },
    {
      title: "Organic Pigments",
      reflection: "For the local black walnut tree, which drops rich husks that produce the most gorgeous, velvety sepia ink.",
      pinnedAngle: "-rotate-3"
    },
    {
      title: "Naturalist Friendships",
      reflection: "For friends across the globe who exchange local heirloom seeds in hand-stamped envelopes.",
      pinnedAngle: "rotate-1"
    }
  ] as GratitudeNote[],

  letter: {
    salutation: "To the Traveler of the Future,",
    paragraphs: [
      "I write this letter from a simple hand-built table of cedar, looking out at a glacial lake that has been here long before my ancestry, and will remain long after my bones feed the soil.",
      "In your time, the world may be faster, louder, and more crowded. Concrete may cover some of my beloved paths, and screens may demand your constant, exhausting devotion. But I beg you, do not let your soul forget the sacred dialect of the trees.",
      "Spend days without purpose or devices. Go outside when it rains and feel the cool moisture on your palms. Press your bare feet against the damp moss. Learn the names of the wild things—not just to catalog them, but to greet them as neighbors. Understand that you are not separate from this landscape; you are a living, breathing extension of it.",
      "In a world that demands rapid growth and continuous consumption, dare to grow slowly. Roots take decades to hold; trees take centuries to mature. Be patient with your own seasons, trust your quiet winter, and bloom when your spring arrives. Stand tall, tread lightly, and let peace be your anchor."
    ],
    signOff: "With deep woodland reverence,",
    signature: "Aveline Thorne"
  },

  // Comprehensive Full Biography Chapters
  fullBiography: [
    {
      id: "bio-ch-1",
      chapterNumber: "Chapter I",
      era: "1988 – 2006",
      title: "The Redwood Cradle",
      subtitle: "Childhood in the Mendocino Wilderness & Early Field Notes",
      image: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=800&q=80",
      quote: "Before I knew how to name the stars, I knew the scent of damp redwood loam after first autumn rain.",
      paragraphs: [
        "Aveline Thorne was born on April 14, 1988, in a hand-hewn cedar cabin bordered by the ancient coastal redwoods of Mendocino County, California. Raised in a home powered by kerosene lamps and woodstoves, her earliest childhood was shaped by the perpetual rhythms of maritime fog, Pacific ocean winds, and towering sequoia groves.",
        "By age seven, Aveline was entrusted with her first blank linen sketchbook. While other children collected plastic toys, she collected fallen chinquapin husks, dried lady ferns, and owl pellets. Her mother, an amateur herbalist, taught her to identify edible wild greens, while her father, an architect turned carpenter, instilled in her a profound reverence for structural geometry—a precision that later became the hallmark of her botanical illustrations.",
        "During her teenage years, she spent countless hours along the Big River estuary, observing how saltwater and freshwater merged to nurture delicate marsh orchids. It was during these solitary adolescent rambles that she realized art was not merely representation, but an act of witness and conservation."
      ],
      keyHighlights: [
        "Born April 14, 1988 in Mendocino County, CA",
        "Kept uninterrupted daily field notebooks from age seven",
        "Learned natural medicine and woodcraft from homesteading parents"
      ]
    },
    {
      id: "bio-ch-2",
      chapterNumber: "Chapter II",
      era: "2007 – 2015",
      title: "The Botanical Eye",
      subtitle: "Classical Apprenticeship, University Studies & Mineral Inks",
      image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=80",
      quote: "A botanical illustrator does not merely copy nature; she interprets the quiet architecture of life itself.",
      paragraphs: [
        "In the autumn of 2007, Aveline moved to the Pacific Northwest to pursue formal studies in Environmental Science and Classical Scientific Illustration at the University of Washington. Under the mentorship of master botanical artists, she spent long days in university herbariums examining centuries-old pressed specimens under brass stereomicroscopes.",
        "Rejecting synthetic acrylics and factory-tube paints, Aveline apprenticed with an artisanal ink maker in Seattle. She learned the lost art of foraging natural lake pigments: crushing iron-rich river silt for warm ochres, boiling wild black walnut hulls for deep sepia, and collecting oak galls to brew archival iron gall ink.",
        "Her graduation thesis—a 120-plate monograph detailing the ephemeral understory flora of the Olympic Rain Forest—was awarded highest honors and acquired by regional botanical archives, launching her career as one of her generation's most distinct environmental chroniclers."
      ],
      keyHighlights: [
        "Double degree in Botany & Classical Scientific Illustration",
        "Mastered historical recipes for mineral and botanical ink crafting",
        "Commissioned for Pacific Northwest rare understory flora survey"
      ]
    },
    {
      id: "bio-ch-3",
      chapterNumber: "Chapter III",
      era: "2016 – 2020",
      title: "Alpine Solitudes",
      subtitle: "Four Years Documenting High-Altitude Swiss Flora & The Philosophy of Slowness",
      image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
      quote: "At nine thousand feet, plants don't grow tall to compete; they cling tight to granite and bloom with ferocity.",
      paragraphs: [
        "In 2016, Aveline accepted an invitational naturalist residency in the Swiss Engadin valley. For four rigorous years, she lived in an alpine stone challet, waking before dawn to hike into glacial cirques above 2,500 meters.",
        "Here, she documented how cushion plants, dwarf willows, and ancient saxifrages survive under meters of winter snowpack. The extreme conditions forced a shift in her artistic practice: working with frozen water bottles and graphite on rag paper, she learned to capture the essential spirit of a plant in mere moments before snow squalls rolled in.",
        "The alpine years solidified her core philosophy: 'The Slow Botanical Ethos.' She began writing essays on ecological grief and seasonal patience, arguing that modern burnout is fundamentally a symptom of disconnection from natural dormancy cycles."
      ],
      keyHighlights: [
        "Cataloged 140+ high-alpine species in the Swiss Alps",
        "Authored 'The Language of Lichen' illustrated journal",
        "Formulated the foundational principles of Slow Botanical Art"
      ]
    },
    {
      id: "bio-ch-4",
      chapterNumber: "Chapter IV",
      era: "2021 – Present",
      title: "The Sierra Sanctuary",
      subtitle: "Lakeside Studio, Family Roots & Living Stewardship",
      image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80",
      quote: "To leave behind a clean stream and a seed bank is a far greater masterpiece than any painting on a gallery wall.",
      paragraphs: [
        "Returning to California in 2021, Aveline and her partner settled by a quiet glacial tarn in the Sierra Nevada mountains. Utilizing fallen pine and cedar timbers, they constructed 'Sequoia Whispers Studio'—a zero-net-energy woodland atelier surrounded by native lupine meadows.",
        "The birth of her daughter Eleanor in 2022 brought a renewed intimacy to her work. Her recent series explores the generational transmission of ecological wonder—capturing small moments such as teaching a toddler to recognize wood sorrel or listening to the nocturnal calls of great horned owls.",
        "Today, Aveline divides her time between custom monograph commissions, hosting seasonal slow-art retreats, and stewarding a native wildflower seed bank designed to restore pollinator corridors across wildfire-affected regions."
      ],
      keyHighlights: [
        "Established Sequoia Whispers Studio in the Sierra Nevada",
        "Co-founded the High Sierra Native Seed Sanctuary",
        "Currently chronicling an archival book on seasonal mindfulness"
      ]
    }
  ] as BiographyChapter[],

  // Detailed Contact Coordinates
  contactInfo: {
    name: "Aveline Thorne",
    studioName: "Sequoia Whispers Studio",
    addressLine1: "P.O. Box 412, Cedar Hollow Trail",
    cityStateZip: "Mendocino, CA 95460",
    country: "United States",
    email: "aveline@sequoiawhispers.com",
    secondaryEmail: "studio@avelinethorne.art",
    phone: "+1 (707) 937-5820",
    visitingHours: "Studio visits welcomed by appointment during spring & autumn equinoxes",
    socials: [
      { platform: "Instagram", handle: "@aveline.thorne", url: "#instagram" },
      { platform: "Substack Field Notes", handle: "The Unhurried Botanist", url: "#substack" },
      { platform: "Flora Archive", handle: "Aveline-Botanica", url: "#github" },
      { platform: "Letterbox", handle: "Inquiries & Commissions", url: "#contact" }
    ]
  } as ContactInfo
};
