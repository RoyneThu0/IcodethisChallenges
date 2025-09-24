import React, { useState, useEffect } from "react";
import { TourTip } from "./TourTip";

// Example dashboard illustration component
const DashboardIcon = () => (
  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
    <div className="w-10 h-10 bg-white rounded opacity-80 flex items-center justify-center">
      <div className="w-6 h-6 bg-blue-500 rounded"></div>
    </div>
  </div>
);

const StatementsIcon = () => (
  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center">
    <div className="w-10 h-6 bg-white rounded opacity-80"></div>
  </div>
);

const AnalyticsIcon = () => (
  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
    <div className="w-8 h-8 bg-white rounded-full opacity-80 flex items-center justify-center">
      <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
    </div>
  </div>
);

// Tour steps configuration
const tourSteps = [
  {
    id: "welcome",
    title: "Welcome to AMUA!",
    description:
      "Let's take a quick tour to show you around the platform and help you get started.",
    image: <DashboardIcon />,
    position: "center",
    duration: 6000,
  },
  {
    id: "dashboard",
    title: "DASHBOARD",
    description:
      "Your control hub for financial insights and overview. Access your main analytics and key metrics here.",
    image: <DashboardIcon />,
    position: "top-right",
    duration: 8000,
  },
  {
    id: "statements",
    title: "MY STATEMENTS",
    description:
      "Upload and manage your bank statements here. AMUA will automatically process and analyze your financial data.",
    image: <StatementsIcon />,
    position: "top-right",
    duration: 8000,
  },
  {
    id: "analytics",
    title: "ANALYTICS",
    description:
      "Dive deep into your financial patterns. View spending trends, income analysis, and AI-powered insights.",
    image: <AnalyticsIcon />,
    position: "top-right",
    duration: 8000,
  },
];

const UserTourExample = ({ startTour = false, onTourComplete }) => {
  const [currentStep, setCurrentStep] = useState(-1);
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    if (startTour) {
      setCurrentStep(0);
      setShowTour(true);
    }
  }, [startTour]);

  const handleStepClose = () => {
    const nextStep = currentStep + 1;

    if (nextStep < tourSteps.length) {
      // Move to next step
      setTimeout(() => {
        setCurrentStep(nextStep);
      }, 300);
    } else {
      // Tour completed
      setShowTour(false);
      setCurrentStep(-1);
      if (onTourComplete) {
        onTourComplete();
      }
      // Mark tour as seen
      localStorage.setItem("hasSeenTour", "true");
    }
  };

  const skipTour = () => {
    setShowTour(false);
    setCurrentStep(-1);
    if (onTourComplete) {
      onTourComplete();
    }
    localStorage.setItem("hasSeenTour", "true");
  };

  if (!showTour || currentStep === -1) return null;

  const currentTourStep = tourSteps[currentStep];

  return (
    <>
      <TourTip
        show={showTour && currentStep >= 0}
        title={currentTourStep?.title}
        description={currentTourStep?.description}
        image={currentTourStep?.image}
        position={currentTourStep?.position}
        onClose={handleStepClose}
        autoHide={true}
        duration={currentTourStep?.duration}
      />

      {/* Tour progress indicator */}
      {showTour && (
        <div className="fixed bottom-4 right-4 z-40">
          <div className="bg-white rounded-full shadow-lg px-4 py-2 flex items-center gap-3">
            <div className="flex gap-1">
              {tourSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                    index <= currentStep ? "bg-blue-500" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
            <button
              onClick={skipTour}
              className="text-xs text-gray-500 hover:text-gray-700 font-medium"
            >
              Skip Tour
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default UserTourExample;

/*
Example usage in a component:

import UserTourExample from './UserTourExample';

const Dashboard = () => {
  const [showTour, setShowTour] = useState(false);

  const startTour = () => {
    setShowTour(true);
  };

  const handleTourComplete = () => {
    setShowTour(false);
    console.log('Tour completed!');
  };

  return (
    <div>
      <button onClick={startTour}>Start Tour</button>
      
      <UserTourExample 
        startTour={showTour} 
        onTourComplete={handleTourComplete} 
      />
      
      // Your dashboard content
    </div>
  );
};
*/
