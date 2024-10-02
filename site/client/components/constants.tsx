"use client";
import { GoogleAuthSVG } from "./svg/google-auth";
import { MSAuthSVG } from "./svg/ms-auth";
import { Logo } from "./svg/logo";
import { Password } from "./svg/password";
import { APILogoSVG } from "./svg/api-logo";

export const authOptionsDefault = [
  {
    name: "Google Authenticator",
    icon: <GoogleAuthSVG className="w-5 h-5" />,
    checked: false,
    address: "0x079800318903E71032321b094f9b86864Ac195E7",
    confirm: false,
    custom: false,
    api: false,
    otp: "",
    url: ""
  },
  {
    name: "Microsoft Authenticator",
    icon: <MSAuthSVG className="w-5 h-5" />,
    checked: false,
    address: "0x96E41B93411bC5335DC0bA02e32A5f3Dbc85a691",
    confirm: false,
    custom: false,
    api: false,
    otp: "",
    url: ""
  },
  {
    name: "Custom API MFA",
    icon: <APILogoSVG  className="fill-sky-200 w-6 h-6 p-0 m-0" />,
    checked: false,
    address: "custom",
    confirm: false,
    custom: true,
    api: true,
    otp: "",
    url: ""
  },
  {
    name: "Custom ZK Password",
    icon: <Password className="w-5 h-5 fill-sky-500" />,
    checked: false,
    address: "0x97A7bF2a7E0A60Eca62801464351cC8a6cF525Be",
    confirm: false,
    custom: true,
    api: false,
    otp: "",
    url: ""
  },
];

export const chains = [
  {
    networkName: "BitTorrent Chain Donau",
    url: "https://pre-rpc.bt.io",
    name: "BitTorrent Testnet",
    id: "1029",
    symbol: "BTT",
    blockExplorerUrl: "https://testscan.bt.io",
    className: "bg-indigo-900 bg-opacity-80 hover:bg-indigo-800",
    iconClass: "text-indigo-400",
  },
];
