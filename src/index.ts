import {
    ChainFactoryConfigs, ChainFactory,
    AppConfigs,
    NftMintArgs, Chain, Web3Helper, NftInfo
} from "xp.network";

import { Wallet } from "ethers";
import { config } from 'dotenv';
config();

(async () => {

    // SETUP
    const shallMint = false;
    const shallList = true;
    const shallApprove = false;
    const shallTransfer = true;
    let selected: NftInfo<any>;

    const testnetConfig = ChainFactoryConfigs.TestNet();
    const factory = ChainFactory(AppConfigs.TestNet(), await testnetConfig);

    const bsc = await factory.inner(Chain.BSC);
    const godwoken = await factory.inner(Chain.GODWOKEN);

    if (godwoken && process.env.SK) {
        const signer = new Wallet(process.env.SK!, godwoken.getProvider());

        // MINTING
        if (shallMint) {
            console.log(`Minting an NFT...`);
            const nftResult = await factory.mint(
                godwoken,
                signer,
                {
                    contract: "0x34933A5958378e7141AA2305Cdb5cDf514896035",
                    uris: ["https://meta.polkamon.com/meta?id=10002366816"]
                } as NftMintArgs
            );
            console.log(`Minted an NFT: ${"https://meta.polkamon.com/meta?id=10002366816"}`, nftResult);
        }

        // LISTING
        if (shallList) {
            console.log(`Listing NFTs...`);
            const NFTs = await factory.nftList(
                godwoken,
                signer.address
            );
            console.log(`Found NFTs:`, NFTs.length);

            selected = NFTs[NFTs.length - 1];
            console.log(`Selected:`, selected);
        }

        // APPROVING
        if (shallApprove) {
            console.log(`Approving an NFT...`);
            const approved = await godwoken.approveForMinter(
                selected!,
                signer
            );
            console.log(`Approved: ${approved}`);
        }

        // TRANFERRING
        if (shallTransfer) {
            console.log(`Transferring an NFT...`);

            const transferResult = await factory.transferNft(
                godwoken,
                bsc,
                selected!,
                signer,
                signer.address,
                undefined,
                undefined,
                500_000
            );
            console.log(`Transferred:`, transferResult);
        }

    }


    process.exit(0);
})().catch(e => {
    console.error(e);
    process.exit(1);
});