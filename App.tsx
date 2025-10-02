import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { AppState, GeminiAnalysisResult, Product, SavedSearch } from './types';
import LandingPage from './components/LandingPage';
import ProcessingView from './components/ProcessingView';
import ResultsPage from './components/ResultsPage';
import Header from './components/Header';
import Footer from './components/Footer';
import { processImage } from './services/imageService';
import { analyzeProductImage, analyzeProductUrl, findSimilarProducts } from './services/geminiService';
import { getSavedSearches, saveSearch, deleteSearch } from './services/storageService';

const App: React.FC = () => {
    const [appState, setAppState] = useState<AppState>(AppState.LANDING);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<GeminiAnalysisResult | null>(null);
    const [productResults, setProductResults] = useState<Product[]>([]);
    const [isRefining, setIsRefining] = useState(false);
    const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);

    useEffect(() => {
        setSavedSearches(getSavedSearches());
    }, []);

    const handleReset = useCallback(() => {
        setAppState(AppState.LANDING);
        setErrorMessage(null);
        setImagePreview(null);
        setAnalysisResult(null);
        setProductResults([]);
    }, []);

    const handleImageSelect = useCallback(async (file: File) => {
        setErrorMessage(null);
        setAppState(AppState.PROCESSING);
        try {
            const { dataUrl, mimeType } = await processImage(file);
            setImagePreview(dataUrl);

            const analysis = await analyzeProductImage(dataUrl, mimeType);
            setAnalysisResult(analysis);
            
            const products = await findSimilarProducts(analysis);
            setProductResults(products);

            setAppState(AppState.RESULTS);
        } catch (error) {
            console.error(error);
            const message = error instanceof Error ? error.message : "An unknown error occurred.";
            setErrorMessage(message);
            setAppState(AppState.ERROR);
        }
    }, []);

    const handleUrlSubmit = useCallback(async (url: string) => {
        setErrorMessage(null);
        setAppState(AppState.PROCESSING);
        
        const loadingImage = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9IiNmMmYzZjUiLz48cGF0aCBkPSJNMjAgMTB2MjBTNCAxMiA0IDIwczE2IDEwIDIwIDEwdi0yMHoiIGZpbGw9IiNkYWUxZTciLz48Y2lyY2xlIGN4PSIzMiIgY3k9IjMyIiByPSIzIiBmaWxsPSIjY2NjIi8+PC9zdmc+`;
        setImagePreview(loadingImage);

        try {
            const analysis = await analyzeProductUrl(url);
            setAnalysisResult(analysis);
            
            if (analysis.imageUrl) {
                setImagePreview(analysis.imageUrl);
            } else {
                // If no image URL, create a relevant one from Unsplash
                const placeholderImage = `https://source.unsplash.com/400x400/?${encodeURIComponent(analysis.itemType)}`;
                setImagePreview(placeholderImage);
            }
            
            const products = await findSimilarProducts(analysis);
            setProductResults(products);

            setAppState(AppState.RESULTS);
        } catch (error) {
            console.error(error);
            const message = error instanceof Error ? error.message : "An unknown error occurred.";
            setErrorMessage(message);
            setAppState(AppState.ERROR);
        }
    }, []);

    const handleRefineSearch = useCallback(async (updatedAnalysis: GeminiAnalysisResult) => {
        setIsRefining(true);
        setAnalysisResult(updatedAnalysis);
        
        try {
            const newProducts = await findSimilarProducts(updatedAnalysis);
            setProductResults(newProducts);
        } catch (error) {
            console.error("Error refining search:", error);
        } finally {
            setIsRefining(false);
        }
    }, []);

    const handleSaveSearch = useCallback(() => {
        if (!analysisResult || !imagePreview) return;
        saveSearch(analysisResult, imagePreview);
        setSavedSearches(getSavedSearches());
    }, [analysisResult, imagePreview]);

    const handleDeleteSearch = useCallback((id: number) => {
        deleteSearch(id);
        setSavedSearches(getSavedSearches());
    }, []);

    const handleRerunSearch = useCallback(async (search: SavedSearch) => {
        setErrorMessage(null);
        setAppState(AppState.PROCESSING);
        setImagePreview(search.imagePreview);
        setAnalysisResult(search.analysis);

        try {
            const products = await findSimilarProducts(search.analysis);
            setProductResults(products);
            setAppState(AppState.RESULTS);
        } catch (error) {
            console.error("Error re-running search:", error);
            const message = error instanceof Error ? error.message : "An unknown error occurred during the search.";
            setErrorMessage(message);
            setAppState(AppState.ERROR);
        }
    }, []);
    
    const isCurrentSearchSaved = useMemo(() => {
        if (!analysisResult) return false;
        const currentAnalysisString = JSON.stringify(analysisResult);
        return savedSearches.some(s => JSON.stringify(s.analysis) === currentAnalysisString);
    }, [analysisResult, savedSearches]);

    const renderContent = () => {
        switch (appState) {
            case AppState.LANDING:
                return <LandingPage 
                    onImageSelect={handleImageSelect} 
                    onUrlSubmit={handleUrlSubmit} 
                    setErrorMessage={setErrorMessage}
                    savedSearches={savedSearches}
                    onRerunSearch={handleRerunSearch}
                    onDeleteSearch={handleDeleteSearch}
                />;
            case AppState.PROCESSING:
                return imagePreview ? <ProcessingView imagePreview={imagePreview} /> : null;
            case AppState.RESULTS:
                return analysisResult && imagePreview ? (
                    <ResultsPage 
                        analysis={analysisResult} 
                        products={productResults} 
                        imagePreview={imagePreview}
                        onRefineSearch={handleRefineSearch}
                        isRefining={isRefining}
                        onSaveSearch={handleSaveSearch}
                        isSearchSaved={isCurrentSearchSaved}
                    />
                ) : null;
            case AppState.ERROR:
                return (
                    <div className="text-center bg-red-50 border border-red-200 p-8 rounded-lg shadow-md">
                        <h2 className="text-2xl font-bold text-red-700">Oops! Something went wrong.</h2>
                        <p className="mt-2 text-red-600">{errorMessage}</p>
                        <button
                            onClick={handleReset}
                            className="mt-6 px-6 py-2 text-white bg-red-600 rounded-full hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                        >
                            Try Again
                        </button>
                    </div>
                );
            default:
                return null;
        }
    };
    
    return (
        <div className="flex flex-col min-h-screen">
            <Header showNewSearch={appState === AppState.RESULTS || appState === AppState.ERROR} onNewSearch={handleReset} />
            <main className="flex-grow flex items-center justify-center py-24 sm:py-32">
                 {appState !== AppState.RESULTS && errorMessage && (
                    <div className="absolute top-20 w-full max-w-md mx-auto p-4 bg-red-100 text-red-700 border border-red-300 rounded-md shadow-lg text-center">
                        {errorMessage}
                    </div>
                )}
                {renderContent()}
            </main>
            <Footer />
        </div>
    );
};

export default App;