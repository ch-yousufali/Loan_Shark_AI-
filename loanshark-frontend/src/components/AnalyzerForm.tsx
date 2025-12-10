import { useState } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { analyzeText, analyzeFile } from '../services/api';
import type { AnalysisResponse } from '../services/api';

interface AnalyzerFormProps {
  onSubmit: (data: AnalysisResponse) => void;
  isLoading: boolean;
}

export const AnalyzerForm = ({ onSubmit, isLoading }: AnalyzerFormProps) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'text'>('upload');
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      let result;
      if (activeTab === 'text') {
        if (text.trim().length < 10) {
          throw new Error('Please paste a valid loan contract (at least 10 characters)');
        }
        result = await analyzeText(text);
      } else {
        if (!file) {
          throw new Error('Please select a file to upload');
        }
        result = await analyzeFile(file);
      }
      onSubmit(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setError('');
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-2xl">
      {/* Tabs */}
      <div className="flex border-b border-gray-700">
        <button
          onClick={() => setActiveTab('upload')}
          type="button"
          className={`flex-1 py-4 font-medium text-sm flex items-center justify-center gap-2 transition ${activeTab === 'upload'
            ? 'bg-gray-800 text-blue-400 border-b-2 border-blue-500'
            : 'bg-gray-900/50 text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
        >
          <Upload className="w-4 h-4" />
          Upload Document
        </button>
        <button
          onClick={() => setActiveTab('text')}
          type="button"
          className={`flex-1 py-4 font-medium text-sm flex items-center justify-center gap-2 transition ${activeTab === 'text'
            ? 'bg-gray-800 text-blue-400 border-b-2 border-blue-500'
            : 'bg-gray-900/50 text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
        >
          <FileText className="w-4 h-4" />
          Paste Text
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {activeTab === 'upload' ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-upload')?.click()}
            className={`border-2 border-dashed rounded-xl h-64 flex flex-col items-center justify-center cursor-pointer transition-all ${isDragOver
              ? 'border-blue-500 bg-blue-500/10'
              : file
                ? 'border-green-500/50 bg-green-500/5'
                : 'border-gray-600 hover:border-blue-400 hover:bg-gray-700/50'
              }`}
          >
            <input
              id="file-upload"
              type="file"
              className="hidden"
              accept=".txt,.pdf,.png,.jpg,.jpeg"
              onChange={handleFileChange}
            />

            {file ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-green-400" />
                </div>
                <p className="font-medium text-white text-lg">{file.name}</p>
                <p className="text-sm text-gray-400 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                <p className="text-blue-400 text-sm mt-4 hover:underline">Click to change file</p>
              </div>
            ) : (
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8 text-blue-400" />
                </div>
                <p className="font-medium text-white text-lg mb-2">Click to upload or drag & drop</p>
                <p className="text-sm text-gray-400">PDF, TXT, or Image (Single page best)</p>
              </div>
            )}
          </div>
        ) : (
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your loan agreement text here..."
            className="w-full h-64 bg-gray-900/50 border border-gray-600 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none font-mono text-sm leading-relaxed"
            disabled={isLoading}
          />
        )}

        <button
          type="submit"
          disabled={isLoading || (activeTab === 'upload' && !file) || (activeTab === 'text' && !text)}
          className="mt-6 w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-500 text-white font-bold py-4 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Analyzing Contract...
            </>
          ) : (
            <>
              {activeTab === 'upload' ? 'Scan Document' : 'Analyze Text'}
            </>
          )}
        </button>
      </form>
    </div>
  );
};