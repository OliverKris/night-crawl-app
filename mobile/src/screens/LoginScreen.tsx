import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
} from "react-native";
import { api } from "../api/client";
import { saveToken } from "../auth/tokenStorage";

export default function LoginScreen({
    onAuthenticated,
}: {
    onAuthenticated: (token: string) => void;
}) {
    const [mode, setMode] = useState<"login" | "signup">("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const { accessToken } =
                mode === "login"
                    ? await api.login(email, password)
                    : await api.signUp(email, password, displayName);

            await saveToken(accessToken);
            onAuthenticated(accessToken);
        } catch (e: any) {
            Alert.alert(
                mode === "login" ? "Login failed" : "Sign up failed",
                e.message,
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Waypoint</Text>

            {mode === "signup" && (
                <TextInput
                    style={styles.input}
                    placeholder="Display name"
                    value={displayName}
                    onChangeText={setDisplayName}
                />
            )}
            <TextInput
                style={styles.input}
                placeholder="Email"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />

            <TouchableOpacity
                style={styles.button}
                onPress={handleSubmit}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>
                        {mode === "login" ? "Log in" : "Sign up"}
                    </Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => setMode(mode === "login" ? "signup" : "login")}
            >
                <Text style={styles.switchText}>
                    {mode === "login"
                        ? "Don't have an account? Sign up"
                        : "Already have an account? Log in"}
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        padding: 24,
        backgroundColor: "#0B0B0F",
    },
    header: {
        fontSize: 32,
        fontWeight: "800",
        color: "#fff",
        marginBottom: 32,
        textAlign: "center",
    },
    input: {
        backgroundColor: "#17171D",
        color: "#fff",
        borderRadius: 10,
        padding: 12,
        marginBottom: 12,
    },
    button: {
        backgroundColor: "#5A4CF0",
        borderRadius: 10,
        padding: 14,
        alignItems: "center",
        marginTop: 8,
    },
    buttonText: { color: "#fff", fontWeight: "600" },
    switchText: { color: "#9A9AA6", textAlign: "center", marginTop: 16 },
});
