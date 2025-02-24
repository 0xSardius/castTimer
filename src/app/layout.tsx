// app/layout.tsx
import { Metadata } from "next";
import { getFrameMetadata } from "@coinbase/onchainkit/frame";
import { Providers } from "./providers";

const frameMetadata = getFrameMetadata({
  buttons: [
    {
      label: "⏰ Set Timer",
    },
  ],
  image: {
    src: `${process.env.NEXT_PUBLIC_URL}/opengraph-image`,
    aspectRatio: "1.91:1",
  },
  postUrl: `${process.env.NEXT_PUBLIC_URL}/api/frame`,
});

export const metadata: Metadata = {
  title: "CastTimer - Smart reminders for Farcaster",
  description: "Never miss an important thread update",
  openGraph: {
    title: "CastTimer",
    description: "Smart reminders for Farcaster threads",
    images: [`${process.env.NEXT_PUBLIC_URL}/opengraph-image`],
  },
  other: {
    ...frameMetadata,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
