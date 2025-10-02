import React, { useRef, useState } from 'react';
import { CameraIcon, UploadIcon, LinkIcon, HistoryIcon, TrashIcon } from './icons';
import { SavedSearch } from '../types';

interface LandingPageProps {
  onImageSelect: (file: File) => void;
  onUrlSubmit: (url: string) => void;
  setErrorMessage: (message: string) => void;
  savedSearches: SavedSearch[];
  onRerunSearch: (search: SavedSearch) => void;
  onDeleteSearch: (id: number) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onImageSelect, onUrlSubmit, setErrorMessage, savedSearches, onRerunSearch, onDeleteSearch }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setErrorMessage("File is too large. Please select an image under 10MB.");
        return;
      }
      onImageSelect(file);
    }
  };

  const handleUrlFormSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!url.trim()) {
      setErrorMessage("Please enter a valid product URL.");
      return;
    }
    try {
      new URL(url);
    } catch (_) {
      setErrorMessage("The entered URL is not valid. Please check and try again.");
      return;
    }
    onUrlSubmit(url);
  };

  return (
    <div className="flex flex-col items-center justify-center text-center px-4 w-full">
        <div className="relative mb-6">
            <div className="absolute -inset-2 bg-gradient-to-br from-blue-400 to-green-400 rounded-full blur-xl opacity-40"></div>
            <div className="relative bg-white/80 backdrop-blur-md p-6 rounded-full border border-gray-200">
                <CameraIcon className="w-16 h-16 text-blue-600" />
            </div>
        </div>
      <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-800 tracking-tight">
        Find Anything, Shop Everywhere
      </h2>
      <p className="mt-4 max-w-2xl text-lg text-gray-600">
        Snap a picture or paste a link of any product to instantly discover similar items and compare prices.
      </p>

      <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md">
        <input
          type="file"
          accept="image/png, image/jpeg, image/webp"
          capture="camera"
          ref={cameraInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          onClick={() => cameraInputRef.current?.click()}
          className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 text-lg font-semibold text-white bg-blue-600 rounded-full shadow-lg hover:bg-blue-700 transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300"
        >
          <CameraIcon className="w-6 h-6" />
          Take Photo
        </button>
        
        <input
          type="file"
          accept="image/png, image/jpeg, image/webp"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 text-lg font-semibold text-blue-600 bg-white border-2 border-blue-200 rounded-full shadow-lg hover:bg-blue-50 transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300"
        >
          <UploadIcon className="w-6 h-6" />
          Upload Image
        </button>
      </div>

      <div className="mt-8 text-gray-600 font-semibold w-full max-w-md text-center">OR</div>

      <form onSubmit={handleUrlFormSubmit} className="mt-8 w-full max-w-md">
        <label htmlFor="url-input" className="sr-only">Product URL</label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <LinkIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="url-input"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste product link (e.g., from Amazon)"
            className="block w-full rounded-full border-2 border-gray-200 bg-white py-4 pl-11 pr-32 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
          <div className="absolute inset-y-0 right-0 flex py-1.5 pr-1.5">
            <button
              type="submit"
              className="flex items-center rounded-full bg-blue-600 px-6 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors"
            >
              Search
            </button>
          </div>
        </div>
      </form>

       <div className="mt-12 text-left w-full max-w-2xl bg-gray-100 p-6 rounded-xl border border-gray-200">
            <h3 className="font-bold text-gray-700 mb-2">How it works:</h3>
            <ol className="list-decimal list-inside space-y-1 text-gray-600">
                <li><span className="font-semibold">Snap, Upload, or Paste:</span> Use your camera, upload a photo, or paste a product link.</li>
                <li><span className="font-semibold">AI Analysis:</span> Our AI identifies the item and its key features.</li>
                <li><span className="font-semibold">Compare Deals:</span> Instantly browse similar products and find the best price.</li>
            </ol>
        </div>

        {savedSearches.length > 0 && (
            <div className="mt-16 w-full max-w-4xl text-left">
                <h3 className="text-2xl font-bold text-gray-800 tracking-tight text-center sm:text-left">Recent Searches</h3>
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {savedSearches.map((search) => (
                        <div key={search.id} className="group relative bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex items-start space-x-4">
                            <img src={search.imagePreview} alt={search.analysis.itemType} className="w-16 h-16 object-cover rounded-md flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-800 truncate capitalize">{search.analysis.itemType}</p>
                                <p className="text-xs text-gray-500 truncate">{search.analysis.styleKeywords.join(', ') || 'General search'}</p>
                                <div className="mt-2 flex items-center space-x-2">
                                    <button
                                        onClick={() => onRerunSearch(search)}
                                        className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800"
                                        aria-label={`Re-run search for ${search.analysis.itemType}`}
                                    >
                                        <HistoryIcon className="w-3 h-3"/>
                                        Re-run
                                    </button>
                                    <span className="text-gray-300">|</span>
                                    <button
                                        onClick={() => onDeleteSearch(search.id)}
                                        className="flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-700"
                                        aria-label={`Delete saved search for ${search.analysis.itemType}`}
                                    >
                                        <TrashIcon className="w-3 h-3"/>
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}
    </div>
  );
};

export default LandingPage;
