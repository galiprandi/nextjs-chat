"use client";

import { useState, useRef, useEffect } from "react";
import { GenerateAgeAppropriateResponseOutput, generateAgeAppropriateResponse } from "@/ai/flows/generate-age-appropriate-response";
import { summarizeChatHistory } from "@/ai/flows/summarize-chat-history";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

const MAX_WORDS_PER_DAY = 500000;

const ChatMessage = ({ message, isUser }: { message: string; isUser: boolean }) => (
  <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
    <Card className={`w-fit max-w-[80%] ${isUser ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
      <CardContent className="p-3">
        {message}
      </CardContent>
    </Card>
  </div>
);

export default function Chat() {
  const [messages, setMessages] = useState<Array<{ text: string; isUser: boolean }>>([]);
  const [input, setInput] = useState("");
  const [childAge, setChildAge] = useState<number | undefined>(undefined);
  const [wordCount, setWordCount] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const ageInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    chatContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const currentWordCount = input.split(/\s+/).length;
    if (wordCount + currentWordCount > MAX_WORDS_PER_DAY) {
      toast({
        title: "Word Limit Exceeded",
        description: `You've reached your daily word limit.  ${wordCount}/${MAX_WORDS_PER_DAY}`,
        variant: "destructive",
      });
      return;
    }

    const userMessage = { text: input, isUser: true };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput("");
    setWordCount(prevCount => prevCount + currentWordCount);
    setIsGenerating(true);

    try {
      const aiResponse: GenerateAgeAppropriateResponseOutput = await generateAgeAppropriateResponse({
        message: input,
        childAge: childAge,
      });

      const aiMessage = { text: aiResponse.response, isUser: false };
      setMessages(prevMessages => [...prevMessages, aiMessage]);
      setWordCount(prevCount => prevCount + aiMessage.text.split(/\s+/).length);

      //Basic summarization example
      if (messages.length > 5){
        const chatHistory = messages.map(m => `${m.isUser ? "User" : "AI"}: ${m.text}`).join("\n");
        const summary = await summarizeChatHistory({chatHistory: chatHistory, childName: "Kid"});
        toast({
          title: "Chat Summary",
          description: summary.summary,
        });
      }

    } catch (error: any) {
      toast({
        title: "AI Response Error",
        description: error.message || "Failed to generate age-appropriate response.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAgeSubmit = (e: any) => {
    e.preventDefault();
    const ageValue = ageInputRef.current?.value;
    if (ageValue) {
      setChildAge(parseInt(ageValue));
      toast({
        title: "Age Set",
        description: `AI responses will now be tailored for a ${ageValue} year old.`,
      });
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <header className="p-4 border-b border-border">
        <h1 className="text-2xl font-semibold">NextChat Kids</h1>
        <p className="text-sm text-muted-foreground">Safe &amp; fun AI conversations for kids.</p>
      </header>

      <main className="flex-1 p-4">
        <form onSubmit={handleAgeSubmit} className="mb-4 flex items-center space-x-2">
          <Input
            type="number"
            placeholder="Set Child's Age"
            className="w-32 text-sm"
            min="3"
            max="12"
            ref={ageInputRef}
          />
          <Button type="submit" variant="outline" size="sm">
            Set Age
          </Button>
          {childAge && <span className="text-sm text-muted-foreground">Current Age: {childAge}</span>}
        </form>

        <ScrollArea className="h-[calc(100vh - 250px)] mb-4">
          <div className="flex flex-col space-y-2 p-2" ref={chatContainerRef}>
            {messages.map((message, index) => (
              <ChatMessage key={index} message={message.text} isUser={message.isUser} />
            ))}
            {isGenerating && (
              <div className="flex w-full justify-start">
                <Card className="w-fit max-w-[80%] bg-secondary text-secondary-foreground">
                  <CardContent className="p-3">
                    <Skeleton className="w-40 h-4" />
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="border-t border-border pt-4">
          <div className="flex items-end space-x-2">
            <Textarea
              placeholder="Type your message..."
              className="flex-1 resize-none"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />
            <Button onClick={sendMessage} disabled={isGenerating}>
              Send
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {wordCount}/{MAX_WORDS_PER_DAY} words used today. Press Shift + Enter for a new line.
          </p>
        </div>
      </main>

      <footer className="p-4 border-t border-border text-center text-muted-foreground text-sm">
        Powered by Vercel AI SDK &amp; Firebase Studio
      </footer>
    </div>
  );
}
