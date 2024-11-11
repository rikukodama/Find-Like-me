import React from 'react'
import { Helmet } from 'react-helmet-async'
import './Home.css'
import Navbar from '../../components/Navbar/Navbar'
import Header from './Header/Header'
import ProblemSolution from './ProblemSolution/ProblemSolution'
import HowItWorks from './HowItWorks/HowItWorks'
import Support from './Support/Support'
import Footer from '../../components/Footer/Footer'
import CallToActionSection from './CTA/CallToActionSection'

function Home() {
	return (
		<>
			<Helmet>
				<title>FindAlike.Me - Connect with People Who Understand | Support Community</title>
				<meta
					name="description"
					content="Join FindAlike.Me to connect with people facing similar challenges. Find support, understanding, and build meaningful connections in our safe community."
				/>
				<meta
					name="keywords"
					content="support community, peer support, mental health, connection, chat, understanding"
				/>
				<link rel="canonical" href="http://localhost:5001" />
				<meta property="og:title" content="FindAlike.Me - Connect with People Who Understand" />
				<meta
					property="og:description"
					content="Join our supportive community to connect with people who understand your journey."
				/>
				<meta property="og:type" content="website" />
				<meta property="og:url" content="http://localhost:5001" />
			</Helmet>
			<main className="home">
				<Navbar />
				<Header />
				<div role="separator" className="px-section-break" aria-hidden="true"></div>
				<ProblemSolution />
				<div role="separator" className="px-section-break" aria-hidden="true"></div>
				<HowItWorks />
				<div role="separator" className="px-section-break-secondary" aria-hidden="true"></div>
				<Support />
				<div role="separator" className="px-section-break-secondary" aria-hidden="true"></div>
				<CallToActionSection />
				<div role="separator" className="px-section-break-secondary" aria-hidden="true"></div>
				<Footer />
			</main>
		</>
	)
}

export default Home
