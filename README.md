<center><h1>Vault: Uncompromising Asset Security & Account Abstraction</h1></center>

## Introduction
As the crypto space evolves, so do the sophisticated tactics of attackers exploiting vulnerabilities to steal valuable assets. Our team has experienced this threat firsthand, with one team member nearly losing tens of thousands of dollars in an elaborate keyboard clipper attack. Had Vault been available, these assets could have been easily recovered, demonstrating the critical need for our solution across all blockchain ecosystems.

Vault’s unique value lies in its comprehensive approach to asset security, recovery, and innovative use of Web2 technologies in the blockchain space.

## Some of the core features of Vault:

Our dApp offers the following innovative features, all designed to be trustless, secure, and gasless where relevant:

### Vault
Securely store your tokens or NFTs within the Vault core smart contract. Users receive mirrored assets at a 1:1 rate, usable anywhere in Web3 (e.g., staking, DeFi, trading), while the original assets remain safely vaulted.

### Customizable Security Layers
Users can apply any combination of time-based locks and Multi-Factor Authentication (MFA) to their vaulted assets:
- **Time Lock**: Set a specific date and time for when the asset becomes transferrable.
- **Custom MFA**: Configure a customizable sequence of authentication steps required to access the asset.

### Unvault
Retrieving vaulted assets requires completing all applied security layers and exchanging the mirrored assets. This process is entirely trustless and secure.

### Lock
An optional additional security layer that completely disables outgoing transfers until unlocked. Unlocking requires satisfying the customized combination of time and MFA conditions set by the user.

### Asset Recovery
In case of wallet compromise or loss, users can recover vaulted assets to a new, secure wallet using our account abstraction system. This process is completely trustless and secure, leveraging zero-knowledge proofs.

### Future-Proof Design
We will be implementing gasless cross-chain account abstraction between the Tron and BitTorrent chains in the future. Planned features include:
- **Asset/Vaulted Asset Bridge**: For common assets like native chain assets and stablecoins.
- **Cross-Chain Asset Recovery**: Instantaneous recovery of assets across chains.

### Flexible MFA Integration
#### Web2 API-Based Providers
Any Web2 service can become an MFA provider by implementing a simple API endpoint. This endpoint processes custom payloads and generates EIP-191 signatures to verify MFA completion. 

Providers need to:
1. Deploy an instance of `ExternalSignerMFA` (specifying the public verification key of the signing key used for EIP-191 signatures).
2. Specify their `ExternalSignerMFA` address and API URL in the Vault core smart contract.

##### Technical Implementation for Web2 API MFA Provider:
1. Create an API endpoint accepting:
    ```
    POST {username, requestId, payload, timestamp}
    ```
2. Implement custom verification logic.
3. If valid, create an EIP-191 signature of: 
    ```
    "{username}-{requestId}-{unixTimestamp}"
    ```
4. Return the following:
    ```
    {message, msg_hash, v, r, s}
    ```
5. Deploy `ExternalSignerMFA` with the public key matching the private signing key.
6. Register the provider in the Vault core contract.

#### Custom Web3 Providers
Easily integrate any Web3-based MFA solution by implementing the `IMFAProvider` interface. For example, we implemented `VaultMFA`, which uses zero-knowledge proofs to verify single-use per-vaulting/per-unlocking passwords without revealing sensitive information, doing so trustlessly and on-chain.

##### Technical Implementation for Web3 MFA Provider:
1. Implement the `IMFAProvider` interface.
2. Define `getMFAData(username, requestId)` returning:
    ```json
    {
        "success": bool,
        "timestamp": uint256
    }
    ```
    - `success`: whether MFA was completed successfully.
    - `timestamp`: when MFA was completed (for expiry checks).
3. Implement `getMFAType()` returning the provider name.
4. Deploy the contract.
5. Register the provider in the Vault core contract.

### Note:
The above system allows for any custom combination of arbitrarily complex Web2/Web3 verification logic.


## How we built it
**1.** Designing the ZKP circuits and smart contract architecture
**2.** Implementing and testing the smart contracts on the Bittorrent testnet
**3.** Creating UI mockups on Figma and building the front-end dApp
**4.** Integrating with MFA providers and testing the security layers
**5.** Conducting thorough testing before deploying


