const CAMERA_FACING_ALIASES = {
  front: "user",
  user: "user",
  selfie: "user",
  back: "environment",
  rear: "environment",
  environment: "environment"
};

export function buildCameraConstraints(options = {}) {
  const {
    facing = "front",
    facingMode,
    width = 1280,
    height = 720,
    frameRate = { ideal: 30 }
  } = options;

  const normalizedFacing =
    CAMERA_FACING_ALIASES[facingMode] || CAMERA_FACING_ALIASES[facing] || CAMERA_FACING_ALIASES.user;

  return {
    audio: false,
    video: {
      facingMode: { ideal: normalizedFacing },
      width: typeof width === "number" ? { ideal: width } : width,
      height: typeof height === "number" ? { ideal: height } : height,
      frameRate
    }
  };
}

const defaultConstraints = buildCameraConstraints();

let sharedStream = null;
let consumerCount = 0;
let pendingRequest = null;
let activeSignature = null;

function normalizeConstraints(constraints) {
  if (!constraints) return { ...defaultConstraints };
  const videoConstraints = {
    ...(defaultConstraints.video || {}),
    ...(constraints.video || {})
  };
  return {
    audio: typeof constraints.audio === "boolean" ? constraints.audio : defaultConstraints.audio,
    video: videoConstraints
  };
}

function createSignature(constraints) {
  try {
    return JSON.stringify(constraints);
  } catch {
    return null;
  }
}

function assertMediaDevices() {
  if (typeof navigator === "undefined" || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error("Tu navegador no soporta la camara.");
  }
}

export async function acquireSharedCamera(constraints = defaultConstraints) {
  const normalizedConstraints = normalizeConstraints(constraints);
  const signature = createSignature(normalizedConstraints);

  if (sharedStream && signature && signature === activeSignature) {
    consumerCount += 1;
    return sharedStream;
  }

  if (sharedStream && (!signature || signature !== activeSignature)) {
    sharedStream.getTracks().forEach(track => track.stop());
    sharedStream = null;
    consumerCount = 0;
    activeSignature = null;
  }

  if (sharedStream) {
    consumerCount += 1;
    return sharedStream;
  }

  if (!pendingRequest) {
    try {
      assertMediaDevices();
      pendingRequest = navigator.mediaDevices.getUserMedia(normalizedConstraints);
    } catch (error) {
      pendingRequest = Promise.reject(error);
    }

    pendingRequest = pendingRequest
      .then(stream => {
        sharedStream = stream;
        activeSignature = signature;
        return stream;
      })
      .catch(error => {
        sharedStream = null;
        activeSignature = null;
        throw error;
      })
      .finally(() => {
        pendingRequest = null;
      });
  }

  const stream = await pendingRequest;
  consumerCount += 1;
  return stream;
}

export function releaseSharedCamera({ stopTracks = true } = {}) {
  if (consumerCount > 0) {
    consumerCount -= 1;
  }

  if (consumerCount <= 0 && sharedStream) {
    if (stopTracks) {
      sharedStream.getTracks().forEach(track => track.stop());
    }
    sharedStream = null;
    activeSignature = null;
  }
}

export function getSharedCameraStream() {
  return sharedStream;
}
