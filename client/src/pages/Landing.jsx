import React from 'react';
import LandingNav      from '../components/landing/LandingNav';
import HeroSection     from '../components/landing/HeroSection';
import ProblemSection  from '../components/landing/ProblemSection';
import FeatureGrid     from '../components/landing/FeatureGrid';
import HowItWorks      from '../components/landing/HowItWorks';
import LiveDemoSection from '../components/landing/LiveDemoSection';
import FinalCTA        from '../components/landing/FinalCTA';
import LandingFooter   from '../components/landing/LandingFooter';

/**
 * Landing page — composes all landing sections.
 * Application logic, routes, and backend are untouched.
 * DesignPrinciples section removed (was showing UX law names).
 * CoordinationLoop replaced with LiveDemoSection (product UI preview).
 */
export default function Landing() {
  return (
    <div className="landing-page">
      <LandingNav />
      <main id="main-content">
        <HeroSection />
        <ProblemSection />
        <FeatureGrid />
        <HowItWorks />
        <LiveDemoSection />
        <FinalCTA />
      </main>
      <LandingFooter />
    </div>
  );
}
