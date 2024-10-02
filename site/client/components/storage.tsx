"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import Web3, { Contract, TransactionBlockTimeoutError } from "web3";
import coreContractABI from "../public/ABIs/VaultCore.json";
import { AbiItem } from "web3-utils";
import ERC20ABI from "../public/ABIs/ERC20.json";
import ERC721ABI from "../public/ABIs/ERC721.json";
import MirroredERC20ABI from "../public/ABIs/MirroredERC20.json";
import MirroredERC721ABI from "../public/ABIs/MirroredERC721.json";
import TokenDataRetrieverABI from "../public/ABIs/TokenDataRetriever.json";
import MFAManagerABI from "../public/ABIs/MFAManager.json";
import ExternalAPIMFAABI from "../public/ABIs/ExternalAPIMFA.json";
import { poseidon } from "@/components/poseidon-hash";
import { toast } from "sonner";

export interface MFAProviderData {
  providerAddress: string;
  message: string;
  v: number;
  r: string;
  s: string;
  subscriptionId: string;
  username: string;
  mfaRequestId: string;
  args: string[];
}

export interface ProofParameters {
  pA0: string;
  pA1: string;
  pB00: string;
  pB01: string;
  pB10: string;
  pB11: string;
  pC0: string;
  pC1: string;
  pubSignals0: string;
  pubSignals1: string;
}

interface StorageContextProps {
  storage: { [key: string]: string };
  setStorage: (key: string, value: string) => void;
  getStorage: (key: string) => string | null | undefined;
  web3: Web3 | null;
  connectToWeb3: () => Promise<boolean>;
  initializeCoreContract: () => any | undefined | null;
  setUsername: (username: string, passwordHash: string) => Promise<void>;
  checkUsernameExists: (username: string) => Promise<boolean>;
  checkUsernameAndPassword: (
    username: string,
    passwordHash: string
  ) => Promise<string>;
  generateCoreProof: (inputs: any) => Promise<any>;
  setProofParameters: (proof: any) => any;
  batchVaultAndSetMFA: (
    token: string,
    amount: string,
    tokenId: string,
    isERC20: boolean,
    password: string,
    mfaProviders: string[],
    url: string
  ) => Promise<void>;
  batchLockAndSetMFA: (
    token: string,
    isERC20: boolean,
    password: string,
    mfaProviders: string[],
    url: string
  ) => Promise<void>;
  batchUnlockAndVerifyMFA: (
    token: string,
    isERC20: boolean,
    password: string,
    otpOne: string,
    otpTwo: string,
    mfaProviders: string[],
    payload: string
  ) => Promise<void>;
  batchUnvaultAndVerifyMFA: (
    token: string,
    amount: string,
    isERC20: boolean,
    password: string,
    otpOne: string,
    otpTwo: string,
    mfaProviders: string[],
    payload: string
  ) => Promise<void>;
  timelockTokens: (token: string, time: string) => Promise<void>;
  retrieveUnlockTimestamp: (
    token: string
  ) => Promise<{ unlockTimestamp: string; transfersDisabled: boolean } | void>;
  fetchTokenBalances: (address: string) => Promise<any[] | undefined>;
  stringToBigInt: (str: string) => bigint;
  bigIntToString: (bigInt: bigint) => string;
  splitTo24: (str: string) => string[];
  registerMFA: (username: string) => Promise<any>;
  signMFA: (
    username: string,
    requestId: string,
    otpSecretOne: string,
    otpSecretTwo: string,
    timestamp: string,
  ) => Promise<any>;
  registerPassword: (username: string, password: string) => Promise<any>;
  registerENS: (username: string, passwordHash: string) => Promise<void>;
  recoverTokens: (username: string, password: string) => Promise<void>;
  callAPI: (
    username: string,
    requestId: string,
    password: string,
    apiURL: string,
    timestamp: string,
  ) => Promise<any>;
  getAPIURL: (mfaProviderAddress: string) => Promise<string>;
}

const StorageContext = createContext<StorageContextProps>({
  storage: {},
  setStorage: () => {},
  getStorage: () => undefined,
  web3: null,
  connectToWeb3: async () => true || false,
  initializeCoreContract: async () => {},
  setUsername: async () => {},
  checkUsernameExists: async () => true || false,
  checkUsernameAndPassword: async () =>
    "NO_WEB3" ||
    "INVALID_CREDENTIALS" ||
    "SKIP_MFA" ||
    "PROCEED_MFA" ||
    "INVALID_STATE",
  generateCoreProof: async () => ({}),
  setProofParameters: () => [],
  batchVaultAndSetMFA: async () => {},
  batchLockAndSetMFA: async () => {},
  batchUnlockAndVerifyMFA: async () => {},
  batchUnvaultAndVerifyMFA: async () => {},
  timelockTokens: async () => {},
  retrieveUnlockTimestamp: async () => {},
  fetchTokenBalances: async () => [],
  stringToBigInt: () => BigInt(0),
  bigIntToString: () => "",
  splitTo24: () => ["", ""],
  registerMFA: async () => undefined,
  signMFA: async () => undefined,
  registerPassword: async () => undefined,
  registerENS: async () => {},
  recoverTokens: async () => {},
  callAPI: async () => ({}),
  getAPIURL: async () => "",
});

