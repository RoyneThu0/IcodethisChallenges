import React, { useState, useEffect } from "react";
import { Modal, Button } from "flowbite-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import { TourTip } from "./Tourtip";

const WelcomeToAmua = ({
  show,
  onClose,
  onShowMeAround,
  isFirstUpload = false,
  isNewUser = false,
  autoTrigger = true,
}) => {
  const [internalShow, setInternalShow] = useState(show);
  const { serverStatements } = useSelector((state) => state.Statements);

  // Auto-trigger logic
  useEffect(() => {
    if (!autoTrigger) return;

    const hasSeenGuidance =
      localStorage.getItem("hasSeenUploadGuidance") === "true";

    console.log("WelcomeToAmua useEffect triggered:", {
      isFirstUpload,
      isNewUser,
      hasSeenGuidance,
      serverStatements,
      autoTrigger,
    });

    // Only proceed if we have determined the serverStatements state
    if (serverStatements === undefined) return;

    // Trigger for first upload scenario
    if (
      isFirstUpload &&
      !hasSeenGuidance &&
      serverStatements &&
      serverStatements.length > 0
    ) {
      console.log("Triggering welcome for first upload");
      setTimeout(() => {
        setInternalShow(true);
      }, 500);
      return;
    }

    // Trigger when user has no statements
    if (
      isNewUser &&
      !hasSeenGuidance &&
      (serverStatements === null ||
        (Array.isArray(serverStatements) && serverStatements.length === 0))
    ) {
      console.log("Triggering welcome for new user");
      setTimeout(() => {
        setInternalShow(true);
      }, 1500);
    }
  }, [isFirstUpload, isNewUser, serverStatements, autoTrigger]);

  // Update internal show state when prop changes
  useEffect(() => {
    setInternalShow(show);
  }, [show]);

  const handleClose = () => {
    setInternalShow(false);
    if (onClose) onClose();
  };

  const handleShowMeAround = () => {
    // Marks user as having seen the welcome
    localStorage.setItem("hasSeenUploadGuidance", "true");
    setInternalShow(false);
    if (onShowMeAround) onShowMeAround();
  };
  console.log("WelcomeToAmua render:", {
    internalShow,
    show,
    isNewUser,
    isFirstUpload,
  });

  return (
    <AnimatePresence>
      {internalShow && (
        <Modal
          show={internalShow}
          onClose={handleClose}
          size="3xl"
          dismissible={false}
          className="transition-all duration-300 bg-gray-900"
          theme={{
            content: {
              base: "relative h-full w-full p-4 md:h-auto",
              inner: "relative rounded-lg bg-transparent shadow-lg",
            },
          }}
        >
          <motion.div
            key="welcome-modal-content"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="w-full bg-white rounded-2xl m-5 p-10"
          >
            <Modal.Body className="!p-0 ">
              <div className="text-center p-3 space-y-6">
                {/* Main heading */}
                <h1 className="text-3xl font-bold text-gray-900 mb-6">
                  Welcome to Amua
                </h1>

                {/* Description */}
                <div className="max-w-2xl !mt-10 mx-auto">
                  <p className="text-md text-gray-700 font-semibold ">
                    Your all-in-one analytics tool for financial statements.{" "}
                    <br />
                    Transform your financial data into actionable insights with
                    AI-powered analytics.
                  </p>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center !mt-12">
                  <Button
                    onClick={handleClose}
                    className="!px-5 !border-none !rounded-lg !bg-amua_blue !text-white hover:!text-gray-800 !transition-all !duration-200 focus:!ring-0 focus:!outline-none"
                  >
                    Skip tour
                  </Button>

                  <Button
                    onClick={handleShowMeAround}
                    className="px-5 py-1 rounded-lg hover:bg-blue-700 transition-all duration-200 transform hover:scale-105"
                  >
                    Show me around
                  </Button>
                </div>
              </div>
            </Modal.Body>
          </motion.div>
        </Modal>
      )}
    </AnimatePresence>
  );
};

export default WelcomeToAmua;
