import { createUserWithEmailAndPassword, onAuthStateChanged, sendPasswordResetEmail, signInWithEmailAndPassword, signOut, updateProfile, User } from "firebase/auth";
import { auth } from "../config/firebaseConfig";

export interface AuthResult {
    success: boolean;
    user?: User;
    error?: string;
}

export const authService = {
    signUp: async (email: string, password: string, displayName?: string): Promise<AuthResult> => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);

            if (displayName) {
                await updateProfile(userCredential.user, { displayName });
            }

            return { success: true, user: userCredential.user };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    },

    signIn: async (email: string, password: string): Promise<AuthResult> => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            return { success: true, user: userCredential.user };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    },

    signOut: async (): Promise<AuthResult> => {
        try {
            await signOut(auth);
            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    },

    resetPassword: async (email: string): Promise<AuthResult> => {
        try {
            await sendPasswordResetEmail(auth, email);
            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    },

    getCurrentUser: (): User | null => {
        return auth.currentUser;
    },

    onAuthStateChanged: (callback: (user: User | null) => void) => {
        return onAuthStateChanged(auth, callback);
    }
}