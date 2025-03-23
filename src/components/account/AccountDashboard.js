import React, { useEffect, useState } from "react";
import { auth, db, storage } from "../../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Button, Input, Upload, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

function AccountDashboard() {
    const user = auth.currentUser;
    const navigate = useNavigate();

    const [userData, setUserData] = useState({
        displayName: "",
        username: "",
        pfpURL: ""
    });
    const [loading, setLoading] = useState(false);
    const [previewURL, setPreviewURL] = useState("");

    useEffect(() => {
        if (!user) return;
        const fetchUserData = async () => {
            const userRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(userRef);
            if (docSnap.exists()) {
                setUserData(docSnap.data());
                setPreviewURL(docSnap.data().pfpURL || "");
            }
        };
        fetchUserData();
    }, [user]);

    const handleSave = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const userRef = doc(db, "users", user.uid);
            await setDoc(userRef, {
                uid: user.uid,
                email: user.email,
                displayName: userData.displayName,
                username: userData.username,
                pfpURL: userData.pfpURL || ""
            });
            message.success("Profile updated!");
        } catch (err) {
            console.error("Error saving profile:", err);
            message.error("Error saving profile.");
        }
        setLoading(false);
    };

    const handleUpload = async (file) => {
        if (!user) return false;

        const storageRef = ref(storage, `profilePictures/${user.uid}`);
        try {
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);
            setUserData(prev => ({ ...prev, pfpURL: downloadURL }));
            setPreviewURL(downloadURL);
            message.success("Profile picture uploaded!");
        } catch (err) {
            console.error("Upload error:", err);
            message.error("Failed to upload picture.");
        }
        return false;
    };

    if (!user) {
        return (
            <div className="wrapperLearn" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <Button
                    type="primary"
                    className="bigGreenButton"
                    style={{ fontSize: "1.5rem", padding: "1rem 2rem" }}
                    onClick={() => navigate("/signin")}
                >
                    Sign In to View Account
                </Button>
            </div>
        );
    }

    return (
        <div className="wrapperLearn" style={{ maxWidth: "500px", margin: "auto", padding: "2rem" }}>
            <h2 style={{ textAlign: "center" }}>My Account</h2>

            <div style={{ marginBottom: "1rem" }}>
                <strong>Email:</strong>
                <p>{user.email}</p>
            </div>

            <div style={{ marginBottom: "1rem" }}>
                <strong>Display Name:</strong>
                <Input
                    value={userData.displayName}
                    onChange={(e) => setUserData({ ...userData, displayName: e.target.value })}
                    placeholder="John Doe"
                />
            </div>

            <div style={{ marginBottom: "1rem" }}>
                <strong>Username:</strong>
                <Input
                    value={userData.username}
                    onChange={(e) => setUserData({ ...userData, username: e.target.value })}
                    placeholder="johnnyD"
                />
            </div>

            <div style={{ marginBottom: "1rem" }}>
                <strong>Profile Picture:</strong>
                <div style={{ margin: "1rem 0" }}>
                    {previewURL ? (
                        <img
                            src={previewURL}
                            alt="Profile Preview"
                            style={{ width: "100px", height: "100px", borderRadius: "50%", objectFit: "cover" }}
                        />
                    ) : (
                        <p>No picture uploaded</p>
                    )}
                </div>
                <Upload beforeUpload={handleUpload} showUploadList={false}>
                    <Button icon={<UploadOutlined />}>Upload New Picture</Button>
                </Upload>
            </div>

            <Button
                type="primary"
                className="bigGreenButton"
                loading={loading}
                onClick={handleSave}
                block
            >
                Save Profile
            </Button>
        </div>
    );
}

export default AccountDashboard;
