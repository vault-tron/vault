import { Fragment, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon, CheckIcon } from "@heroicons/react/24/outline";
import { Input } from "../ui/input";
import { GoogleAuthSVG } from "../svg/google-auth";
import { MSAuthSVG } from "../svg/ms-auth";
import { Logo } from "../svg/logo";
import * as OTP from "../ui/input-otp";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { Password } from "../svg/password";
import { useStorage } from "../storage";
import { authOptionsDefault } from "../constants";
import ScaleLoader from "react-spinners/ScaleLoader";

const VaultSection = ({
  authOptions,
  setAuthOptions,
  handleClose,
  buttonText,
}) => {
  return (
    <>
      <div className="mt-2 items-center justify-center max-h-[60vh] min-w-[16rem] md:min-w-[50vh] lg:min-w-[50vh] overflow-y-auto px-1 pb-1 text-white">
        <div className="text-m font-light">
          Complete the following security procedures set up for this token
          unvault.
        </div>

        <div className="w-auto mt-6 flex items-center justify-center px-4">
          <div className="w-full h-[40vh] flex flex-col items-center justify-center rounded-lg p-2">
            {authOptions.map((authOption) => (
              <AuthSelection
                key={authOption.address}
                authOptions={authOptions}
                authOption={authOption}
                setAuthOptions={setAuthOptions}
              />
            ))}
          </div>
        </div>

        <div className="mt-4 w-full items-center justify-center text-center">
          <div className="my-9"></div>
          <div className="w-full flex items-center justify-center">
            <Button
              className="relative py-2 h-2/3 w-auto text-black rounded-md font-medium px-12"
              type="submit"
              onClick={handleClose}
            >
              <div className={buttonText != "Unvault" ? "mr-2" : ""}>
                {buttonText}
              </div>
              <ScaleLoader
                loading={buttonText != "Unvault"}
                color="#0ea5e9"
                height={20}
                margin={1}
                radius={7}
                width={2}
              />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

const AuthSelection = ({ authOption, authOptions, setAuthOptions }) => {
  const [showInput, setShowInput] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [otpValue, setOTPValue] = useState("");
  const [password, setPassword] = useState("");
  const [payload, setPayload] = useState("");
  const [apiUrl, setApiUrl] = useState("");

  const { getAPIURL } = useStorage();

  useEffect(() => {
    const fetchApiUrl = async () => {
      if (isCustomAPI(authOption)) {
        try {
          const url = await getAPIURL(authOption.address);
          setApiUrl(url);
        } catch (error) {
          console.error("Failed to fetch API URL:", error);
          setApiUrl("Error fetching URL");
        }
      }
    };

    fetchApiUrl();
  }, [authOption, getAPIURL]);

  const confirmOTP = (otpValue) => {
    const updatedAuthOptions = authOptions.map((a) => {
      if (a.address === authOption.address) {
        console.log("We got a match");
        return { ...a, otp: otpValue };
      }
      console.log("No match");
      return a;
    });
    setAuthOptions(updatedAuthOptions);
  };

  const isCustomAPI = (authOption) => {
    return !["0x079800318903E71032321b094f9b86864Ac195E7", 
            "0x96E41B93411bC5335DC0bA02e32A5f3Dbc85a691", 
            "0x97A7bF2a7E0A60Eca62801464351cC8a6cF525Be"]
            .includes(authOption.address);
  }

  return (
    <Popover
      open={showInput}
      onOpenChange={() => {
          console.log("open changed!!!");
          setShowInput(!showInput);
      }}
    >
      <PopoverTrigger className="w-2/3">
        <div className="">
          <div
            className={`flex items-center ${
              completed
                ? "bg-emerald-800 border-emerald-400"
                : showInput
                  ? "bg-yellow-700 border-yellow-500"
                  : "bg-neutral-800 border-neutral-600"
            } border-2 rounded-lg px-4 py-2 my-1 cursor-pointer full`}
          >
            <div className="pr-1">{authOption.icon}</div>
            <span className="flex-1 text-center">{authOption.name}</span>
            <div
              className={`w-5 h-5 flex items-center text-xs justify-center rounded transition-all duration-300 ${
                showInput ? "bg-yellow-500 border-yellow-500" : "bg-neutral-800"
              }`}
            >
              {completed && <CheckIcon className="bg-emerald-500 text-white" />}
            </div>
          </div>
        </div>
      </PopoverTrigger>
        <PopoverContent className="w-80 bg-neutral-900 border-sky-700 border-2 text-white">
          <div>
            {!isCustomAPI(authOption) && !authOption.custom ? (
              <div className="border-black rounded-lg items-center text-center justify-center bg-neutral-900">
                <div className="p-4">
                  <span className="text-sm font-bold">
                    Multi Factor Authentication
                  </span>
                </div>
                <div className="p-2 flex rounded-lg items-center justify-center bg-neutral-800">
                  <OTP.InputOTP
                    maxLength={6}
                    className="border-black"
                    value={otpValue}
                    onChange={setOTPValue}
                  >
                    <OTP.InputOTPGroup className="font-bold">
                      <OTP.InputOTPSlot index={0} />
                      <OTP.InputOTPSlot index={1} />
                      <OTP.InputOTPSlot index={2} />
                    </OTP.InputOTPGroup>
                    <OTP.InputOTPSeparator className="text-neutral-500" />
                    <OTP.InputOTPGroup className="font-bold">
                      <OTP.InputOTPSlot index={3} />
                      <OTP.InputOTPSlot index={4} />
                      <OTP.InputOTPSlot index={5} />
                    </OTP.InputOTPGroup>
                  </OTP.InputOTP>
                </div>
                <div className="p-4">
                  <span className="text-xs">
                    Enter the 6-digit code from your {authOption.name} app.
                  </span>
                </div>
                <div className="p-2">
                  <Button
                    type="button"
                    className="w-auto"
                    onClick={() => {
                      confirmOTP(otpValue);
                      setShowInput(!showInput);
                      setCompleted(!completed);
                    }}
                  >
                    Confirm
                  </Button>
                </div>
              </div>
            ) : isCustomAPI(authOption) ? (
              <div>
                {/* URL Input */}
                <input
                  type="text"
                  value={apiUrl}
                  readOnly
                  tabIndex="-1"
                  className="border-2 border-sky-700 rounded-md px-4 py-2 w-full mt-2 bg-neutral-800 text-white font-mono cursor-text"
                  onFocus={(e) => e.preventDefault()} 
                  onClick={(e) => e.target.select()} 
                />

                {/* Payload Textarea */}
                <textarea
                  value={payload}
                  onChange={(e) => setPayload(e.target.value)}
                  className="border-2 border-sky-700 rounded-md px-4 py-2 w-full mt-2 focus-visible:ring-0 focus-visible:border-sky-500 my-1.5 py-4 bg-neutral-800 font-mono"
                  placeholder="Enter Payload..."
                  rows={4}
                />

                <div className="flex p-2 w-full items-center justify-center">
                  <Button
                    type="button"
                    className="w-auto"
                    onClick={() => {
                      setShowInput(!showInput);
                      setCompleted(!completed);
                      confirmOTP(payload);
                    }}
                  >
                    Confirm
                  </Button>
                </div>
              </div>

            ) : 
            (
              <div>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-2 border-sky-700 rounded-md px-4 py-2 w-full mt-2 focus-visible:ring-0 focus-visible:border-sky-500 my-1.5 py-4 bg-neutral-800"
                  placeholder="Password..."
                />
                <div className="flex p-2 w-full items-center justify-center">
                  <Button
                    type="button"
                    className="w-auto"
                    onClick={() => {
                      setShowInput(!showInput);
                      setCompleted(!completed);
                      confirmOTP(password);
                    }}
                  >
                    Confirm
                  </Button>
                </div>
              </div>
            )}
          </div>
        </PopoverContent>
    </Popover>
  );
};

export function UnvaultAssetModal({
  open,
  onClose,
  selectedRow,
  fetchAssets,
  setShowError,
  setErrorTitle,
  setErrorMessage,
}) {
  const { batchUnvaultAndVerifyMFA } = useStorage();

  useEffect(() => {}, [selectedRow]);

  useEffect(() => {
    filterAuthOptions();
  }, [open]);

  const handleClose = () => {
    setShowSecureSection(false);
    setButtonText("Unvault");
    onClose();
  };

  const [authOptions, setAuthOptions] = useState(authOptionsDefault);

  const filterAuthOptions = () => {
    if (selectedRow.vaultAuthOptions && selectedRow.vaultAuthOptions.length > 0) {
      const standardAddresses = [
        "0x079800318903E71032321b094f9b86864Ac195E7",
        "0x96E41B93411bC5335DC0bA02e32A5f3Dbc85a691",
        "0x97A7bF2a7E0A60Eca62801464351cC8a6cF525Be"
      ];
  
      const filteredOptions = authOptionsDefault.map(a => {
        if (a.address === "custom") {
          const customAddress = selectedRow.vaultAuthOptions.find(addr => 
            !standardAddresses.includes(addr)
          );
          if (customAddress) {
            return { ...a, address: customAddress };
          }
        }
        return a;
      }).filter(a => 
        selectedRow.vaultAuthOptions.includes(a.address)
      );
  
      console.log("FILTERED OPTIONS:", filteredOptions);
      setAuthOptions(filteredOptions);
    } else {
      setAuthOptions([]);
    }
  };

  const [showSecureSection, setShowSecureSection] = useState(true);
  const [buttonText, setButtonText] = useState("Unvault");

  const handleNext = () => {
    if (showSecureSection) {
      setShowSecureSection(false);
    }
  };

  const completeUnvault = async () => {
    try {
      setButtonText("Awaiting transaction..");
      console.log(authOptions);
      console.log(selectedRow);

      const readableBalanceNumber = parseFloat(selectedRow.bal);
      const rawBalanceNumber = BigInt(readableBalanceNumber * Math.pow(10, 18));

      const customZKPassAuthOption = authOptions.filter(
        (a) => a.name === "Custom ZK Password",
      );
      const customZKPass =
        customZKPassAuthOption.length > 0 ? customZKPassAuthOption[0].otp : "";

      const googleAuthOption = authOptions.filter(
        (a) => a.name === "Google Authenticator",
      );
      const otpValue1 =
        googleAuthOption.length > 0 ? googleAuthOption[0].otp : "";

      const msAuthOption = authOptions.filter(
        (a) => a.name === "Microsoft Authenticator",
      );

      const customApiMfaOption = authOptions.filter(
        (a) => a.name === "Custom API MFA",
      );

      const payload = customApiMfaOption.length > 0 ? customApiMfaOption[0].otp : "";
      console.log("msAuthOption");
      console.log(msAuthOption);
      const otpValue2 = msAuthOption.length > 0 ? msAuthOption[0].otp : "";

      const mfaProviders = authOptions.map((a) => a.address);
      console.log(`mfaProviders: ${mfaProviders}`);
      console.log(`payload: ${payload}`);
      await batchUnvaultAndVerifyMFA(
        selectedRow.tokenAddress,
        rawBalanceNumber.toString(),
        selectedRow.isERC20,
        customZKPass,
        otpValue1,
        otpValue2,
        mfaProviders,
        payload,
      );

      fetchAssets();

      // batchUnvaultAndVerifyMFA: (
      //   token: string,
      //   amount: string,
      //   requestId: string,
      //   isERC20: boolean,
      //   password: string,
      //   otpOne: string,
      //   otpTwo: string,
      //   mfaProviders: []
      // ) => Promise<void>;

      handleClose();
    } catch (e) {
      setShowError(true);
      setErrorTitle("Error with transaction");
      setErrorMessage(
        `There was an error with the transaction: ${e.toString()}`,
      );
      setButtonText("Unvault");
    }
  };

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-50 overflow-y-auto dark:bg-opacity-75"
        onClose={onClose}
      >
        <div className="flex min-h-screen items-center justify-center">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-500"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-600 dark:bg-gray-900 bg-opacity-50 dark:bg-opacity-50 backdrop-filter backdrop-blur-sm" />
          </Transition.Child>

          <Transition.Child
            as={Fragment}
            enter="ease-out duration-500"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-300"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div>
              <div className="relative w-auto mt-6 max-w-screen-2xl rounded-lg border-2 border-sky-700 bg-black px-8 pb-4 pt-8 text-left shadow-xl sm:my-20 sm:w-full sm:max-w-3xl sm:p-6">
                <div className="absolute right-0 top-0 pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-neutral-950 text-gray-400 hover:text-gray-400"
                    onClick={handleClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon
                      className="h-6 w-6 text-sky-500 hover:text-sky-600 dark:text-sky-600 dark:hover:text-sky-500 bg-neutral-900 rounded"
                      aria-hidden="true"
                    />
                  </button>
                </div>
                <Dialog.Title as="h3" className="text-xl font-bold text-white">
                  Security Check
                </Dialog.Title>
                <VaultSection
                  authOptions={authOptions}
                  setAuthOptions={setAuthOptions}
                  handleClose={completeUnvault}
                  buttonText={buttonText}
                />
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
