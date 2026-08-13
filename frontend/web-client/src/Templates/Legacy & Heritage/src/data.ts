export interface Milestone {
  year: string;
  title: string;
  category: "Childhood" | "Education" | "Career" | "Family" | "Golden Years";
  description: string;
  image: string;
  location: string;
  annotation?: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  type: "photo" | "video";
  url: string;
  caption: string;
  rotation: string; // Tailwind rotation class for scrapbook feel
  date: string;
  videoUrl?: string;
}

export interface Story {
  id: string;
  title: string;
  date: string;
  excerpt: string;
  image: string;
  category: string;
  handwrittenNote?: string;
}

export interface Value {
  title: string;
  quote: string;
  description: string;
}

export const MILESTONES: Milestone[] = [
  {
    year: "1922 – 1939",
    title: "The Meadowbrook Homestead",
    category: "Childhood",
    location: "Green Mountains, Vermont",
    description: "Born on a crisp October morning, Eleanor was raised in a three-story timber homestead surrounded by towering sugar maples. Her childhood was spent collecting wildflowers, pressing maple leaves in heavy old dictionaries, and listening to her father recite classic poetry by the fireplace.",
    image: "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=600",
    annotation: "Pressed clover is still inside her 1935 diary."
  },
  {
    year: "1940 – 1944",
    title: "Wellesley College & Botanical Arts",
    category: "Education",
    location: "Wellesley, Massachusetts",
    description: "During a time of great global change, Eleanor pursued her love for Classical Literature and botany. She spent her college years in the grand brick libraries, sketching botanical diagrams of native ferns and compiling a handwritten anthology of Emerson's essays.",
    image: "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?q=80&w=600",
    annotation: "Graduated with highest honors in literature."
  },
  {
    year: "1945 – 1968",
    title: "The Village Schoolhouse",
    category: "Career",
    location: "East Arlington schoolhouse",
    description: "Eleanor dedicated twenty-three years to educating young minds in the local valley. As schoolmistress, she was famous for teaching history through storytelling and starting every spring day with a nature walk. She kept a small brass bell on her oak desk, which she eventually passed to her daughter.",
    image: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?q=80&w=600",
    annotation: "Taught over 500 children how to write cursive."
  },
  {
    year: "1950 – 1990",
    title: "The Rose-Colored Estate",
    category: "Family",
    location: "The Sterling Family Estate",
    description: "Eleanor married Thomas Sterling in the summer of 1950, wearing a simple lace gown hand-stitched by her grandmother. Together they raised three children, planted an heirloom apple orchard, and built a sanctuary of roses, warmth, and laughter that hosted forty decades of family autumn reunions.",
    image: "https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=600",
    annotation: "Thomas always left a wild rose on her writing desk."
  },
  {
    year: "1991 – 2018",
    title: "The Garden of Wisdom",
    category: "Golden Years",
    location: "Greenwood Sanctuary",
    description: "In her final decades, Eleanor focused on archiving the family legacy. She compiled over sixty albums of photographs, wrote three volumes of personal memoirs, and hosted weekly storytelling afternoons in her greenhouse for her eight grandchildren and twelve great-grandchildren.",
    image: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?q=80&w=600",
    annotation: "Her final entry: 'Live beautifully, love gently, write always.'"
  }
];

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: "gal-1",
    title: "The Summer Cottage",
    type: "photo",
    url: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=500",
    caption: "Greenwood Lake House, July 1964",
    rotation: "-rotate-2",
    date: "1964"
  },
  {
    id: "gal-2",
    title: "The Writing Bureau",
    type: "photo",
    url: "https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=500",
    caption: "Eleanor's walnut desk with vintage typewriter",
    rotation: "rotate-3",
    date: "1972"
  },
  {
    id: "gal-3",
    title: "Wildrose Garden",
    type: "photo",
    url: "https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?q=80&w=500",
    caption: "First rose blooms of the heirloom gardens",
    rotation: "rotate-1",
    date: "1958"
  },
  {
    id: "gal-4",
    title: "Thomas & Eleanor",
    type: "photo",
    url: "https://images.unsplash.com/photo-1464746133101-a2c3f88e0dd9?q=80&w=500",
    caption: "Autumn walk in the Vermont maple forests",
    rotation: "-rotate-3",
    date: "1952"
  },
  {
    id: "gal-5",
    title: "Preserved Botanicals",
    type: "photo",
    url: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=500",
    caption: "Pressed ferns from the Wellesley woods",
    rotation: "rotate-2",
    date: "1942"
  },
  {
    id: "gal-6",
    title: "Archival Letters",
    type: "photo",
    url: "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=500",
    caption: "A bundle of letters tied with lavender twine",
    rotation: "-rotate-1",
    date: "1945"
  },
  {
    id: "vid-1",
    title: "Super 8 Home Movies: Summer Picnic",
    type: "video",
    url: "https://images.unsplash.com/photo-1501555088652-021faa106b9b?q=80&w=500",
    caption: "Reel 4: Family gathering in the heirloom orchard",
    rotation: "rotate-2",
    date: "1961",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4"
  },
  {
    id: "vid-2",
    title: "The Autumn Equinox Festival",
    type: "video",
    url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=500",
    caption: "Reel 9: Golden light on the Vermont hillsides",
    rotation: "-rotate-2",
    date: "1975",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-autumn-leaves-falling-in-the-forest-34135-large.mp4"
  },
  {
    id: "vid-3",
    title: "Winter at the Old Homestead",
    type: "video",
    url: "https://images.unsplash.com/photo-1482862549707-f63cb32c5fd9?q=80&w=500",
    caption: "Reel 12: Cozy fireplace and heavy snowfall in Arlington",
    rotation: "rotate-1",
    date: "1968",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-fireplace-burning-brightly-in-a-dark-room-42861-large.mp4"
  }
];

