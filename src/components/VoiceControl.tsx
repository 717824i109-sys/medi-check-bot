import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff } from 'lucide-react';
import { voiceAssistant } from '@/services/voiceAssistant';
import { toast } from 'sonner';

interface VoiceControlProps {
  onCommand: (command: string) => void;
}

const VoiceControl: React.FC<VoiceControlProps> = ({ onCommand }) => {
  const [isListening, setIsListening] = useState(false);

  const toggleListening = async () => {
    if (isListening) {
      voiceAssistant.stopListening();
      setIsListening(false);
      return;
    }

    if (!voiceAssistant.isSupported()) {
      toast.error('Voice recognition not supported', {
        description: 'Please use a modern browser like Chrome or Edge',
      });
      return;
    }

    setIsListening(true);
    toast.info('Listening...', {
      description: 'Say "scan medicine" or "analyze now"',
    });

    await voiceAssistant.listen(
      (transcript) => {
        console.log('Voice command:', transcript);
        toast.success('Command received', {
          description: transcript,
        });
        onCommand(transcript.toLowerCase());
        setIsListening(false);
      },
      (error) => {
        toast.error('Voice recognition error', {
          description: error,
        });
        setIsListening(false);
      }
    );
  };

  return (
    <Button
      onClick={toggleListening}
      variant={isListening ? 'default' : 'outline'}
      size="icon"
      className={`fixed top-20 right-4 z-50 rounded-full shadow-lg ${
        isListening ? 'animate-pulse' : ''
      }`}
      title={isListening ? 'Stop listening' : 'Start voice command'}
    >
      {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
    </Button>
  );
};

export default VoiceControl;
