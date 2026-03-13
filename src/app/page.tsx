export const revalidate = 300; // revalidate every 5 minutes

import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import HowItWorks from "@/components/HowItWorks";
import Security from "@/components/Security";
import Pricing from "@/components/Pricing";
import FAQ from "@/components/FAQ";
import SupportedBanks from "@/components/SupportedBanks";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <Hero />
      <Stats />
      <SupportedBanks />
      <HowItWorks />
      <Security />
      <Pricing />
      <FAQ />
      <Footer />
    </main>
  );
}
