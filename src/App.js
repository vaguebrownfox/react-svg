import React from "react";
import { Paper, Button } from "@material-ui/core";

import { makeStyles } from "@material-ui/core/styles";
import { orange, pink, red } from "@material-ui/core/colors";

import { analyserNode } from "./recorder";

const useStyles = makeStyles((theme) => ({
  root: {
    height: "100%",
    minHeight: "100vh",

    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignContent: "center",
  },
  head: {
    textAlign: "center",
  },
  container: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
  },
  vizdiv: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
  },
  visualizer: {
    flex: 1,
  },
  shape: {
    // stroke: "black",
    strokeWidth: 0.1,
    opacity: 0.9,
    zIndex: -1,
  },
}));

const c = 128;

function App() {
  const classes = useStyles();

  const vizRef = React.useRef();

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

      //   let a = []; //new Uint8Array(c);
      //   for (let i = 0; i < c; ++i) a[i] = i;
      //   function shuffle(array) {
      //     var tmp,
      //       current,
      //       top = array.length;
      //     if (top)
      //       while (--top) {
      //         current = Math.floor(Math.random() * (top + 1));
      //         tmp = array[current];
      //         array[current] = array[top];
      //         array[top] = tmp;
      //       }
      //     return array;
      //   }
      //   a = shuffle(a);

      const bufferLength = analyserNode.frequencyBinCount;
      const dataArrayBuffer = new Uint8Array(bufferLength);
      analyserNode.getByteFrequencyData(dataArrayBuffer);

      const dataArray = [...dataArrayBuffer].slice(
        0,
        Math.floor(bufferLength / 1)
      );

      setViz({ spectrum: dataArray });
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };

  React.useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(requestRef.current);
      analyserNode.disconnect();
    };
  }, []); // Make sure the effect runs only once

  const handleStart = async () => {};

  return (
    <div className={classes.root}>
      <h4 className={classes.head}>Listening...</h4>
      <div className={classes.container}>
        {/* <h4>frame: {Math.round(count)}</h4> */}
        {/* <h4>height: {height}</h4>
        <h4>width: {width}</h4> */}
        <div ref={vizRef} className={classes.vizdiv}>
          <svg
            className={classes.visualizer}
            // viewBox={`0 0 100% 100%`}
            // viewBox={`0 0 100 ${width}`}
          >
            {viz && <Worm spectrum={viz.spectrum} vizRef={vizRef} />}
          </svg>
        </div>
      </div>
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

const Worm = ({ spectrum, vizRef }) => {
  const { width, height } = useContainerDimensions(vizRef);
  const classes = useStyles();
  const bw = Math.ceil(width / spectrum.length);
  return (
    <>
      {spectrum.map((a, i) => {
        const x = bw * i;
        const ynorm = a / 255;
        const y = Math.round((ynorm * height) / 4);

        const shade = ynorm < 0.7 ? orange : red;
        const color = (Math.floor(ynorm * 10) % 9) * 100;
        return (
          <circle
            key={i}
            className={classes.shape}
            cx={x}
            cy={height - y}
            width={bw}
            r={y}
            fill={shade[color < 100 ? 100 : color]}
          />
        );
      })}
    </>
  );
};

export default App;
