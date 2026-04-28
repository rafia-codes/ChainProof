import { useAccount, useConnect, useDisconnect, useSignMessage } from 'wagmi'
import { metaMask } from 'wagmi/connectors'
import { useState } from 'react'
import api from '../utils/api'

export function useWallet() {
  const { address, isConnected } = useAccount()
  const { connectAsync } = useConnect()
  const { disconnect } = useDisconnect()
  const { signMessageAsync } = useSignMessage()
  const [signing, setSigning] = useState(false)

  const connect = async () => {
    try {
      await connectAsync({ connector: metaMask() })
    } catch (err) {
      console.error('Connect error:', err)
    }
  }

  // Get nonce from backend and sign it — returns { signature, nonce }
  // const getSignedAuth = async () => {
  //   if (!address) throw new Error('Wallet not connected')
  //   setSigning(true)
  //   try {
  //     const { data } = await api.post('/auth/nonce', { wallet: address })
  //     const nonce = data.nonce
  //     const message = `Verify identity: ${nonce}`
  //     const signature = await signMessageAsync({ message })
  //     return { signature, nonce }
  //   } finally {
  //     setSigning(false)
  //   }
  // }
  const getSignedAuth = async () => {
  if (!address) throw new Error('Wallet not connected');

  setSigning(true);

  try {
    console.log("Requesting nonce for:", address);

    // 1. Get nonce
    const { data } = await api.post('/auth/nonce', {
      wallet: address,
    });

    const nonce = data.nonce;

    if (!nonce) {
      throw new Error("Nonce not received from backend");
    }

    // 2. EXACT message (must match backend)
    const message = `Verify identity: ${nonce}`;

    console.log("Signing message:", message);

    // 3. Sign
    const signature = await signMessageAsync({ message });

    console.log("Generated signature:", signature);

    if (!signature || typeof signature !== "string") {
      throw new Error("Invalid signature generated");
    }

    return { signature, nonce };

  } catch (err) {
    console.error("getSignedAuth error:", err);
    throw err;
  } finally {
    setSigning(false);
  }
};

  return {
    address,
    isConnected,
    connect,
    disconnect,
    getSignedAuth,
    signing,
  }
}
