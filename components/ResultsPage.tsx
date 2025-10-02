import React, { useState, useEffect, useMemo, useRef } from 'react';
import { GeminiAnalysisResult, Product } from '../types';
import ProductCard from './ProductCard';
import { PencilIcon, BookmarkIcon, FilterIcon } from './icons';

interface ResultsPageProps {
  analysis: GeminiAnalysisResult;
  products: Product[];
  imagePreview: string;
  onRefineSearch: (analysis: GeminiAnalysisResult) => void;
  isRefining: boolean;
  onSaveSearch: () => void;
  isSearchSaved: boolean;
}

type SortOption = 'relevance' | 'price_asc' | 'price_desc';

const ResultsPage: React.FC<ResultsPageProps> = ({ analysis, products, imagePreview, onRefineSearch, isRefining, onSaveSearch, isSearchSaved }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editableAnalysis, setEditableAnalysis] = useState<GeminiAnalysisResult>(analysis);
  const [sortOption, setSortOption] = useState<SortOption>('relevance');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedRetailers, setSelectedRetailers] = useState<Set<string>>(new Set());
  const filterRef = useRef<HTMLDivElement>(null);

  const uniqueRetailers = useMemo(() => {
    const retailers = new Set<string>();
    products.forEach(p => retailers.add(p.retailer.name));
    return Array.from(retailers).sort();
  }, [products]);

  useEffect(() => {
    setEditableAnalysis(analysis);
  }, [analysis]);
  
  // Reset filters when a new search is performed
  useEffect(() => {
    setSelectedRetailers(new Set(uniqueRetailers));
  }, [uniqueRetailers]);
  
  // Close filter dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditableAnalysis(prev => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'styleKeywords' | 'colors') => {
    const { value } = e.target;
    setEditableAnalysis(prev => ({ ...prev, [field]: value.split(',').map(k => k.trim()).filter(Boolean) }));
  };

  const handleRefineClick = () => {
    onRefineSearch(editableAnalysis);
    setIsEditing(false);
  };
  
  const handleCancelClick = () => {
    setEditableAnalysis(analysis);
    setIsEditing(false);
  };

  const filteredAndSortedProducts = useMemo(() => {
    return [...products]
      .filter(p => selectedRetailers.has(p.retailer.name))
      .sort((a, b) => {
        switch (sortOption) {
            case 'price_asc':
                return a.price.current - b.price.current;
            case 'price_desc':
                return b.price.current - a.price.current;
            case 'relevance':
            default:
                return b.similarityScore - a.similarityScore;
        }
    });
  }, [products, sortOption, selectedRetailers]);

  const handleSortChange = () => {
    const options: SortOption[] = ['relevance', 'price_asc', 'price_desc'];
    const currentIndex = options.indexOf(sortOption);
    const nextIndex = (currentIndex + 1) % options.length;
    setSortOption(options[nextIndex]);
  };

  const getSortLabel = () => {
      switch(sortOption) {
          case 'price_asc': return 'Sort: Price Low-High';
          case 'price_desc': return 'Sort: Price High-Low';
          case 'relevance':
          default:
            return 'Sort: Relevance';
      }
  }
  
  const handleRetailerToggle = (retailerName: string) => {
    setSelectedRetailers(prev => {
        const newSet = new Set(prev);
        if (newSet.has(retailerName)) {
            newSet.delete(retailerName);
        } else {
            newSet.add(retailerName);
        }
        return newSet;
    });
  };

  const renderAnalysisContent = () => {
    if (isEditing) {
      return (
        <div className="space-y-4">
          <div>
            <label htmlFor="itemType" className="block text-sm font-medium text-gray-700">Item Type</label>
            <input type="text" name="itemType" id="itemType" value={editableAnalysis.itemType} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea name="description" id="description" value={editableAnalysis.description} onChange={handleInputChange} rows={3} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"></textarea>
          </div>
          <div>
            <label htmlFor="colors" className="block text-sm font-medium text-gray-700">Colors (comma-separated)</label>
            <input type="text" name="colors" id="colors" value={editableAnalysis.colors.join(', ')} onChange={(e) => handleArrayChange(e, 'colors')} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
          </div>
          <div>
            <label htmlFor="styleKeywords" className="block text-sm font-medium text-gray-700">Style Keywords (comma-separated)</label>
            <input type="text" name="styleKeywords" id="styleKeywords" value={editableAnalysis.styleKeywords.join(', ')} onChange={(e) => handleArrayChange(e, 'styleKeywords')} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button onClick={handleCancelClick} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Cancel</button>
            <button onClick={handleRefineClick} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Refine Search</button>
          </div>
        </div>
      );
    }

    return (
      <div>
        <div className="flex justify-between items-start">
            <div>
                <h2 className="text-2xl font-bold text-gray-800 capitalize">{analysis.itemType}</h2>
                <p className="text-gray-600 mt-1">{analysis.description}</p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={onSaveSearch}
                  disabled={isSearchSaved}
                  className="flex items-center gap-2 text-sm text-blue-600 font-medium p-2 rounded-md hover:bg-blue-50 disabled:text-gray-400 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                  aria-label={isSearchSaved ? "Search saved" : "Save this search"}
                >
                    <BookmarkIcon className={`w-4 h-4 ${isSearchSaved ? 'fill-current text-blue-600' : ''}`} />
                    <span>{isSearchSaved ? 'Saved' : 'Save'}</span>
                </button>
                <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 text-sm text-blue-600 font-medium p-2 rounded-md hover:bg-blue-50">
                    <PencilIcon className="w-4 h-4" />
                    <span>Edit</span>
                </button>
            </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
            {analysis.styleKeywords.map(keyword => (
                <span key={keyword} className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">{keyword}</span>
            ))}
            {analysis.colors.map(color => (
                <span key={color} className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">{color}</span>
            ))}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 w-full">
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 mb-8 flex flex-col md:flex-row items-start gap-6">
          <img src={imagePreview} alt="Searched product" className="w-24 h-24 object-cover rounded-lg border"/>
          <div className="flex-1 min-w-0">
            {renderAnalysisContent()}
          </div>
      </div>

      <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-700">
              Found {filteredAndSortedProducts.length} similar items
          </h3>
          <div className="flex items-center gap-2">
              <button onClick={handleSortChange} className="text-sm text-gray-600 font-medium p-2 rounded-md hover:bg-gray-100 w-40 text-left">{getSortLabel()}</button>
              <div className="relative" ref={filterRef}>
                <button onClick={() => setIsFilterOpen(o => !o)} className="flex items-center gap-1 text-sm text-gray-600 font-medium p-2 rounded-md hover:bg-gray-100">
                    <FilterIcon className="w-4 h-4" />
                    Filter ({selectedRetailers.size})
                </button>
                {isFilterOpen && (
                    <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-xl z-20">
                        <div className="p-4 border-b">
                            <h4 className="font-semibold text-sm">Filter by Retailer</h4>
                        </div>
                        <div className="p-4 max-h-60 overflow-y-auto space-y-2">
                            {uniqueRetailers.map(retailer => (
                                <label key={retailer} className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={selectedRetailers.has(retailer)}
                                        onChange={() => handleRetailerToggle(retailer)}
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700">{retailer}</span>
                                </label>
                            ))}
                        </div>
                        <div className="p-2 border-t bg-gray-50 flex justify-between">
                            <button onClick={() => setSelectedRetailers(new Set())} className="text-xs text-gray-600 hover:text-blue-600 font-medium">Clear All</button>
                            <button onClick={() => setSelectedRetailers(new Set(uniqueRetailers))} className="text-xs text-blue-600 hover:text-blue-800 font-semibold">Select All</button>
                        </div>
                    </div>
                )}
              </div>
          </div>
      </div>
      
      <div className="relative">
        {isRefining && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
                <div className="text-center">
                    <p className="font-semibold text-gray-700">Finding better matches...</p>
                </div>
            </div>
        )}
        {filteredAndSortedProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
            {filteredAndSortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-100 rounded-lg">
            <p className="text-gray-600">No similar products could be found.</p>
            <p className="text-sm text-gray-500 mt-2">Try adjusting your filters or refining your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsPage;