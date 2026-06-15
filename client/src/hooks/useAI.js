import { useState, useCallback } from 'react';
import aiService from '../services/aiService';

export function useAI() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [weeklySummary, setWeeklySummary] = useState(null);
  const [churnData, setChurnData] = useState(null);
  const [reorderData, setReorderData] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [churnLoading, setChurnLoading] = useState(false);
  const [reorderLoading, setReorderLoading] = useState(false);

  const sendMessage = useCallback(async (question) => {
    const userMessage = { role: 'user', content: question, timestamp: Date.now() };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const res = await aiService.askQuestion(question);
      const aiMessage = { 
        role: 'assistant', 
        content: res.data?.answer || 'I could not generate a response.',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      const errorMessage = { 
        role: 'assistant', 
        content: `Sorry, I encountered an error: ${err.message}`,
        timestamp: Date.now(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadWeeklySummary = useCallback(async () => {
    try {
      setSummaryLoading(true);
      const res = await aiService.getWeeklySummary();
      setWeeklySummary(res.data);
    } catch (err) {
      console.error('Failed to load weekly summary:', err);
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  const loadChurnAnalysis = useCallback(async () => {
    try {
      setChurnLoading(true);
      const res = await aiService.getChurnAnalysis();
      setChurnData(res.data);
    } catch (err) {
      console.error('Failed to load churn analysis:', err);
    } finally {
      setChurnLoading(false);
    }
  }, []);

  const loadReorderAdvice = useCallback(async () => {
    try {
      setReorderLoading(true);
      const res = await aiService.getReorderAdvice();
      setReorderData(res.data);
    } catch (err) {
      console.error('Failed to load reorder advice:', err);
    } finally {
      setReorderLoading(false);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isLoading,
    weeklySummary,
    churnData,
    reorderData,
    summaryLoading,
    churnLoading,
    reorderLoading,
    sendMessage,
    loadWeeklySummary,
    loadChurnAnalysis,
    loadReorderAdvice,
    clearMessages
  };
}

export default useAI;
