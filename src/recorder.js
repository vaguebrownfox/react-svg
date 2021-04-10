const SAMPLE_RATE = 48000; // Hz
const SAMPLE_SIZE = 16; // bits

const initializeMedia = () => {
	if (!("mediaDevices" in navigator)) {
		navigator.mediaDevices = {};
	}

	if (!("getUserMedia" in navigator.mediaDevices)) {
		navigator.mediaDevices.getUserMedia = (constraints) => {
			var getUserMedia =
				navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

			if (!getUserMedia) {
				return Promise.reject(
					new Error("getUserMedia is not implemented")
				);
			}

			return new Promise((resolve, reject) => {
				getUserMedia.call(navigator, constraints, resolve, reject);
			});
		};
	}
};

initializeMedia();

export const getAudioInputStream = async (device) => {
	const audioStream = await navigator.mediaDevices
		.getUserMedia({
			audio: {
				autoGainControl: false, //(2) [true, false]
				channelCount: 0, // {max: 2, min: 1}
				deviceId: device?.deviceId || "default",
				// groupId: null,
				echoCancellation: false, //(2) [true, false]
				latency: 0.01, //{max: 0.01, min: 0.01}
				noiseSuppression: false, //(2) [true, false]
				sampleRate: SAMPLE_RATE, //{max: 48000, min: 48000}
				sampleSize: SAMPLE_SIZE, //{max: 16, min: 16}
			},
			video: false,
		})
		.then((stream) => {
			return stream;
		})
		.catch((err) => {
			console.error("asq::recorder:: get input devices error", err);
			return null;
		});
	return audioStream;
};

export const audioContext = new AudioContext();
export const analyserNode = new AnalyserNode(audioContext, {
	fftSize: 2048,
	minDecibels: -111,
	smoothingTimeConstant: 0.7,
});

export const setupContext = async () => {
	const stream = await getAudioInputStream();
	console.log("recorder ::context state", audioContext.state);
	if (audioContext.state === "suspended") {
		await audioContext.resume();
	}
	console.log("recorder ::context state", audioContext.state);
	const source = audioContext.createMediaStreamSource(stream);
	source.connect(analyserNode).connect(audioContext.destination);
};

setupContext();
