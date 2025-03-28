import React, { useEffect, useState, useRef } from "react";
import 'bootstrap/dist/css/bootstrap.css';
import "./Learn.css";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Progress } from "antd";
import { CaretLeftOutlined, CaretRightOutlined } from '@ant-design/icons';

import WordList from "../worldList/WordList";
import ExerciseList from "../worldList/ExerciseList";
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

function MultiSignLearn() {
    const { exerciseID } = useParams();
    const navigate = useNavigate();

    let exercise = ExerciseList.find(item => item.id === parseInt(exerciseID));

    if (!exercise && parseInt(exerciseID) === 999) {
        const saved = localStorage.getItem("customExercise");
        if (saved) {
            exercise = JSON.parse(saved);
        }
    }

    const wordIDs = exercise?.numpyFrames || [];

    const [currentSignIndex, setCurrentSignIndex] = useState(0);         // Word in the series
    const [currentTabIndex, setCurrentTabIndex] = useState(0);           // 0 = Tutorial, 1 = Practice
    const [completedSigns, setCompletedSigns] = useState(new Set());     // Tracks completed signs
    const [subframeProgressMap, setSubframeProgressMap] = useState({});  // Tracks subframe completion

    const [selectedFrameIndex, setSelectedFrameIndex] = useState(0);

    const currentWordID = wordIDs[currentSignIndex];
    const wordData = WordList.find(w => w.id === currentWordID);

    // Create combined sub-frame URL
    const [combinedSubFrameURL, setCombinedSubFrameURL] = useState(null);
    const [totalSubframes, setTotalSubframes] = useState(0);

    useEffect(() => {
        if (!wordData || !wordData.numpyFrames) return;

        (async () => {
            const parts = [];
            let total = 0;

            for (const url of wordData.numpyFrames) {
                const resp = await fetch(url);
                const txt = await resp.text();

                parts.push(txt.trim());
                parts.push("====SUBFRAME====");
                total++;
            }

            const combinedText = parts.join("\n");
            const blob = new Blob([combinedText], { type: "text/plain" });
            const objectURL = URL.createObjectURL(blob);

            setCombinedSubFrameURL(objectURL);
            setTotalSubframes(total);
            setSelectedFrameIndex(0);
        })();
    }, [currentWordID]);

    const handleFrameSuccess = (frameIdx) => {
        setSubframeProgressMap(prev => {
            const key = `${currentWordID}`;
            const prevSet = prev[key] || new Set();
            if (prevSet.has(frameIdx)) return prev; // already marked
            const newSet = new Set(prevSet);
            newSet.add(frameIdx);

            return {
                ...prev,
                [key]: newSet
            };
        });
    };

    const handleFrameChange = (index) => {
        setSelectedFrameIndex(index);
    };

    const handleSignComplete = (isCorrect) => {
        if (isCorrect) {
            setCompletedSigns(prev => new Set([...prev, currentWordID]));
            localStorage.setItem(currentWordID, "completed");
        }
    };

    const handleNext = () => {
        if (currentTabIndex === 0) {
            setCurrentTabIndex(1);
        } else if (currentTabIndex === 1 && completedSigns.has(currentWordID)) {
            if (currentSignIndex < wordIDs.length - 1) {
                setCurrentSignIndex(prev => prev + 1);
                setCurrentTabIndex(0);
            } else {
                navigate("/units");
            }
        }
    };

    const handleBack = () => {
        if (currentTabIndex === 1) {
            setCurrentTabIndex(0);
        } else if (currentTabIndex === 0 && currentSignIndex > 0) {
            setCurrentSignIndex(prev => prev - 1);
            setCurrentTabIndex(1);
        }
    };

    if (!exercise || !wordData) {
        return <div>Invalid exercise or word.</div>;
    }

    const totalSubframesDone = Object.values(subframeProgressMap)
        .reduce((sum, set) => sum + set.size, 0);

    const grandTotalSubframes = wordIDs.reduce((sum, id) => {
        const word = WordList.find(w => w.id === id);
        return sum + (word?.numpyFrames?.length || 0);
    }, 0);

    const progressPercent = Math.round((totalSubframesDone / grandTotalSubframes) * 100);

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

                <h1>Learn: {exercise.name}</h1>
                <h2 style={{ textAlign: 'center' }}>
                    Sign {currentSignIndex + 1} of {wordIDs.length}: {wordData.name}
                </h2>

                <div className="learnContentWrapper">
                    {currentTabIndex === 0 ? (
                        <Tutorial wordID={currentWordID} />
                    ) : (
                        combinedSubFrameURL && (
                            <HandTracking
                                key={currentWordID}
                                wordID={currentWordID}
                                selectedFrameIndex={selectedFrameIndex}
                                onFrameChange={handleFrameChange}
                                subFrameURL={combinedSubFrameURL}
                                image={wordData.image}
                                onFrameSuccess={handleFrameSuccess}
                                onSignComplete={handleSignComplete}
                                mode="practice"
                            />
                        )
                    )}

                    {currentTabIndex === 1 && (
                        <img
                            className="exampleImg"
                            src={wordData.image}
                            alt={`Example Image of ${wordData.name}`}
                        />
                    )}
                </div>

                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        maxWidth: '300px',
                        margin: '0 auto',
                        marginBottom: "3rem",
                        gap: '1rem'
                    }}
                >
                    <Button
                        className="bigGreenButton"
                        type="primary"
                        disabled={currentSignIndex === 0 && currentTabIndex === 0}
                        onClick={handleBack}
                    >
                        <CaretLeftOutlined /> Back
                    </Button>

                    <Button
                        className="bigGreenButton"
                        type="primary"
                        onClick={handleNext}
                        disabled={currentTabIndex === 1 && !completedSigns.has(currentWordID)}
                    >
                        {currentTabIndex === 1 && currentSignIndex === wordIDs.length - 1
                            ? "Finish"
                            : "Next"} <CaretRightOutlined />
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default MultiSignLearn;
