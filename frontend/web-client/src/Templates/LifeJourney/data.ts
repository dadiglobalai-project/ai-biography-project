import { BiographyCategory } from './types';

export const CATEGORIES_DATA: Record<'life' | 'visionary' | 'entrepreneur', BiographyCategory> = {
  life: {
    id: 'life',
    title: 'Life Journey',
    badge: 'CLASSIC MEMOIR',
    quote: '"A JOURNEY THROUGH THE LAND"',
    description: 'Complete autobiography template emphasizing chronologies, personal milestones, and wisdom gathered.',
    settings: {
      theme: 'cream',
      fontPairing: 'classic',
      spacing: 'spacious'
    },
    personalDetails: {
      fullName: "Julian Vance",
      tagline: "Crafting timeless organic furniture and restoring wooden vessels from the ancient cedar and redwood forests of the Oregon coast.",
      birthDetails: "Born May 14, 1952 • Coos Bay, Oregon",
      location: "Currently residing in Cannon Beach, Oregon",
      shortIntro: "Born in a rugged harbor town on the Pacific Northwest coast, I spent my youth around timber mills and foggy shipyards. I dedicated my life to the honest scent of sawdust, the curve of hand-carved cedar hulls, and the slow, perfect joints of mid-century furniture. This digital cabin houses my notebooks, archives, and the memory of things built to last generations.",
      bioFull: "I have always believed that wood is a living history book, holding the weather and spirit of the years in its rings. From my early days as an apprentice shipwright in Astoria to my decades shaping custom walnut furniture in my Portland workshop, my guides have been the steady rhythm of the hand plane, the grain of native walnut, and the salt of the Pacific Ocean.\n\nNow, retired to a quiet studio overlooking the monoliths of Cannon Beach, I look back on a life spent in deep conversation with the forests of Oregon. This archive is a tribute to raw materials, clean joinery, and the wonderful people who sat at my tables, sailed my canoes, and filled my days with warmth and laughter.",
      signatureQuote: "To build something with your hands is to make a contract with time. If you shape it with care and respect for the tree, it will tell your story long after you are gone.",
      occupation: "Master Carpenter & Shipwright",
      coordinates: "CANNON BEACH, OR // 45.8918° N, 123.9615° W",
      coordsLabel: "Tide is coming in",
      coordsSub: "Cedar sawdust spiced breeze"
    },
    values: [
      {
        id: "v1",
        title: "Honesty of Material",
        description: "Working with native timber like Oregon walnut and cedar, respecting the knots, grains, and beautiful flaws that tell the tree's unique history.",
        icon: "Leaf"
      },
      {
        id: "v2",
        title: "The Living Apprentice",
        description: "Passing down traditional woodworking techniques to the next generation. True legacy is not built in wood, but in the hands of those we teach.",
        icon: "Heart"
      },
      {
        id: "v3",
        title: "Functional Silence",
        description: "Creating pieces that serve a quiet purpose—furniture that doesn't scream for attention, but settles comfortably into the daily patterns of home.",
        icon: "Compass"
      },
      {
        id: "v4",
        title: "Craftsmanship as Worship",
        description: "Slowing down. A joint is not just a connection; it is a promise of durability, requiring patience, precise hands, and deep concentration.",
        icon: "Feather"
      }
    ],
    hobbies: [
      {
        id: "h1",
        title: "Wooden Boat Building",
        description: "Restoring vintage cedar canoes and building wooden rowing skiffs. Navigating the cold Pacific swells in a vessel shaped by your own hand is unmatched.",
        icon: "Sprout",
        imageUrl: "https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?auto=format&fit=crop&q=80&w=800"
      },
      {
        id: "h2",
        title: "Landscape Sketching",
        description: "Carrying a leather sketchpad on wilderness hikes to document the twisted shore pines, sea arches, and raw topography of the coast.",
        icon: "BookOpen",
        imageUrl: "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&q=80&w=800"
      },
      {
        id: "h3",
        title: "Traditional Joinery",
        description: "Practicing traditional Japanese joinery techniques that require zero metal nails or glue. It is a puzzle of absolute precision and absolute patience.",
        icon: "Palette",
        imageUrl: "https://images.unsplash.com/photo-1581428982868-e410dd047a90?auto=format&fit=crop&q=80&w=800"
      },
      {
        id: "h4",
        title: "Mountain Wandering",
        description: "Exploring the misty, moss-draped trails of the Cascade Range. Walking among the old-growth giants keeps the spirit small and the mind clear.",
        icon: "Mountain",
        imageUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=800"
      }
    ],
    timeline: [
      {
        id: "m1",
        year: "1952 – 1970",
        era: "youth",
        title: "The Timber & Tide Days",
        location: "Coos Bay & Astoria, Oregon",
        description: "My early years were spent in my father's small boat repair shop, surrounded by salt-crusted hulls, timber mills, and the roaring ocean. Here, I first learned that wood is not static, but a living medium that responds to water, wind, and time.",
        details: [
          "Born to a coastal fisherman and a botanical illustrator in Coos Bay.",
          "Learned the fundamentals of steam-bending wood and caulking wooden hulls at age twelve.",
          "Graduated from Astoria High School, crafting a cedar canoe as my final shop project.",
          "Sourced beach-combed driftwood to carve small bird and fish figurines, learning to follow natural grain patterns."
        ],
        imageUrl: "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=800",
        imageCaption: "Julian, age 8, exploring the old harbor shipyards of Coos Bay (1960)."
      },
      {
        id: "m2",
        year: "1971 – 1975",
        era: "youth",
        title: "Mastering the Chisel",
        location: "Astoria Shipyards, Oregon",
        description: "Serving a rigorous apprenticeship under old-school Scandinavian shipwrights, learning to read the grains of timber, split logs cleanly along natural fiber lines, and mold heavy oak timbers using steam.",
        details: [
          "Worked sixty-hour weeks restoring classic wooden salmon trollers and tugboats.",
          "Mastered the use of traditional hand tools—the adze, drawknife, and slick chisel.",
          "Spent winter nights drafting sailboat lines on large lofting floors.",
          "Studied the properties of native Douglas fir, Sitka spruce, and Port Orford cedar under Norwegian masters."
        ],
        imageUrl: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=800",
        imageCaption: "Hand chisels and adzes used during my shipbuilding apprenticeship in Astoria (1973)."
      },
      {
        id: "m3",
        year: "1976 – 1998",
        era: "middle",
        title: "The Vance Workshop",
        location: "Portland, Oregon",
        description: "Establishing my independent studio in Portland, transitioning from heavy maritime boatbuilding to custom organic modern furniture that honors the natural, unrefined contours of the Pacific Northwest trees.",
        details: [
          "Opened a small workshop in an old brick warehouse in the Portland Industrial District (1976).",
          "Gained national acclaim for my 'River Table' series, merging wild-edge walnut with smoked glass.",
          "Exhibited custom sculptural furniture at galleries in San Francisco, Seattle, and Tokyo.",
          "Pioneered sustainable sourcing methods, rescuing urban storm-felled timber and river-salvaged logs."
        ],
        imageUrl: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=800",
        imageCaption: "Julian in his Portland studio, custom-carving a walnut rocking chair (1985)."
      },
      {
        id: "m4",
        year: "1978 – Present",
        era: "middle",
        title: "The Heart of the Home",
        location: "Cannon Beach, Oregon",
        description: "Marrying Sarah Vance, raising three adventurous children, and building our hand-hewn, timber-framed cedar home in Cannon Beach—a labor of love that stood as a testament to craftsmanship and family resilience.",
        details: [
          "Married Sarah in a beachside ceremony during a glorious Oregon sunset (1978).",
          "Designed and built our family home over two years, sourcing recycled timbers from old bridges.",
          "Taught our kids to fish, carve small birds, and handle a sailboat in rough coastal bays.",
          "Constructed a timber-framed garden shed and greenhouse using traditional mortise-and-tenon joinery."
        ],
        imageUrl: "https://images.unsplash.com/photo-1485738422979-f5c462d49f74?auto=format&fit=crop&q=80&w=800",
        imageCaption: "The Vance family sitting on the beach near Haystack Rock (1989)."
      },
      {
        id: "m5",
        year: "1999 – Present",
        era: "recent",
        title: "The Shoreline Studio",
        location: "Cannon Beach, Oregon",
        description: "Retiring from full-scale commercial production to focus on teaching the next generation, restoring historic wooden yachts, and writing reflective essays on the spiritual side of working with hand tools.",
        details: [
          "Opened a non-profit cooperative workshop for young carpenters and wooden boat builders.",
          "Authored the bestselling essay collection 'The Grain of Truth: A Life in Woodcraft' (2008).",
          "Enjoying the steady companionship of six grandchildren, teaching them the smell of cedar shavings.",
          "Received the Oregon Governor's Arts Award for lifetime dedication to preserving regional craft heritage."
        ],
        imageUrl: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=800",
        imageCaption: "The quiet interior of the Shoreline Studio in Cannon Beach, Oregon (2012)."
      }
    ],
    gallery: [
      {
        id: "g1",
        title: "The Boatyard Shed",
        category: "family",
        imageUrl: "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=800",
        caption: "The sun streaming into my father's old workshop where my love for tools was first born.",
        year: "1964"
      },
      {
        id: "g2",
        title: "The Draftsman Table",
        category: "career",
        imageUrl: "https://images.unsplash.com/photo-1508962914676-134849a727f0?auto=format&fit=crop&q=80&w=800",
        caption: "Hand-drawn blueprints of a custom walnut dining table drafted on my vintage drafting table.",
        year: "1982"
      },
      {
        id: "g3",
        title: "Launch Day",
        category: "family",
        imageUrl: "https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?auto=format&fit=crop&q=80&w=800",
        caption: "Our first family-built wooden rowing skiff sliding into the cold waters of Nehalem Bay.",
        year: "1989"
      },
      {
        id: "g4",
        title: "The Coastal Trail",
        category: "travel",
        imageUrl: "https://images.unsplash.com/photo-1485738422979-f5c462d49f74?auto=format&fit=crop&q=80&w=800",
        caption: "Watching the fog roll in past Haystack Rock during a winter morning driftwood collection.",
        year: "2015"
      },
      {
        id: "g5",
        title: "The Tool Rack",
        category: "creative",
        imageUrl: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=800",
        caption: "A collection of antique Japanese hand planes and Swiss chisels, kept razor-sharp and organized.",
        year: "2024"
      },
      {
        id: "g6",
        title: "Walnut & Wedges",
        category: "creative",
        imageUrl: "https://images.unsplash.com/photo-1541123437800-1bb1317badc2?auto=format&fit=crop&q=80&w=800",
        caption: "A close-up of an organic walnut bench showing the hand-cut butterfly joints and satin oil finish.",
        year: "2025"
      }
    ],
    stories: [
      {
        id: "s1",
        title: "The Language of Cedar",
        date: "November 14, 1968",
        readTime: "4 min read",
        category: "Early Memories",
        imageUrl: "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=800",
        shortDescription: "How a master shipwright taught a stubborn sixteen-year-old apprentice that you cannot force your will upon wood, but must instead ask for its permission.",
        fullStory: "My mentor in the Astoria yards was Nils Berg, a third-generation Norwegian shipwright whose hands looked like gnarled oak roots and whose voice sounded like dry gravel.\n\nOne rainy Thursday, I was trying to bend an exceptionally thick white cedar plank around the frame of a salmon troller. I was frustrated, using heavy clamps and hammering the wood, trying to force it into place. Nils watched me silently for ten minutes, chewing on a matchstick. Finally, he walked over, laid his massive hand on my shoulder, and said: 'Stop. You are fighting the wood, Julian. If you fight the wood, she will split tomorrow, or in five years when the boat is in a storm. Wood has a memory of the mountain it grew on. You must steam her longer, talk to her, and let her find the curve herself.'\n\nHe had me take the plank down, place it back into the steam box, and sit down to drink a cup of strong black coffee. He taught me that day that craftsmanship is not about conquering raw materials. It is a negotiation. When you respect the wood, she will keep you safe in the middle of the sea."
      },
      {
        id: "s2",
        title: "The Table in the Trees",
        date: "September 8, 1984",
        readTime: "6 min read",
        category: "Journeys & Careers",
        imageUrl: "https://images.unsplash.com/photo-1541123437800-1bb1317badc2?auto=format&fit=crop&q=80&w=800",
        shortDescription: "A journey deep into the Cascade foothills to salvage an ancient fallen walnut tree, and the beautiful table that connected two families across generations.",
        fullStory: "In the late summer of 1984, I received a letter from an elderly orchardist named Arthur Miller. He lived in the Cascade foothills and had a magnificent, century-old black walnut tree that had fallen during a severe windstorm. He didn't want it turned into cheap firewood. He asked if I could give it a second life.\n\nMy assistant and I drove up with a flatbed truck and spent three grueling days milling the massive trunk into thick slabs right there on the forest floor. The scent of fresh walnut—spicy, rich, and earthy—filled the air. One particular slab had a gorgeous, wild double-curve and a deep hollow in the center where a branch had once been.\n\nI spent six months in my Portland workshop drying, planing, and hand-sanding that slab. Instead of cutting it square, I left the natural live edge, filling the middle void with a custom-cut sheet of deep green glass that mimicked the flow of a forest river. Arthur sat at that finished dining table on his golden wedding anniversary, tears in his eyes as he traced the grain of the tree he had climbed as a child. That table didn't just support dinner plates; it held sixty years of family laughter."
      },
      {
        id: "s3",
        title: "The Sailing Lesson",
        date: "August 12, 1993",
        readTime: "5 min read",
        category: "Wanderlust",
        imageUrl: "https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?auto=format&fit=crop&q=80&w=800",
        shortDescription: "A sudden, fierce summer squall in Tillamook Bay that tested our family-built sailboat, and what the wild wind taught my young son about courage.",
        fullStory: "We had finished the 'Sundance', an 18-foot wooden pocket cruiser, just two weeks prior. My son Peter was ten, his eyes wide with the nervous excitement of our first overnight voyage. We set sail under clear skies in Tillamook Bay, but by mid-afternoon, the Pacific had brewed a fierce, sudden gale.\n\nThe waves turned grey and choppy, slapping hard against our cedar hull. The wind whistled through the rigging. Peter was terrified, clinging tightly to the coaming, his face pale with sea spray. I felt a pang of guilt for bringing him out.\n\nInstead of panic, I handed him the tiller. 'Peter, feel the boat,' I said, raising my voice over the roar. 'The cedar wants to float. She knows how to climb the waves. You don't fight the ocean; you just guide her shoulder.'\n\nHis small hands gripped the oak tiller. I showed him how to point her slightly into the wind, riding the swells instead of taking them broadside. As he felt the hull lift and slide gracefully over each peak, the terror in his eyes dissolved into absolute concentration. We rode into the sheltered harbor of Garibaldi just as the sun broke through the clouds. Peter looked up at me, drenched and beaming, and said: 'Dad, she built us, didn't she?' He was right. A good boat doesn't just cross the water; she builds the character of those on board."
      }
    ]
  },
  visionary: {
    id: 'visionary',
    title: 'Visionary Legacy',
    badge: 'BOLD & CREATIVE',
    quote: '"THE VISIONARY WHO CHANGED THE WAY WE LIVE"',
    description: 'A high-contrast, bold template designed for leaders, innovators, and creators who forged new paths.',
    settings: {
      theme: 'charcoal',
      fontPairing: 'modern',
      spacing: 'spacious'
    },
    personalDetails: {
      fullName: "Julian Vance",
      tagline: "Shaping the future of architectural woodwork. Creating monumental kinetic timber sculptures that bridge nature, geometry, and human experience.",
      birthDetails: "Born May 14, 1952 • Coos Bay, Oregon",
      location: "Currently residing in Cannon Beach, Oregon",
      shortIntro: "Born into an era of rapid change, I saw trees not just as lumber, but as dynamic structural forces. I dedicated my career to pioneering kinetic architecture and giant timber joints that withstand earthquakes and Pacific gales. This digital archive showcases my blueprints, monument drawings, and the legacy of structures built to shape communities.",
      bioFull: "I believe that architecture should live, breathe, and adapt. From my early experiments with tensegrity structures in the wind-swept Oregon dunes to my decades designing massive cedar community halls, my life has been a search for structural truth.\n\nNow, as my kinetic monuments stand as landmarks along the West Coast, I document the sketches, calculations, and stories behind these grand-scale wooden wonders. This portfolio is for those who dare to dream in timber, steel, and light.",
      signatureQuote: "To build a monument is to engage in a dialogue with gravity. If you align your lines with the natural vectors of the earth, your work will dance with the wind and outlive the centuries.",
      occupation: "Kinetic Architect & Structural Pioneer",
      coordinates: "CANNON BEACH MONUMENT // 45.8918° N, 123.9615° W",
      coordsLabel: "Sensing Coast Winds",
      coordsSub: "Kinetic vectors active"
    },
    values: [
      {
        id: "v1",
        title: "Tensegrity & Balance",
        description: "Creating monumental structures that balance heavy timber tension with steel cable compression, mimicking the natural resilience of coastal cedar.",
        icon: "Compass"
      },
      {
        id: "v2",
        title: "The Community Shelter",
        description: "Designing sweeping public spaces where communities gather. Architecture is only as grand as the warmth of the humans it protects.",
        icon: "Heart"
      },
      {
        id: "v3",
        title: "Kinetic Movement",
        description: "Engineering timber that moves. Incorporating natural wind-driven pivots and wooden gears that allow structures to adapt to coastal storms.",
        icon: "Leaf"
      },
      {
        id: "v4",
        title: "The Eternal Draft",
        description: "Slowing down the blueprint stage. A perfectly resolved blueprint contains the math of the universe, waiting to be brought to life.",
        icon: "Feather"
      }
    ],
    hobbies: [
      {
        id: "h1",
        title: "Kinetic Wood Sculpting",
        description: "Engineering modular wooden gears and pendulums that react to changing winds. Elevating joinery into a physical dance of gravity.",
        icon: "Sprout",
        imageUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800"
      },
      {
        id: "h2",
        title: "Mathematical Drafting",
        description: "Sinking into geometry. Rendering hyper-precise blueprint curves using hand dividers, T-squares, and high-density ink on heavy parchment.",
        icon: "BookOpen",
        imageUrl: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=800"
      },
      {
        id: "h3",
        title: "Large-Scale Timber Framing",
        description: "Splicing ten-ton coastal fir beams with interlocking wooden keys. Crafting seismic-resistant frames that require zero metal nails.",
        icon: "Palette",
        imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800"
      },
      {
        id: "h4",
        title: "Cosmic Wind-Sensing",
        description: "Mapping the atmospheric pressure and airflows of mountain valleys. Understanding how to align rooftops with natural wind highways.",
        icon: "Mountain",
        imageUrl: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=800"
      }
    ],
    timeline: [
      {
        id: "m1",
        year: "1952 – 1970",
        era: "youth",
        title: "The Geometry of Shorelines",
        location: "Coos Bay, Oregon",
        description: "My early years were spent mapping the mathematical spirals of seashells, tide patterns, and storm-bent cedar branches.",
        details: [
          "Developed a passion for geometry under my mother, an botanical illustrator.",
          "Constructed small scale wind turbines and gliders in our beach shed by age fourteen.",
          "Graduated with honors, constructing an aerodynamic wood dome model as a final project."
        ],
        imageUrl: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=800",
        imageCaption: "Julian, age 12, mapping storm wind vectors on the dunes (1964)."
      },
      {
        id: "m2",
        year: "1971 – 1975",
        era: "youth",
        title: "Structural Revolution",
        location: "University of Washington",
        description: "Studying seismic architecture and tension structures, learning how organic wood acts as a smart seismic absorber.",
        details: [
          "Published breakthrough research on hyper-flexible timber joints in earthquake zones.",
          "Worked on experimental tensegrity structures with pioneering West Coast architects.",
          "Designed a self-supporting geodesic greenhouse on the rugged Olympic Peninsula."
        ]
      },
      {
        id: "m3",
        year: "1976 – 1998",
        era: "middle",
        title: "The Monument Years",
        location: "Pacific Northwest",
        description: "Establishing my design collective. Transitioning from blueprints to public monumental timber architecture.",
        details: [
          "Designed the iconic Oregon Coastal Pavilion, a masterwork of self-supporting kinetic pine beams.",
          "Honored with the National Green Guild Award for architectural carbon-neutral innovations (1987).",
          "Commissioned to build wind-reactive public sculptures in San Francisco, Seattle, and Vancouver."
        ],
        imageUrl: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80&w=800",
        imageCaption: "The Coastal Pavilion construction site with giant cedar columns rising (1983)."
      },
      {
        id: "m4",
        year: "1978 – Present",
        era: "middle",
        title: "An Anchor in the Wind",
        location: "Cannon Beach, Oregon",
        description: "Marrying Sarah, raising three children in our custom geometric glass-and-timber geodesic home.",
        details: [
          "Built our solar-powered geodesic beach house utilizing recycled logs and passive sea-breeze cooling.",
          "Taught our children the geometry of waves, sailing math, and wood framing.",
          "Hosted legendary summer retreats for revolutionary designers and environmental builders."
        ],
        imageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800",
        imageCaption: "Julian and Sarah atop Cascade Peak planning the geodesic beach retreat (1980)."
      },
      {
        id: "m5",
        year: "1999 – Present",
        era: "recent",
        title: "The Legacy Blueprint",
        location: "Cannon Beach, Oregon",
        description: "Transitioning from physical monuments to archiving blueprints and mentoring the next generation of eco-architects.",
        details: [
          "Founded the Shoreline Architectural Fellowship for revolutionary sustainable designs.",
          "Published the bestselling manifesto 'Resilient Beams: The Future of Organic Cities' (2009).",
          "Developing open-source blueprints for off-grid coastal shelters and community hubs."
        ]
      }
    ],
    gallery: [
      {
        id: "g1",
        title: "The Geodesic Frame",
        category: "family",
        imageUrl: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=800",
        caption: "Early framing stages of the geodesic dome under misty Oregon morning light.",
        year: "1979"
      },
      {
        id: "g2",
        title: "Blueprint No. 8",
        category: "career",
        imageUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800",
        caption: "The mathematical calculations and tension curves for the Pavilion's self-supporting roof.",
        year: "1982"
      },
      {
        id: "g3",
        title: "Monument Elevation",
        category: "family",
        imageUrl: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80&w=800",
        caption: "Looking directly up into the kinetic wood rafters of our coastal landmark.",
        year: "1988"
      },
      {
        id: "g4",
        title: "Starry Summit",
        category: "travel",
        imageUrl: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=800",
        caption: "Astrophotography study from the deck of our high Cascade mountain outpost.",
        year: "2016"
      },
      {
        id: "g5",
        title: "Drawn Connections",
        category: "creative",
        imageUrl: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=800",
        caption: "Abstract sketching showing the intersection of structural beams and kinetic force directions.",
        year: "2023"
      },
      {
        id: "g6",
        title: "The Tension Joint",
        category: "creative",
        imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800",
        caption: "Close-up profile of the interlocking compression joint with a modern glass boundary.",
        year: "2025"
      }
    ],
    stories: [
      {
        id: "s1",
        title: "The Wave and the Wedge",
        date: "October 11, 1974",
        readTime: "5 min read",
        category: "Early Research",
        imageUrl: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=800",
        shortDescription: "A massive storm on the Pacific coast that inspired a mathematical joint system capable of absorbing seismic forces in architectural lumber.",
        fullStory: "In my senior year of university, a major storm hit the coast, washing away several wooden piers but leaving the storm-swept coastal pine trees completely unharmed. I sat on a sand dune, wrapped in a thick wool coat, watching the pines bend nearly forty-five degrees and then whip back into shape.\n\nI realized then that our architectural thinking was completely backwards. We were building rigid wooden boxes that tried to resist the earth's movement by brute force. If the force was greater than our nails, the building cracked. Nature, however, survived through compliance and flexibility.\n\nI spent that winter designing the 'Compliance Wedge'—a wood-and-steel pivot joint that allows massive timber framing to twist and flex during a tremor, dissipating energy rather than snapping. When we tested the joint on a seismic shake table in Seattle, the engineers were stunned: it absorbed ninety percent of the shockwaves. A building should not stand like a stone; it should sway like a tree in a gale."
      },
      {
        id: "s2",
        title: "The Pavilion of Whispers",
        date: "June 24, 1985",
        readTime: "7 min read",
        category: "Structures & Legacy",
        imageUrl: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80&w=800",
        shortDescription: "Sourcing seventy-foot salvage cedar beams to build a public monument that breathes with the wind and amplifies the songs of the sea.",
        fullStory: "When the city of Astoria commissioned us to build the Community Pavilion, they wanted a building that represented the spirit of the shore. I wanted to build a structure that was literally played by the elements like an instrument.\n\nWe salvaged twelve massive, seventy-foot cedar poles from a decomissioned logging bridge in the mountains. We cleaned them by hand, keeping their natural curves, and erected them in a sweeping circle. For the roof, we designed a series of louvers that tilted open and shut depending on wind direction, using balance counterweights made of local river stone.\n\nOn opening day, as a heavy sea fog swept across the bay, the roof louvers slowly turned, letting out a deep, harmonious hum as the wind brushed through them. Inside, the sound of the crashing waves was perfectly focused, creating an acoustic sanctuary. The mayor called it 'The Pavilion of Whispers.' It proved that architecture does not have to block nature; it can translate its voice."
      },
      {
        id: "s3",
        title: "Taming the Sky",
        date: "August 18, 1997",
        readTime: "6 min read",
        category: "Monuments",
        imageUrl: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=800",
        shortDescription: "Assembling a thirty-foot wind sculpture atop a high Cascade peak, and what a sudden lightning strike taught us about absolute grounding.",
        fullStory: "We were installing 'Aero-Timber', a thirty-foot kinetic wooden sculpture with sweeping sails of lightweight cedar, on a high ridge overlooking Mount Hood. The sculpture was designed to spin and pivot, tracking the thermal winds of the valley. It was the culmination of three years of math and wind tunnel testing.\n\nOn the final day of assembly, an unforecasted electric storm rolled in. The clouds turned black, and the air crackled with static electricity. Suddenly, a bolt of lightning struck a dead pine just fifty yards from our ridge. The shockwave knocked us off our feet, and our ears rang with the thunder.\n\nWe scrambled down the mountain in a downpour, terrified that the bolt had shattered our wooden masterpiece. When the storm passed, we climbed back up. The sculpture was completely untouched, spinning silently in the clean mountain air. I had spent so much time engineering it to handle wind forces that I had forgotten the ultimate law of heights: grounding. My assistant had quietly installed a heavy copper grounding wire along the central pivot column, saving our work from turning into charcoal. It was a lesson in humility: your creation can reach for the sky, but it must always have a direct, robust connection to the earth."
      }
    ]
  },
  entrepreneur: {
    id: 'entrepreneur',
    title: 'Entrepreneur Story',
    badge: 'PROFESSIONAL',
    quote: '"DOCUMENT YOUR BUSINESS ADVENTURES"',
    description: 'Tailored for founders, pathfinders, and industry pioneers to archive their ventures, failures, and triumphs.',
    settings: {
      theme: 'sage',
      fontPairing: 'editorial',
      spacing: 'compact'
    },
    personalDetails: {
      fullName: "Julian Vance",
      tagline: "Scaling artisan craftsmanship into a global timberworks enterprise. Championing sustainable forestry, business ventures, and industrial design.",
      birthDetails: "Born May 14, 1952 • Coos Bay, Oregon",
      location: "Currently residing in Cannon Beach, Oregon",
      shortIntro: "A craftsman by nature, a builder of enterprises by choice. I spent forty years scaling a local workshop into Pacific Timberworks—employing over two hundred carpenters, managing sustainable forest supply chains, and delivering high-end custom cabinetry worldwide. This archive documents my business logs, investment letters, and the wisdom of managing a creative empire.",
      bioFull: "Business is not just about balance sheets; it is about scaling trust. From a single small-town workspace to manufacturing facilities across the Pacific Northwest, my goal has always been to maintain artisan quality at an industrial scale. We navigated inflation crises, supply chain logjams, and the tough transition to automated CNC millings while keeping our hearts rooted in the smell of cedar.\n\nNow retired from the board, I share the business cases, structural turnarounds, and management frameworks that allowed us to craft a legacy. This space serves as an executive blueprint for creative founders and industrial pioneers.",
      signatureQuote: "A great company is like a complex dovetail joint. It requires diverse pieces, absolute precision, and an unyielding commitment to hold together under immense external pressure.",
      occupation: "Founder & Chairman Emeritus",
      coordinates: "PACIFIC TIMBERWORKS HQ // 45.8918° N, 123.9615° W",
      coordsLabel: "Sustainable Supply Chain",
      coordsSub: "3 trees planted per log"
    },
    values: [
      {
        id: "v1",
        title: "Artisan Scale",
        description: "Proving that you can manufacture thousands of design units without losing the signature touch, hand-inspected finishes, and pride of the local carpenter.",
        icon: "Compass"
      },
      {
        id: "v2",
        title: "Ecological Forestry",
        description: "Investing in sustainable forest plots, planting three trees for every log harvested, and proving that business can thrive in harmony with nature.",
        icon: "Leaf"
      },
      {
        id: "v3",
        title: "Founder Apprenticeship",
        description: "Mentoring creative executives. Teaching them that a company's culture is its most valuable product, requiring constant care and shaping.",
        icon: "Heart"
      },
      {
        id: "v4",
        title: "Resilient Operations",
        description: "Designing business processes that bend with market trends without breaking. Operational flexibility is the key to corporate longevity.",
        icon: "Feather"
      }
    ],
    hobbies: [
      {
        id: "h1",
        title: "Forest Resource Scouting",
        description: "Hiking private and state timber forests to evaluate timber density and negotiate conservation-minded harvesting agreements with landowners.",
        icon: "Sprout",
        imageUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=800"
      },
      {
        id: "h2",
        title: "Executive Journaling",
        description: "Documenting strategic business philosophies, market cycle analysis, and corporate management frameworks in my leather-bound journals.",
        icon: "BookOpen",
        imageUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=800"
      },
      {
        id: "h3",
        title: "CNC & Manual Millwork",
        description: "Merging computerized robotic milling with manual carpenter assembly. Creating hybrid lines that combine the best of both worlds.",
        icon: "Palette",
        imageUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=800"
      },
      {
        id: "h4",
        title: "Strategic Hiking",
        description: "Escaping the boardrooms for multi-day hikes along the coastal mountain ranges to review growth, recharge, and map long-term investments.",
        icon: "Mountain",
        imageUrl: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&q=80&w=800"
      }
    ],
    timeline: [
      {
        id: "m1",
        year: "1952 – 1970",
        era: "youth",
        title: "The Ledger of Sawdust",
        location: "Coos Bay, Oregon",
        description: "My early years were spent working as a teenage clerk at local timber mills, learning the business of log grading, supply logs, and mill operations.",
        details: [
          "Managed accounts and cataloged redwood timber loads at age fifteen.",
          "Studied local timber logistics and ocean port shipping routines.",
          "Graduated with a deep understanding of wood commodities and coastal shipping."
        ],
        imageUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=800",
        imageCaption: "Julian, age 16, stacking fresh-cut cedar planks at the local mill (1968)."
      },
      {
        id: "m2",
        year: "1971 – 1975",
        era: "youth",
        title: "Industrial Logistics",
        location: "University of Oregon",
        description: "Studying business administration while working as a forklift driver, learning how timber supply chains flow from forest to factory.",
        details: [
          "Developed innovative software tracking algorithms for regional logging fleets.",
          "Graduated with a degree in Operations Management and Sustainable Forestry.",
          "Drafted the initial business plan for Pacific Timberworks in a crowded college cafe."
        ]
      },
      {
        id: "m3",
        year: "1976 – 1998",
        era: "middle",
        title: "Pacific Timberworks Inc.",
        location: "Portland Headquarters",
        description: "Incorporating Pacific Timberworks, scaling from a small cabinet workshop to an eighty thousand square foot robotic manufacturing facility.",
        details: [
          "Secured first venture funding to build a state-of-the-art eco-mill (1979).",
          "Expanded distribution to forty states and twelve international architectural markets.",
          "Named Pacific Northwest Businessman of the Year for ethical employee compensation practices (1994)."
        ],
        imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800",
        imageCaption: "Pacific Timberworks corporate office rising in Portland (1991)."
      },
      {
        id: "m4",
        year: "1978 – Present",
        era: "middle",
        title: "Family & Enterprise",
        location: "Oregon Coast",
        description: "Partnering with Sarah to manage company benefits, building a company-town daycare, and raising our children.",
        details: [
          "Established the Vance Conservation Foundation, securing 5,000 acres of old-growth forest.",
          "Built a state-of-the-art employee health and child care campus at our mills.",
          "Passed down executive shares and management roles to our three capable children."
        ],
        imageUrl: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=800",
        imageCaption: "Celebrating the company's twentieth anniversary with employees and family (1996)."
      },
      {
        id: "m5",
        year: "1999 – Present",
        era: "recent",
        title: "The Advisory Board",
        location: "Cannon Beach, Oregon",
        description: "Stepping down as CEO, serving as Chairman Emeritus, and funding local sustainable forestry and woodcraft startups.",
        details: [
          "Managed a smooth CEO succession to daughter Nora Vance (2001).",
          "Invested over $20M in ethical forest start-ups and regional woodworking fellowships.",
          "Erecting a public carpentry center in Cannon Beach to offer free trade education to youth."
        ]
      }
    ],
    gallery: [
      {
        id: "g1",
        title: "The Nursery",
        category: "family",
        imageUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=800",
        caption: "Our tree nursery where we grew native pine and redwood seedlings for forest restoration.",
        year: "1981"
      },
      {
        id: "g2",
        title: "Sourcing Ledger",
        category: "career",
        imageUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=800",
        caption: "Original ledger tracking wood inventory, shipments, and forest sustainability coordinates.",
        year: "1983"
      },
      {
        id: "g3",
        title: "The Industrial Mill",
        category: "family",
        imageUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=800",
        caption: "Inside our automated fabrication plant showing CNC cutters paired with master carpenters.",
        year: "1995"
      },
      {
        id: "g4",
        title: "Forest River Bridge",
        category: "travel",
        imageUrl: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&q=80&w=800",
        caption: "A wood suspension bridge constructed by our team on conservation land in Nehalem.",
        year: "2012"
      },
      {
        id: "g5",
        title: "Board of Directors",
        category: "creative",
        imageUrl: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=800",
        caption: "Sharing wine and plans at the annual Vance Advisory Group dinner in Cannon Beach.",
        year: "2022"
      },
      {
        id: "g6",
        title: "Skyline Headquarters",
        category: "creative",
        imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800",
        caption: "Sleek architectural details of the Pacific Timberworks high-rise offices.",
        year: "2024"
      }
    ],
    stories: [
      {
        id: "s1",
        title: "The Mill and the Meadow",
        date: "May 18, 1979",
        readTime: "5 min read",
        category: "Corporate Foundations",
        imageUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=800",
        shortDescription: "A tough business negotiation with local foresters that led to our pioneering 'Plant-Three, Take-One' corporate environmental charter.",
        fullStory: "When I was trying to buy our first major logging plot in Nehalem Valley, the local community was highly suspicious. They had seen corporate timber giants clear-cut beautiful ridges, leaving nothing but mud and debris. They didn't want another sawmill.\n\nI rented the local grange hall and invited every family in the valley. I stood on the stage with our financial spreadsheets and a box of Douglas fir seedlings. I promised them: 'We will not build a quarry. We will build a crop. For every mature cedar we cut, we will plant three seedlings in its place. We will employ your sons and daughters, pay forty percent over minimum wage, and leave thirty percent of the forest entirely untouched as a permanent refuge.'\n\nIt took three hours of heated debate, but we signed the charter that night. That charter became our brand's absolute competitive advantage. Customers in Seattle and Chicago weren't just buying fine cabinets; they were buying the survival of Oregon's forests. Sustainable business is not a cost center; it is the ultimate marketing engine."
      },
      {
        id: "s2",
        title: "The Pivot of Ninety-Two",
        date: "November 08, 1992",
        readTime: "6 min read",
        category: "Industrial Strategy",
        imageUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=800",
        shortDescription: "How introducing robotic milling machines caused an employee strike, and the corporate treaty that integrated high-tech with human hands.",
        fullStory: "In the early nineties, we were facing intense competition from cheap furniture imports. Our margins were bleeding, and we were falling behind on delivery schedules. I knew we had to modernize. I invested half of our cash reserves in importing high-precision computer-controlled CNC router machines from Germany.\n\nWhen the machines arrived, fear spread through the factory like wildfire. The shop stewards called a strike, blockading the doors. They believed the steel robots were going to steal their jobs and destroy our artisan soul.\n\nI walked into the picket line alone, carrying a thermos of coffee. I gathered the master carpenters and said: 'The machines can cut a perfect circle in three seconds, but they don't have eyes. They can't see the grain swirl. They can't feel the oil finish. I am not replacing you. I am freeing you. The machines will do the boring, heavy cutting, and you will do the complex assembly, the butterfly joints, the fine sanding, and the inspection.'\n\nWe signed the 'Treaty of the Joint'—promising that no carpenter would lose their job due to automation, and that every worker would be retrained to operate the CNC software. Our productivity tripled in six months, and our quality actually improved because our master builders had more time to focus on the fine craft. Automation should amplify the artisan, never replace them."
      },
      {
        id: "s3",
        title: "The Golden Handshake",
        date: "June 30, 2001",
        readTime: "5 min read",
        category: "Management Succession",
        imageUrl: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=800",
        shortDescription: "Handing over the keys of our 200-person company to my daughter Nora, and the final piece of business advice I left on her new desk.",
        fullStory: "Stepping down as CEO of a company you built from a dusty garage is a profound psychological test. Your identity is wrapped in every brick and every ledger sheet. On my last official day, the board hosted a massive banquet in Portland, but the real moment happened in the quiet of the CEO office at dusk.\n\nMy daughter Nora, who had spent ten years working her way up from the shipping docks to Executive VP, sat in the leather chair that had been mine for twenty-five years. She looked nervous. The responsibility of holding two hundred families' livelihoods in her hands was suddenly very real.\n\nI handed her the company seal and a small wooden block of cherry wood that had a clean mortise-and-tenon joint. I told her: 'Nora, a business is not a static machine. It is a live joint. If you hold it too tight with rigid regulations, the timber will split under heat. If you leave it too loose, the structure will wobble under pressure. Trust your directors, treat your loggers like family, and let the company breathe.'\n\nI walked out into the cool evening air of the harbor, feeling lighter than I had in forty years. The company was in safe, modern, courageous hands. The ultimate test of an entrepreneur is not how high you can climb, but how cleanly you can step away."
      }
    ]
  }
};
