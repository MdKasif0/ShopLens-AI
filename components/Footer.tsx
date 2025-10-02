
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="container mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs text-gray-500">
          © {new Date().getFullYear()} ShopLens AI. All rights reserved.
        </p>
        <p className="text-center text-xs text-gray-400 mt-1">
          As an affiliate, we may earn from qualifying purchases. This does not affect the price you pay.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
