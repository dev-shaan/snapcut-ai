import sampleBefore from "@/assets/sample-before.jpg";
import sampleAfter from "@/assets/sample-after.png";
import gallerySneaker from "@/assets/gallery-sneaker.png";
import galleryDog from "@/assets/gallery-dog.png";
import galleryMug from "@/assets/gallery-mug.png";
import galleryPlant from "@/assets/gallery-plant.png";

export const sampleImages = {
  before: sampleBefore,
  after: sampleAfter,
};

export type GalleryItem = {
  id: string;
  label: string;
  image: string;
};

export const galleryItems: GalleryItem[] = [
  { id: "g1", label: "Product · Footwear", image: gallerySneaker },
  { id: "g2", label: "Pets · Portrait", image: galleryDog },
  { id: "g3", label: "E-commerce · Ceramics", image: galleryMug },
  { id: "g4", label: "Interior · Plants", image: galleryPlant },
  { id: "g5", label: "People · Studio", image: sampleAfter },
];

export type HistoryStatus = "completed" | "processing" | "failed";

export type HistoryItem = {
  id: string;
  filename: string;
  date: string;
  size: string;
  status: HistoryStatus;
  thumbnail: string;
};

export const historyItems: HistoryItem[] = [
  {
    id: "h1",
    filename: "campaign-portrait-01.png",
    date: "12 Aug 2026, 4:12 PM",
    size: "2.4 MB",
    status: "completed",
    thumbnail: sampleAfter,
  },
  {
    id: "h2",
    filename: "sneaker-white-front.png",
    date: "12 Aug 2026, 1:38 PM",
    size: "1.1 MB",
    status: "completed",
    thumbnail: gallerySneaker,
  },
  {
    id: "h3",
    filename: "golden-retriever-sit.png",
    date: "11 Aug 2026, 7:02 PM",
    size: "3.0 MB",
    status: "completed",
    thumbnail: galleryDog,
  },
  {
    id: "h4",
    filename: "ceramic-mug-studio.png",
    date: "10 Aug 2026, 10:24 AM",
    size: "890 KB",
    status: "processing",
    thumbnail: galleryMug,
  },
  {
    id: "h5",
    filename: "monstera-pot-side.png",
    date: "09 Aug 2026, 6:47 PM",
    size: "1.7 MB",
    status: "completed",
    thumbnail: galleryPlant,
  },
  {
    id: "h6",
    filename: "street-shot-raw.jpg",
    date: "08 Aug 2026, 9:15 AM",
    size: "4.2 MB",
    status: "failed",
    thumbnail: sampleBefore,
  },
];

export type Plan = {
  id: "free" | "pro" | "business";
  name: string;
  priceMonthly: number;
  priceYearly: number;
  credits: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  cta: string;
};

export const plans: Plan[] = [
  {
    id: "free",
    name: "Free",
    priceMonthly: 0,
    priceYearly: 0,
    credits: "3 credits",
    description: "Try SnapCut AI on a handful of images.",
    features: ["Background removal", "Standard processing", "Download PNG", "Up to 5 MB per image"],
    cta: "Start free",
  },
  {
    id: "pro",
    name: "Pro",
    priceMonthly: 99,
    priceYearly: 990,
    credits: "100 credits / month",
    description: "For creators shipping content every week.",
    features: [
      "Background removal",
      "High quality output",
      "Priority processing",
      "Processing history",
    ],
    highlighted: true,
    cta: "Upgrade to Pro",
  },
  {
    id: "business",
    name: "Business",
    priceMonthly: 299,
    priceYearly: 2990,
    credits: "500 credits / month",
    description: "For teams and catalogue-scale workloads.",
    features: [
      "Everything in Pro",
      "Bulk processing (coming soon)",
      "Higher size and rate limits",
      "Team-ready workspace",
    ],
    cta: "Upgrade to Business",
  },
];

export const currentUser = {
  name: "Aarav Mehta",
  email: "aarav.mehta@example.com",
  initials: "BM",
  plan: "Free",
  credits: 3,
  totalCredits: 3,
  imagesProcessed: 18,
  memberSince: "March 2026",
};
