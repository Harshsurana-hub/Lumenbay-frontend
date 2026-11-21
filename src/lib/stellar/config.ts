import { Networks } from "@stellar/stellar-sdk";

/**
 * Public Stellar settings. Nothing here is secret: contract IDs and RPC URLs
 * are visible on-chain anyway. Defaults point at the current testnet
 * deployment (see Lumenbay-contract/docs/deploy-testnet.md) so the app works
 * without extra setup; set the env vars to point elsewhere.
 */
const network = (process.env.NEXT_PUBLIC_STELLAR_NETWORK ?? "testnet") as "testnet" | "mainnet";

export const STELLAR = {
  network,
  networkPassphrase: network === "mainnet" ? Networks.PUBLIC : Networks.TESTNET,
  rpcUrl: process.env.NEXT_PUBLIC_STELLAR_RPC_URL ?? "https://soroban-testnet.stellar.org",
  horizonUrl: process.env.NEXT_PUBLIC_STELLAR_HORIZON_URL ?? "https://horizon-testnet.stellar.org",
  escrowContractId:
    process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ID ?? "CDSLTYUH6YDS5WIW3QB2CRBKPP2YSKURD36ZEK7LKSZBHIGVTKUNFMYG",
  /** Stellar Asset Contract for native XLM on this network. */
  xlmTokenId:
    process.env.NEXT_PUBLIC_XLM_TOKEN_ID ?? "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC",
  explorerUrl: `https://stellar.expert/explorer/${network === "mainnet" ? "public" : "testnet"}`,
  /** Platform fee the contract was initialised with, for display only. */
  feeBps: Number(process.env.NEXT_PUBLIC_ESCROW_FEE_BPS ?? 100),
} as const;

export const isTestnet = STELLAR.network === "testnet";

export const explorerTx = (hash: string) => `${STELLAR.explorerUrl}/tx/${hash}`;
export const explorerAccount = (address: string) => `${STELLAR.explorerUrl}/account/${address}`;
export const explorerContract = (id: string) => `${STELLAR.explorerUrl}/contract/${id}`;
