'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Send, User, Bot, FileText, X } from 'lucide-react';
import { ProjectFile } from './ProjectNode';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  fileContext?: string;
}

interface ChatInterfaceProps {
  selectedFile: ProjectFile | null;
  onClose: () => void;
}

export function ChatInterface({ selectedFile, onClose }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input when file changes
  useEffect(() => {
    if (selectedFile && inputRef.current) {
      inputRef.current.focus();
    }
  }, [selectedFile]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Initialize chat when file is selected
  useEffect(() => {
    if (selectedFile) {
      const initialMessage: ChatMessage = {
        id: 'init-' + Date.now(),
        type: 'assistant',
        content: `Hi! I'm here to help you with **${selectedFile.name}**. 

This is a ${selectedFile.type} file located at \`${selectedFile.path}\`.

${selectedFile.description}

What would you like to modify or ask about this file?`,
        timestamp: new Date(),
        fileContext: selectedFile.path
      };
      
      setMessages([initialMessage]);
    }
  }, [selectedFile]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !selectedFile) return;

    const userMessage: ChatMessage = {
      id: 'user-' + Date.now(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
      fileContext: selectedFile.path
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Simulate AI response (in real implementation, this would call Claude API)
    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: 'assistant-' + Date.now(),
        type: 'assistant',
        content: generateMockResponse(inputValue, selectedFile),
        timestamp: new Date(),
        fileContext: selectedFile.path
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const generateMockResponse = (userInput: string, file: ProjectFile): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes('add') || input.includes('create')) {
      return `I'll help you add that to **${file.name}**. Here's what I can do:

1. **Add new functionality** to the ${file.type}
2. **Import required dependencies** 
3. **Update the component structure**
4. **Ensure proper TypeScript types**

Would you like me to proceed with implementing this change in \`${file.path}\`?`;
    }
    
    if (input.includes('fix') || input.includes('bug')) {
      return `I'll analyze **${file.name}** for potential issues:

🔍 **Reviewing**: \`${file.path}\`
🛠️ **Checking**: Dependencies, types, and logic
✅ **Ready to fix**: Any issues found

What specific behavior or error are you experiencing with this ${file.type}?`;
    }
    
    if (input.includes('explain') || input.includes('understand')) {
      return `Let me explain **${file.name}**:

📁 **File**: \`${file.path}\`
🏷️ **Type**: ${file.type}
📝 **Purpose**: ${file.description}

This ${file.type} is responsible for:
- Core functionality related to its type
- Integration with other components
- Maintaining proper state management

What specific part would you like me to dive deeper into?`;
    }
    
    if (input.includes('delete') || input.includes('remove')) {
      return `⚠️ **Careful!** You want to remove something from **${file.name}**.

I can help you:
- Remove specific functions or components
- Clean up unused imports
- Refactor code structure
- Update dependent files

What exactly would you like me to remove from \`${file.path}\`?`;
    }

    return `I understand you want to work on **${file.name}**. 

As your coding assistant, I can:
- ✏️ **Edit** the file directly
- 🔧 **Refactor** existing code  
- 🆕 **Add** new features
- 🐛 **Fix** bugs and issues
- 📚 **Explain** how the code works

Just tell me what specific changes you'd like me to make to \`${file.path}\` and I'll implement them for you!`;
  };

  if (!selectedFile) {
    return (
      <div className="w-96 bg-gray-50 border-l p-8 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">Select a file to start chatting</p>
          <p className="text-sm mt-2">Click on any component box to begin</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-96 bg-white border-l flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-blue-500" />
            <h3 className="font-semibold text-gray-900 truncate">
              {selectedFile.name}
            </h3>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="text-xs">
            {selectedFile.type}
          </Badge>
          <span className="text-xs text-gray-500 font-mono truncate">
            {selectedFile.path}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`
                  max-w-[80%] rounded-lg p-3 
                  ${message.type === 'user' 
                    ? 'bg-blue-500 text-white ml-4' 
                    : 'bg-gray-100 text-gray-900 mr-4'
                  }
                `}
              >
                <div className="flex items-start space-x-2">
                  {message.type === 'assistant' && (
                    <Bot className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  )}
                  {message.type === 'user' && (
                    <User className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <div className="prose prose-sm max-w-none">
                      {message.content.split('\n').map((line, i) => {
                        if (line.startsWith('**') && line.endsWith('**')) {
                          return <strong key={i}>{line.slice(2, -2)}</strong>;
                        }
                        if (line.startsWith('`') && line.endsWith('`')) {
                          return <code key={i} className="bg-gray-200 px-1 rounded text-xs">{line.slice(1, -1)}</code>;
                        }
                        return <p key={i}>{line}</p>;
                      })}
                    </div>
                    <div className="text-xs opacity-70 mt-2">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-900 rounded-lg p-3 mr-4">
                <div className="flex items-center space-x-2">
                  <Bot className="h-4 w-4" />
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-gray-50">
        <div className="flex space-x-2">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Ask about ${selectedFile.name}...`}
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={!inputValue.trim() || isLoading}
            size="sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <div className="text-xs text-gray-500 mt-2">
          Press Enter to send • Shift+Enter for new line
        </div>
      </div>
    </div>
  );
}