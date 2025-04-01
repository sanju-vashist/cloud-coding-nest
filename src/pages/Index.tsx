
import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/toaster";
import Desktop from "@/components/Desktop";
import LoginForm from "@/components/LoginForm";
import SignupForm from "@/components/SignupForm";

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('webOS_user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUsername(userData.username);
        setIsLoggedIn(true);
      } catch (e) {
        localStorage.removeItem('webOS_user');
      }
    }
  }, []);

  const handleLogin = (loggedInUsername: string) => {
    setUsername(loggedInUsername);
    setIsLoggedIn(true);
    toast({
      title: "Logged in successfully",
      description: `Welcome back, ${loggedInUsername}!`,
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('webOS_user');
    setIsLoggedIn(false);
    setUsername('');
    toast({
      title: "Logged out",
      description: "You've been logged out successfully.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Toaster />
      
      {isLoggedIn ? (
        <Desktop username={username} onLogout={handleLogout} />
      ) : (
        <div className="flex items-center justify-center min-h-screen p-4">
          <Card className="w-full max-w-md p-6 shadow-xl">
            <h1 className="mb-6 text-2xl font-bold text-center">WebOS</h1>
            
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <LoginForm onLogin={handleLogin} />
              </TabsContent>
              
              <TabsContent value="signup">
                <SignupForm onSignupSuccess={() => toast({
                  title: "Account created",
                  description: "Your account has been created successfully. You can now log in.",
                })} />
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Index;
