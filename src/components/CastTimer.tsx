import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, MessageSquare, Users } from "lucide-react";
import { TabsList, TabsTrigger, TabsContent, Tabs } from "@/components/ui/tabs";
import sdk from "@farcaster/frame-sdk";

const CastTimer = () => {
  const [mode, setMode] = useState("focus"); // focus, thread, event
  const [minutes, setMinutes] = useState(25);
  const [isActive, setIsActive] = useState(false);
  const [context, setContext] = useState(null);

  useEffect(() => {
    const loadContext = async () => {
      const frameContext = await sdk.context;
      setContext(frameContext);
      sdk.actions.ready();
    };
    loadContext();
  }, []);

  const handleStartTimer = async () => {
    setIsActive(true);

    // If we have notification permissions, schedule one
    if (context?.client?.notificationDetails) {
      try {
        const notificationMessage = {
          focus: "Focus session complete! Share your achievement?",
          thread: "Time to check back on that conversation",
          event: "Your community event is starting soon!",
        }[mode];

        await fetch("/api/schedule-notification", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            minutes,
            message: notificationMessage,
            notificationDetails: context.client.notificationDetails,
            mode,
            castHash: context?.location?.cast?.hash, // For thread reminders
          }),
        });
      } catch (error) {
        console.error("Failed to schedule notification:", error);
      }
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          CastTimer
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="focus" onValueChange={setMode}>
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="focus">
              <Clock className="w-4 h-4 mr-2" />
              Focus
            </TabsTrigger>
            <TabsTrigger value="thread">
              <MessageSquare className="w-4 h-4 mr-2" />
              Thread
            </TabsTrigger>
            <TabsTrigger value="event">
              <Users className="w-4 h-4 mr-2" />
              Event
            </TabsTrigger>
          </TabsList>

          <TabsContent value="focus" className="mt-4">
            <div className="text-center">
              <h3 className="font-medium mb-2">Pomodoro Focus</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Focus for 25 minutes, then share your achievement
              </p>
              <Button
                onClick={() => handleStartTimer()}
                disabled={isActive}
                className="w-full"
              >
                Start Focus Session
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="thread" className="mt-4">
            <div className="text-center">
              <h3 className="font-medium mb-2">Thread Reminder</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Get notified to check back on this conversation
              </p>
              <Button
                onClick={() => handleStartTimer()}
                disabled={isActive || !context?.location?.cast?.hash}
                className="w-full"
              >
                Remind Me Later
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="event" className="mt-4">
            <div className="text-center">
              <h3 className="font-medium mb-2">Event Timer</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Set a countdown for community events
              </p>
              <Button
                onClick={() => handleStartTimer()}
                disabled={isActive}
                className="w-full"
              >
                Start Countdown
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {isActive && (
          <div className="mt-4 p-4 bg-secondary rounded-lg text-center">
            <p className="font-medium">Timer Active!</p>
            <p className="text-sm text-muted-foreground">
              We'll notify you when it's time
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CastTimer;
