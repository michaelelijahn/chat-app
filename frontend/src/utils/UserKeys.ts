
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

// convert from key format to base64 string
export const exportKey = async (key: CryptoKey, type: string) => {
    const keyFormat = type === "private" ? "pkcs8" : "spki";
    const exported = await window.crypto.subtle.exportKey(keyFormat, key);
    // Convert to base64 in one step
    const binary = String.fromCharCode(...new Uint8Array(exported));
    return window.btoa(binary);
}

// convert from base64 string to key format
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

export const arrayBufferToString = (buf: ArrayBuffer) => {
    return String.fromCharCode(...new Uint8Array(buf));
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

        console.log("Storing Private Key", userId, {
            type: privateKey.type,
            algorithm: privateKey.algorithm,
            usages: privateKey.usages
        });

        const transaction = db.transaction("keys", "readwrite");
        await transaction.store.put(privateKey, userId);
        const key = await transaction.store.get(userId);
        console.log("private key : ", key);
        await transaction.done;

    } catch (error) {
        console.error("Failed to store private key: ", error);
    }
}

export const getUserPrivateKey = async (userId: string) => {
    try {
        // Open the database
        const db = await openDB('secureKeyStorage', 1);
    
        // Start a transaction and get the private key
        const tx = db.transaction('keys', 'readonly');
        const privateKey = await tx.store.get(userId);
        await tx.done;

        if (!privateKey) {
            throw new Error("No private key found in storage");
        }

        // Verify it's a valid private key with decrypt usage
        if (privateKey.type !== 'private' || !privateKey.usages.includes('decrypt')) {
            throw new Error("Invalid private key format");
        }
    
        return privateKey;
      } catch (error) {
        console.error('Error retrieving the private key', error);
        return null;
      }
}