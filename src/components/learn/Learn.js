import React, { useEffect, useState } from "react";
import 'bootstrap/dist/css/bootstrap.css';
import "./Learn.css";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Progress } from "antd";
import { CaretLeftOutlined, CaretRightOutlined } from '@ant-design/icons';
import WordList from "../worldList/WordList";

import HandTracking from "../handtrackingstate/HandTracking";
import Tutorial from "../tutorial/Tutorial";

import ExerciseList from "../worldList/ExerciseList";

const components = [
    { label: "Tutorial" },
    { label: "Hand Tracking" },
];

const twoColors = {
    '0%': '#97b952',
    '100%': '#566B30',
};



function Learn() {

    const { exerciseID, wordID } = useParams(); // Get exerciseID and wordID from the URL
    const navigate = useNavigate();

// Fetch the exercise from ExerciseList
    const exercise = ExerciseList.find((item) => item.id === parseInt(exerciseID)) || ExerciseList[0];
    const frames = exercise ? exercise.numpyFrames : []; // Default to an empty array if no exercise found

    const [currentFrameIndex, setCurrentFrameIndex] = useState(
        frames.indexOf(parseInt(wordID)) !== -1 ? frames.indexOf(parseInt(wordID)) : 0
    );
    const [selectedFrameIndex, setSelectedFrameIndex] = useState(0); // Frame-level control for HandTracking
    const [isSignComplete, setIsSignComplete] = useState(false); // Track sign completion

    const [completedSubframeSet, setCompletedSubframeSet] = useState(new Set());
    const handleFrameSuccess = (frameIndex) => {
        const key = `${frames[currentFrameIndex]}-${frameIndex}`; // e.g., "3-1" means sign 3, frame 1

        setCompletedSubframeSet(prevSet => {
            if (prevSet.has(key)) return prevSet; // already counted

            const newSet = new Set(prevSet);
            newSet.add(key);
            return newSet;
        });
    };


    const handleFrameChange = (newIndex) => {
        setSelectedFrameIndex(newIndex);
    };

    useEffect(() => {
        if (frames.length > 0 && frames[currentFrameIndex] !== undefined) {
            navigate(`/learn/${exerciseID}/${frames[currentFrameIndex]}`);
        }
    }, [frames, currentFrameIndex]);

    const navigateLearn = (newIndex) => {
        if (frames[newIndex] !== undefined) {
            setCurrentFrameIndex(newIndex);
            setSelectedFrameIndex(0); // Reset to the first frame when navigating to a new sign
            navigate(`/learn/${exerciseID}/${frames[newIndex]}`);
        }
    };

    const navigateNavigation = () => {
        navigate("/navigation");
    };

    const [currentIndex, setCurrentIndex] = useState(0);

    const handleNext = () => {
        setIsSignComplete(false);

        if (currentIndex < components.length - 1) {
            // Move between Tutorial and Hand Tracking
            setCurrentIndex(currentIndex + 1);
        } else if (currentIndex === components.length - 1 && currentFrameIndex < frames.length - 1) {
            // Move to the next sign
            setCurrentIndex(0); // Reset to Tutorial
            navigateLearn(currentFrameIndex + 1);
        } else if (currentIndex === components.length - 1 && currentFrameIndex === frames.length - 1) {
            // Finish when at the end of all signs
            navigateNavigation();
        }
    };

    const handleBack = () => {
        setIsSignComplete(false);
        if (currentIndex > 0) {
            // Move between Hand Tracking and Tutorial
            setCurrentIndex(currentIndex - 1);
        } else if (currentIndex === 0 && currentFrameIndex > 0) {
            // Move to the previous sign
            setCurrentIndex(components.length - 1); // Reset to Hand Tracking
            navigateLearn(currentFrameIndex - 1);
        }
    };

    const wordData = WordList.find((item) => item.id === frames[currentFrameIndex]);

    if (!wordData) {
        return <div>Content not found.</div>;
    }

    const { title, name, instructions, numpyFrames, image } = wordData;

// Calculate total frames across all signs
    const totalFrames = frames.reduce((sum, frameID) => {
        const frameData = WordList.find((item) => item.id === frameID);
        return sum + (frameData?.numpyFrames?.length || 1); // Default to 1 if no frames found
    }, 0);

// Calculate completed frames
    const completedFrames = frames.slice(0, currentFrameIndex).reduce((sum, frameID) => {
        const frameData = WordList.find((item) => item.id === frameID);
        return sum + (frameData?.numpyFrames?.length || 1);
    }, selectedFrameIndex + 1); // Include the current frame's progress

// Progress percentage
    console.log("Total Frames: ", totalFrames);
    console.log("completedSubframes:", completedSubframeSet);
    const progressPercent = Math.min(Math.round((completedSubframeSet.size / totalFrames) * 100), 100);



    return (
        <div className="wrapperLearn">
            <div className="verticalWrapperLearn">
                <div className="headerLearn">
                    <Button className="bigGreenButton" type="primary" onClick={() => navigate('/home')}>
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

                <h1>Learn!</h1>
                <div className="learnContentWrapper">
                    <div className="componentContainerLearn">
                        <div>
                            {currentIndex === 0 ? (
                                <Tutorial wordID={wordID} /> // Pass wordID as a prop to Tutorial
                            ) : (
                                <HandTracking
                                    key={wordID}
                                    wordID={wordID}
                                    selectedFrameIndex={selectedFrameIndex}
                                    onFrameChange={handleFrameChange}
                                    image={image}
                                    onSignComplete={(isCorrect) => setIsSignComplete(isCorrect)}
                                    mode={"learn"}
                                    onFrameSuccess={handleFrameSuccess} // ✅ Track subframe completions
                                />
                            )}
                        </div>

                        {components[currentIndex].label === "Hand Tracking" && <img className = "exampleImg" src = {image} alt={`Example Image of ${wordData.name}`}></img>}

                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', maxWidth: '300px', margin: '0 auto', marginBottom: "3rem", gap: '1rem' }}>
                    <Button className="bigGreenButton" type="primary" disabled={currentIndex === 0} onClick={handleBack}>
                        <CaretLeftOutlined /> Back
                    </Button>
                    <Button className="bigGreenButton" type="primary" onClick={handleNext} disabled={currentIndex === components.length - 1 && !isSignComplete}>

                        {currentIndex === components.length - 1 && currentFrameIndex === frames.length - 1
                            ? "Finish"
                            : "Next"}  <CaretRightOutlined />
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default Learn;