## Accomplishments that we're proud of
1. **Organized workflow**: The team successfully utilized Trello and a ticketing system to maintain consistency and effectively scope work throughout the project.

2. **Timely delivery**: By consistently meeting deadlines that we set during our sprint-planning sessions, the team avoided the last-minute rush and chaos experienced in previous hackathons.

3. **User-centric**: approach The team prioritized user experience and ensured that the dApp is functional and interactive, going beyond a simple video demo.

4. **Seamless MFA**: integration By integrating with popular MFA providers like Google and Microsoft, users can easily customize their security layers when protecting their assets.

5. **Comprehensive testing**: Because of points 1 and 2, the team had sufficient time to test and ensure the reliability of Vault features.

6. **Custom API MFA**: The implementation of a custom API MFA completely bridges the gap between Web2 and Web3 in a seamless manner. We truly believe this is a groundbreaking feature, particularly for quickly growing chains such as TRON.

## What we learned
**1. Meticulous planning and preparation are the cornerstones of success**
 By leveraging powerful tools like Trello and implementing a high-level ticketing system we were able to optimize our workflow. This ensured every team member had a clear understanding of their responsibilities and the project's overall progress.

**2. Efficient communication and collaboration are essential**
 Limiting team meetings to 1-2 times a week struck a perfect balance between staying organized and maximizing productivity. We were able to focus on our tasks at hand while maintaining a cohesive vision for the project.

**3. Trello high-level ticketing system is useful**
 This provided us with effective prioritization of work and maintained transparency throughout the development process. We made a point not to go too granular with these tickets, otherwise, it would take too much time from us during planning sessions. Every team member had a clear picture of accomplishments and where they could contribute their skills, and it ultimately fostered a sense of ownership and accountability.

**4. Setting realistic deadlines and managing time wisely alleviates stress**
 At the end of our last hackathon, our team had to pull all-nighters to finish resulting in an extremely stressed set of final days. We had no intention of repeating history so we decided to push forward the launch deadline and aimed to complete the project a week before the final due date. This allowed the team to maintain sanity and focus on delivering a polished and reliable product.

**5. Streamlining the frontend development process accelerates progress**
 Investing time in creating detailed designs upfront allowed developers to concentrate solely on the implementation. This ultimately eliminated the added burden of designing on the fly, and although this still did happen at times, it was at a component level and much less frequently than we have done in the past. We found this approach ensured a cohesive and visually appealing user experience. These lessons on effective planning, efficient communication, realistic goal-setting, and process optimization will serve as guiding principles for our team as we continue to try and push the boundaries of what is possible in the realm of Web3 data security.

## What's next for Vault
We firmly believe that Vault has the potential to revolutionize asset security in the Web3 ecosystem, offering users an unparalleled level of protection. Our immediate goal following the hackathon is to continue growing our presence and networking within the TRON community, and ensuring others are able to leverage the features of our protocol to build amazing solutions.

One of the most promising applications for Vault lies in Decentralized Finance (DeFi). With the growing popularity of liquid staking and the increasing value locked in DeFi protocols, the need for robust asset security solutions has never been more pressing. We intend to actively engage with DeFi protocols that offer staking services, exploring potential integrations of our vaulting and locking mechanisms into their platforms. By doing so, we aim to provide users with an additional layer of security, ensuring the safety of their staked assets and fostering greater confidence in the DeFi ecosystem as a whole.

In addition to our focus on DeFi, we plan to continue refining the Vault protocol based on user feedback and emerging market needs. This product serves general Web3 users simply trying to protect their assets as well. Our team will dedicate resources to optimizing the user experience, streamlining the asset management process, and introducing new features that enhance the flexibility and usability of our solution.

*We invite all interested parties to follow us and offer feedback as we work towards building a safer and more secure future for digital assets.*

#### Live Demo

The live version of this dApp can be found at https://tronvault.net

#### Run a local installation of the dApp
Please follow the steps under `/site/client/README.md` to run the dApp locally.

#### Contracts

Please find all relevant documentation perataining to smart contracts under `contracts/README.md`.

#### ZK Circuits
Please find all relevant documentation perataining to smart contracts under `circuits/README.md`.

#### Tokenomics

Please conslult `/tokenomics.md`