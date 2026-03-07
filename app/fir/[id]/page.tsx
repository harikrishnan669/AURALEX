"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { doc, getDoc } from "firebase/firestore"
import { db, auth } from "@/lib/firebase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function FIRDetailsPage() {
    const { id } = useParams()
    const router = useRouter()
    const [fir, setFir] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchFIR = async () => {
            const currentUser = auth.currentUser
            if (!currentUser) {
                router.push("/login")
                return
            }
            const docRef = doc(db, "fir_documents", id as string)
            const docSnap = await getDoc(docRef)

            if (docSnap.exists()) {
                setFir(docSnap.data())
            } else {
                alert("FIR not found")
            }
            setLoading(false)
        }
        fetchFIR()
    }, [id])

    if (loading) return <p className="p-8">Loading...</p>

    if (!fir) return <p className="p-8">No FIR Found</p>

    return (
        <div className="max-w-4xl mx-auto p-8 space-y-6">

            <Button variant="outline" onClick={() => router.back()}>
                Back
            </Button>

            <Card>
                <CardHeader>
                    <CardTitle>{fir.firNumber}</CardTitle>
                </CardHeader>

                <CardContent className="space-y-4 text-sm">

                    <div>
                        <strong>Complainant:</strong> {fir.complainant}
                    </div>

                    <div>
                        <strong>Accused:</strong> {fir.accused}
                    </div>

                    <div>
                        <strong>Incident Type:</strong> {fir.incidentType}
                    </div>

                    <div>
                        <strong>Date & Time:</strong> {fir.dateTime}
                    </div>

                    <div>
                        <strong>Location:</strong> {fir.location}
                    </div>

                    <div>
                        <strong>Description:</strong>
                        <p className="mt-1">{fir.description}</p>
                    </div>

                    <div>
                        <strong>Legal Sections:</strong>
                        <ul className="list-disc ml-6 mt-2">
                            {fir.sections?.map((sec: string, index: number) => (
                                <li key={index}>{sec}</li>
                            ))}
                        </ul>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}