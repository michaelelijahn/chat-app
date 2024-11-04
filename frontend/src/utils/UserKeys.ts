
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

    return keyPair;
}

export const exportKey = async (key: CryptoKey, type: string) => {
    const keyFormat = type === "private" ? "pkcs8" : "spki";
    const exported = await window.crypto.subtle.exportKey(keyFormat, key);
    const binary = String.fromCharCode(...new Uint8Array(exported));
    return window.btoa(binary);
}

export const importKey = async (key: string, type: string) => {
    const keyFormat = type === "private" ? "pkcs8" : "spki";
    const action = type === "private" ? "decrypt" : "encrypt";

    const binaryString = window.atob(key);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }

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
        const store = db.createObjectStore('keys');
        store.createIndex("timestamp", "timestamp");
      }
    });
    return db;
}

export const storePrivateKey = async (privateKey: CryptoKey, userId: string) => {
    const db = await initializeDB();
    try {

        const transaction = db.transaction("keys", "readwrite");
        await transaction.store.put({
            key: privateKey,
            timeStamp: Date.now(),
            expiresAt: Date.now() + (30 * 24 * 60 * 60 * 1000)
        }, userId);
        await transaction.done;

    } catch (error) {
        console.error("Failed to store private key: ", error);
    }
}

export const getUserPrivateKey = async (userId: string) => {
    try {

        const db = await openDB('secureKeyStorage', 1);
        const tx = db.transaction('keys', 'readonly');
        const key = await tx.store.get(userId);
        await tx.done;

        if (!key) {
            throw new Error("No private key found in storage");
        }

        if (key.expiresAt && Date.now() > key.expiresAt) {
            throw new Error("Private key has expired");
        }

        const privateKey = key.key;

        const update = db.transaction("keys", "readwrite");
        await update.store.put({
            ...key,
            timeStamp: Date.now(),
            expiresAt: Date.now() + (30 * 24 * 60 * 60 * 1000),
        }, userId);
        await update.done;
    
        return privateKey;
      } catch (error) {
        console.error('Error retrieving the private key', error);
        return null;
      }
}