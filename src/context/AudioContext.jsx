import { createContext, useContext } from "react";

export const AudioContext = createContext();

export function useAudio() {
    const context = useContext(AudioContext);
    if (!context) {
        throw new Error("useAudio doit être utilisé à l'intérieur d'un AudioProvider");
    }
    return context;
}
