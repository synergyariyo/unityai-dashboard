import React from 'react';
import { X, Check, Crown, Zap, Star } from 'lucide-react';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handlePayment = (plan: string, amount: string) => {
    // In a real app, this would initialize Paystack Inline or redirect
    alert(`Redirecting to Paystack for ${plan} ($${amount})...`);
    window.open('https://paystack.com', '_blank');
  };

  const plans = [
    {
      name: 'Basic',
      price: '4',
      icon: Star,
      features: ['Standard Image Gen', 'Basic Scripting', '10 generations/day'],
      color: 'blue'
    },
    {
      name: 'Standard',
      price: '8',
      icon: Zap,
      features: ['Pro Image & Video', 'Unlimited Scripting', 'Priority Support', '50 generations/day'],
      color: 'indigo',
      popular: true
    },
    {
      name: 'Premium',
      price: '18',
      icon: Crown,
      features: ['4K Video Generation', 'Brand Kit Generator', 'Unlimited Access', 'Commercial License'],
      color: 'purple'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Upgrade to Pro</h2>
            <p className="text-slate-500 dark:text-slate-400">Unlock the full power of Unity AI.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <X className="w-6 h-6 text-slate-500" />
          </button>
        </div>

        <div className="p-8 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div 
                key={plan.name} 
                className={`relative rounded-2xl p-6 border-2 flex flex-col ${
                  plan.popular 
                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20 shadow-lg scale-105 z-10' 
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-300'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Most Popular
                  </div>
                )}
                
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                  plan.color === 'purple' ? 'bg-purple-100 text-purple-600' : 
                  plan.color === 'indigo' ? 'bg-indigo-100 text-indigo-600' : 
                  'bg-blue-100 text-blue-600'
                }`}>
                  <plan.icon className="w-6 h-6" />
                </div>

                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{plan.name}</h3>
                <div className="mt-2 mb-6">
                  <span className="text-3xl font-bold text-slate-900 dark:text-white">${plan.price}</span>
                  <span className="text-slate-500 dark:text-slate-400">/month</span>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feat, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                <button 
                  onClick={() => handlePayment(plan.name, plan.price)}
                  className={`w-full py-3 rounded-xl font-bold transition-all ${
                    plan.popular 
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none' 
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  Choose {plan.name}
                </button>
              </div>
            ))}
          </div>
        </div>
        
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 text-center text-xs text-slate-400">
           Secured by Paystack. Cancel anytime.
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;