import Hero from "../components/Hero"
import HowItWorks from "../components/HowItWorks"
import ProductShowcase from "../components/ProductShowcase"
import FeatureSection from "../components/FeatureSection"
import TrustBar from "../components/TrustBar"
import CTA from "../components/CTA"
import Footer from "../components/Footer"

export default function Landing({ language = "en" }) {
  return (
    <>
      <Hero language={language} />
      <HowItWorks language={language} />
      <ProductShowcase language={language} />
      <FeatureSection language={language} />
      <TrustBar language={language} />
      <CTA language={language} />
      <Footer language={language} />
    </>
  )
}
