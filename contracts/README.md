## Deployment Sequence:

1. **Set Compiler:**
   - Set compiler to latest version, EVM version Paris, with 200 optimizations.

2. **Deploy Contracts:**
   - Deploy the Password Verifier contract.
   - Deploy the MFAManager contract.
   - Deploy the vaultCore contract, passing the address of the MFAManager contract and the password verifier contract.
   - Deploy the vaultMFA contract, passing the address of the Verifier contract and the address of the vaultCore contract.
   - Set the vaultMFA, vaultCore Address in the MFAManager contract by calling the appropriate set functions.
   - Deploy the ExternalSignerMFA contracts (for 0x1111, 0x2222, 0x3333), passing the address of the external signer.
   - Deploy TokenDataRetriever contract
   - Deploy TestERC20 (if needed/wanted for test tokens).
   - Deploy TestERC721 (if needed/wanted for test tokens).

## ExternalSignerMFA Addresses:

- ExternalSignerMFA 1:
  - Address: 0x1111697F4dA79a8e7969183d8aBd838572E50FF3
  - Key: 819843e94a6e40bb59127970c282468328cdeff87ef58299daa9ff1b98400f67

- ExternalSignerMFA 2:
  - Address: 0x2222E49A58e8238c864b7512e6C87886Aa0B6318
  - Key: a76c92f6a95175ca91b6f8def794793ad5e28517e5bbdf870ca3eeb9da1816bb

- ExternalSignerMFA 2:
  - Address: 0x33331cec94930Ef66B3D2a13fD60890dd05323Ed
  - Key: 2ca71c6ba1a8692cc3eb81d243698257e92e89b584285b343fc1152ef0697a56

---

## Block Explorer, Faucet, RPC details

- https://testnet.bttcscan.com/
- https://testfaucet.bt.io/#/
- https://doc.bt.io/docs/networks/network

## Addresses 

-  Groth16Verifier:           0xf401a231ebf18c5c68C7B822F097834E42B9c793
-  MFAManager:                0xB9A979BcC82F93ff969EFa5B3e5B2EfE9654c19d
-  vaultCore:                 0xb6eA1AC42c3efff1b81b20EA797CA2a9148606fB
-  vaultMFA:                  0x97A7bF2a7E0A60Eca62801464351cC8a6cF525Be
-  ExternalSignerMFA:         0x079800318903E71032321b094f9b86864Ac195E7
-  ExternalSignerMFA:         0x96E41B93411bC5335DC0bA02e32A5f3Dbc85a691
-  ExternalSignerMFA:         0xE4CfcAC1A829bd9f83F7D66F138B64b150F79bce
-  TokenDataRetriever:        0x4A8829650B47fA716fdd774956e1418c05284e27