export const StorageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [storage, setStorage] = useState<{ [key: string]: string }>({});
  const [web3, setWeb3] = useState<Web3 | null>(null);

  const setStorageValue = (key: string, value: string) => {
    setStorage((prevStorage) => ({ ...prevStorage, [key]: value }));
    localStorage.setItem(key, value);
  };

  const getStorageValue = (key: string) => {
    return storage[key] || localStorage.getItem(key);
  };

  const connectToWeb3 = async () => {
    if ((window as any).ethereum) {
      try {
        // Request account access
        await (window as any).ethereum.request({
          method: "eth_requestAccounts",
        });
        // Create Web3 instance
        const web3Instance = new Web3((window as any).ethereum);
        setWeb3(web3Instance);
        console.log("Connected to Web3");
        // Check if the desired network is already added
        const chainId = await (window as any).ethereum.request({
          method: "eth_chainId",
        });
        if (chainId !== "0x405") {
          try {
            // Attempt to switch to the desired network
            await (window as any).ethereum.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: "0x405" }],
            });
          } catch (switchError) {
            // If the network doesn't exist, add it
            if ((switchError as any).code === 4902) {
              try {
                await (window as any).ethereum.request({
                  method: "wallet_addEthereumChain",
                  params: [
                    {
                      chainId: "0x405",
                      chainName: "BitTorrent Chain Donau",
                      rpcUrls: ["https://pre-rpc.bt.io"],
                      nativeCurrency: {
                        name: "BTT",
                        symbol: "BTT",
                        decimals: 18,
                      },
                      blockExplorerUrls: ["https://testscan.bt.io"],
                    },
                  ],
                });
              } catch (addError) {
                console.error("Failed to add network:", addError);
                return false;
              }
            } else {
              console.error("Failed to switch network:", switchError);
              return false;
            }
          }
        }
        return true;
      } catch (error) {
        console.error("Failed to connect to Web3:", error);
        return false;
      }
    } else {
      console.error("MetaMask not detected");
      return false;
    }
  };

  const initializeCoreContract = async () => {
    if (web3) {
      const coreContractAddress = "0xb6eA1AC42c3efff1b81b20EA797CA2a9148606fB";
      const contract = new web3.eth.Contract(
        coreContractABI as AbiItem[],
        coreContractAddress
      );
      return contract;
    }
  };

  const initializeMirroredERC20Contract = async (contractAddress: string) => {
    if (web3) {
      const contract = new web3.eth.Contract(
        MirroredERC20ABI as AbiItem[],
        contractAddress
      );
      return contract;
    }
  };

  const initializeMirroredERC721Contract = async (contractAddress: string) => {
    if (web3) {
      const contract = new web3.eth.Contract(
        MirroredERC721ABI as AbiItem[],
        contractAddress
      );
      return contract;
    }
  };

  const initializeERC20Contract = async (contractAddress: string) => {
    if (web3) {
      const contract = new web3.eth.Contract(
        ERC20ABI as AbiItem[],
        contractAddress
      );
      return contract;
    }
  };

  const initializeERC721Contract = async (contractAddress: string) => {
    if (web3) {
      const contract = new web3.eth.Contract(
        ERC721ABI as AbiItem[],
        contractAddress
      );
      return contract;
    }
  };

  const initializeMFAManagerContract = async () => {
    if (web3) {
      const contractAddress = "0xB9A979BcC82F93ff969EFa5B3e5B2EfE9654c19d";
      const contract = new web3.eth.Contract(
        MFAManagerABI as AbiItem[],
        contractAddress
      );
      return contract;
    }
  };

  const initializeExternalAPIMFAContract = async () => {
    if (web3) {
      const contractAddress = "custom";
      const contract = new web3.eth.Contract(
        ExternalAPIMFAABI as AbiItem[],
        contractAddress
      );
      return contract;
    }
  };

  const setUsername = async (username: string, passwordHash: string) => {
    if (!web3) {
      return;
    }
    let coreContract = await initializeCoreContract();
    const accounts = await web3.eth.getAccounts();
    await (coreContract as any).methods
      .setUsername(username, String(accounts[0]), passwordHash)
      .send({
        from: accounts[0],
        gas: "3000000",
        gasPrice: web3.utils.toWei("9000000", "gwei"),
      });
  };

  const checkUsernameExists = async (username: string) => {
    if (!web3) {
      return false;
    }
    let coreContract = await initializeCoreContract();
    const mappedAddress = await (coreContract as any).methods
      .usernameAddress(username)
      .call();
    return mappedAddress !== "0x0000000000000000000000000000000000000000";
  };

  const checkUsernameAndPassword = async (
    username: string,
    passwordHash: string
  ) => {
    if (!web3) {
      return "NO_WEB3";
    }

    let coreContract = await initializeCoreContract();
    const accounts = await web3.eth.getAccounts();
    const address = accounts[0];

    // Check if the address is already present in the usernames mapping
    const mappedUsername = await (coreContract as any).methods
      .usernames(address)
      .call();
    const mappedAddress = await (coreContract as any).methods
      .usernameAddress(mappedUsername)
      .call();
    const storedHash = await (coreContract as any).methods
      .passwordHashes(mappedAddress)
      .call();

    // console.log(username);
    // console.log(passwordHash);
    // console.log(mappedUsername);
    // console.log(mappedAddress);
    // console.log(storedHash);
    // console.log(String(storedHash)===passwordHash);

    if (
      mappedUsername !== "" &&
      mappedAddress !== "0x0000000000000000000000000000000000000000" &&
      storedHash !== "0"
    ) {
      // If the user is registered, check if all conditions match
      if (
        mappedUsername !== username ||
        mappedAddress !== address ||
        String(storedHash) !== passwordHash
      ) {
        return "INVALID_CREDENTIALS";
      }

      // If all conditions match, the user is already registered and can skip MFA setup
      return "SKIP_MFA";
    } else if (
      mappedUsername === "" &&
      mappedAddress === "0x0000000000000000000000000000000000000000" &&
      String(storedHash) === "0"
    ) {
      // If all mappings are empty, the user is not registered and should proceed with MFA setup
      return "PROCEED_MFA";
    } else {
      // If the mappings are in an inconsistent state, return an error
      return "INVALID_STATE";
    }
  };

  const setProofParameters = (proof: any): any => {
    return [
      proof.pi_a[0],
      proof.pi_a[1],
      proof.pi_b[0][0],
      proof.pi_b[0][1],
      proof.pi_b[1][0],
      proof.pi_b[1][1],
      proof.pi_c[0],
      proof.pi_c[1],
      proof.pubSignals[0],
      proof.pubSignals[1],
    ];
  };

  const batchVaultAndSetMFA = async (
    token: string,
    amount: string,
    tokenId: string,
    isERC20: boolean,
    password: string,
    mfaProviders: string[],
    url: string = ""
  ) => {
    if (!web3) return;

    let coreContract = await initializeCoreContract();
    const accounts = await web3.eth.getAccounts();

    let mfaProviderData: any[] = [];

    if (url !== "") {
      console.log("CUSTOM URL: ", url);
      const mfaProviderAddress = await (coreContract as any).methods
        .getContractAddress(url)
        .call();
      if (mfaProviderAddress !== "0x0000000000000000000000000000000000000000") {
        mfaProviders = mfaProviders.filter((m) => m !== "custom");
        mfaProviders.push(mfaProviderAddress);
      }
    }

    for (let i = 0; i < mfaProviders.length; i++) {
      mfaProviderData.push([
        mfaProviders[i],
        "",
        0,
        "0x0000000000000000000000000000000000000000000000000000000000000000",
        "0x0000000000000000000000000000000000000000000000000000000000000000",
        "0",
        "",
        "0",
        [],
      ]);
    }

    let hash;

    if (password === "") hash = 0;
    else {
      let [first, second] = splitTo24(password);
      let [first_int, second_int] = [
        stringToBigInt(first),
        stringToBigInt(second),
      ];
      hash = await poseidon([first_int, second_int]);
    }

    if (isERC20) {
      const tokenContract = await initializeERC20Contract(token);
      const allowance = await (tokenContract as Contract<AbiItem[]>).methods
        .allowance(accounts[0], "0xb6eA1AC42c3efff1b81b20EA797CA2a9148606fB")
        .call();

      console.log(
        `Allowance for ${"0xb6eA1AC42c3efff1b81b20EA797CA2a9148606fB"} to ${
          accounts[0]
        }: ${allowance}`
      );

      if (parseFloat(amount) > parseFloat(allowance as any)) {
        console.log(`${parseFloat(amount)} > ${parseFloat(allowance as any)}`);
        console.log("Increasing allowance...");
        await (tokenContract as Contract<AbiItem[]>).methods
          .approve("0xb6eA1AC42c3efff1b81b20EA797CA2a9148606fB", amount)
          .send({
            from: accounts[0],
            gas: "3000000",
            gasPrice: web3.utils.toWei("9000000", "gwei"),
          });
      }

      console.log(token, amount, tokenId, isERC20, hash, mfaProviderData);
      console.log(accounts[0]);
      await (coreContract as any).methods
        .batchVaultAndSetMFA(
          token,
          amount,
          tokenId,
          isERC20,
          hash,
          mfaProviderData
        )
        .send({
          from: accounts[0],
          gas: 3000000,
          gasPrice: web3.utils.toWei("9000000", "gwei"),
        });
    } else {
      const tokenContract = await initializeERC721Contract(token);
      const isApproved = await (tokenContract as Contract<AbiItem[]>).methods
        .isApprovedForAll(
          accounts[0],
          "0xb6eA1AC42c3efff1b81b20EA797CA2a9148606fB"
        )
        .call();

      console.log(
        `Approval for ${"0xb6eA1AC42c3efff1b81b20EA797CA2a9148606fB"} to ${
          accounts[0]
        }: ${isApproved}`
      );

      if (!isApproved) {
        console.log("Setting approval...");
        await (tokenContract as Contract<AbiItem[]>).methods
          .setApprovalForAll("0xb6eA1AC42c3efff1b81b20EA797CA2a9148606fB", true)
          .send({
            from: accounts[0],
            gas: "3000000",
            gasPrice: web3.utils.toWei("9000000", "gwei"),
          });
      }

      await (coreContract as any).methods
        .batchVaultAndSetMFA(
          token,
          "0",
          tokenId,
          isERC20,
          hash,
          mfaProviderData
        )
        .send({
          from: accounts[0],
          gas: 3000000,
          gasPrice: web3.utils.toWei("9000000", "gwei"),
        });
    }
  };

  const batchLockAndSetMFA = async (
    token: string,
    isERC20: boolean,
    password: string,
    mfaProviders: string[],
    url: string = ""
  ) => {
    if (!web3) return;

    let coreContract = await initializeCoreContract();
    const accounts = await web3.eth.getAccounts();

    let mfaProviderData: any[] = [];

    if (url !== "") {
      const mfaProviderAddress = await (coreContract as any).methods
        .getContractAddress(url)
        .call();
      if (mfaProviderAddress !== "0x0000000000000000000000000000000000000000") {
        mfaProviders.push(mfaProviderAddress);
      }
    }

    for (let i = 0; i < mfaProviders.length; i++) {
      mfaProviderData.push([
        mfaProviders[i],
        "",
        0,
        "0x0000000000000000000000000000000000000000000000000000000000000000",
        "0x0000000000000000000000000000000000000000000000000000000000000000",
        "0",
        "",
        "0",
        [],
      ]);
    }

    let hash;

    if (password === "") hash = 0;
    else {
      let [first, second] = splitTo24(password);
      let [first_int, second_int] = [
        stringToBigInt(first),
        stringToBigInt(second),
      ];
      hash = await poseidon([first_int, second_int]);
    }

    await (coreContract as any).methods
      .batchLockAndSetMFA(token, isERC20, mfaProviderData, hash)
      .send({
        from: accounts[0],
        gas: "3000000",
        gasPrice: web3.utils.toWei("9000000", "gwei"),
      });
  };

  const batchUnlockAndVerifyMFA = async (
    token: string,
    isERC20: boolean,
    password: string,
    otpOne: string,
    otpTwo: string,
    mfaProviders: string[],
    payload: string = ""
  ) => {
    if (!web3) return;

    let coreContract = await initializeCoreContract();
    const accounts = await web3.eth.getAccounts();

    let mfaProviderData: any[] = [];

    const tokenContract = await initializeMirroredERC20Contract(token);
    const requestId = (await (tokenContract as Contract<AbiItem[]>).methods
      .lockId()
      .call()) as string;

    const timestamp = Math.floor(Date.now() / 1000).toString();

    const signMFAResponse =
      otpOne !== "" || otpTwo !== ""
        ? await signMFA(
            getStorageValue("username") as string,
            requestId.toString(),
            otpOne,
            otpTwo,
            timestamp 
          )
        : "";

    let proofParams = ["0", "0", "0", "0", "0", "0", "0", "0", "0", "0"];

    for (let i = 0; i < mfaProviders.length; i++) {
      if (mfaProviders[i] == "0x079800318903E71032321b094f9b86864Ac195E7") {
        const response_otp_one = signMFAResponse["signed_message_one"];
        mfaProviderData.push([
          mfaProviders[i],
          response_otp_one["message"],
          response_otp_one["v"],
          response_otp_one["r"],
          response_otp_one["s"],
          "0",
          "",
          "0",
          [],
        ]);
      } else if (
        mfaProviders[i] == "0x96E41B93411bC5335DC0bA02e32A5f3Dbc85a691"
      ) {
        const response_otp_two = signMFAResponse["signed_message_two"];
        mfaProviderData.push([
          mfaProviders[i],
          response_otp_two["message"],
          response_otp_two["v"],
          response_otp_two["r"],
          response_otp_two["s"],
          "0",
          "",
          "0",
          [],
        ]);
      } else if (
        mfaProviders[i] == "0x97A7bF2a7E0A60Eca62801464351cC8a6cF525Be"
      ) {
        mfaProviderData.push([
          mfaProviders[i],
          "",
          "0",
          "0x0000000000000000000000000000000000000000000000000000000000000000",
          "0x0000000000000000000000000000000000000000000000000000000000000000",
          "0",
          "",
          "0",
          [],
        ]);

        let [first, second] = splitTo24(password);
        let [first_int, second_int] = [
          stringToBigInt(first),
          stringToBigInt(second),
        ];
        let hash = await poseidon([first_int, second_int]);

        let proof = await generateCoreProof({
          password_0: String(first_int),
          password_1: String(second_int),
          provided_password_hash: String(hash),
          timestamp: timestamp,
        });

        if ((proof as any)["result"] !== "Verification OK")
          throw Error("password is incorrect");

        proofParams = setProofParameters((proof as any)["proof"]);
      } else {
        const providerURL = await (coreContract as any).methods
          .getURL(mfaProviders[i])
          .call();
        const apiURL =
          providerURL === "https://tronvault.net/api"
            ? `${baseURL}/api`
            : providerURL;

        if (payload) {
          const apiResponse = await callAPI(
            getStorageValue("username") as string,
            requestId,
            payload,
            apiURL,
            timestamp 
          );
          const signed_api_message = apiResponse.signed_api_message;

          mfaProviderData.push([
            mfaProviders[i],
            signed_api_message["message"],
            signed_api_message["v"],
            signed_api_message["r"],
            signed_api_message["s"],
            "0",
            "",
            "0",
            [],
          ]);
        }
      }
    }

    await (coreContract as any).methods
      .batchUnlockAndVerifyMFA(
        requestId,
        isERC20,
        timestamp,
        proofParams,
        mfaProviderData
      )
      .send({
        from: accounts[0],
        gas: "3000000",
        gasPrice: web3.utils.toWei("9000000", "gwei"),
      });
  };

  const batchUnvaultAndVerifyMFA = async (
    token: string,
    amount: string,
    isERC20: boolean,
    password: string,
    otpOne: string,
    otpTwo: string,
    mfaProviders: string[],
    payload: string
  ) => {
    if (!web3) return;

    let coreContract = await initializeCoreContract();
    const accounts = await web3.eth.getAccounts();

    let mfaProviderData: any[] = [];

    const tokenContract = isERC20
      ? await initializeMirroredERC20Contract(token)
      : await initializeMirroredERC721Contract(token);
    const mfaRequestId = (await (tokenContract as Contract<AbiItem[]>).methods
      .requestId()
      .call()) as string;

    const timestamp = Math.floor(Date.now() / 1000).toString();

    const signMFAResponse =
      otpOne !== "" || otpTwo !== ""
        ? await signMFA(
            getStorageValue("username") as string,
            mfaRequestId.toString(),
            otpOne,
            otpTwo,
            timestamp 
          )
        : "";

    const underlyingAsset = (await (
      tokenContract as Contract<AbiItem[]>
    ).methods
      .underlyingAsset()
      .call()) as string;

    let proofParams = ["0", "0", "0", "0", "0", "0", "0", "0", "0", "0"];

    for (let i = 0; i < mfaProviders.length; i++) {
      if (mfaProviders[i] == "0x079800318903E71032321b094f9b86864Ac195E7") {
        const response_otp_one = signMFAResponse["signed_message_one"];
        mfaProviderData.push([
          mfaProviders[i],
          response_otp_one["message"],
          response_otp_one["v"],
          response_otp_one["r"],
          response_otp_one["s"],
          "0",
          "",
          "0",
          [],
        ]);
      } else if (
        mfaProviders[i] == "0x96E41B93411bC5335DC0bA02e32A5f3Dbc85a691"
      ) {
        const response_otp_two = signMFAResponse["signed_message_two"];
        mfaProviderData.push([
          mfaProviders[i],
          response_otp_two["message"],
          response_otp_two["v"],
          response_otp_two["r"],
          response_otp_two["s"],
          "0",
          "",
          "0",
          [],
        ]);
      } else if (
        mfaProviders[i] == "0x97A7bF2a7E0A60Eca62801464351cC8a6cF525Be"
      ) {
        mfaProviderData.push([
          mfaProviders[i],
          "",
          "0",
          "0x0000000000000000000000000000000000000000000000000000000000000000",
          "0x0000000000000000000000000000000000000000000000000000000000000000",
          "0",
          "",
          "0",
          [],
        ]);

        let [first, second] = splitTo24(password);
        let [first_int, second_int] = [
          stringToBigInt(first),
          stringToBigInt(second),
        ];
        let hash = await poseidon([first_int, second_int]);

        let proof = await generateCoreProof({
          password_0: String(first_int),
          password_1: String(second_int),
          provided_password_hash: String(hash),
          timestamp: timestamp,
        });

        if ((proof as any)["result"] !== "Verification OK")
          throw Error("password is incorrect");

        proofParams = setProofParameters((proof as any)["proof"]);
      } else {
        const providerURL = await (coreContract as any).methods
          .getURL(mfaProviders[i])
          .call();
        const apiURL =
          providerURL === "https://tronvault.net/api"
            ? `${baseURL}/api`
            : providerURL;

        if (payload) {
          const apiResponse = await callAPI(
            getStorageValue("username") as string,
            mfaRequestId,
            payload,
            apiURL,
            timestamp 
          );
          const signed_api_message = apiResponse.signed_api_message;

          console.log("SIGNED API MESSAGE", signed_api_message);

          mfaProviderData.push([
            mfaProviders[i],
            signed_api_message["message"],
            signed_api_message["v"],
            signed_api_message["r"],
            signed_api_message["s"],
            "0",
            "",
            "0",
            [],
          ]);
        }
      }
    }

    console.log(mfaProviderData);

    await (coreContract as any).methods
      .batchUnvaultAndVerifyMFA(
        underlyingAsset,
        amount,
        mfaRequestId,
        isERC20,
        timestamp,
        proofParams,
        mfaProviderData
      )
      .send({
        from: accounts[0],
        gas: "3000000",
        gasPrice: web3.utils.toWei("9000000", "gwei"),
      });
  };

  const timelockTokens = async (token: string, time: string) => {
    if (!web3) {
      return;
    }
    console.log(`
      token: ${token},
      time: ${time}
    `);
    const accounts = await web3.eth.getAccounts();

    const tokenContract = await initializeMirroredERC20Contract(token);

    if (time == "inf")
      await (tokenContract as Contract<AbiItem[]>).methods
        .disableTransfersPermanently()
        .send({ from: accounts[0] });
    else
      await (tokenContract as Contract<AbiItem[]>).methods
        .setTransferUnlockTimestamp(time)
        .send({
          from: accounts[0],
          gas: "3000000",
          gasPrice: web3.utils.toWei("9000000", "gwei"),
        });
  };

  const retrieveUnlockTimestamp = async (token: string) => {
    if (!web3) {
      return;
    }
    const tokenContract = await initializeMirroredERC20Contract(token);

    const unlockTimestamp = (await (
      tokenContract as Contract<AbiItem[]>
    ).methods
      .transferUnlocktimestamp()
      .call()) as string;

    const transfersDisabled = (await (
      tokenContract as Contract<AbiItem[]>
    ).methods
      .transfersDisabled()
      .call()) as boolean;

    return { unlockTimestamp, transfersDisabled };
  };

  const fetchTokenBalances = async (address: string) => {
    if (!web3) {
      return;
    }

    const API_KEY = "N8D9KVEZ9IE2GNURJ8ZGM9H6GWZ5SY8WX4";
    const BASE_URL = "https://api-testnet.bttcscan.com/api";

    try {
      const accounts = await (web3 as any).eth.getAccounts();

      const erc20Response = await fetch(
        `${BASE_URL}?module=account&action=tokentx&address=${accounts[0]}&page=1&offset=100&sort=asc&apikey=${API_KEY}`
      );
      const erc20Data = await erc20Response.json();

      const erc721Response = await fetch(
        `${BASE_URL}?module=account&action=tokennfttx&address=${accounts[0]}&page=1&offset=100&sort=asc&apikey=${API_KEY}`
      );
      const erc721Data = await erc721Response.json();

      console.log(erc20Data);
      console.log(erc721Data);

      const erc20Addresses: string[] = [];
      for (const tx of erc20Data.result) {
        if (!erc20Addresses.includes(tx.contractAddress)) {
          erc20Addresses.push(tx.contractAddress);
        }
      }

      const erc721Addresses: string[] = [];
      const erc721TokenIds: string[] = [];
      for (const tx of erc721Data.result) {
        if (!erc721Addresses.includes(tx.contractAddress)) {
          erc721Addresses.push(tx.contractAddress);
          erc721TokenIds.push(tx.tokenID);
        }
      }

      console.log(erc20Addresses);
      console.log(erc721Addresses);
      console.log(erc721TokenIds);

      const tokenDataRetrieverContract = new web3.eth.Contract(
        TokenDataRetrieverABI,
        "0x4A8829650B47fA716fdd774956e1418c05284e27"
      );

      console.log("data retriever loaded");

      const erc20TokenData = await tokenDataRetrieverContract.methods
        .getERC20TokenData(erc20Addresses, accounts[0])
        .call();

      console.log("erc20 token data fetched");

      const erc721TokenData = await tokenDataRetrieverContract.methods
        .getERC721TokenData(erc721Addresses, erc721TokenIds, accounts[0])
        .call();

      console.log("erc721 token data fetched");

      const updatedAssets: any[] = [];
      const mirroredERC20Addresses: string[] = [];
      const mirroredERC721Addresses: string[] = [];

      console.log(updatedAssets);
      console.log(mirroredERC20Addresses);
      console.log(mirroredERC721Addresses);

      for (const tokenData of erc20TokenData as any) {
        if (tokenData.name.toLowerCase().startsWith("mirrored ")) {
          mirroredERC20Addresses.push(tokenData.tokenAddress);
        } else {
          updatedAssets.push({
            token: tokenData.name,
            tokenAddress: tokenData.tokenAddress,
            tokenId: "0",
            ticker: tokenData.symbol,
            bal: (
              parseFloat(tokenData.balance.toString()) /
              Math.pow(10, parseInt(tokenData.decimals.toString()))
            ).toFixed(3),
            vaulted: tokenData.vaulted,
            locked: tokenData.locked,
            authOptions: [],
            vaultAuthOptions: tokenData.vaultAuthOptions,
            lockAuthOptions: tokenData.lockAuthOptions,
            isERC20: true,
          });
        }
      }

      for (const tokenData of erc721TokenData as any) {
        if (tokenData.name.toLowerCase().startsWith("mirrored ")) {
          mirroredERC721Addresses.push(tokenData.tokenAddress);
        } else {
          updatedAssets.push({
            token: tokenData.name,
            tokenAddress: tokenData.tokenAddress,
            tokenId: tokenData.tokenId.toString(),
            ticker: tokenData.symbol,
            bal: tokenData.balance.toString(),
            vaulted: tokenData.vaulted,
            locked: tokenData.locked,
            authOptions: [],
            vaultAuthOptions: tokenData.vaultAuthOptions,
            lockAuthOptions: tokenData.lockAuthOptions,
            isERC20: false,
          });
        }
      }

      if (
        mirroredERC20Addresses.length > 0 ||
        mirroredERC721Addresses.length > 0
      ) {
        const mirroredERC20TokenData = await tokenDataRetrieverContract.methods
          .getMirroredERC20TokenData(mirroredERC20Addresses, accounts[0])
          .call();

        const mirroredERC721TokenData = await tokenDataRetrieverContract.methods
          .getMirroredERC721TokenData(mirroredERC721Addresses, accounts[0])
          .call();

        for (const tokenData of mirroredERC20TokenData as any) {
          updatedAssets.push({
            token: tokenData.name,
            tokenAddress: tokenData.tokenAddress,
            tokenId: "0",
            ticker: tokenData.symbol,
            bal: (
              parseFloat(tokenData.balance.toString()) /
              Math.pow(10, parseInt(tokenData.decimals.toString()))
            ).toFixed(3),
            vaulted: tokenData.vaulted,
            locked: tokenData.locked,
            authOptions: [],
            vaultAuthOptions: tokenData.vaultAuthOptions,
            lockAuthOptions: tokenData.lockAuthOptions,
            isERC20: true,
          });
        }

        for (const tokenData of mirroredERC721TokenData as any) {
          updatedAssets.push({
            token: tokenData.name,
            tokenAddress: tokenData.tokenAddress,
            tokenId: tokenData.tokenId.toString(),
            ticker: tokenData.symbol,
            bal: tokenData.balance.toString(),
            vaulted: tokenData.vaulted,
            locked: tokenData.locked,
            authOptions: [],
            vaultAuthOptions: tokenData.vaultAuthOptions,
            lockAuthOptions: tokenData.lockAuthOptions,
            isERC20: false,
          });
        }
      }

      updatedAssets.sort((a, b) => (a.token as any).localeCompare(b.token));
      const filteredAssets = updatedAssets.filter(
        (asset) => asset.bal !== "0.000" && asset.bal !== "0"
      );

      console.log(filteredAssets);
      return filteredAssets;
    } catch (error) {
      console.error("Error fetching token balances:", error);
      return [];
    }
  };

  const hashSHA256 = async (message: string) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hash = await window.crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  };

  const generateCoreProof = async (inputs: any) => {
    const snarkjs = (window as any).snarkjs;
    const input = {
      password_0: inputs.password_0,
      password_1: inputs.password_1,
      provided_password_hash: inputs.provided_password_hash,
      timestamp: inputs.timestamp,
    };
    const circuitWasm =
      "/circuit_wasms_and_keys/vaultCorePassword/build/vaultCorePassword_js/vaultCorePassword.wasm";
    const circuitZkey =
      "/circuit_wasms_and_keys/vaultCorePassword/circuit.zkey";
    let vKey;
    const response = await fetch(
      "/circuit_wasms_and_keys/vaultCorePassword/verification_key.json"
    );
    if (response.ok) {
      vKey = await response.json();
    } else {
      console.error("Failed to fetch verification key.");
    }
    try {
      const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        input,
        circuitWasm,
        circuitZkey
      );
      const isValid = await snarkjs.groth16.verify(vKey, publicSignals, proof);
      if (isValid) {
        const _pA = [proof.pi_a[0], proof.pi_a[1]];
        const _pB = [
          [proof.pi_b[0][1], proof.pi_b[0][0]],
          [proof.pi_b[1][1], proof.pi_b[1][0]],
        ];
        const _pC = [proof.pi_c[0], proof.pi_c[1]];
        const _pubSignals = publicSignals;
        const res = {
          result: "Verification OK",
          proof: {
            pi_a: _pA,
            pi_b: _pB,
            pi_c: _pC,
            pubSignals: _pubSignals,
          },
        };
        return res;
      } else {
        return { result: "Invalid proof" };
      }
    } catch (error: any) {
      console.error(error);
      return { result: "Error occurred: " + error.toString() };
    }
  };

  const stringToBigInt = (str = "") => {
    if (str.length > 25) {
      throw new Error("String length must be 25 characters or less.");
    }
    let numStr = "";
    for (let i = 0; i < str.length; i++) {
      let ascii = str.charCodeAt(i);
      numStr += ascii.toString().padStart(3, "0");
    }
    return BigInt(numStr);
  };

  const bigIntToString = (bigInt = BigInt(0)) => {
    let str = bigInt.toString();
    while (str.length % 3 !== 0) {
      str = "0" + str;
    }
    let result = "";
    for (let i = 0; i < str.length; i += 3) {
      let ascii = parseInt(str.substr(i, 3), 10);
      result += String.fromCharCode(ascii);
    }
    return result;
  };

  const splitTo24 = (str = "") => {
    const firstElement = str.substring(0, 24);
    const secondElement = str.length > 24 ? str.substring(24, 48) : "";
    return [firstElement, secondElement];
  };

  const baseURL =
    "https://kqysqbam9h.execute-api.ap-southeast-2.amazonaws.com/prod";

  const registerMFA = async (username: string) => {
    try {
      const response = await fetch(`${baseURL}/registerMFABTTC`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username }),
      });
      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        throw new Error("Failed to register MFA");
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const signMFA = async (
    username: string,
    requestId: string,
    otpSecretOne: string,
    otpSecretTwo: string,
    timestamp: string
  ) => {
    try {
      const response = await fetch(`${baseURL}/signMFABTTC`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          requestId,
          otpSecretOne,
          otpSecretTwo,
          timestamp
        }),
      });
      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        throw new Error("Failed to sign MFA");
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const callAPI = async (
    username: string,
    requestId: string,
    password: string,
    apiURL: string,
    timestamp: string,
  ) => {
    try {
      const response = await fetch(apiURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          {
            username,
            requestId,
            payload: password,
            timestamp,
          },
          (key, value) => (typeof value === "bigint" ? value.toString() : value) 
        ),
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        throw new Error("Failed to call API");
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const getAPIURL = async (mfaProviderAddress: string): Promise<string> => {
    if (!web3) {
      throw new Error("Web3 is not initialized");
    }

    const coreContract = await initializeCoreContract();
    if (!coreContract) {
      throw new Error("Failed to initialize core contract");
    }

    const providerURL = await (coreContract as any).methods
      .getURL(mfaProviderAddress)
      .call();

    return providerURL;
  };

  const registerPassword = async (username: string, password: string) => {
    try {
      const response = await fetch(`${baseURL}/registerPasswordBTTC`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        throw new Error("Failed to register password");
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const registerENS = async (name: string, passwordHash: string) => {
    try {
      if (!web3) {
        return;
      }
      const accounts = await web3.eth.getAccounts();
      const userAddress = accounts[0];
      const response = await fetch(`${baseURL}/registerENS`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, userAddress, passwordHash }),
      });
      if (response.ok) {
        const data = await response.json();
        console.log(data);
        return data;
      } else {
        throw new Error("Failed to register ENS");
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const recoverTokens = async (username: string, password: string) => {
    try {
      if (!web3) {
        return;
      }

      const accounts = await web3.eth.getAccounts();
      const newUserAddress = accounts[0];
      const timestamp = Math.floor(Date.now() / 1000);
      let [first, second] = splitTo24(password);
      let [first_int, second_int] = [
        stringToBigInt(first),
        stringToBigInt(second),
      ];
      let hash = await poseidon([first_int, second_int]);
      console.log(first_int, second_int, hash, timestamp);
      let proof = await generateCoreProof({
        password_0: String(first_int),
        password_1: String(second_int),
        provided_password_hash: String(hash),
        timestamp: String(timestamp),
      });
      console.log(proof);
      if ((proof as any)["result"] !== "Verification OK")
        throw Error("password is incorrect");
      const proofParams = setProofParameters((proof as any)["proof"]);
      const params = {
        pA0: proofParams[0],
        pA1: proofParams[1],
        pB00: proofParams[2],
        pB01: proofParams[3],
        pB10: proofParams[4],
        pB11: proofParams[5],
        pC0: proofParams[6],
        pC1: proofParams[7],
        pubSignals0: proofParams[8],
        pubSignals1: proofParams[9],
      };
      console.log(params);

      let coreContract = await initializeCoreContract();

      const resetUsernameAddressParams = [
        username,
        newUserAddress,
        hash.toString(),
        timestamp.toString(),
        [
          proofParams[0],
          proofParams[1],
          proofParams[2],
          proofParams[3],
          proofParams[4],
          proofParams[5],
          proofParams[6],
          proofParams[7],
          proofParams[8],
          proofParams[9],
        ],
      ];

      console.log(
        "Smart contract call parameters:",
        resetUsernameAddressParams
      );

      const tx = await (coreContract as any).methods
        .resetUsernameAddress(...resetUsernameAddressParams)
        .send({
          from: accounts[0],
          gas: "3000000",
          gasPrice: web3.utils.toWei("9000000", "gwei"),
        });

      console.log("Transaction hash:", tx.transactionHash);

      toast.success(
        "Recovery successfully completed for " +
          username +
          ". You have been airdroped an additional 10000 VAULT tokens."
      );
      return tx;
    } catch (error) {
      console.error(error);
      toast.error(
        "Error during recovery, please initiate recovery again from an unregistered wallet address."
      );
      throw error;
    }
  };

  return (
    <StorageContext.Provider
      value={{
        storage,
        setStorage: setStorageValue,
        getStorage: getStorageValue,
        web3,
        connectToWeb3,
        initializeCoreContract,
        setUsername,
        checkUsernameExists,
        checkUsernameAndPassword,
        generateCoreProof,
        setProofParameters,
        batchVaultAndSetMFA,
        batchLockAndSetMFA,
        batchUnlockAndVerifyMFA,
        batchUnvaultAndVerifyMFA,
        timelockTokens,
        retrieveUnlockTimestamp,
        fetchTokenBalances,
        stringToBigInt,
        bigIntToString,
        splitTo24,
        registerMFA,
        signMFA,
        registerPassword,
        registerENS,
        recoverTokens,
        callAPI,
        getAPIURL,
      }}
    >
      {children}
    </StorageContext.Provider>
  );
};

export const useStorage = () => useContext(StorageContext);
