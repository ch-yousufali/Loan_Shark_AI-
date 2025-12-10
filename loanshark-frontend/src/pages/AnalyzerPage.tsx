import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnalyzerForm } from '../components/AnalyzerForm';
import { ScoreBadge } from '../components/ScoreBadge';
import { ReasonsList } from '../components/ReasonsList';
import { HighlightItem } from '../components/HighlightItem';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorBanner } from '../components/ErrorBanner';
import { analyzeContract } from '../services/api';
import type { AnalysisResult } from '../types/api';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const AnalyzerPage = () => {
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');


    const handleSampleAnalyze = async (text: string) => {
        setIsLoading(true);
        setError('');
        try {
            const data = await analyzeContract(text);
            setResult(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Analysis failed');
            setResult(null);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFormSubmit = (data: AnalysisResult) => {
        setResult(data);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
            {/* Header */}
            <header className="bg-gray-800 border-b border-gray-700 py-6 sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Link to="/" className="text-gray-400 hover:text-white transition">
                                <ArrowLeft className="h-6 w-6" />
                            </Link>
                            <div>
                                <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                                    <ShieldAlert className="h-8 w-8 text-red-500" />
                                    LoanShark Analyzer
                                </h1>
                                <p className="text-gray-400 text-sm mt-1">Detect predatory loan practices instantly</p>
                            </div>
                        </div>

                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-6xl mx-auto px-4 py-8">
                {!result ? (
                    <>
                        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 mb-8">
                            <h2 className="text-xl font-bold mb-4">Analyze Agreement</h2>
                            <AnalyzerForm onSubmit={handleFormSubmit} isLoading={isLoading} />
                        </div>

                        {/* Sample Contracts */}
                        <h3 className="text-lg font-semibold text-gray-400 mb-4">Or try a sample contract:</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                                onClick={() => handleSampleAnalyze('Loan Amount: $300\nAPR: 520%\nService Fee: $25 per $100 borrowed\nTerm: 14 days\nLender may repeatedly debit your account until paid.\nBinding arbitration required.')}
                                disabled={isLoading}
                                className="bg-red-500/10 border border-red-500 hover:bg-red-500/20 text-red-300 p-6 rounded-xl transition text-left group"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <p className="font-bold text-lg">Predatory Sample</p>
                                    <span className="text-2xl group-hover:scale-110 transition">🚩</span>
                                </div>
                                <p className="text-sm opacity-80">High APR (520%), short term, fees, arbitration.</p>
                            </button>
                            <button
                                onClick={() => handleSampleAnalyze('Personal Loan\nAmount: $5,000\nAPR: 12%\nTerm: 24 months\nMonthly Payment: $235\nNo prepayment penalty.')}
                                disabled={isLoading}
                                className="bg-green-500/10 border border-green-500 hover:bg-green-500/20 text-green-300 p-6 rounded-xl transition text-left group"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <p className="font-bold text-lg">Safe Sample</p>
                                    <span className="text-2xl group-hover:scale-110 transition">✅</span>
                                </div>
                                <p className="text-sm opacity-80">Reasonable APR (12%), fair terms, no traps.</p>
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        {/* Results */}
                        <ScoreBadge score={result.score} label={result.label} confidence={result.confidence} />

                        {result.reasons.length > 0 && <ReasonsList reasons={result.reasons} />}

                        {result.highlights.length > 0 && (
                            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-6">
                                <h2 className="text-xl font-bold mb-4 flex items-center">
                                    <span className="mr-2">🚩</span> Dangerous Clauses Found
                                </h2>
                                <div className="space-y-3">
                                    {result.highlights.map((h, idx) => (
                                        <HighlightItem key={idx} text={h.text} category={h.category} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Debug Info */}
                        <details className="bg-gray-800 rounded-lg p-4 border border-gray-700 mb-6">
                            <summary className="cursor-pointer text-gray-300 font-bold">📊 Advanced Details</summary>
                            <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-400">Rule Score</p>
                                    <p className="text-white font-bold">{result.debug.rule_score}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400">ML Score</p>
                                    <p className="text-white font-bold">{result.debug.ml_score ?? 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400">ML Probability</p>
                                    <p className="text-white font-bold">{result.debug.ml_prob ? (result.debug.ml_prob * 100).toFixed(1) + '%' : 'N/A'}</p>
                                </div>
                            </div>
                        </details>

                        {/* Back Button */}
                        <button
                            onClick={() => setResult(null)}
                            className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
                        >
                            <ArrowLeft className="h-5 w-5" />
                            Analyze Another Contract
                        </button>
                    </>
                )}

                {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}
                {isLoading && <LoadingSpinner />}
            </main>
        </div>
    );
};