export const STORIES: Story[] = [
  {
    id: "story-1",
    title: "The Letter in the Attic",
    date: "November 14, 1943",
    category: "Uncovered Secrets",
    excerpt: "While clearing the old homestead eaves, we found a hand-bound pocket edition of John Keats' poetry. Tucked behind the spine was an unposted letter addressed to Thomas. Written in fading blue fountain pen, it contained Eleanor's quiet confession of love written on the eve of his departure for the navy shipyard.",
    image: "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?q=80&w=600",
    handwrittenNote: "Thomas carried this book in his coat for three solid years."
  },
  {
    id: "story-2",
    title: "The Great Frost of 1957",
    date: "June 2, 1957",
    category: "Family Tales",
    excerpt: "A sudden, unseasonal mountain frost threatened the entire nursery of young heirloom roses. Thomas and Eleanor stayed awake until dawn, lighting tiny fires of dried maple bark in copper pans throughout the garden and wrapping each delicate bud in flannel blankets. Every single rose survived the freeze, blooming a week later in spectacular crimson.",
    image: "https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?q=80&w=600",
    handwrittenNote: "The neighbor called us the 'Rose Madmen of Arlington'."
  },
  {
    id: "story-3",
    title: "The Candlelit Chopin Recital",
    date: "October 12, 1962",
    category: "Musical Memories",
    excerpt: "A fierce autumn gale tore through the valley, toppling pine trees and plunging the township into total darkness. Instead of canceling the family dinner, Eleanor lit dozens of beeswax candles and sat at the upright mahogany piano. She played Chopin's Nocturnes from memory as the wind howled, creating an unforgettable evening of golden shadow and soft harmony.",
    image: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?q=80&w=600",
    handwrittenNote: "The grandchildren fell asleep right on the rug beneath the pedals."
  }
];

export const VALUES: Value[] = [
  {
    title: "Uncompromising Integrity",
    quote: "Be true in your quietest thoughts, and truer still in your public deeds.",
    description: "Eleanor believed that honor was a quiet tapestry woven thread-by-thread daily. She taught us that a family name is only as strong as the promises kept by those who bear it."
  },
  {
    title: "Cultivated Curiosity",
    quote: "A mind that remains idle is like a garden that remains unplanted.",
    description: "She never stopped learning. Whether documenting rare mosses, learning Latin at age fifty, or reading ancient philosophy, Eleanor believed that wonder was the key to eternal youth."
  },
  {
    title: "Nurturing the Soil",
    quote: "Our deepest roots are anchored in the love we cultivate in others.",
    description: "To Eleanor, family was a garden requiring constant care—soft words, regular letters, long Sunday dinners, and an open door for anyone in need of a quiet sanctuary."
  }
];

export const INTERESTS = [
  { title: "Botanical Pressing", desc: "Archiving native wildflowers in heavy oak presses." },
  { title: "Antique Bookbinding", desc: "Restoring and stitching old family diaries with leather." },
  { title: "Epistolary Writing", desc: "Maintaining pen-pal connections with friends worldwide." },
  { title: "Classical Piano", desc: "Playing Bach and Chopin by candlelight every twilight." }
];
