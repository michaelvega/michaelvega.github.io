import React, { useEffect, useState, useRef } from "react";
import 'bootstrap/dist/css/bootstrap.css';
import "./Learn.css";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Progress } from "antd";

import ExerciseList from "../worldList/ExerciseList";
import WordList from "../worldList/WordList";
import HandTracking from "../handtrackingstate/HandTracking";

function Practice() {
    const { exerciseID } = useParams();
    const navigate = useNavigate();

    // We'll store the final combined .txt as a blob URL
    const [combinedSubFrameURL, setCombinedSubFrameURL] = useState(null);
    console.log(combinedSubFrameURL);

    // Store the exercise name for the heading
    const [exerciseName, setExerciseName] = useState("");

    // For our progress bar
    const [progressPercent, setProgressPercent] = useState(0);

    // The index that the child is showing
    const [childFrameIndex, setChildFrameIndex] = useState(0);

    // How many total sub-frames are in this combined file
    const [totalSubFrames, setTotalSubFrames] = useState(0);

    // We no longer store “completedCount” in a state that increments multiple times.
    // Instead, we store which frames are “completed,” so we can do set logic.
    const completedFramesRef = useRef(new Set());

    useEffect(() => {
        // 1) Find the exercise from our global ExerciseList
        const foundExercise = ExerciseList.find(
            (item) => item.id === parseInt(exerciseID)
        );
        if (!foundExercise) {
            console.error("Exercise not found for ID:", exerciseID);
            return;
        }
        setExerciseName(foundExercise.name || "Practice Exercise");

        // 2) Build one big text file with all sub-frames from these wordIDs
        const wordIDs = foundExercise.numpyFrames || [];
        if (!wordIDs.length) {
            console.warn("No word IDs found in this exercise.");
            return;
        }

        combineAllWordFrames(wordIDs)
            .then(({ objectURL, totalSubFrames }) => {
                setCombinedSubFrameURL(objectURL);
                setTotalSubFrames(totalSubFrames);
                setProgressPercent(0);
            })
            .catch((err) => {
                console.error("Error combining frames:", err);
            });
    }, [exerciseID]);

    /**
     * Called by HandTracking when the user navigates to a new sub-frame
     * (e.g. next sub-frame).
     */
    function handleFrameChange(newIndex) {
        setChildFrameIndex(newIndex);
    }

    /**
     * Called by HandTracking exactly once each time a sub-frame is recognized as correct.
     * But if the user is holding the correct shape for multiple frames, that function
     * might get called repeatedly for the same sub-frame — so we must GATE here.
     */
    function handleFrameSuccess(frameIndex) {
        // If we've already marked sub-frame `frameIndex` as done, skip
        if (completedFramesRef.current.has(frameIndex)) {
            return;
        }

        // Otherwise, add it to the completed set
        completedFramesRef.current.add(frameIndex);

        // Recompute progress: (# completed / total) * 100
        const completedCount = completedFramesRef.current.size;
        const percent = (completedCount / totalSubFrames) * 100;
        setProgressPercent(percent);
    }

    /**
     * Called when the user has successfully completed *all* frames (or forcibly done).
     */
    function handleSignComplete(isCorrect) {
        if (isCorrect) {
            console.log("All frames recognized / completed successfully!");
            // You can navigate away or do other logic here
            //navigate("/navigation");
        }
    }

    /**
     * Helper function: merges all sub-frames from each word ID
     * into one big text file separated by "====SUBFRAME===="
     */
    async function combineAllWordFrames(wordIDs) {
        const allTextParts = [];
        let totalSubFrames = 0;

        for (const wid of wordIDs) {
            const wordData = WordList.find((w) => w.id === wid);
            if (!wordData || !wordData.numpyFrames) continue;

            for (const subFrameURL of wordData.numpyFrames) {
                const resp = await fetch(subFrameURL);
                const subFrameText = await resp.text();

                allTextParts.push(subFrameText.trim());
                allTextParts.push("====SUBFRAME====");
                totalSubFrames++;
            }
        }

        // Build final text
        const combinedText = allTextParts.join("\n");
        console.log("Combined all sub-frames:\n", combinedText);

        const blob = new Blob([combinedText], { type: "text/plain" });
        const objectURL = URL.createObjectURL(blob);
        return { objectURL, totalSubFrames };
    }

    // If not loaded yet, show a simple message
    if (!combinedSubFrameURL) {
        return (
            <div className="wrapperLearn">
                <h2>Loading all multi-hand frames...</h2>
            </div>
        );
    }

    // Render
    return (
        <div className="wrapperLearn">
            <div className="verticalWrapperLearn">

                <div className="headerLearn" style={{ marginBottom: '1rem' }}>
                    <Button
                        className="bigGreenButton"
                        type="primary"
                        onClick={() => navigate('/home')}
                    >
                        Back to Home
                    </Button>

                    <Progress
                        strokeWidth="2rem"
                        className="progressTop"
                        percent={progressPercent}
                        showInfo
                    />
                </div>

                <h1>Practice Mode</h1>

                <h2 style={{ textAlign: 'center' }}>
                    Signing: <strong>{exerciseName}</strong>,
                    Frame {childFrameIndex + 1} of {totalSubFrames}
                </h2>

                <p style={{ textAlign: 'center', marginBottom: '1rem' }}>
                    We've merged all sub-frames (including multi-hand) into one file.
                </p>

                <div className="learnContentWrapper" style={{ marginBottom: '2rem' }}>
                    <HandTracking
                        // The child does the actual sign detection
                        // It calls onFrameSuccess(frameIndex) once per recognized sub-frame
                        // But we GATE here so we only increment once
                        selectedFrameIndex={childFrameIndex}
                        mode="practice"
                        subFrameURL={combinedSubFrameURL}
                        onFrameChange={handleFrameChange}
                        onSignComplete={handleSignComplete}
                        onFrameSuccess={handleFrameSuccess}
                    />
                </div>
                {progressPercent === 100 && (
                    <p style={{ textAlign: 'center', color: '#566B30', fontWeight: 'bold' }}>
                        ✅ Great job! You've completed all frames. Feel free to continue practicing.
                    </p>
                )}

                {/* No skipping or next/back buttons, because
                    we let the child auto-advance. */}
            </div>
        </div>
    );
}

export default Practice;
