
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";

interface LoginFormProps {
  onLogin: (username: string) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check for saved credentials
  useEffect(() => {
    const savedUsername = localStorage.getItem('webOS_rememberUsername');
    if (savedUsername) {
      setUsername(savedUsername);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simple client-side authentication (in a real app, this would be server-side)
    const users = JSON.parse(localStorage.getItem('webOS_users') || '[]');
    const user = users.find((u: any) => u.username === username && u.password === password);

    setTimeout(() => {
      setIsLoading(false);
      
      if (user) {
        // Store logged in user (excluding password)
        localStorage.setItem('webOS_user', JSON.stringify({ 
          username: user.username,
          id: user.id
        }));
        
        // Handle "Remember me"
        if (rememberMe) {
          localStorage.setItem('webOS_rememberUsername', username);
        } else {
          localStorage.removeItem('webOS_rememberUsername');
        }
        
        onLogin(user.username);
        
        toast({
          title: "Login successful",
          description: `Welcome back, ${user.username}!`,
        });
      } else {
        toast({
          title: "Login failed",
          description: "Invalid username or password",
          variant: "destructive"
        });
      }
    }, 1000); // Simulated delay
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          type="text"
          placeholder="Enter your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="dark:bg-gray-800"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="dark:bg-gray-800"
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="remember" 
          checked={rememberMe} 
          onCheckedChange={(checked) => setRememberMe(checked === true)}
        />
        <Label htmlFor="remember" className="cursor-pointer text-sm">Remember me</Label>
      </div>
      
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Logging in..." : "Login"}
      </Button>
    </form>
  );
};

export default LoginForm;
