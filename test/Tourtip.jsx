import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoClose } from "react-icons/io5";

// Simple tooltip component (existing)
const AutoHideTooltip = ({
  content,
  duration = 5000,
  onClose,
  placement = "bottom",
}) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!show) return null;

  return (
    <div className="relative inline-block">
      <div
        className={`absolute z-50 px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-sm tooltip ${placement}`}
      >
        {content}
      </div>
    </div>
  );
};

// Reusable Tour Tip Component
export const TourTip = ({
  show = false,
  onClose,
  title,
  description,
  image,
  position = "top-right",
  className = "",
  autoHide = false,
  duration = 8000,
}) => {
  const [isVisible, setIsVisible] = useState(show);

  useEffect(() => {
    setIsVisible(show);
  }, [show]);

  useEffect(() => {
    if (autoHide && isVisible) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [autoHide, duration, isVisible]);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  const getPositionClasses = () => {
    switch (position) {
      case "top-left":
        return "top-4 left-4";
      case "top-right":
        return "top-4 right-4";
      case "bottom-left":
        return "bottom-4 left-4";
      case "bottom-right":
        return "bottom-4 right-4";
      case "center":
        return "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2";
      default:
        return "top-4 right-4";
    }
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, x: 20 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        exit={{ opacity: 0, scale: 0.8, x: 20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={`fixed z-50 ${getPositionClasses()} ${className}`}
      >
        <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden max-w-sm">
          {/* Arrow pointing to target element */}
          <div className="absolute -left-3 top-8 w-0 h-0 border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent border-r-[12px] border-r-white"></div>

          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 z-10 w-8 h-8 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center transition-colors duration-200"
          >
            <IoClose className="text-white text-lg" />
          </button>

          {/* Content */}
          <div className="p-6 pr-12">
            {/* Image/Icon */}
            {image && (
              <div className="mb-4 flex justify-center">
                {typeof image === "string" ? (
                  <img
                    src={image}
                    alt="Tour illustration"
                    className="w-16 h-16 object-contain"
                  />
                ) : (
                  <div className="w-16 h-16 flex items-center justify-center">
                    {image}
                  </div>
                )}
              </div>
            )}

            {/* Title */}
            {title && (
              <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">
                {title}
              </h3>
            )}

            {/* Description */}
            {description && (
              <p className="text-gray-600 text-sm leading-relaxed text-center">
                {description}
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AutoHideTooltip;
