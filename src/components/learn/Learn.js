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
    const { exerciseID, wordID } = useParams(); // e.g. /learn/2/28
    const navigate = useNavigate();

    // 1) The exercise with multiple sign IDs
    const exercise = ExerciseList.find(item => item.id === parseInt(exerciseID)) || ExerciseList[0];
    const frames = exercise ? exercise.numpyFrames : [];

    // 2) The “index” of which sign ID we’re on
    const [currentFrameIndex, setCurrentFrameIndex] = useState(
        frames.indexOf(parseInt(wordID)) !== -1
            ? frames.indexOf(parseInt(wordID))
            : 0
    );

    // 3) The sub-frame index for the single sign’s `<HandTracking>` logic
    const [selectedFrameIndex, setSelectedFrameIndex] = useState(0);

    // 4) Whether the user completed the current sign
    const [isSignComplete, setIsSignComplete] = useState(false);

    // 5) A set of “(signID)-(frameIndex)” that the user has successfully completed
    const [completedSubframeSet, setCompletedSubframeSet] = useState(new Set());
    const handleFrameSuccess = (frameIndex) => {
        // E.g. "27-1" means sign #27, subframe #1
        const key = `${frames[currentFrameIndex]}-${frameIndex}`;
        setCompletedSubframeSet(prev => {
            if (prev.has(key)) return prev; // already counted
            const newSet = new Set(prev);
            newSet.add(key);
            return newSet;
        });
    };

    const handleFrameChange = (newIndex) => {
        setSelectedFrameIndex(newIndex);
    };

    // If we do a single “sign by sign” approach, once we pick a new sign ID,
    // we navigate so the user sees a new word’s tutorial/handtracking
    useEffect(() => {
        if (frames.length > 0 && frames[currentFrameIndex] !== undefined) {
            navigate(`/learn/${exerciseID}/${frames[currentFrameIndex]}`);
        }
    }, [frames, currentFrameIndex]);

    const navigateLearn = (newIndex) => {
        if (frames[newIndex] !== undefined) {
            setCurrentFrameIndex(newIndex);
            setSelectedFrameIndex(0); // reset subframe index
            setIsSignComplete(false);
            navigate(`/learn/${exerciseID}/${frames[newIndex]}`);
        }
    };

    const navigateNavigation = () => {
        navigate("/navigation");
    };

    // 6) The “page” we’re on: 0 => tutorial, 1 => practice
    const [currentIndex, setCurrentIndex] = useState(0);

    // 7) “Next” button logic
    const handleNext = () => {
        setIsSignComplete(false);

        // If we are on tutorial => go to practice
        if (currentIndex < components.length - 1) {
            setCurrentIndex(currentIndex + 1);
            return;
        }
        // else we’re on practice, check if we can move to the next sign
        if (currentIndex === components.length - 1 && currentFrameIndex < frames.length - 1) {
            // Move to the next sign
            setCurrentIndex(0);  // back to “Tutorial” for that next sign
            navigateLearn(currentFrameIndex + 1);
        } else if (currentIndex === components.length - 1 && currentFrameIndex === frames.length - 1) {
            // We finished the last sign in this exercise
            navigateNavigation();
        }
    };

    // 8) “Back” button logic
    const handleBack = () => {
        setIsSignComplete(false);

        // If we are on practice => go to tutorial
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        } else if (currentIndex === 0 && currentFrameIndex > 0) {
            // go to the previous sign
            setCurrentIndex(components.length - 1); // jump to practice for the previous sign?
            navigateLearn(currentFrameIndex - 1);
        }
    };

    // 9) The “current” sign data
    const wordData = WordList.find(item => item.id === frames[currentFrameIndex]);
    if (!wordData) {
        return <div>Content not found.</div>;
    }
    const { numpyFrames, image } = wordData;

    // 10) Counting total frames across the entire exercise
    const totalFrames = frames.reduce((sum, signID) => {
        const fd = WordList.find(it => it.id === signID);
        return sum + (fd?.numpyFrames?.length || 1);
    }, 0);

    // Counting how many are completed
    // We interpret “completedSubframeSet.size” as how many subframes in total the user has done
    // or we do a more complicated approach. For simplicity, we’ll do:
    const progressPercent = Math.min(
        Math.round((completedSubframeSet.size / totalFrames) * 100),
        100
    );

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

                <h1>Learn (Tutorial + Practice, Single HandTracking Instance)</h1>

                {/*
          11) Always mount BOTH Tutorial and HandTracking so that the
              HandTracking remains in the DOM, camera remains started, etc.
              We just hide one or the other by CSS if “currentIndex=0 or 1”.
        */}

                <div className="learnContentWrapper">
                    {/* TUTORIAL always mounted, but hidden if currentIndex===1 */}
                    <div
                        style={{
                            display: currentIndex === 0 ? 'block' : 'none',
                            transition: '0.3s ease',
                        }}
                    >
                        <Tutorial wordID={wordID} />
                    </div>

                    {/* HANDTRACKING always mounted, but hidden if currentIndex===0 */}
                    <div
                        style={{
                            display: currentIndex === 1 ? 'block' : 'none',
                            transition: '0.3s ease',
                        }}
                    >
                        <HandTracking
                            key={wordID}
                            wordID={wordID}
                            selectedFrameIndex={selectedFrameIndex}
                            onFrameChange={handleFrameChange}
                            image={image}
                            mode="learn"
                            // When user completes this sign, set isSignComplete
                            onSignComplete={(isCorrect) => {
                                setIsSignComplete(isCorrect);
                            }}
                            onFrameSuccess={handleFrameSuccess}
                        />

                        {/* Possibly show an example image next to handtracking */}
                        <img
                            className="exampleImg"
                            src={image}
                            alt={`Example Image of sign #${wordID}`}
                        />
                    </div>
                </div>

                {/*
          12) “Back” and “Next”
        */}
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
                        {currentIndex === components.length - 1 && currentFrameIndex === frames.length - 1
                            ? "Finish"
                            : "Next"} <CaretRightOutlined />
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default Learn;
