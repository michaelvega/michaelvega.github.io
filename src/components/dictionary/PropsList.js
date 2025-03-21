import React from "react";
import "./PropsList.css"
import {CheckCircleFilled, PlayCircleFilled} from "@ant-design/icons";
import {Link, useNavigate} from 'react-router-dom';

function PropsList({ props }) {
    return (
        <div className="list">
            {props.map((prop, index) => (
                <div key={index} className="list-item">
                    {localStorage.getItem(String(prop.id)) == "completed" ? <Link to={`/dictionary/${prop.id}`}><CheckCircleFilled  style={{ color: "green", fontSize: "1.5em" }}/> </Link> : <Link to={`/tutorial/${prop.id}`}><PlayCircleFilled style={{ color: "#636363", fontSize: "1.5em" }}/> </Link> }
                    <div className={"titleDescription"} >
                        <Link to={`/dictionary/${prop.id}`}> <h3 className="title" >{prop.title}</h3></Link>
                        <p style={{ margin: 0 }}>{prop.description}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default PropsList;