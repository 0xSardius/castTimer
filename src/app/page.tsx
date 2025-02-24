import { Metadata } from "next";
import CastTimer from "./components/CastTimer";

const appUrl = process.env.NEXT_PUBLIC_URL;

const frame = {
  version: "next",
  image: {
    src: `${appUrl}/opengraph-image`,
    aspectRatio: "1.91:1",
  },
  buttons: [
    {
      label: "⏰ Set Timer",
    },
  ],
  postUrl: `${appUrl}/api/frame`,
};

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "CastTimer",
    description: "Smart reminders for Farcaster threads",
    openGraph: {
      title: "CastTimer",
      description: "Never miss an important thread update",
    },
    other: {
      "fc:frame": JSON.stringify(frame),
      "fc:frame:image": `${appUrl}/opengraph-image`,
      "fc:frame:button:1": "⏰ Set Timer",
      "fc:frame:post_url": `${appUrl}/api/frame`,
    },
  };
}

export default function Home() {
  return <CastTimer />;
}
