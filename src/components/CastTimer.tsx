import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Clock, Bell } from "lucide-react";

const TIMER_OPTIONS = [
  { value: "1", label: "1 hour" },
  { value: "4", label: "4 hours" },
  { value: "8", label: "8 hours" },
  { value: "24", label: "24 hours" },
];

export default function CastTimer() {
  const [context, setContext] = useState(null);
  const [duration, setDuration] = useState("4");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeFrame = async () => {
      try {
        const frameContext = await sdk.context;
        setContext(frameContext);

        // Initialize the frame
        await sdk.actions.ready();
      } catch (err) {
        setError("Failed to initialize frame");
        console.error("Frame initialization error:", err);
      }
    };

    initializeFrame();
  }, []);

  const handleSetTimer = async () => {
    if (!context?.client?.notificationDetails) {
      // Prompt to enable notifications
      try {
        const result = await sdk.actions.addFrame();
        if (!result.notificationDetails) {
          setError("Please enable notifications to set timers");
          return;
        }
      } catch (err) {
        setError("Failed to enable notifications");
        return;
      }
    }

    setLoading(true);
    try {
      // Create timer
      await createTimer({
        duration: parseInt(duration),
        castHash: context?.location?.cast?.hash,
        fid: context?.user?.fid,
        notificationDetails: context?.client?.notificationDetails,
      });

      // Close frame with success message
      await sdk.actions.close({
        toast: {
          message: `Timer set! We'll remind you in ${duration} hours`,
        },
      });
    } catch (err) {
      setError("Failed to set timer");
    } finally {
      setLoading(false);
    }
  };

  // If not in cast context, show instruction
  if (context && context?.location?.type !== "cast_embed") {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <Alert>
            <AlertDescription>
              Launch this frame from a cast to set a reminder!
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          CastTimer
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              When should we remind you?
            </label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger>
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                {TIMER_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleSetTimer}
            disabled={loading || !context}
            className="w-full"
          >
            <Bell className="h-4 w-4 mr-2" />
            Set Timer
          </Button>

          {!context?.client?.notificationDetails && (
            <p className="text-xs text-muted-foreground text-center">
              Enable notifications to set timers
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Helper function to create timer (to be implemented)
async function createTimer({ duration, castHash, fid, notificationDetails }) {
  // This will be implemented in our API
  const response = await fetch("/api/timers/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      duration,
      castHash,
      fid,
      notificationDetails,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to create timer");
  }

  return response.json();
}
