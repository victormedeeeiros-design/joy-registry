import Hero from "@/components/Hero";
import Features from "@/components/Features";
import SupabaseNotice from "@/components/SupabaseNotice";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <Features />
      <SupabaseNotice />
      <Footer />
    </div>
  );
};

export default Index;
