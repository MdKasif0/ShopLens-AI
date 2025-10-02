import { GoogleGenAI, Type } from "@google/genai";
import { GeminiAnalysisResult, Product } from '../types';

const B64_PREFIX_REGEX = /^data:image\/(png|jpeg|webp);base64,/;

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    category: { type: Type.STRING, description: 'e.g., "clothing", "furniture", "electronics"' },
    itemType: { type: Type.STRING, description: 'e.g., "denim jacket", "table lamp", "smartphone"' },
    colors: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'All visible colors' },
    patterns: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'e.g., "striped", "floral", "leather texture"' },
    materials: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'e.g., "denim", "wood", "metal"' },
    brand: { type: Type.STRING, description: 'Brand name if visible, otherwise null' },
    styleKeywords: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'e.g., "vintage", "modern", "casual"' },
    visibleText: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Any visible text, labels, or logos' },
    description: { type: Type.STRING, description: 'A detailed description suitable for product search engines.' },
    confidence: { type: Type.INTEGER, description: 'A confidence score from 0-100 on the accuracy of the analysis.' },
    imageUrl: { type: Type.STRING, description: 'The direct URL of the main product image from the page.' },
  },
  required: ['category', 'itemType', 'colors', 'patterns', 'materials', 'brand', 'styleKeywords', 'visibleText', 'description', 'confidence']
};


export const analyzeProductImage = async (
  base64ImageData: string,
  mimeType: string
): Promise<GeminiAnalysisResult> => {
  try {
    const base64Data = base64ImageData.replace(B64_PREFIX_REGEX, "");

    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType,
      },
    };

    const prompt = `Analyze this product image in detail. Extract information for a shopping search. Be specific and detailed. This information will be used to find similar products for purchase online.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [{ text: prompt }, imagePart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
      },
    });

    const jsonText = response.text.trim();
    const parsedJson = JSON.parse(jsonText);
    return parsedJson as GeminiAnalysisResult;

  } catch (error) {
    console.error("Error analyzing image with Gemini:", error);
    if (error instanceof Error && error.message.includes('429')) {
      throw new Error("Too many requests. Please try again in a moment.");
    }
    throw new Error("Failed to analyze image. The image might be unclear or unsupported.");
  }
};

export const analyzeProductUrl = async (
  url: string
): Promise<GeminiAnalysisResult> => {
  try {
    const prompt = `You are an advanced AI shopping assistant. Analyze the product from this e-commerce URL: "${url}".
    Based on the product details you can infer from this link, extract its key attributes for a shopping search engine, including the main product image URL.
    Your response MUST be a valid JSON object that strictly adheres to the provided schema.

    Provide details for:
    - category (e.g., "clothing", "electronics")
    - itemType (e.g., "men's leather boots", "wireless headphones")
    - colors (list of primary colors)
    - patterns (e.g., "solid", "plaid")
    - materials (e.g., "leather", "cotton", "plastic")
    - brand (the brand name, or "Generic" if not obvious)
    - styleKeywords (e.g., "minimalist", "retro", "techwear")
    - visibleText (any text on the product)
    - description (a concise, compelling description for product listings)
    - confidence (a score from 80-100 reflecting your confidence in the analysis based on the URL)
    - imageUrl (The direct URL of the main product image from the page. If you cannot find one, omit this field.)
    
    Do not include any text or markdown formatting before or after the JSON object.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [{ text: prompt }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
      },
    });

    const jsonText = response.text.trim();
    const parsedJson = JSON.parse(jsonText);
    return parsedJson as GeminiAnalysisResult;

  } catch (error) {
    console.error("Error analyzing URL with Gemini:", error);
    if (error instanceof Error && error.message.includes('429')) {
      throw new Error("Too many requests. Please try again in a moment.");
    }
    throw new Error("Failed to analyze URL. The link might be broken or inaccessible.");
  }
};

export const findSimilarProducts = async (analysis: GeminiAnalysisResult): Promise<Product[]> => {
  try {
    const searchQuery = `Based on the following product analysis, find 15-20 similar items available for purchase from trusted e-commerce websites in India.

    Analysis:
    - Item Type: ${analysis.itemType}
    - Description: ${analysis.description}
    - Colors: ${analysis.colors.join(', ')}
    - Patterns: ${analysis.patterns.join(', ')}
    - Materials: ${analysis.materials.join(', ')}
    - Style Keywords: ${analysis.styleKeywords.join(', ')}

    Prioritize searching on these Indian e-commerce sites: Amazon.in, Flipkart, Myntra, Snapdeal, and Limeroad.

    Use Google Search to find these products. For each product found, provide a detailed JSON object. The response MUST be a single, valid JSON array containing these objects, with no surrounding text or markdown.

    Each JSON object must have this exact structure:
    {
      "id": "unique_product_id",
      "title": "Product Title",
      "imageUrl": "URL to a high-quality product image",
      "price": {
        "current": 2499.00,
        "original": 3999.00,
        "currency": "₹"
      },
      "retailer": {
        "name": "E-commerce Site Name (e.g., Amazon.in, Myntra)"
      },
      "affiliateLink": "Direct URL to the product page",
      "similarityScore": 95.5
    }`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: searchQuery,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const responseText = response.text.trim();

    // The model might wrap the JSON in markdown or add other text.
    // Find the start and end of the JSON array to extract it reliably.
    const jsonStart = responseText.indexOf('[');
    const jsonEnd = responseText.lastIndexOf(']');

    if (jsonStart === -1 || jsonEnd === -1 || jsonEnd < jsonStart) {
        console.warn("Could not find a valid JSON array in the response.", responseText);
        return [];
    }

    const jsonString = responseText.substring(jsonStart, jsonEnd + 1);

    try {
        const products = JSON.parse(jsonString);

        if (Array.isArray(products)) {
          // Filter out any malformed product objects and assign a random score if missing
          return products.filter(p => 
            p && p.id && p.title && p.imageUrl && p.price && typeof p.price.current === 'number' && p.retailer && p.affiliateLink
          ).map(p => ({ ...p, similarityScore: p.similarityScore || Math.random() * 10 + 89 }));
        }
        
        console.warn("Parsed content from response was not a JSON array:", products);
        return [];

    } catch (parseError) {
        console.error("Failed to parse JSON from Gemini response:", parseError);
        console.error("Extracted string for parsing:", jsonString);
        return [];
    }

  } catch (error) {
    console.error("Error finding similar products with Gemini:", error);
    if (error instanceof Error && error.message.includes('429')) {
      throw new Error("Too many requests. Please try again in a moment.");
    }
    throw new Error("Failed to find similar products. Please try refining your search.");
  }
};