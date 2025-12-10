import { Link } from 'react-router-dom';
import { ShieldAlert, Search, FileText, AlertTriangle, CheckCircle, Gavel, HandCoins } from 'lucide-react';

export const LandingPage = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white font-sans">
            {/* Header */}
            <header className="fixed w-full z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-2">
                            <ShieldAlert className="h-8 w-8 text-red-500" />
                            <span className="text-xl font-bold tracking-tight">LoanShark AI</span>
                        </div>
                        <nav className="flex gap-4">
                            <Link to="/analyze" className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition font-semibold">
                                Start Scan
                            </Link>
                        </nav>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4">
                <div className="max-w-5xl mx-auto text-center">
                    <div className="mb-6 inline-flex items-center px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                        <span className="mr-2">🚀</span> Built for Snow Fest Hackathon
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-orange-400">
                        Scan your loan <br className="hidden md:block" /> before it bites.
                    </h1>
                    <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                        Upload any loan agreement and get a <span className="text-white font-bold">Predatory Risk Score</span> + clause warnings in under 60 seconds.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/analyze" className="px-8 py-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-lg transition transform hover:scale-105 shadow-lg shadow-red-600/20 flex items-center justify-center gap-2">
                            <Search className="h-5 w-5" />
                            Start a Scan
                        </Link>
                        <a href="#how-it-works" className="px-8 py-4 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white font-bold text-lg transition flex items-center justify-center">
                            How it works
                        </a>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-20 bg-gray-800/50">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <FeatureCard
                            icon={<HandCoins className="h-6 w-6 text-yellow-400" />}
                            title="High APR & Fees"
                            desc="Detects interest rates above 36% and hidden service fees."
                        />
                        <FeatureCard
                            icon={<AlertTriangle className="h-6 w-6 text-orange-400" />}
                            title="Debt Traps"
                            desc="Flags rollover clauses and short repayment terms."
                        />
                        <FeatureCard
                            icon={<ShieldAlert className="h-6 w-6 text-red-400" />}
                            title="Predatory Access"
                            desc="Identifies auto-debit rights and wage assignments."
                        />
                        <FeatureCard
                            icon={<Gavel className="h-6 w-6 text-purple-400" />}
                            title="Legal Waivers"
                            desc="Spots arbitration clauses and class action waivers."
                        />
                    </div>
                </div>
            </section>

            {/* How it Works */}
            <section id="how-it-works" className="py-20 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-bold mb-16">How it works</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gradient-to-r from-red-600/0 via-red-600/50 to-red-600/0" />

                        <Step
                            number="1"
                            icon={<FileText className="h-8 w-8" />}
                            title="Upload Contract"
                            desc="Paste text or upload a PDF/Image of your loan agreement."
                        />
                        <Step
                            number="2"
                            icon={<Search className="h-8 w-8" />}
                            title="AI Analysis"
                            desc="We scan for 20+ known predatory patterns and legal traps."
                        />
                        <Step
                            number="3"
                            icon={<CheckCircle className="h-8 w-8" />}
                            title="Get Results"
                            desc="Receive a simple risk score and clear explanations."
                        />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-gray-800 text-center text-gray-500 text-sm">
                <p className="max-w-2xl mx-auto px-4 mb-4">
                    Disclaimer: LoanShark AI provides educational analysis only. It is not legal or financial advice.
                    Always consult a qualified professional before signing a contract.
                </p>
                <p>© {new Date().getFullYear()} LoanShark AI. Built for Snow Fest Hackathon.</p>
            </footer>
        </div>
    );
};

const FeatureCard = ({ icon, title, desc }: { icon: any, title: string, desc: string }) => (
    <div className="p-6 rounded-2xl bg-gray-800 border border-gray-700 hover:border-red-500/50 transition">
        <div className="p-3 bg-gray-900 rounded-lg inline-block mb-4 border border-gray-700">
            {icon}
        </div>
        <h3 className="text-lg font-bold mb-2">{title}</h3>
        <p className="text-gray-400 text-sm">{desc}</p>
    </div>
);

const Step = ({ number, icon, title, desc }: { number: string, icon: any, title: string, desc: string }) => (
    <div className="relative z-10 flex flex-col items-center">
        <div className="w-24 h-24 rounded-full bg-gray-900 border-2 border-red-500 flex items-center justify-center mb-6 shadow-lg shadow-red-900/20 text-red-500">
            {icon}
        </div>
        <div className="absolute top-0 right-10 md:right-auto md:left-[55%] bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">
            Step {number}
        </div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-gray-400 px-4">{desc}</p>
    </div>
);
