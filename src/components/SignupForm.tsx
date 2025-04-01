
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

interface SignupFormProps {
  onSignupSuccess: () => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ onSignupSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    // Get existing users or initialize empty array
    const existingUsers = JSON.parse(localStorage.getItem('webOS_users') || '[]');
    
    // Check if username already exists
    if (existingUsers.some((user: any) => user.username === username)) {
      setIsLoading(false);
      toast({
        title: "Username already exists",
        description: "Please choose a different username",
        variant: "destructive"
      });
      return;
    }
    
    // Create new user
    const newUser = {
      id: Date.now().toString(),
      username,
      password,
      files: [],
      settings: {
        theme: 'light',
        wallpaper: 'default'
      }
    };
    
    // Add to users list
    existingUsers.push(newUser);
    
    setTimeout(() => {
      // Save back to localStorage
      localStorage.setItem('webOS_users', JSON.stringify(existingUsers));
      
      // Create user directory
      const fileSystem = JSON.parse(localStorage.getItem('webOS_fileSystem') || '{}');
      fileSystem[newUser.id] = {
        'Documents': [],
        'Pictures': [],
        'Music': [],
        'Desktop': []
      };
      localStorage.setItem('webOS_fileSystem', JSON.stringify(fileSystem));
      
      setIsLoading(false);
      setUsername('');
      setPassword('');
      setConfirmPassword('');
      
      onSignupSuccess();
    }, 1000); // Simulated delay
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="signup-username">Username</Label>
        <Input
          id="signup-username"
          type="text"
          placeholder="Choose a username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="signup-password">Password</Label>
        <Input
          id="signup-password"
          type="password"
          placeholder="Choose a password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="confirm-password">Confirm Password</Label>
        <Input
          id="confirm-password"
          type="password"
          placeholder="Confirm your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </div>
      
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Creating Account..." : "Sign Up"}
      </Button>
    </form>
  );
};

export default SignupForm;
