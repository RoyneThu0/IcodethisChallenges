import { Badge, Button, Spinner } from "flowbite-react";
import React, { useEffect, useState } from "react";
import {
  HiDocumentMagnifyingGlass,
  HiArrowRight,
  HiQuestionMarkCircle,
} from "react-icons/hi2";
import { fetchStatementsData } from "@redux-utils/thunks/overview";
import { useDispatch, useSelector } from "react-redux";
import { checkForProcessedStatements } from "../../redux-utils/thunks/statements";
import { Link } from "react-router-dom";
import { fetchServerStatementsData } from "@redux-utils/thunks/statements";
import { BsQuestionCircleFill } from "react-icons/bs";
import logo from "@assets/icons/amua_logo.png";
import { getUserActiveSubscriptions } from "@redux-utils/thunks/subscriptionType";
import { selectProcessedStatements } from "@redux-utils/features/statementActions.slice";
import RefreshRequestButton from "./RefreshRequestButton";
import UploadSection from "./sections/uploadSection";
import UserGuidance from "@components/UserGuidance";
import WelcomeToAmua from "@components/Usertour";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";

const EmptyStatePage = () => {
  const dispatch = useDispatch();
  const { hasProcessedStatements, hasSubmittedStatements, serverStatements } =
    useSelector((state) => state.Statements);

  // Use Redux selectors for processed statements and IDs
  const processedStatements = useSelector(selectProcessedStatements);

  // Upload state management
  const [processingStatements, setProcessingStatements] = useState(0);
  const [showGuidance, setShowGuidance] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  // Determine if user is truly new (no statements at all)
  const hasAnyStatements = serverStatements && serverStatements.length > 0;
  const isNewUser = !hasAnyStatements;

  useEffect(() => {
    setProcessingStatements(
      serverStatements.filter((statement) => statement.status === "processing")
        .length
    );
  }, [serverStatements]);

  useEffect(() => {
    dispatch(fetchStatementsData());
    dispatch(fetchServerStatementsData());
    dispatch(getUserActiveSubscriptions());
  }, [dispatch]);

  useEffect(() => {
    let statementCheck = dispatch(checkForProcessedStatements());
  }, [hasProcessedStatements]);

  // Define the animation style
  const loadingBarStyle = {
    width: "30%",
    height: "100%",
    backgroundColor: "#2563eb", // blue-600
    borderRadius: "9999px",
    position: "absolute",
    left: "-30%",
    animation: "trickle 1.5s ease-in-out infinite",
  };

  useEffect(() => {
    // Create and append global CSS for the animation
    const style = document.createElement("style");
    style.innerHTML = `
      @keyframes trickle {
        0% { left: -30%; }
        100% { left: 100%; }
      }
    `;
    document.head.appendChild(style);

    // Cleanup on unmount
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Helper to get prioritized recent statements
  const getPrioritizedStatements = () => {
    if (!serverStatements) return [];

    const processing = serverStatements.filter(
      (s) => s.status === "processing"
    );
    const failed = serverStatements.filter((s) => s.status === "failed");
    const processed = serverStatements.filter((s) => s.status === "processed");

    let result = [];

    //sort processing by created_at with latest first
    processing.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // Add up to 5 processing
    result = processing.slice(0, 5);

    // If less than 5, add up to 2 failed
    if (result.length < 5) {
      const failedToAdd = Math.min(2, 5 - result.length, failed.length);
      result = result.concat(failed.slice(0, failedToAdd));
    }

    // If still less than 5, add processed
    if (result.length < 5) {
      result = result.concat(processed.slice(0, 5 - result.length));
    }

    return result;
  };

  const formatTimestamp = (timestamp) => {
    // return the timestamp in the format of "1 hour ago", "2 days ago", "3 months ago", "4 years ago"
    const date = new Date(timestamp);
    const diffTime = Math.abs(Date.now() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.ceil(diffTime / (1000 * 60));
    const diffSeconds = Math.ceil(diffTime / 1000);

    if (diffDays > 0) {
      return `${diffDays} days ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hours ago`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes} minutes ago`;
    } else if (diffSeconds > 0) {
      return `${diffSeconds} seconds ago`;
    }

    return "just now";
  };

  const helpBtnRef = useScrollAnimation({ animation: "fadeIn", duration: 1 });

  return (
    <div className="w-full min-h-[90dvh] p-0 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-4 flex flex-col items-center">
          <div className="flex items-center justify-between w-full mb-4">
            <div className="flex-1"></div>
            <div className="flex items-center space-x-4">
              <h1 className="text-3xl font-bold text-gray-800">Welcome to</h1>
              <img src={logo} alt="Logo" className="w-40" />
            </div>
            <div className="flex-1 flex justify-end">
              <Button
                ref={helpBtnRef}
                color="light"
                size="sm"
                onClick={() => setShowGuidance(true)}
                className="text-blue-600 hover:text-blue-800"
              >
                <HiQuestionMarkCircle className="mr-2 h-4 w-4" />
                Need Help?
              </Button>

              {/* Debug button to test welcome modal */}
              <Button
                color="gray"
                size="sm"
                onClick={() => setShowWelcome(true)}
                className="text-green-600 hover:text-green-800"
              >
                Test Welcome
              </Button>

              {/* Debug button to clear localStorage */}
              <Button
                color="red"
                size="sm"
                onClick={() => {
                  localStorage.removeItem("hasSeenUploadGuidance");
                  window.location.reload();
                }}
                className="text-red-600 hover:text-red-800"
              >
                Reset Guidance
              </Button>
            </div>
          </div>

          <p className="text-gray-600 text-sm">
            We're ready to analyze your financial statements and provide
            valuable insights
          </p>
        </div>

        <UploadSection />

        {isNewUser && (
          <div className="mb-8">
            <div className="max-w-lg mx-auto text-center">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  What to expect
                </h3>
                <p className="text-gray-600 text-sm mb-6">
                  After uploading your statements, we'll analyze your data and
                  generate insights.
                </p>

                <div className="space-y-4 text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">
                      Financial overview and trends
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">
                      Transaction categorization
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">
                      Spending insights and recommendations
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {hasAnyStatements && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
            <div className="flex flex-row justify-between">
              <h2 className="text-xl font-semibold mb-4">Processing Status</h2>
              {serverStatements && serverStatements.length > 0 && (
                <RefreshRequestButton />
              )}
            </div>{" "}
            {processingStatements > 0 && (
              <p className="text-gray-600 mb-2">
                Your statements are being processed. This might take a little
                while.
              </p>
            )}
            <div className="flex items-center gap-2 mb-1">
              <div className="flex-shrink-0 w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                <div
                  className={
                    processingStatements > 0
                      ? "w-2 h-2 bg-blue-500 rounded-full"
                      : "w-2 h-2 bg-gray-500 rounded-full"
                  }
                ></div>
              </div>
              <span className="text-sm text-gray-600">
                {processingStatements > 0
                  ? "Processing your statements"
                  : "Your statements have been processed successfully."}
              </span>
              <span className="ml-auto text-gray-400 text-sm font-medium">
                {processedStatements.length}/{serverStatements?.length}{" "}
                statements processed
              </span>
            </div>
            {processingStatements > 0 && (
              <div className="w-full h-2 bg-gray-200 rounded-full mb-4 overflow-hidden relative">
                <div className="absolute w-full h-full">
                  <div style={loadingBarStyle}></div>
                </div>
              </div>
            )}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm text-gray-600">
              <p className="mb-2 sm:mb-0">
                {processingStatements > 0 &&
                  "We're analyzing your data to provide you with accurate insights."}
              </p>
            </div>
          </div>
        )}

        {hasAnyStatements && (
          <div className="bg-white border border-gray-200 rounded-lg p-2 md:p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Recent Statements</h2>
              <Link to="/dashboard/statements">
                {" "}
                <Button color="light" size="xs">
                  View All
                </Button>{" "}
              </Link>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Your recently uploaded statements
            </p>

            <div className="space-y-2">
              {getPrioritizedStatements().length === 0 ? (
                <p className="text-gray-500 text-sm">
                  No recent statements found.
                </p>
              ) : (
                getPrioritizedStatements().map((statement, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-3 flex flex-col md:flex-row gap-4 md:gap-1 justify-between items-start md:items-center"
                  >
                    <div className="flex flex-row w-full max-w-[70%] items-start gap-3">
                      <div className="p-2 bg-gray-100 rounded">
                        <HiDocumentMagnifyingGlass className="text-xl text-gray-600" />
                      </div>
                      <div className="flex flex-col w-full">
                        <p className="text-sm md:text-base font-medium line-clamp-1">
                          {statement.file_name}
                        </p>
                        <p className="text-xs text-gray-500 line-clamp-1">
                          Uploaded {formatTimestamp(statement.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex w-fit items-center gap-3">
                      <Badge
                        color={
                          statement.status === "processing"
                            ? "warning"
                            : statement.status === "processed"
                            ? "success"
                            : statement.status === "failed"
                            ? "failure"
                            : "gray"
                        }
                        className="px-2 py-1 text-xs uppercase"
                      >
                        <div className="flex flex-row items-center gap-2">
                          {statement.status}
                          {statement.status === "processing" && (
                            <Spinner size="xs" />
                          )}
                        </div>{" "}
                      </Badge>
                      <Link to="/dashboard/statements">
                        <HiArrowRight className="text-gray-400" />
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        <div className="text-center mt-8 absolute bottom-5 left-0 right-0">
          <small className="text-sm text-gray-500 font-medium">
            AMUA SASA® version 1.0.1
          </small>
        </div>
      </div>

      {/* Welcome to Amua Modal - handles auto-triggering internally */}
      <WelcomeToAmua
        show={showWelcome}
        onClose={() => setShowWelcome(false)}
        onShowMeAround={() => {
          setShowWelcome(false);
          setShowGuidance(true);
        }}
        isNewUser={isNewUser}
        autoTrigger={true}
      />

      {/* User Guidance Modal */}
      <UserGuidance
        show={showGuidance}
        onClose={() => setShowGuidance(false)}
        isFirstUpload={false}
      />
    </div>
  );
};

export default EmptyStatePage;
