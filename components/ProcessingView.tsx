
import React from 'react';

interface ProcessingViewProps {
  imagePreview: string;
}

const ProcessingView: React.FC<ProcessingViewProps> = ({ imagePreview }) => {
  const tips = [
    "We search 1000+ stores to find you the best deals.",
    "Our AI can identify clothing, furniture, electronics, and more!",
    "Clear, well-lit photos provide the best results.",
    "Finding the perfect match just for you...",
  ];
  const [tip, setTip] = React.useState(tips[0]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setTip(tips[Math.floor(Math.random() * tips.length)]);
    }, 3000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col items-center justify-center text-center px-4">
      <div className="relative">
        <img
          src={imagePreview}
          alt="Product preview"
          className="w-48 h-48 object-cover rounded-2xl shadow-2xl border-4 border-white animate-pulse"
        />
      </div>

      <h2 className="mt-8 text-3xl font-bold text-gray-800 tracking-tight">
        Analyzing your photo...
      </h2>
      <p className="mt-2 text-gray-600 max-w-md">
        Our AI is working its magic to identify your product and find the best matches online. This should only take a moment.
      </p>

      <div className="w-full max-w-md mt-8 bg-gray-100 p-4 rounded-lg">
          <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-400 to-green-400 rounded-full w-full animate-progress"></div>
          </div>
      </div>
      
      <p className="mt-6 text-sm text-gray-500 italic h-5">
        Tip: {tip}
      </p>

      <style>{`
        @keyframes progress {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
        }
        .animate-progress {
            animation: progress 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default ProcessingView;
