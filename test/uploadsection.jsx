import React, { useEffect, useState } from "react";
import { BiUpload, BiCheckCircle } from "react-icons/bi";
import { LuAlertCircle, LuFileUp } from "react-icons/lu";
import { Badge, Button, Progress, Spinner } from "flowbite-react";
import { Upload, Input, Skeleton, Typography } from "antd";
import { FaXmark } from "react-icons/fa6";
import { useForm } from "react-hook-form";
import { processPdf } from "@utils/ProcessPDF";
import { useDispatch, useSelector } from "react-redux";
import {
  uploadStatement,
  checkForProcessedStatements,
} from "@redux-utils/thunks/statements";
import { fetchServerStatementsData } from "@redux-utils/thunks/statements";
import { selectTopRankingSubscription } from "@redux-utils/features/subscriptionType.slice";
import { BsQuestionCircleFill } from "react-icons/bs";
import { HiDocumentMagnifyingGlass } from "react-icons/hi2";
import UserGuidance from "@components/UserGuidance";
import WelcomeToAmua from "@components/Usertour";
const { Dragger } = Upload;

const UploadSection = () => {
  const dispatch = useDispatch();
  const topRankingSubscription = useSelector(selectTopRankingSubscription);
  const { serverStatements } = useSelector((state) => state.Statements);

  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [fileInfo, setFileInfo] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [showGuidance, setShowGuidance] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    defaultValues: {
      has_password: false,
      password: "",
    },
  });

  const handleFileUpload = async (file) => {
    if (!file) return false;

    setIsProcessing(true);
    setSelectedFile(file);
    setUploadSuccess(null);
    setUploadError(null);

    // Check if file is PDF
    if (file.type !== "application/pdf") {
      setUploadError("Only PDF files are allowed.");
      setIsProcessing(false);
      return false;
    }

    try {
      const info = await processPdf(file);
      setFileInfo(info);

      if (info.isEncrypted) {
        setShowPasswordField(true);
      }
      setIsProcessing(false);
    } catch (err) {
      // console.error("Error processing PDF:", err);
      setUploadError("Failed to process the PDF.");
      setIsProcessing(false);
      return false;
    }

    return false; // Prevent default upload
  };

  const handlePasswordChange = async (e) => {
    const newPassword = e.target.value;
    setValue("password", newPassword);

    // Always set password as attempted when the user types anything
    // This ensures the submit button can be enabled
    setFileInfo((prev) => ({ ...prev, passwordAttempted: true }));

    if (fileInfo?.isEncrypted && selectedFile && newPassword.length >= 1) {
      try {
        const newInfo = await processPdf(selectedFile, newPassword);
        setFileInfo({
          ...newInfo,
          passwordAttempted: true,
          wrongPassword: !newInfo.pageNumber, // If we can't get page number, password is likely wrong
        });
      } catch (err) {
        // console.error("Error unlocking PDF:", err);
        setFileInfo((prev) => ({
          ...prev,
          passwordAttempted: true,
          wrongPassword: true,
        }));
      }
    }
  };

  const handleStatementUpload = async (file, password = "") => {
    setIsUploading(true);
    setUploadSuccess(null);
    setUploadError(null);

    // Check if this will be the user's first upload
    const isFirstUpload = !serverStatements || serverStatements.length === 0;
    const hasSeenGuidance =
      localStorage.getItem("hasSeenUploadGuidance") === "true";

    try {
      const response = await dispatch(
        uploadStatement({
          statement_file: file,
          statement_type: "USER UPLOAD",
          password: password,
          subscription_id: topRankingSubscription?.id || 1,
        })
      ).unwrap();

      // console.log("Upload response:", response);
      setUploadSuccess("Statement uploaded successfully!");
      reset();
      setFileInfo(null);
      setSelectedFile(null);
      setShowPasswordField(false);
      dispatch(checkForProcessedStatements());
      dispatch(fetchServerStatementsData());

      // WelcomeToAmua component will now handle auto-triggering internally
      // Remove the manual trigger logic from here
    } catch (error) {
      // console.error("Upload Error Details:", error);
      setUploadError(
        error.message || "Failed to upload the statement. Please try again."
      );
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmitPassword = (data) => {
    if (selectedFile) {
      // Always try to upload with the provided password, even if we're not sure it's correct
      handleStatementUpload(selectedFile, data.password);
    }
  };

  const props = {
    name: "file",
    multiple: false,
    beforeUpload: handleFileUpload,
    showUploadList: false,
    customRequest: ({ file, onSuccess }) => {
      // This prevents the default upload behavior
      setTimeout(() => {
        onSuccess("ok");
      }, 0);
    },
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6">
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-3 mb-3 w-full">
          <div className="bg-gray-100 rounded-full p-3">
            <LuFileUp className="text-xl text-gray-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold">
              To get started, upload your financial statements
            </h3>
          </div>
        </div>

        {uploadSuccess && (
          <div className="mb-4 w-full flex flex-row relative justify-start items-center gap-2 p-2 text-sm text-green-700 bg-green-100 rounded-lg">
            <BiCheckCircle />
            {uploadSuccess}
            <Button
              size="xs"
              className="absolute right-2"
              onClick={() => setUploadSuccess(null)}
            >
              <FaXmark />
            </Button>
          </div>
        )}

        {uploadError && (
          <div className="mb-4 w-full flex flex-row relative justify-start items-center gap-2 p-2 text-sm text-red-700 bg-red-100 rounded-lg">
            <LuAlertCircle />
            {uploadError}
            <Button
              size="xs"
              color="red"
              className="absolute right-2"
              onClick={() => setUploadError(null)}
            >
              <FaXmark />
            </Button>
          </div>
        )}

        {!showPasswordField && !selectedFile && (
          <Dragger {...props} className="w-full rounded-lg mb-3 py-8">
            <p className="ant-upload-drag-icon">
              <BiUpload className="text-4xl mx-auto text-gray-400" />
            </p>
            <p className="ant-upload-text font-medium text-lg">
              Drag & drop your statement here
            </p>
            <p className="ant-upload-hint text-sm text-gray-500">
              or click to browse files (PDF format only)
            </p>
          </Dragger>
        )}

        {!showPasswordField && selectedFile && fileInfo && (
          <div className="w-full">
            <div className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-200 rounded">
                  <HiDocumentMagnifyingGlass className="text-lg text-gray-600" />
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-sm text-gray-900">
                        {selectedFile.name}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {(selectedFile.size / 1024).toFixed(2)} KB • Added just
                        now
                      </p>
                    </div>
                    <Button
                      size="xs"
                      color="gray"
                      onClick={() => {
                        setSelectedFile(null);
                        setFileInfo(null);
                      }}
                    >
                      <FaXmark />
                    </Button>
                  </div>

                  <div className="mt-1 grid grid-cols-2 gap-1 text-xs">
                    <div className="text-gray-600">
                      <span className="font-semibold">Pages:</span>{" "}
                      {fileInfo.isEncrypted && !fileInfo.pageNumber
                        ? "Unknown (Encrypted)"
                        : fileInfo.pageNumber}
                    </div>
                    <div className="text-gray-600">
                      <span className="font-semibold">Encryption:</span>{" "}
                      {fileInfo.isEncrypted ? "Protected" : "None"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-2 flex justify-end">
                {fileInfo.isEncrypted ? (
                  <Button
                    color="blue"
                    size="xs"
                    onClick={() => setShowPasswordField(true)}
                  >
                    Enter Password
                  </Button>
                ) : (
                  <Button
                    color="blue"
                    size="xs"
                    onClick={() => handleStatementUpload(selectedFile)}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <>
                        <Spinner size="sm" className="mr-1" />
                        Uploading...
                      </>
                    ) : (
                      "Confirm Upload"
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {showPasswordField && (
          <div className="w-full">
            <div className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-200 rounded">
                  <HiDocumentMagnifyingGlass className="text-lg text-gray-600" />
                </div>
                <div className="flex-grow">
                  <h3 className="font-medium text-sm text-gray-900">
                    {selectedFile?.name}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {selectedFile
                      ? (selectedFile.size / 1024).toFixed(2) +
                        " KB • Added just now"
                      : ""}
                  </p>
                  <div className="mt-1 text-xs text-amber-600 font-medium">
                    <span className="font-semibold text-gray-600">Status:</span>{" "}
                    {fileInfo?.isEncrypted
                      ? "Password required"
                      : "Adding password"}
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmitPassword)}>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  This PDF is password protected
                </label>
                <Input.Password
                  placeholder="Enter PDF password"
                  onChange={handlePasswordChange}
                  className="w-full"
                />
                {fileInfo?.wrongPassword && (
                  <p className="mt-1 text-xs text-red-500">
                    The password you entered is incorrect. Please try again.
                  </p>
                )}
                <small className="text-xs text-gray-500 block mt-1">
                  Enter the password to unlock the statement.
                </small>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  color="light"
                  size="sm"
                  onClick={() => {
                    setShowPasswordField(false);
                    setFileInfo(null);
                    setSelectedFile(null);
                  }}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  color="dark"
                  size="sm"
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <Spinner size="sm" className="mr-1" />
                      Uploading...
                    </>
                  ) : (
                    "Confirm Upload"
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* {!showPasswordField && !selectedFile && (
          <div className="flex gap-3 mt-3 ">
            <Button
              color="dark"
              className="bg-amua_blue"
              size="sm"
              onClick={() =>
                document.querySelector(".ant-upload input").click()
              }
              disabled={isUploading}
            >
              <div className="flex items-center gap-1">
                {isUploading ? (
                  <>
                    <Spinner size="sm" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <BiUpload />
                    Upload Statements
                  </>
                )}
              </div>
            </Button>
        
          </div>
        )} */}
      </div>

      {/* Welcome to Amua Modal - handles auto-triggering internally */}
      <WelcomeToAmua
        show={showWelcome}
        onClose={() => setShowWelcome(false)}
        onShowMeAround={() => {
          setShowWelcome(false);
          setShowGuidance(true);
        }}
        isFirstUpload={true}
        autoTrigger={true}
      />

      {/* User Guidance Modal */}
      <UserGuidance
        show={showGuidance}
        onClose={() => setShowGuidance(false)}
        isFirstUpload={true}
      />
    </div>
  );
};

export default UploadSection;
