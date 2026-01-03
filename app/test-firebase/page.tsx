"use client";

import { useEffect } from "react";
import { auth } from "@/lib/firebase";

export default function TestFirebasePage() {
    useEffect(() => {
        console.log("TEST: firebase auth object:", auth);
        console.log("TEST: auth.currentUser:", auth.currentUser);
        console.log("TEST: NEXT_PUBLIC_FIREBASE_PROJECT_ID:", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
    }, []);

    return <div style={{padding:20,color:"#fff"}}>Open the browser console to see Firebase debug logs.</div>;
}
