import React, { Activity, useEffect, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import LoginScreen from "./src/screens/LoginScreen";
import { getToken, clearToken } from "./src/auth/tokenStorage";
import { setAuthToken } from "./src/api/client";

export default function App() {
    const [checking, setChecking] = useState(true);
    const [loggedIn, setLoggedIn] = useState(false);

    useEffect(() => {
        getToken().then((token) => {
            if (token) {
                setAuthToken(token);
                setLoggedIn(true);
            }
            setChecking(false);
        });
    }, []);

    const handleLogout = async () => {
        await clearToken();
        setAuthToken(null);
        setLoggedIn(false);
    };

    if (checking) {
        return (
            <View style={styles.center}>
                <ActivityIndicator />
            </View>
        );
    }

    return (
        <>
            <StatusBar style="light" />
            {loggedIn ? (
                <View style={styles.center}>
                    <Text style={styles.text}>You're logged in.</Text>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleLogout}
                    >
                        <Text style={styles.buttonText}>Log out</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <LoginScreen
                    onAuthenticated={(token) => {
                        setAuthToken(token);
                        setLoggedIn(true);
                    }}
                />
            )}
        </>
    );
}

const styles = StyleSheet.create({
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#0B0B0F",
    },
    text: { color: "#fff", fontSize: 18, marginBottom: 16 },
    button: {
        backgroundColor: "#5A4CF0",
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 24,
    },
    buttonText: { color: "#fff", fontWeight: "600" },
});
