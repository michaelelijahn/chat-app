
import { openDB } from "idb";

export const generateUserKeys = async () => {
    let keyPair = await window.crypto.subtle.generateKey(
        {
          name: "RSA-OAEP",
          modulusLength: 4096,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: "SHA-256",
        },
        true,
        ["encrypt", "decrypt"],
    );

    console.log("Generated Keys:", {
        publicKey: {
            type: keyPair.publicKey.type,
            algorithm: keyPair.publicKey.algorithm,
            usages: keyPair.publicKey.usages
        },
        privateKey: {
            type: keyPair.privateKey.type,
            algorithm: keyPair.privateKey.algorithm,
            usages: keyPair.privateKey.usages
        }
    });

    return keyPair;
}

export const exportKey = async (key: CryptoKey, type: string) => {
    const keyFormat = type === "private" ? "pkcs8" : "spki";
    const exported = await window.crypto.subtle.exportKey(keyFormat, key);
    // Convert to base64 in one step
    const binary = String.fromCharCode(...new Uint8Array(exported));
    return window.btoa(binary);
}

export const importKey = async (key: string, type: string) => {
    const keyFormat = type === "private" ? "pkcs8" : "spki";
    const action = type === "private" ? "decrypt" : "encrypt";

    // 1. Convert base64 to binary array buffer
    const binaryString = window.atob(key);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }

    // 2. Import the key with proper format
    return await window.crypto.subtle.importKey(
        keyFormat,
        bytes.buffer,
        {
            name: "RSA-OAEP",
            hash: "SHA-256",
        },
        true,
        [action],
    );
}

export const stringToArrayBuffer = (str: string) => {
    const binaryString = window.atob(str);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

const initializeDB = async () => {
    const db = await openDB("secureKeyStorage", 1, {
      upgrade(db) {
        db.createObjectStore('keys');
      }
    });
    return db;
}

export const storePrivateKey = async (privateKey: CryptoKey, userId: string) => {
    const db = await initializeDB();
    try {

        const transaction = db.transaction("keys", "readwrite");
        await transaction.store.put(privateKey, userId);
        await transaction.done;

    } catch (error) {
        console.error("Failed to store private key: ", error);
    }
}

export const getUserPrivateKey = async (userId: string) => {
    try {

        const db = await openDB('secureKeyStorage', 1);
    
        const tx = db.transaction('keys', 'readonly');
        const privateKey = await tx.store.get(userId);
        await tx.done;

        if (!privateKey) {
            throw new Error("No private key found in storage");
        }
    
        return privateKey;
      } catch (error) {
        console.error('Error retrieving the private key', error);
        return null;
      }
}