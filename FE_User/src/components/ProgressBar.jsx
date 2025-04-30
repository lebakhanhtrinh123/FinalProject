import React from 'react';

const ProgressBar = ({ currentStep }) => {
  const steps = [
    { id: 'basket', label: 'Choose Basket' },
    { id: 'style', label: 'Choose Style' },
    { id: 'flowers', label: 'Choose Flowers' },
    { id: 'accessories', label: 'Choose Accessories' }
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);

  return (
    <div className="max-w-5xl mx-auto mb-10 px-4">
      <div className="relative">
        <div className="h-2 bg-gray-200 rounded-full mb-6"></div>
        <div 
          className="absolute top-0 h-2 bg-pink-500 rounded-full transition-all duration-300 ease-in-out"
          style={{ 
            width: `${(currentStepIndex + 1) * 100 / steps.length}%` 
          }}
        ></div>

        <div className="flex justify-between">
          {steps.map((step, index) => {
            const isCompleted = index < currentStepIndex;
            const isActive = index === currentStepIndex;
            const isPending = index > currentStepIndex;
            
            return (
              <div key={step.id} className="relative flex flex-col items-center">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold -mt-3 z-10 transition-all duration-300
                    ${isCompleted 
                      ? 'bg-pink-500 text-white' // Completed
                      : isActive
                        ? 'bg-pink-100 border-2 border-pink-500 text-pink-600' // Active
                        : 'bg-white border-2 border-gray-300 text-gray-500' // Pending
                    }
                    ${isActive ? 'ring-4 ring-pink-100' : ''}
                  `}
                >
                  {isCompleted ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                
                <span 
                  className={`mt-2 text-sm font-medium
                    ${isActive 
                      ? 'text-pink-600 font-bold' 
                      : isCompleted 
                        ? 'text-gray-700' 
                        : 'text-gray-400'
                    }
                  `}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;