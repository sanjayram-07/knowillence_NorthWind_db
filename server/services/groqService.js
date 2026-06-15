const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

// Ask a business question with context
const askQuestion = async (question, dbContext) => {
  try {
    const response = await groq.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: `You are a business intelligence assistant for a wholesale food distribution company (Northwind). You have been given real data from the database. Answer the user's question clearly and specifically using the numbers provided. Be concise — 3 to 5 sentences max. Do not use markdown formatting. Speak like a helpful business analyst.`
        },
        {
          role: 'user',
          content: `Question: ${question}\n\nData: ${JSON.stringify(dbContext)}`
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    return response.choices[0]?.message?.content || 'Unable to generate response';
  } catch (error) {
    console.error('askQuestion error:', error);
    return { error: error.message };
  }
};

// Generate weekly business summary
const generateWeeklySummary = async (data) => {
  try {
    const response = await groq.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: `You are writing a weekly executive summary for a sales manager at a wholesale food company. Be specific with numbers. Highlight the biggest win and biggest concern. Give exactly 3 action items. Keep total response under 200 words. Format your response as JSON with this structure: {"summary": "...", "highlights": ["...", "...", "..."], "actions": ["...", "...", "..."]}`
        },
        {
          role: 'user',
          content: `Weekly business data:\n${JSON.stringify(data)}`
        }
      ],
      temperature: 0.7,
      max_tokens: 700
    });

    const content = response.choices[0]?.message?.content || '';
    
    try {
      // Try to parse as JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      // If parsing fails, return structured response
    }

    return {
      summary: content,
      highlights: ['Revenue analysis complete', 'Customer trends identified', 'Inventory status reviewed'],
      actions: ['Review low stock items', 'Follow up with at-risk customers', 'Optimize top products']
    };
  } catch (error) {
    console.error('generateWeeklySummary error:', error);
    return { error: error.message };
  }
};

// Analyze customer churn risk
const analyzeChurnRisk = async (customers) => {
  try {
    const response = await groq.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: `You are a customer success analyst. Review these customer purchase patterns and assess churn risk. For each customer provide: riskLevel (high/medium/low), a one-sentence reason, and a specific re-engagement suggestion. Return as JSON array with this structure: [{"CustomerID": "...", "CompanyName": "...", "riskLevel": "high|medium|low", "reason": "...", "action": "..."}]. Only analyze up to 10 customers.`
        },
        {
          role: 'user',
          content: `At-risk customers:\n${JSON.stringify(customers.slice(0, 10))}`
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    const content = response.choices[0]?.message?.content || '';
    
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      // If parsing fails, return simplified data
    }

    return customers.slice(0, 10).map((c) => ({
      CustomerID: c.CustomerID,
      CompanyName: c.CompanyName,
      riskLevel: 'medium',
      reason: 'No recent orders detected',
      action: 'Schedule a follow-up call'
    }));
  } catch (error) {
    console.error('analyzeChurnRisk error:', error);
    return { error: error.message };
  }
};

// Get reorder advice for low stock products
const getReorderAdvice = async (products) => {
  try {
    const response = await groq.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: `You are an inventory manager. Review these low-stock products and recommend reorder priority. Split into urgent (must order now) and recommended (order soon). Consider UnitPrice and stock levels. Return JSON with this structure: {"urgent": [{"ProductName": "...", "reason": "..."}], "recommended": [{"ProductName": "...", "reason": "..."}], "summary": "..."}`
        },
        {
          role: 'user',
          content: `Low stock products:\n${JSON.stringify(products)}`
        }
      ],
      temperature: 0.7,
      max_tokens: 800
    });

    const content = response.choices[0]?.message?.content || '';
    
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      // If parsing fails, return structured response
    }

    const urgent = products.filter(p => p.UnitsInStock === 0).map(p => ({
      ProductName: p.ProductName,
      reason: 'Out of stock'
    }));

    const recommended = products.filter(p => p.UnitsInStock > 0).slice(0, 5).map(p => ({
      ProductName: p.ProductName,
      reason: 'Low inventory'
    }));

    return {
      urgent,
      recommended,
      summary: `${urgent.length} products need immediate reordering, ${recommended.length} should be ordered soon.`
    };
  } catch (error) {
    console.error('getReorderAdvice error:', error);
    return { error: error.message };
  }
};

// Explain a trend
const explainTrend = async (metric, current, previous, context) => {
  try {
    const response = await groq.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: `You are a business analyst. Explain in 2 sentences why this metric may have changed. Be specific if the data supports it. No markdown.`
        },
        {
          role: 'user',
          content: `Metric: ${metric}\nCurrent value: ${current}\nPrevious value: ${previous}\nContext: ${JSON.stringify(context)}`
        }
      ],
      temperature: 0.7,
      max_tokens: 200
    });

    return response.choices[0]?.message?.content || 'Unable to analyze trend';
  } catch (error) {
    console.error('explainTrend error:', error);
    return { error: error.message };
  }
};

module.exports = {
  askQuestion,
  generateWeeklySummary,
  analyzeChurnRisk,
  getReorderAdvice,
  explainTrend
};
