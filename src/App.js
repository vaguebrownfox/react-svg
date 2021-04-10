import React from "react";
import { Paper, Button } from "@material-ui/core";

import { makeStyles } from "@material-ui/core/styles";
import { orange, pink, red } from "@material-ui/core/colors";

import { analyserNode } from "./recorder";

const useStyles = makeStyles((theme) => ({
	root: {
		height: "100%",
		width: "100%",
		minHeight: "100vh",
	},
	container: {
		position: "relative",
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		marginTop: theme.spacing(4),
		padding: theme.spacing(2),
	},
	vizdiv: {
		position: "absolute",
		bottom: 0,
		width: "100%",
		height: "100%",
	},
	visualizer: {
		width: "100%",
		height: "100%",
	},
	shape: {
		// stroke: "black",
		strokeWidth: 0.1,
		opacity: 0.9,
		zIndex: -1,
	},
	button: {
		marginTop: theme.spacing(2),
	},
}));

const c = 128;

function App() {
	const classes = useStyles();

	const vizRef = React.useRef();
	const { width, height } = useContainerDimensions(vizRef);

	const [viz, setViz] = React.useState(null);
	const [count, setCount] = React.useState(0);

	const requestRef = React.useRef();
	const previousTimeRef = React.useRef();

	const animate = (time) => {
		if (previousTimeRef.current !== undefined) {
			const deltaTime = time - previousTimeRef.current;

			// Pass on a function to the setter of the state
			// to make sure we always have the latest state
			setCount((prevCount) => prevCount + deltaTime * 0.01);

			let a = []; //new Uint8Array(c);
			for (let i = 0; i < c; ++i) a[i] = i;
			function shuffle(array) {
				var tmp,
					current,
					top = array.length;
				if (top)
					while (--top) {
						current = Math.floor(Math.random() * (top + 1));
						tmp = array[current];
						array[current] = array[top];
						array[top] = tmp;
					}
				return array;
			}
			a = shuffle(a);

			const bufferLength = analyserNode.frequencyBinCount;
			const dataArrayBuffer = new Uint8Array(bufferLength);
			analyserNode.getByteFrequencyData(dataArrayBuffer);

			const dataArray = [...dataArrayBuffer].slice(
				0,
				Math.floor(bufferLength / 5)
			);

			const newViz = {
				spectrum: dataArray,
				bw: 5,
			};

			setViz({ ...newViz });
		}
		previousTimeRef.current = time;
		requestRef.current = requestAnimationFrame(animate);
	};

	React.useEffect(() => {
		requestRef.current = requestAnimationFrame(animate);
		return () => cancelAnimationFrame(requestRef.current);
	}, []); // Make sure the effect runs only once

	const handleStart = async () => {};

	return (
		<div className={classes.root}>
			<Paper className={classes.container}>
				<h4>SVG Learn</h4>
				<h4>{Math.round(count)}</h4>
				<h4>{height}</h4>
				<h4>{width}</h4>
				<div ref={vizRef} className={classes.vizdiv}>
					<svg
						className={classes.visualizer}
						// viewBox={`0 0 100% 100%`}
						// viewBox={`0 0 100 ${width}`}
					>
						{viz &&
							viz.spectrum.map((a, i) => {
								const bw = Math.ceil(
									width / viz.spectrum.length
								);
								const y = Math.round(((a / 255) * height) / 4);
								const shade = y < height / 5 ? orange : red;
								const color =
									Math.round((a / 255) * 10) * 100 + 100;
								const x = bw * i;
								return (
									// <rect
									// 	key={i}
									// 	className={classes.shape}
									// 	x={x}
									// 	y={height - y}
									// 	width={bw}
									// 	height={y}
									// 	fill={pink[color < 900 ? color : 900]}
									// />
									<circle
										key={i}
										className={classes.shape}
										cx={x}
										cy={height - y}
										width={bw}
										r={y}
										fill={shade[color < 900 ? color : 900]}
									/>
								);
							})}
					</svg>
				</div>
				<Button
					className={classes.button}
					variant="contained"
					color="secondary"
					onClick={handleStart}
				>
					start
				</Button>
			</Paper>
		</div>
	);
}

const useContainerDimensions = (myRef) => {
	const getDimensions = () => ({
		width: myRef.current.offsetWidth,
		height: myRef.current.offsetHeight,
	});

	const [dimensions, setDimensions] = React.useState({ width: 0, height: 0 });

	React.useEffect(() => {
		const handleResize = () => {
			setDimensions(getDimensions());
		};

		if (myRef.current) {
			setDimensions(getDimensions());
		}

		window.addEventListener("resize", handleResize);

		return () => {
			window.removeEventListener("resize", handleResize);
		};
	}, [myRef]);

	return dimensions;
};

export default App;
