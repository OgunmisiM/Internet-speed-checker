import React, { useState, useEffect } from "react";
import { ArrowDownToLine, ArrowUpToLine } from "lucide-react";

const InternetSpeedChecker: React.FC = () => {
	const [downloadSpeed, setDownloadSpeed] = useState<number | null>(0);
	const [uploadSpeed, setUploadSpeed] = useState<number | null>(0);
	const [unit, setUnit] = useState<string>("bps"); // Initial unit is bps

	const convertSpeed = (speed: number | null): { value: number; unit: string } => {
		if (speed === null || speed === 0) {
			return { value: 0, unit: "bps" };
		}

		if (speed > 1e9) {
			return { value: speed / 1e9, unit: "Gbps" };
		} else if (speed > 1e6) {
			return { value: speed / 1e6, unit: "Mbps" };
		} else if (speed > 1e3) {
			return { value: speed / 1e3, unit: "Kbps" };
		} else {
			return { value: speed, unit: "bps" };
		}
	};

	const measureDownloadSpeed = async () => {
		const url = "https://www.cloudflare.com/cdn-cgi/trace";

		const startTime = new Date().getTime();

		try {
			const response = await fetch(url);
			if (!response.ok) {
				throw new Error(`HTTP error! Status: ${response.status}`);
			}

			const reader = response.body?.getReader();
			if (!reader) {
				throw new Error("ReadableStream not supported.");
			}

			let totalBytes = 0;

			while (true) {
				const { done, value } = await reader.read();

				if (done) {
					break;
				}

				totalBytes += value?.length || 0;
			}

			const endTime = new Date().getTime();
			const durationInSeconds = (endTime - startTime) / 1000;
			const speedBytesPerSecond = totalBytes / durationInSeconds;

			setDownloadSpeed(speedBytesPerSecond);
		} catch (error) {
			setDownloadSpeed(0); // Set to 0 if there's an error (no connection)
			if (error instanceof Error) {
				console.error("Error measuring download speed:", error.message);
			} else {
				console.error("Unknown error type:", error);
			}
		}
	};

	const measureUploadSpeed = async () => {
		const uploadData = new Array(1024 * 1024).fill("a").join("");
		const url = "https://httpbin.org/post";

		const startTime = new Date().getTime();

		try {
			const response = await fetch(url, {
				method: "POST",
				body: uploadData,
			});

			if (!response.ok) {
				throw new Error(`HTTP error! Status: ${response.status}`);
			}

			const endTime = new Date().getTime();
			const durationInSeconds = (endTime - startTime) / 1000;

			const speedBytesPerSecond = uploadData.length / durationInSeconds;

			setUploadSpeed(speedBytesPerSecond);
		} catch (error) {
			setUploadSpeed(0); // Set to 0 if there's an error (no connection)
			if (error instanceof Error) {
				console.error("Error measuring upload speed:", error.message);
			} else {
				console.error("Unknown error type:", error);
			}
		}
	};

	useEffect(() => {
		const downloadIntervalId = setInterval(() => {
			measureDownloadSpeed();
		}, 1000);

		const uploadIntervalId = setInterval(() => {
			measureUploadSpeed();
		}, 1000);

		return () => {
			clearInterval(downloadIntervalId);
			clearInterval(uploadIntervalId);
		};
	}, []);

	return (
		<div className="fixed bottom-0 w-11/12 lg:w-5/12 px-5 pb-4">
			<div className="flex justify-between items-center">
				<p className="text-left text-zinc-400 font-light text-xs inline-flex items-center">
					<ArrowDownToLine className="mr-1 w-3 h-auto" /> {convertSpeed(downloadSpeed).value.toFixed(2)} {convertSpeed(downloadSpeed).unit}
				</p>

				<p className="text-right text-zinc-400 font-light text-xs inline-flex items-center">
					<ArrowUpToLine className="mr-1 w-3 h-auto" /> {convertSpeed(uploadSpeed).value.toFixed(2)} {convertSpeed(uploadSpeed).unit}
				</p>
			</div>
		</div>
	);
};

export default InternetSpeedChecker;
