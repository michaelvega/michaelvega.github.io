import React, { useState } from "react";
import 'bootstrap/dist/css/bootstrap.css';
import "./Learn.css";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Progress } from "antd";
import { CaretLeftOutlined, CaretRightOutlined } from '@ant-design/icons';

// Our local data
import WordList from "../worldList/WordList";

// Components
import HandTracking from "../handtrackingstate/HandTracking";
import Tutorial from "../tutorial/Tutorial";

const components = [
    { label: "Tutorial" },
    { label: "Hand Tracking" },
];

const twoColors = {
    '0%': '#97b952',
    '100%': '#566B30',
};

function DictionaryLearn() {
    const { wordID } = useParams();
    const navigate = useNavigate();

    // Find the single word in WordList by its ID
    const wordData = WordList.find((item) => item.id === parseInt(wordID));

    // If word doesn't exist, handle gracefully

    // We have just ONE sign here, so track whether user is in the tutorial or hand tracking:
    const [currentIndex, setCurrentIndex] = useState(0);

    const totalFrames = wordData.numpyFrames?.length || 1; // Total frames per sign

    console.log("Total Frames", totalFrames);


    // Track if the user has successfully completed the sign
    const [isSignComplete, setIsSignComplete] = useState(false);

    // If the sign has multiple sub-frames, we can track them here:
    const [selectedFrameIndex, setSelectedFrameIndex] = useState(0);
    console.log("Selected Framessss", selectedFrameIndex);

    if (!wordData) {
        return <div>Content not found (invalid wordID).</div>;
    }

    // 0% if not complete, 100% if sign is complete
    //const progressPercent = isSignComplete ? 100 : 0;

    const progressPercent = (currentIndex === components.length - 1 && totalFrames > 0 && !isSignComplete)
        ? Math.round((selectedFrameIndex / totalFrames) * 100)
        : (currentIndex === components.length - 1 && isSignComplete)
            ? 100
            : 0;

    const handleFrameChange = (newIndex) => {
        console.log("HELLOHELLOHELLOHELLOHELLOHELLOHELLOHELLOHELLOHELLOHELLOHELLOHELLOHELLO")
        setSelectedFrameIndex(newIndex);
    };

    // Step forward: either from tutorial -> hand tracking, or “Finish”
    const handleNext = () => {
        if (currentIndex < components.length - 1) {
            // Move from tutorial to hand tracking
            setCurrentIndex(currentIndex + 1);
        } else {
            // If user is on hand tracking, check if sign is complete
            if (isSignComplete) {
                // Possibly redirect somewhere or show a success message
                // For now, we just log and/or navigate back to home
                console.log("Sign completed in dictionary mode!");
                navigate("/navigation");
            }
        }
    };

    const handleSignComplete = (isCorrect) => {
        if (isCorrect) {
            setIsSignComplete(true);
            localStorage.setItem(wordID, "completed"); // ✅ Save completion status
        }
    };

    // Step backward: only relevant if we’re on hand tracking
    const handleBack = () => {
        if (currentIndex > 0) {
            // Move from hand tracking back to tutorial
            setCurrentIndex(currentIndex - 1);
        }
        // No "previous sign" in dictionary mode
    };

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

                <h1>Dictionary Mode</h1>
                <div className="learnContentWrapper">
                    <div className="componentContainerLearn">
                        {currentIndex === 0 ? (
                            <Tutorial wordID={wordID} />
                        ) : (
                            <HandTracking
                                key={wordID}
                                wordID={wordID}
                                selectedFrameIndex={selectedFrameIndex}
                                onFrameChange={handleFrameChange}
                                image={wordData.image}
                                onSignComplete={handleSignComplete}
                                mode={"dictionary"} // dictionary so no subframe url
                            />
                        )}

                        {/* Only show example image if we are on Hand Tracking */}
                        {components[currentIndex].label === "Hand Tracking" && (
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

export default DictionaryLearn;
