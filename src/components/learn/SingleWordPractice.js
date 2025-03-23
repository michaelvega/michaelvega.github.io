// SingleWordLearn.js
import React, { useEffect, useState, useRef } from "react";
import 'bootstrap/dist/css/bootstrap.css';
import "./Learn.css";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Progress } from "antd";
import { CaretLeftOutlined, CaretRightOutlined } from '@ant-design/icons';

import WordList from "../worldList/WordList";
import HandTracking from "../handtrackingstate/HandTracking";
import Tutorial from "../tutorial/Tutorial";

const components = [
    { label: "Tutorial" },
    { label: "Practice" }
];

const twoColors = {
    '0%': '#97b952',
    '100%': '#566B30',
};

function SingleWordLearn() {
    const { wordID } = useParams();
    const navigate = useNavigate();

    const wordData = WordList.find((item) => item.id === parseInt(wordID));

    const [currentIndex, setCurrentIndex] = useState(0);
    const [combinedSubFrameURL, setCombinedSubFrameURL] = useState(null);
    const [totalSubFrames, setTotalSubFrames] = useState(0);
    const [selectedFrameIndex, setSelectedFrameIndex] = useState(0);
    const [isSignComplete, setIsSignComplete] = useState(false);

    const completedFramesRef = useRef(new Set());

    useEffect(() => {
        if (!wordData || !wordData.numpyFrames) return;

        combineWordSubframes(wordData.numpyFrames)
            .then(({ objectURL, total }) => {
                setCombinedSubFrameURL(objectURL);
                setTotalSubFrames(total);
            })
            .catch((err) => {
                console.error("Error combining word frames:", err);
            });
    }, [wordID]);

    async function combineWordSubframes(frameURLs) {
        const parts = [];
        let total = 0;

        for (const url of frameURLs) {
            const resp = await fetch(url);
            const txt = await resp.text();

            parts.push(txt.trim());
            parts.push("====SUBFRAME====");
            total++;
        }

        const combinedText = parts.join("\n");
        const blob = new Blob([combinedText], { type: "text/plain" });
        const objectURL = URL.createObjectURL(blob);

        return { objectURL, total };
    }

    const handleFrameSuccess = (index) => {
        if (completedFramesRef.current.has(index)) return;

        completedFramesRef.current.add(index);
        const done = completedFramesRef.current.size;
        setSelectedFrameIndex(index);
    };

    const handleFrameChange = (index) => {
        setSelectedFrameIndex(index);
    };

    const handleSignComplete = (isCorrect) => {
        if (isCorrect) {
            setIsSignComplete(true);
            localStorage.setItem(wordID, "completed");
        }
    };

    const handleNext = () => {
        if (currentIndex < components.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else if (isSignComplete) {
            console.log("✅ Sign practice complete!");
            navigate("/dictionary");
        }
    };

    const handleBack = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const progressPercent = (currentIndex === components.length - 1 && totalSubFrames > 0 && !isSignComplete)
        ? Math.round((completedFramesRef.current.size / totalSubFrames) * 100)
        : (currentIndex === components.length - 1 && isSignComplete)
            ? 100
            : 0;

    if (!wordData) {
        return <div>Word not found.</div>;
    }

    return (
        <div className="wrapperLearn">
            <div className="verticalWrapperLearn">
                <div className="headerLearn">
                    <Button
                        className="bigGreenButton"
                        type="primary"
                        onClick={() => navigate('/home')}
                    >
                        Back to Home
                    </Button>
                    <Progress
                        strokeColor={twoColors}
                        strokeWidth="2rem"
                        className="progressTop"
                        percent={progressPercent}
                        showInfo={false}
                    />
                </div>

                <h1>Learn {wordData.title}</h1>
                <div className="learnContentWrapper">
                    <div className="componentContainerLearn">
                        {currentIndex === 0 ? (
                            <Tutorial wordID={wordID} />
                        ) : (
                            combinedSubFrameURL && (
                                <HandTracking
                                    key={wordID}
                                    wordID={wordID}
                                    selectedFrameIndex={selectedFrameIndex}
                                    onFrameChange={handleFrameChange}
                                    subFrameURL={combinedSubFrameURL}
                                    image={wordData.image}
                                    onSignComplete={handleSignComplete}
                                    onFrameSuccess={handleFrameSuccess}
                                    mode={"practice"}
                                />
                            )
                        )}

                        {components[currentIndex].label === "Practice" && (
                            <img
                                className="exampleImg"
                                src={wordData.image}
                                alt={`Example Image of ${wordData.name}`}
                            />
                        )}
                    </div>
                </div>

                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        maxWidth: '300px',
                        margin: '0 auto',
                        marginBottom: "3rem",
                        gap: '1rem',
                    }}
                >
                    <Button
                        className="bigGreenButton"
                        type="primary"
                        disabled={currentIndex === 0}
                        onClick={handleBack}
                    >
                        <CaretLeftOutlined /> Back
                    </Button>
                    <Button
                        className="bigGreenButton"
                        type="primary"
                        onClick={handleNext}
                        disabled={currentIndex === components.length - 1 && !isSignComplete}
                    >
                        {currentIndex === components.length - 1 ? "Finish" : "Next"}
                        <CaretRightOutlined />
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default SingleWordLearn;
