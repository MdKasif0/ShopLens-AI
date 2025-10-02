
import React from 'react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <div className="group relative bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden transition-shadow hover:shadow-lg">
      <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-100">
        <img
          src={product.imageUrl}
          alt={product.title}
          className="w-full h-full object-cover object-center transition-transform group-hover:scale-105"
        />
      </div>
      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-700 h-10 overflow-hidden">
          {product.title}
        </h3>
        <p className="mt-1 text-xs text-gray-500">{product.retailer.name}</p>
        <div className="flex items-baseline justify-between mt-2">
            <p className="text-lg font-bold text-gray-900">
                {product.price.currency}{product.price.current.toFixed(2)}
            </p>
            {product.price.original && (
                <p className="text-sm text-gray-500 line-through">
                    {product.price.currency}{product.price.original.toFixed(2)}
                </p>
            )}
        </div>
      </div>
       <a
        href={product.affiliateLink}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute inset-0"
      >
        <span className="sr-only">View deal for {product.title}</span>
      </a>
      <div className="p-4 pt-0">
          <a
              href={product.affiliateLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
              View Deal
          </a>
      </div>
    </div>
  );
};

export default ProductCard;
