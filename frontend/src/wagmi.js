import { http, createConfig } from 'wagmi'
import { polygonAmoy } from 'wagmi/chains'
import { metaMask } from 'wagmi/connectors'

export const config = createConfig({
  chains: [polygonAmoy],
  connectors: [metaMask()],
  transports: {
    [polygonAmoy.id]: http(import.meta.env.VITE_RPC_URL),
  },
})

export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS

export const CONTRACT_ABI = [
  "function approveIssuer(address issuer) public",
  "function unapproveIssuer(address issuer) public",
  "function issuerStatus(address issuer) public view returns(bool)",
  "function issueCertificate(string calldata certificateId, bytes32 hash, string calldata cid) public",
  "function getCertificate(string calldata certificateId) public view returns (tuple(string certificateId, address issuer, string cid, bytes32 hash, uint256 timestamp, bool isRevoked))",
  "function revokeCertificate(string calldata certificateId) public"
]
