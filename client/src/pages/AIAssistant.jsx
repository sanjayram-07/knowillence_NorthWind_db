import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  Send,
  RefreshCw,
  ChevronDown,
  Sparkles,
  AlertTriangle,
  Package,
  TrendingUp,
  Users,
  BarChart3,
  Globe,
  MessageSquare,
  Loader2
} from 'lucide-react';
import useAI from '../hooks/useAI';

const suggestedQuestions = [
  { icon: TrendingUp, text: 'What is our total revenue this quarter?', color: 'indigo' },
  { icon: AlertTriangle, text: 'Which customers are at risk of churning?', color: 'amber' },
  { icon: Package, text: 'Which products need urgent reordering?', color: 'rose' },
  { icon: Globe, text: 'Which country generates the most revenue?', color: 'emerald' },
  { icon: Users, text: 'Who are our top 10 customers by spend?', color: 'blue' },
  { icon: BarChart3, text: 'What are the best selling product categories?', color: 'purple' }
];

const colorClasses = {
  indigo: 'bg-primary-50 text-primary-600 border-primary-200 hover:bg-primary-100',
  amber: 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100',
  rose: 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100',
  emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100',
  blue: 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100',
  purple: 'bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100'
};

export default function AIAssistant() {
  const {
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
  } = useAI();

  const [input, setInput] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    summary: true,
    churn: false,
    reorder: false
  });

  useEffect(() => {
    loadWeeklySummary();
  }, [loadWeeklySummary]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input);
    setInput('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const getRiskColor = (level) => {
    const colors = {
      high: 'bg-red-100 text-red-700',
      medium: 'bg-amber-100 text-amber-700',
      low: 'bg-green-100 text-green-700'
    };
    return colors[level] || colors.medium;
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-112px)]">
      {/* Left Panel - Chat */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex-[3] flex flex-col bg-white rounded-2xl shadow-sm overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/25">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">Ask Anything</h2>
              <p className="text-xs text-slate-500">Powered by Groq AI</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={clearMessages}
            className="text-sm text-slate-500 hover:text-slate-700"
          >
            Clear chat
          </motion.button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mb-4"
              >
                <Sparkles className="w-8 h-8 text-primary-500" />
              </motion.div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                How can I help you today?
              </h3>
              <p className="text-sm text-slate-500 mb-6 text-center max-w-md">
                Ask me anything about your sales, customers, products, or business performance.
              </p>
              <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
                {suggestedQuestions.map((q, i) => {
                  const Icon = q.icon;
                  return (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => sendMessage(q.text)}
                      className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-colors ${colorClasses[q.color]}`}
                    >
                      <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{q.text}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          ) : (
            <AnimatePresence>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      msg.role === 'user'
                        ? 'bg-primary-600 text-white rounded-br-md'
                        : 'bg-slate-100 text-slate-900 rounded-bl-md'
                    } ${msg.isError ? 'bg-red-100 text-red-700' : ''}`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="flex items-center gap-1.5 mb-1">
                        <Bot className="w-3 h-3 text-primary-500" />
                        <span className="text-xs font-medium text-primary-600">AI</span>
                      </div>
                    )}
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-slate-100 rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-primary-400 rounded-full typing-dot" />
                        <span className="w-2 h-2 bg-primary-400 rounded-full typing-dot" />
                        <span className="w-2 h-2 bg-primary-400 rounded-full typing-dot" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about sales, customers, products..."
              className="flex-1 px-4 py-3 bg-slate-50 rounded-xl border-0 focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all text-sm"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="w-12 h-12 rounded-xl bg-primary-600 hover:bg-primary-700 disabled:bg-slate-200 flex items-center justify-center transition-colors shadow-lg shadow-primary-500/25 disabled:shadow-none"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              ) : (
                <Send className="w-5 h-5 text-white" />
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Right Panel - Insights */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex-[2] space-y-4 overflow-y-auto"
      >
        {/* Weekly Summary */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <button
            onClick={() => toggleSection('summary')}
            className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-primary-600" />
              </div>
              <span className="font-semibold text-slate-900">Weekly Business Summary</span>
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.1, rotate: 180 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => { e.stopPropagation(); loadWeeklySummary(); }}
                className="p-1.5 rounded-lg hover:bg-slate-100"
              >
                <RefreshCw className={`w-4 h-4 text-slate-400 ${summaryLoading ? 'animate-spin' : ''}`} />
              </motion.button>
              <motion.div animate={{ rotate: expandedSections.summary ? 180 : 0 }}>
                <ChevronDown className="w-5 h-5 text-slate-400" />
              </motion.div>
            </div>
          </button>
          <AnimatePresence>
            {expandedSections.summary && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 pt-0">
                  {summaryLoading ? (
                    <div className="space-y-2">
                      <div className="skeleton h-4 w-full rounded" />
                      <div className="skeleton h-4 w-3/4 rounded" />
                      <div className="skeleton h-4 w-5/6 rounded" />
                    </div>
                  ) : weeklySummary ? (
                    <div className="space-y-4">
                      <p className="text-sm text-slate-600 leading-relaxed">{weeklySummary.summary}</p>
                      {weeklySummary.highlights?.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Key Highlights</p>
                          <ul className="space-y-1.5">
                            {weeklySummary.highlights.map((h, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-1.5" />
                                {h}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {weeklySummary.actions?.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Recommended Actions</p>
                          <ul className="space-y-1.5">
                            {weeklySummary.actions.map((a, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5" />
                                {a}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400">Click refresh to load summary</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Churn Analysis */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <button
            onClick={() => toggleSection('churn')}
            className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              </div>
              <span className="font-semibold text-slate-900">Customer Churn Alerts</span>
            </div>
            <motion.div animate={{ rotate: expandedSections.churn ? 180 : 0 }}>
              <ChevronDown className="w-5 h-5 text-slate-400" />
            </motion.div>
          </button>
          <AnimatePresence>
            {expandedSections.churn && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 pt-0">
                  {!churnData && !churnLoading ? (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={loadChurnAnalysis}
                      className="w-full py-2 bg-amber-50 text-amber-700 rounded-xl text-sm font-medium hover:bg-amber-100 transition-colors"
                    >
                      Load Churn Analysis
                    </motion.button>
                  ) : churnLoading ? (
                    <div className="space-y-2">
                      <div className="skeleton h-16 rounded-xl" />
                      <div className="skeleton h-16 rounded-xl" />
                    </div>
                  ) : churnData?.length > 0 ? (
                    <div className="space-y-3">
                      {churnData.slice(0, 5).map((c, i) => (
                        <div key={i} className="p-3 bg-slate-50 rounded-xl">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-slate-900">{c.CompanyName}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getRiskColor(c.riskLevel)}`}>
                              {c.riskLevel}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">{c.reason}</p>
                          <p className="text-xs text-primary-600 italic mt-1">{c.action}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400">No at-risk customers found</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Reorder Advice */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <button
            onClick={() => toggleSection('reorder')}
            className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center">
                <Package className="w-4 h-4 text-rose-600" />
              </div>
              <span className="font-semibold text-slate-900">Reorder Advice</span>
            </div>
            <motion.div animate={{ rotate: expandedSections.reorder ? 180 : 0 }}>
              <ChevronDown className="w-5 h-5 text-slate-400" />
            </motion.div>
          </button>
          <AnimatePresence>
            {expandedSections.reorder && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 pt-0">
                  {!reorderData && !reorderLoading ? (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={loadReorderAdvice}
                      className="w-full py-2 bg-rose-50 text-rose-700 rounded-xl text-sm font-medium hover:bg-rose-100 transition-colors"
                    >
                      Load Reorder Advice
                    </motion.button>
                  ) : reorderLoading ? (
                    <div className="space-y-2">
                      <div className="skeleton h-10 rounded-xl" />
                      <div className="skeleton h-10 rounded-xl" />
                    </div>
                  ) : reorderData ? (
                    <div className="space-y-3">
                      {reorderData.urgent?.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-2">Urgent</p>
                          <div className="space-y-1">
                            {reorderData.urgent.map((p, i) => (
                              <div key={i} className="flex items-center gap-2 p-2 bg-red-50 rounded-lg">
                                <span className="w-2 h-2 rounded-full bg-red-500" />
                                <span className="text-sm text-slate-700">{p.ProductName}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {reorderData.recommended?.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-2">Recommended</p>
                          <div className="space-y-1">
                            {reorderData.recommended.slice(0, 3).map((p, i) => (
                              <div key={i} className="flex items-center gap-2 p-2 bg-amber-50 rounded-lg">
                                <span className="w-2 h-2 rounded-full bg-amber-500" />
                                <span className="text-sm text-slate-700">{p.ProductName}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {reorderData.summary && (
                        <p className="text-xs text-slate-500 mt-2">{reorderData.summary}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400">No reorder advice available</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
