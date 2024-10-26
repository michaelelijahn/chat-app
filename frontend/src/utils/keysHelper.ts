
import { openDB } from "idb";

export const generateKeys = async () => {
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

export const exportPublicKey = async (publicKey: CryptoKey) => {
    const exported = await window.crypto.subtle.exportKey("spki", publicKey);
    const exportedAsString = arrayBufferToString(exported);
    const exportedAsBase64 = window.btoa(exportedAsString);
    return exportedAsBase64;
}

export const importPublicKey = async (publicKey: string) => {
    const binaryDerString = window.atob(publicKey);
    const binaryDer = stringToArrayBuffer(binaryDerString);

    return window.crypto.subtle.importKey(
        "spki",
        binaryDer,
        {
          name: "RSA-OAEP",
          hash: "SHA-256",
        },
        true,
        ["encrypt"],
    );
}

export const exportPrivateKey = async (privateKey: CryptoKey) => {
    const exported = await window.crypto.subtle.exportKey("pkcs8", privateKey);
    const exportedAsString = arrayBufferToString(exported);
    const exportedAsBase64 = window.btoa(exportedAsString);
    return exportedAsBase64;
}

export const importPrivateKey = async (publicKey: string) => {
    const binaryDerString = window.atob(publicKey);
    const binaryDer = stringToArrayBuffer(binaryDerString);
    return window.crypto.subtle.importKey(
        "pkcs8",
        binaryDer,
        {
          name: "RSA-OAEP",
          hash: "SHA-256",
        },
        true,
        ["decrypt"],
    );
}

const arrayBufferToString = (buf: ArrayBuffer) => {
    return String.fromCharCode.apply(null, Array.from(new Uint8Array(buf)));
}

const stringToArrayBuffer = (str: string) => {
    const buf = new ArrayBuffer(str.length);
    const bufView = new Uint8Array(buf);
    for (let i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}

const initializeDB = async () => {
    const db = await openDB("secureKeyStorage", 1, {
      upgrade(db) {
        db.createObjectStore('keys');
      }
    });
    return db;
}

export const storePrivateKey = async (privateKey: CryptoKey) => {
    const db = await initializeDB();
    try {
        const transaction = db.transaction("keys", "readwrite");
        await transaction.store.put(privateKey, "privateKey");
        await transaction.done;

    } catch (error) {
        console.error("Failed to store private key: ", error);
    }

}
