import { importKey, stringToArrayBuffer, getUserPrivateKey } from "./UserKeys";

export const generateAESChatKey = async () => {
    return await window.crypto.subtle.generateKey(
        {
          name: "AES-GCM",
          length: 256,
        },
        true,
        ["encrypt", "decrypt"]
    );
}

export const encryptChatContent = async (content: string, aesKey: CryptoKey) => {
    const iv = window.crypto.getRandomValues(new Uint8Array(12));

    const encryptedContent = await window.crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: iv,
        },
        aesKey,
        new TextEncoder().encode(content)
    );

    const encryptedContentString = window.btoa(
        String.fromCharCode(...new Uint8Array(encryptedContent))
    );
    const ivString = window.btoa(
        String.fromCharCode(...new Uint8Array(iv))
    );

    return {
        encryptedContent: encryptedContentString,
        iv: ivString,
    };
}

export const decryptChatContent = async (encryptedContent: string, encryptedAESKey: string, iv: string, userId: string) => {
    try {
        const privateKey = await getUserPrivateKey(userId);
        if (!privateKey) {
            throw new Error("Private key not found");
        }

        const aesKey = await decryptAndImportAESChatKey(
            encryptedAESKey,
            privateKey
        );

        const encryptedBuffer = stringToArrayBuffer(encryptedContent);
        const ivBuffer = stringToArrayBuffer(iv);

        const decryptedContent = await window.crypto.subtle.decrypt(
            {
                name: "AES-GCM",
                iv: ivBuffer
            },
            aesKey,
            encryptedBuffer
        );

        return new TextDecoder().decode(decryptedContent);
    } catch (error) {
        console.error("Message decryption failed:", error);
        throw error;
    }
};

export const encryptAESChatKey = async (publicKey: string, aesKey: CryptoKey) => {
    const importedPublicKey = await importKey(publicKey, "public");

    const exportedAESKey = await window.crypto.subtle.exportKey("raw", aesKey);

    const encryptedKey = await window.crypto.subtle.encrypt(
        {
            name: "RSA-OAEP",
        } as RsaOaepParams,
        importedPublicKey,
        exportedAESKey
    );

    const uint8Array = new Uint8Array(encryptedKey);
    
    const binary = String.fromCharCode(...uint8Array);
    
    const base64 = window.btoa(binary);

    return base64;
}   

const decryptAndImportAESChatKey = async (encryptedAESKey: string, privateKey: CryptoKey) => {
    try {

        const binaryStr = window.atob(encryptedAESKey);

        const bytes = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i++) {
            bytes[i] = binaryStr.charCodeAt(i);
        }

        const decryptedKeyBuffer = await window.crypto.subtle.decrypt(
            {
                name: "RSA-OAEP",
            } as RsaOaepParams,
            privateKey,
            bytes.buffer,
        );

        return await window.crypto.subtle.importKey(
            "raw",
            decryptedKeyBuffer,
            {
                name: "AES-GCM",
            },
            true,
            ["decrypt"]
        );
    } catch (error: any) {
        console.error("Decryption Error Details:", error);
        throw error;
    }
}