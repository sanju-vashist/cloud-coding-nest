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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [rememberMe, setRememberMe] = useState(() => {
    const remembered = localStorage.getItem('webOS_rememberMe');
    return remembered ? JSON.parse(remembered) : false;
  });

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

  useEffect(() => {
    localStorage.setItem('webOS_rememberMe', JSON.stringify(rememberMe));
  }, [rememberMe]);

  const handleLogin = (loggedInUsername: string) => {
    setUsername(loggedInUsername);
    setIsLoggedIn(true);
    
    // If remember me is not checked, we'll only keep the session until browser close
    if (!rememberMe) {
      sessionStorage.setItem('webOS_session', JSON.stringify({ username: loggedInUsername }));
    }
    
    toast({
      title: "Logged in successfully",
      description: `Welcome back, ${loggedInUsername}!`,
    });
  };

  const handleLogout = () => {
    if (!rememberMe) {
      localStorage.removeItem('webOS_user');
    }
    sessionStorage.removeItem('webOS_session');
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
          <Card className="w-full max-w-md p-6 shadow-xl backdrop-blur-sm bg-white/90 dark:bg-gray-800/90 border border-white/20">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold mb-1">WebOS</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Web-based Operating System</p>
            </div>
            
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <LoginForm onLogin={handleLogin} />
                
                <div className="flex items-center space-x-2 mt-4">
                  <Checkbox 
                    id="rememberMe" 
                    checked={rememberMe} 
                    onCheckedChange={(checked) => {
                      if (typeof checked === 'boolean') {
                        setRememberMe(checked);
                      }
                    }} 
                  />
                  <Label htmlFor="rememberMe" className="text-sm text-gray-500 cursor-pointer">
                    Remember me
                  </Label>
                </div>
              </TabsContent>
              
              <TabsContent value="signup">
                <SignupForm onSignupSuccess={() => toast({
                  title: "Account created",
                  description: "Your account has been created successfully. You can now log in.",
                })} />
              </TabsContent>
            </Tabs>
            
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-center text-gray-500">
                WebOS 2.0 - A fully functional web-based OS <br/>
                Running in your browser
              </p>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Index;
