const LOCK_ENABLED_KEY = "password-app-lock-enabled";
const LOCK_CRED_KEY = "password-app-cred-id";

function bufToBase64url(buf) {
  const bytes = new Uint8Array(buf);
  let str = "";
  for (const b of bytes) str += String.fromCharCode(b);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64urlToBuf(b64url) {
  const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((b64url.length + 3) % 4);
  const str = atob(b64);
  const bytes = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) bytes[i] = str.charCodeAt(i);
  return bytes.buffer;
}

function lockEnabled() {
  return localStorage.getItem(LOCK_ENABLED_KEY) === "true" && !!localStorage.getItem(LOCK_CRED_KEY);
}

async function platformAuthAvailable() {
  return !!(
    window.PublicKeyCredential &&
    PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable &&
    (await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable())
  );
}

async function registerLock() {
  const cred = await navigator.credentials.create({
    publicKey: {
      challenge: crypto.getRandomValues(new Uint8Array(32)),
      rp: { name: "Claves" },
      user: {
        id: crypto.getRandomValues(new Uint8Array(16)),
        name: "claves-usuario",
        displayName: "Claves",
      },
      pubKeyCredParams: [
        { type: "public-key", alg: -7 },
        { type: "public-key", alg: -257 },
      ],
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        userVerification: "required",
        residentKey: "preferred",
      },
      timeout: 60000,
      attestation: "none",
    },
  });
  localStorage.setItem(LOCK_CRED_KEY, bufToBase64url(cred.rawId));
  localStorage.setItem(LOCK_ENABLED_KEY, "true");
}

async function verifyLock() {
  const storedId = localStorage.getItem(LOCK_CRED_KEY);
  if (!storedId) throw new Error("no-credential");
  await navigator.credentials.get({
    publicKey: {
      challenge: crypto.getRandomValues(new Uint8Array(32)),
      allowCredentials: [{ type: "public-key", id: base64urlToBuf(storedId) }],
      userVerification: "required",
      timeout: 60000,
    },
  });
}

function disableLock() {
  localStorage.removeItem(LOCK_ENABLED_KEY);
  localStorage.removeItem(LOCK_CRED_KEY);
}
