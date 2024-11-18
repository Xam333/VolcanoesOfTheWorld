import './Home.css';  // Import CSS file

// Import react components
import { Link } from "react-router-dom";

// Hero content function
const Hero = () => (
  <section className="hero">
    <div className="hero_content">
      <img src="/img/hero_text.png" alt="Volcanoes Of The World!" className="responsive-image"/>
      <Link to="/volcanoes">Explore</Link>
    </div>
  </section>
);

export default function Home() {
  // Return home page body
  return (
    <main>
      <Hero />
    </main>
  );
}