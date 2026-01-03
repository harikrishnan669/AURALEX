import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile,
    User,
    UserCredential,
} from "firebase/auth";

import {
    doc,
    setDoc,
    getDoc,
    collection,
    query,
    where,
    getDocs,
} from "firebase/firestore";

import { auth, db } from "./firebase";

export async function registerUser({
                                       email,
                                       password,
                                       username,
                                       name,
                                       role = "officer",
                                   }: {
    email: string;
    password: string;
    username: string;
    name?: string;
    role?: string;
}): Promise<User> {
    try {
        const cred: UserCredential = await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );

        if (name) {
            await updateProfile(cred.user, { displayName: name });
        }

        await setDoc(doc(db, "users", cred.user.uid), {
            uid: cred.user.uid,
            email,
            username,
            name: name || username,
            role,
            createdAt: new Date().toISOString(),
        });

        return cred.user;
    } catch (err: any) {
        throw new Error(err?.message || "Failed to register user");
    }
}

export async function loginWithEmailOrUsername(
    identifier: string,
    password: string
): Promise<User> {
    try {
        let email = identifier;
        if (typeof window === "undefined") {
            throw new Error("Login must run in browser only.");
        }

        if (!identifier.includes("@")) {
            const usersRef = collection(db, "users");
            const q = query(usersRef, where("username", "==", identifier));
            const snap = await getDocs(q);

            if (snap.empty) {
                throw new Error("No user found with that username");
            }

            const userData = snap.docs[0].data() as any;
            if (!userData.email) {
                throw new Error("User record missing email field");
            }

            email = userData.email;
        }

        const cred: UserCredential = await signInWithEmailAndPassword(
            auth,
            email,
            password
        );

        return cred.user;
    } catch (err: any) {
        throw new Error(err?.message || "Login failed");
    }
}

export async function logout(): Promise<void> {
    await signOut(auth);
    if (typeof window !== "undefined") {
        localStorage.removeItem("user");
        localStorage.removeItem("isAuthenticated");
    }
}

export function onAuthChanged(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
}

export async function getUserProfile(uid: string) {
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : null;
}
