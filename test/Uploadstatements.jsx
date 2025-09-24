import React, { useContext, useEffect, useState, useRef } from "react";
import {
  Modal,
  Button,
  TextInput,
  Label,
  Select,
  Spinner,
} from "flowbite-react";
import { Input, Text } from "@rewind-ui/core";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { uploadStatement } from "@redux-utils/thunks/statements";
import { AppContext } from "../contexts/Appcontexts";
import { selectActiveSubscriptions } from "@redux-utils/features/subscriptionType.slice";
import { getUserActiveSubscriptions } from "@redux-utils/thunks/subscriptionType";
import Kenyan_Banks from "@lib/kenyan_banks.json";
import { CircleLoader } from "./Loaders";
import { processPdf } from "@utils/ProcessPDF";
import { FiUploadCloud } from "react-icons/fi";
import { BiCheckCircle, BiUpload } from "react-icons/bi";
import { FaXmark } from "react-icons/fa6";
import {
  checkForProcessedStatements,
  fetchServerStatementsData,
} from "../redux-utils/thunks/statements";
import { Upload } from "antd";
import { HiDocumentMagnifyingGlass } from "react-icons/hi2";
import { fetchStatementsData } from "../redux-utils/thunks/overview";

const { Dragger } = Upload;

const UploadStatementsPopUp = () => {
  const { setShowUploadStatementModal, showUploadStatementModal } =
    useContext(AppContext);
  const activeSubscriptions = useSelector(selectActiveSubscriptions);
  const dispatch = useDispatch();
  const { uploadStatementMessage, uploadStatementError, serverStatements } =
    useSelector((state) => state.Statements);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [fileInfo, setFileInfo] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showPasswordField, setShowPasswordField] = useState(false);

  const [statementTypeQuery, setStatementTypeQuery] = useState("");
  const [filteredBanks, setFilteredBanks] = useState([...Kenyan_Banks.banks]);
  const [showBankDropdown, setShowBankDropdown] = useState(false);

  const corporatePlansNamesMap = {
    corporate_payg: "Corporate Pay As You Go",
  };

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

  useEffect(() => {
    dispatch(getUserActiveSubscriptions());
  }, [dispatch]);

  const hasPassword = watch("has_password");

  const handleFileUpload = async (file) => {
    if (!file) return false;

    setSelectedFile(file);
    setUploadSuccess(null);
    setUploadError(null);

    // Check if file is PDF
    if (file.type !== "application/pdf") {
      setUploadError("Only PDF files are allowed.");
      return false;
    }

    try {
      const info = await processPdf(file);
      setFileInfo(info);

      if (info.isEncrypted) {
        setShowPasswordField(true);
        setValue("has_password", true);
      }
    } catch (err) {
      // console.error("Error processing PDF:", err);
      setUploadError("Failed to process the PDF.");
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

  const handleStatementUpload = async (data) => {
    setIsUploading(true);
    setUploadSuccess(null);
    setUploadError(null);

    try {
      await dispatch(
        uploadStatement({
          statement_file: selectedFile,
          password: data.has_password ? data.password : "",
          subscription_id: activeSubscriptions?.[0]?.id || 1,
        })
      ).unwrap();

      dispatch(fetchServerStatementsData());
      dispatch(fetchStatementsData());

      setUploadSuccess("Statement uploaded successfully!");
      reset();
      setFileInfo(null);
      setSelectedFile(null);
      setShowPasswordField(false);
      setShowUploadStatementModal(false);
    } catch (error) {
      setUploadError("Failed to upload the statement. Please try again.");
      // console.error("Upload Error:", error);
    } finally {
      setIsUploading(false);
      dispatch(checkForProcessedStatements());
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
    <>
      {/* Top-right corner notification for statement uploads */}
      <CircleLoader
        isLoading={isUploading}
        message="Processing your statement..."
      />

      <Modal
        size="3xl"
        show={showUploadStatementModal}
        dismissible
        onClose={() => {
          setShowUploadStatementModal(false);
          reset();
          setFileInfo(null);
          setSelectedFile(null);
          setShowPasswordField(false);
          setUploadSuccess(null);
          setUploadError(null);
        }}
      >
        <Modal.Header>
          <div className="flex flex-row gap-3 items-center">
            <FiUploadCloud />
            <Text size="xl" className="font-semibold">
              Upload Statement
            </Text>
          </div>
        </Modal.Header>

        <form onSubmit={handleSubmit(handleStatementUpload)}>
          <Modal.Body>
            {uploadSuccess && (
              <div className="mb-4 flex flex-row relative justify-start items-center gap-2 p-2 text-sm text-green-700 bg-green-100 rounded-lg">
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
              <div className="mb-4 flex flex-row relative justify-start items-center gap-2 p-2 text-sm text-red-700 bg-red-100 rounded-lg">
                <FaXmark />
                {uploadError}
                <Button
                  size="xs"
                  className="absolute right-2"
                  onClick={() => setUploadError(null)}
                >
                  <FaXmark />
                </Button>
              </div>
            )}

            {uploadStatementError && (
              <div className="mb-4 p-2 text-sm text-red-700 bg-red-100 rounded-lg">
                {uploadStatementMessage}
              </div>
            )}

            {!showPasswordField ? (
              <div className="w-full">
                <Dragger {...props} className="w-full rounded-lg mb-3 py-4">
                  <p className="ant-upload-drag-icon">
                    <BiUpload className="text-2xl mx-auto text-gray-400" />
                  </p>
                  <p className="ant-upload-text font-medium">
                    Upload Statements
                  </p>
                  <p className="ant-upload-hint text-xs text-gray-500">
                    Click or drag PDF files to this area to upload
                  </p>
                </Dragger>

                {selectedFile && fileInfo && (
                  <div className="w-full border border-gray-200 rounded-lg p-3 my-3 bg-gray-50">
                    <div className="flex items-start gap-2">
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
                              {(selectedFile.size / 1024).toFixed(2)} KB • Added
                              just now
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

                    <div className="mt-3 flex justify-between items-center">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="has_password"
                          {...register("has_password")}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                          disabled={fileInfo?.isEncrypted}
                        />
                        <label
                          htmlFor="has_password"
                          className="ml-2 block text-sm text-gray-700"
                        >
                          {fileInfo?.isEncrypted
                            ? "This file requires a password"
                            : "Add a password to this file"}
                        </label>
                      </div>
                      <div>
                        {fileInfo.isEncrypted ? (
                          <Button
                            color="blue"
                            size="xs"
                            onClick={() => setShowPasswordField(true)}
                          >
                            Enter Password
                          </Button>
                        ) : hasPassword ? (
                          <Button
                            color="blue"
                            size="xs"
                            onClick={() => setShowPasswordField(true)}
                          >
                            Add Password
                          </Button>
                        ) : (
                          <Button
                            color="blue"
                            size="xs"
                            onClick={() =>
                              handleStatementUpload({ has_password: false })
                            }
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
              </div>
            ) : (
              <div className="w-full">
                <div className="border border-gray-200 rounded-lg p-3 mb-3 bg-gray-50">
                  <div className="flex items-start gap-2">
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
                        <span className="font-semibold text-gray-600">
                          Status:
                        </span>{" "}
                        {fileInfo?.isEncrypted
                          ? "Password required"
                          : "Adding password"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {fileInfo?.isEncrypted
                      ? "This PDF is password protected"
                      : "Add a password to this PDF"}
                  </label>
                  <Input
                    type="password"
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
                    {fileInfo?.isEncrypted
                      ? "Enter the password to unlock the statement."
                      : "Enter a password to protect your statement."}
                  </small>
                </div>
              </div>
            )}
          </Modal.Body>

          <Modal.Footer>
            {showPasswordField ? (
              <>
                <Button type="submit" color="blue" disabled={isUploading}>
                  {isUploading ? (
                    <>
                      <Spinner size="sm" className="mr-1" />
                      Uploading...
                    </>
                  ) : (
                    "Confirm Upload"
                  )}
                </Button>

                <Button
                  type="button"
                  color="light"
                  onClick={() => {
                    setShowPasswordField(false);
                    if (!fileInfo?.isEncrypted) {
                      setValue("has_password", false);
                    }
                  }}
                  disabled={isUploading}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <>
                {!selectedFile && (
                  <Button
                    color="blue"
                    onClick={() =>
                      document.querySelector(".ant-upload input").click()
                    }
                    disabled={isUploading}
                  >
                    <div className="flex items-center gap-1">
                      <BiUpload />
                      Select File
                    </div>
                  </Button>
                )}

                <Button
                  type="button"
                  color="red"
                  onClick={() => {
                    setShowUploadStatementModal(false);
                    reset();
                    setFileInfo(null);
                    setSelectedFile(null);
                    setShowPasswordField(false);
                    setUploadSuccess(null);
                    setUploadError(null);
                  }}
                  disabled={isUploading}
                >
                  Close
                </Button>
              </>
            )}
          </Modal.Footer>
        </form>
      </Modal>
    </>
  );
};

export default UploadStatementsPopUp;
