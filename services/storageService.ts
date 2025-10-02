import { GeminiAnalysisResult, SavedSearch } from '../types';

const STORAGE_KEY = 'shoplens_saved_searches';
const MAX_SAVED_SEARCHES = 9;

/**
 * Retrieves all saved searches from local storage.
 */
export const getSavedSearches = (): SavedSearch[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error("Failed to retrieve saved searches:", error);
    // In case of parsing error, clear the corrupted storage
    localStorage.removeItem(STORAGE_KEY);
    return [];
  }
};

/**
 * Saves a new search to local storage.
 * @param analysis The analysis result from Gemini.
 * @param imagePreview The data URL of the preview image.
 */
export const saveSearch = (analysis: GeminiAnalysisResult, imagePreview: string): void => {
  try {
    const searches = getSavedSearches();
    
    // Prevent exact duplicates based on analysis content
    const currentAnalysisString = JSON.stringify(analysis);
    const isDuplicate = searches.some(s => JSON.stringify(s.analysis) === currentAnalysisString);
    if (isDuplicate) {
        return;
    }

    const newSearch: SavedSearch = {
      id: Date.now(),
      analysis,
      imagePreview,
    };
    
    const updatedSearches = [newSearch, ...searches].slice(0, MAX_SAVED_SEARCHES);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSearches));
  } catch (error)
    {
        console.error("Failed to save search:", error);
    }
    };
    
    /**
    * Deletes a search from local storage by its ID.
    * @param id The ID of the search to delete.
    */
    export const deleteSearch = (id: number): void => {
    try {
        const searches = getSavedSearches();
        const updatedSearches = searches.filter(search => search.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSearches));
    } catch (error) {
        console.error("Failed to delete search:", error);
    }
};
