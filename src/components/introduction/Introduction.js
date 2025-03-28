import React, { useState } from "react";
import 'bootstrap/dist/css/bootstrap.css';
import "./Introduction.css";
import { useNavigate } from "react-router-dom";
import { Button, Progress } from "antd";
import Aloeha7 from "../../assets/Aloeha7.png";
import Aloeha3 from "../../assets/Aloeha3.png";
import Aloeha6 from "../../assets/Aloeha6.png";
import Aloeha15 from "../../assets/Aloeha15.png";
import Aloeha14 from "../../assets/Aloeha14.png";

import { CaretLeftOutlined, CaretRightOutlined } from '@ant-design/icons';
import 'antd/dist/reset.css'; // Make sure you import Antd style

const frames = [
    { text: 'Hi! My name is Aloeha the Aloe Plant, and I will be your guide!', image: Aloeha7, insertName: false },
    { text: 'Welcome to LearnASL!', image: Aloeha3, insertName: false },
    { text: 'Lets get you right into it so you can really see what LearnASL is all about!', image: Aloeha6, insertName: false },
    { text: 'Please start by entering your preferred first name and last initial in the text box below.', image: Aloeha15, insertName: true },
    { text: 'Sweet! Also did you notice the progress bar move? This will show you how far in a lesson you are. Awesome first step.', image: Aloeha14, insertName: false },
    { text: 'To get you situated with how we work, lets teach you how to introduce yourself in ASL!', image: Aloeha6, insertName: false }
];

const twoColors = {
    '0%': '#97b952',
    '100%': '#566B30',
};

function Introduction() {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [currentFrame, setCurrentFrame] = useState(0);
    const [animationClass, setAnimationClass] = useState('');

    const handleNameChange = (event) => {
        setName(event.target.value);
    };

    const navigateLanding = () => {
        navigate('/landing');
    };

    const navigateLearn = () => {
        const initials = localStorage.getItem("userInitials"); // e.g., "AG"
        const frameIDs = [28, 27]; // "my name is"

        for (const char of initials.toUpperCase()) {
            const code = char.charCodeAt(0) - 64; // 'A' = 1
            frameIDs.push(code);
        }

        localStorage.setItem("customExercise", JSON.stringify({
            id: 999,
            name: `MyNameIs${initials}`,
            numpyFrames: frameIDs
        }));

        navigate('/learn/999');
    };

    const progressPercent = ((currentFrame + 1) / frames.length) * 100;

    const handleNext = () => {
        if (frames[currentFrame].insertName) {
            const nameFormat = /^[a-z]+ [a-z]\.?$/i;
            if (!nameFormat.test(name)) {
                alert("Please enter your name in 'FirstName LastInitial' format, e.g., 'Andre G'");
                return;
            }
            localStorage.setItem("userInitials", name.split(" ")[0][0].toUpperCase() + name.split(" ")[1][0].toUpperCase());
        }       
        if (currentFrame === frames.length-1) {
            navigateLearn();
        }

        if (currentFrame < frames.length - 1) {
            setAnimationClass('slide-out-left');
            setTimeout(() => {
                setCurrentFrame((prev) => prev + 1);
                setAnimationClass('slide-in-right');
                setTimeout(() => setAnimationClass(''), 500); // Reset animation class
            }, 500);
        }
    };

    const handleBack = () => {
        if (currentFrame > 0) {
            setAnimationClass('slide-out-right');
            setTimeout(() => {
                setCurrentFrame((prev) => prev - 1);
                setAnimationClass('slide-in-left');
                setTimeout(() => setAnimationClass(''), 500); // Reset animation class
            }, 500);
        }
    };

    return (
        <div className={"wrapperIntroduction"}>
            <div className={"verticalWrapperIntroduction"}>
                <div className={"headerIntroduction"}>
                    <Button className="bigGreenButton" type="primary" onClick={navigateLanding}>
                        Back to Home
                    </Button>
                    <Progress strokeColor={twoColors} strokeWidth={"2rem"} className={"progressTop"} percent={progressPercent} showInfo={false} />
                </div>
                <h1 className="introTitle">Introduction!</h1>
                {/* Character and Text Bubble with Animation */}
                <div className={`characterTextBubble ${animationClass}`}>
                    <div className="textBubbleWrapper">
                        <div className="bubbleText">{frames[currentFrame].text}</div>
                        <div className="boxIntroduction"></div>
                    </div>
                    
                    <img
                        src={frames[currentFrame].image}
                        alt="Guide"
                        className="aloe-avatar"
                    />
                </div>
                {frames[currentFrame].insertName && (
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={handleNameChange}
                        className="name-input"
                        placeholder="Enter your name (e.g., Andre G)"
                        style={{ marginTop: "1rem" }}
                    />
                )}

                {/* Navigation Buttons */}
                <div style={{ display: 'flex', justifyContent: 'space-between', maxWidth: '300px', margin: '0 auto', gap: '1rem' }}>
                    <Button className="bigGreenButton" type="primary" disabled={currentFrame === 0} onClick={handleBack}>
                        <CaretLeftOutlined /> Back
                    </Button>
                    <Button className="bigGreenButton" type="primary"  onClick={handleNext}>
                        {currentFrame === frames.length - 1 ? "Get Started" : "Next"}
                        <CaretRightOutlined />
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default Introduction;
