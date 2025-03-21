import React, { useState } from "react";
import PropsList from "./PropsList";
import "./Dictionary.css";
import wordList from "../worldList/WordList";
import { Button, Progress } from "antd";

function Dictionary() {
    const props = wordList; // Load word list

    let progress = 0;
    let total = 0;

    const items = wordList;
    items.forEach(item => {
        const localStorageData = localStorage.getItem(item.id);
        if (localStorageData) {
            total += 1;
            if (localStorageData === "completed") {
                progress += 1;
            }
        }
    });

    let progressDivision = (progress / total) * 100;
    if (!progressDivision) {
        progressDivision = 0;
    }
    const [percent, setPercent] = useState(Number.parseFloat(progressDivision).toFixed(0));

    const resetProgress = () => {
        items.forEach(item => {
            localStorage.setItem(item.id, "notstarted");
        });
        localStorage.setItem("current", "1");
        window.location.reload();
    };

    return (
        <div className="dictionaryWrapper">
            <h1 className="dictionaryTitle">Learn ASL Signs Below</h1>
            <Progress
                type="circle"
                percent={percent}
                strokeColor={{ '0%': '#5a7c46', '100%': '#283618' }}
                className="dictionaryProgress"
                size={130}
            />
            <Button onClick={resetProgress} type="primary" size={"small"} className="resetButton">Reset Progress</Button>
            <PropsList props={props} />
        </div>
    );
}

export default Dictionary;