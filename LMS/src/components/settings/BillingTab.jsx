import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, AlertCircle, CreditCard, History, Loader2, ExternalLink, PartyPopper, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

// Helper to load PayPal script dynamically
const loadPayPalScript = (clientId) => {
  return new Promise((resolve, reject) => {
    // 1. Check if EXACT script exists
    const exactScript = document.querySelector(`script[src*="client-id=${clientId}"]`);
    if (exactScript && window.paypal) {
      resolve(window.paypal);
      return;
    }

    // 2. Check for conflicting scripts
    const anyPayPalScript = document.querySelector('script[src*="paypal.com/sdk/js"]');
    if (anyPayPalScript) {
        // Only remove if it's a different client ID
        if (!anyPayPalScript.src.includes(`client-id=${clientId}`)) {
            console.log("Reloading PayPal script due to client ID change");
            anyPayPalScript.remove();
            if (window.paypal) delete window.paypal;
        } else if (window.paypal) {
            resolve(window.paypal);
            return;
        }
    }

    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=ILS&intent=capture`;
    script.async = true;
    script.onload = () => resolve(window.paypal);
    script.onerror = (err) => {
        console.error("PayPal Script Load Error:", err);
        reject(err);
    };
    document.body.appendChild(script);
  });
};

export default function BillingTab({ organization, isLoading }) {
  const queryClient = useQueryClient();
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [purchasedPlanName, setPurchasedPlanName] = useState('');
  const [sendingReceiptId, setSendingReceiptId] = useState(null);

  const sendReceiptMutation = useMutation({
      mutationFn: async (paymentId) => {
          return base44.functions.invoke('sendPaymentReceipt', { paymentId });
      },
      onSuccess: () => {
          toast.success('הקבלה נשלחה לאימייל שלך בהצלחה');
          setSendingReceiptId(null);
      },
      onError: () => {
          toast.error('שגיאה בשליחת הקבלה');
          setSendingReceiptId(null);
      }
  });

  const handleSendReceipt = (paymentId) => {
      setSendingReceiptId(paymentId);
      sendReceiptMutation.mutate(paymentId);
  };

  const activateFreePlanMutation = useMutation({
    mutationFn: async (planId) => {
        return base44.functions.invoke('paypal', { 
            action: 'activateFree',
            planId: planId
        });
    },
    onSuccess: (res) => {
        if (res.data.error) {
            toast.error(res.data.error);
            return;
        }
        queryClient.invalidateQueries({ queryKey: ['myOrganization'] });
        toast.success('התוכנית הופעלה בהצלחה');
        setShowSuccessDialog(true);
    },
    onError: () => {
        toast.error('שגיאה בהפעלת התוכנית');
    }
  });

  // Fetch PayPal Config from backend using useQuery
  const { data: paypalConfig } = useQuery({
    queryKey: ['paypalConfig'],
    queryFn: async () => {
        const res = await base44.functions.invoke('paypal', { action: 'getConfig' });
        return res.data;
    },
    staleTime: 0, // Always fetch fresh config
    refetchOnWindowFocus: true
  });

  // Load script when config is available
  useEffect(() => {
    if (paypalConfig?.clientId) {
      setPaypalLoaded(false); // Reset while loading
      loadPayPalScript(paypalConfig.clientId)
        .then(() => setPaypalLoaded(true))
        .catch(e => {
             console.error("PayPal Script Load Error", e);
             toast.error("שגיאה בטעינת רכיב התשלום");
        });
    }
  }, [paypalConfig?.clientId]);

  // Fetch available plans
  const { data: plans, isLoading: plansLoading } = useQuery({
    queryKey: ['plans'],
    queryFn: () => base44.entities.SubscriptionPlan.filter({ active: true }),
    staleTime: 1000 * 60 * 5, // Keep fresh for 5 minutes to prevent re-renders during payment
  });

  // Fetch payment history
  const { data: payments } = useQuery({
    queryKey: ['payments', organization?.id],
    queryFn: () => base44.entities.Payment.filter({ organization_id: organization?.id }, '-date'),
    enabled: !!organization?.id
  });

  // Fetch current plan details
  const { data: currentPlan } = useQuery({
    queryKey: ['plan', organization?.plan_id],
    queryFn: () => organization?.plan_id ? base44.entities.SubscriptionPlan.get(organization.plan_id) : null,
    enabled: !!organization?.plan_id
  });

  const renderPayPalButton = (plan) => {
      if (!paypalLoaded || !window.paypal) return null;
      
      const ButtonComponent = window.paypal.Buttons.driver('react', { React, ReactDOM: window.ReactDOM });
      // Since we are not using react-paypal-js package, we use direct DOM rendering or basic container logic.
      // But standard way without package is to render into a div ref.
      
      return (
        <PayPalButtonContainer 
            plan={plan} 
            onSuccess={() => {
                queryClient.invalidateQueries({ queryKey: ['myOrganization'] });
                queryClient.invalidateQueries({ queryKey: ['payments'] });
                setPurchasedPlanName(plan.name);
                setShowSuccessDialog(true);
                setSelectedPlanId(null);
            }} 
        />
      );
  };

  if (plansLoading || isLoading || !organization) {
    return (
      <div className="p-8 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-violet-600" />
        <p className="text-sm text-slate-500 mt-2">טוען נתוני תשלומים...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Current Subscription Status */}
      <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-0">
        <CardContent className="pt-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 mb-1">תוכנית נוכחית</p>
              <h2 className="text-3xl font-bold mb-2">{currentPlan?.name || 'ללא תוכנית פעילה'}</h2>
              <div className="flex items-center gap-2">
                <Badge className={
                  organization.subscription_status === 'active' ? 'bg-green-500 hover:bg-green-600' : 
                  organization.subscription_status === 'past_due' ? 'bg-red-500 hover:bg-red-600' : 'bg-slate-600'
                }>
                  {organization.subscription_status === 'active' ? 'פעיל' : 
                   organization.subscription_status === 'past_due' ? 'חוב לתשלום' : 'לא פעיל/ניסיון'}
                </Badge>
                {organization.current_period_end && (
                  <span className="text-sm text-slate-300">
                    בתוקף עד: {format(new Date(organization.current_period_end), 'dd/MM/yyyy')}
                  </span>
                )}
              </div>
              
              <div className="mt-4 p-3 bg-white/10 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-slate-200">שימוש בחבילת SMS</span>
                  <span className="text-sm font-bold">
                    {organization.sms_usage || 0} / {currentPlan?.max_sms > 0 ? currentPlan.max_sms : '∞'}
                  </span>
                </div>
                <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${
                      (organization.sms_usage / (currentPlan?.max_sms || 1)) > 0.9 ? 'bg-red-500' : 
                      (organization.sms_usage / (currentPlan?.max_sms || 1)) > 0.7 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(((organization.sms_usage || 0) / (currentPlan?.max_sms || 1)) * 100, 100)}%` }}
                  />
                </div>
              </div>

            </div>
            <div className="text-right">
              <p className="text-slate-400 text-sm mb-1">אמצעי תשלום</p>
              <div className="flex items-center gap-2 text-white bg-white/10 px-3 py-1.5 rounded-full">
                <span className="font-bold italic">PayPal</span>
                <span className="text-sm border-r border-white/20 pr-2 mr-2">{organization.billing_email}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plans Selection */}
      <div>
        <h3 className="text-xl font-bold text-slate-900 mb-4">שדרוג חבילה</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans?.map((plan) => {
            const isCurrent = organization.plan_id === plan.id;
            const isSelected = selectedPlanId === plan.id;
            const price = Number(plan.price);
            const isFree = price === 0;

            const isDisabled = !isFree && price < 2;

            return (
              <Card 
                key={plan.id} 
                className={`relative transition-all flex flex-col ${
                  isCurrent ? 'border-violet-500 bg-violet-50/50 shadow-md' : 
                  isDisabled ? 'opacity-50 cursor-not-allowed border-slate-100' :
                  'hover:border-violet-300 hover:shadow-lg'
                }`}
                onClick={(e) => {
                    if (isDisabled && !isCurrent) {
                        e.preventDefault();
                        toast.error("סכום המינימום לתשלום הוא 2 ₪");
                    }
                }}
              >
                {isCurrent && (
                  <div className="absolute top-0 right-0 bg-violet-500 text-white text-xs px-2 py-1 rounded-bl-lg rounded-tr-lg">
                    נוכחי
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-2">
                    <span className="text-3xl font-bold">₪{plan.price}</span>
                    <span className="text-slate-500"> / {plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-2 text-sm">
                    {plan.features?.split('\n').filter(f => f.trim()).map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                        <span className="text-slate-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="flex-col gap-2 mt-auto">
                    {isSelected ? (
                        <div className="w-full">
                             {paypalLoaded ? (
                                 <PayPalButtonContainer plan={plan} onSuccess={() => {
                                    queryClient.invalidateQueries({ queryKey: ['myOrganization'] });
                                    queryClient.invalidateQueries({ queryKey: ['payments'] });
                                    setPurchasedPlanName(plan.name);
                                    setShowSuccessDialog(true);
                                    setSelectedPlanId(null);
                                 }} />
                             ) : (
                                 <div className="text-center text-sm text-red-500">
                                     טוען רכיב תשלום... (אם לא נטען, בדוק הגדרות)
                                 </div>
                             )}
                             <Button variant="ghost" size="sm" onClick={() => setSelectedPlanId(null)} className="w-full mt-2">
                                 ביטול
                             </Button>
                        </div>
                    ) : (
                      <Button 
                        className={`w-full ${isCurrent ? 'bg-slate-200 text-slate-600 cursor-default hover:bg-slate-200' : isFree ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                        disabled={isCurrent || isDisabled}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (isDisabled) {
                                toast.error("סכום המינימום לתשלום הוא 2 ₪");
                                return;
                            }
                            if (isFree) {
                                setPurchasedPlanName(plan.name);
                                activateFreePlanMutation.mutate(plan.id);
                            } else {
                                setSelectedPlanId(plan.id);
                            }
                        }}
                      >
                        {isCurrent ? 'התוכנית שלך' : 
                         isFree ? 'עבור לתוכנית חינם' :
                         <>
                            שדרג באמצעות <span className="font-bold italic ml-1">PayPal</span>
                         </>}
                      </Button>
                    )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Payment History */}
      <div>
        <h3 className="text-xl font-bold text-slate-900 mb-4">היסטוריית תשלומים</h3>
        <Card>
          <CardContent className="p-0">
            {payments && payments.length > 0 ? (
              <div className="divide-y">
                {payments.map((payment) => (
                  <div key={payment.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full ${payment.status === 'succeeded' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                        {payment.status === 'succeeded' ? <Check className="h-4 w-4" /> : <History className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{payment.description || 'חיוב חודשי'}</p>
                        <p className="text-sm text-slate-500">{format(new Date(payment.date), 'dd/MM/yyyy')}</p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <div>
                          <p className="font-bold text-slate-900">₪{payment.amount}</p>
                          <Badge variant="outline" className="text-xs">{payment.status}</Badge>
                      </div>
                      {payment.status === 'succeeded' && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 text-xs gap-1 text-slate-500 hover:text-violet-600"
                            onClick={() => handleSendReceipt(payment.id)}
                            disabled={sendingReceiptId === payment.id}
                          >
                            {sendingReceiptId === payment.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Mail className="h-3 w-3" />}
                            שלח קבלה
                          </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500">
                <History className="h-8 w-8 mx-auto mb-2 opacity-20" />
                <p>לא נמצאו חיובים קודמים</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <PartyPopper className="h-6 w-6 text-green-600" />
            </div>
            <DialogHeader>
                <DialogTitle className="text-center text-xl">תשלום התקבל בהצלחה!</DialogTitle>
                <DialogDescription className="text-center">
                    ברכות! המנוי שלך לתוכנית <strong>{purchasedPlanName}</strong> הופעל בהצלחה.
                    <br />
                    כל הפיצ'רים החדשים זמינים עבורך כעת.
                </DialogDescription>
            </DialogHeader>
            <div className="bg-slate-50 p-4 rounded-lg text-sm text-slate-600 mt-2 mb-4">
                קבלה נשלחה לכתובת האימייל שלך.
            </div>
            <DialogFooter className="sm:justify-center">
                <Button onClick={() => setShowSuccessDialog(false)} className="w-full sm:w-auto bg-green-600 hover:bg-green-700">
                    מעולה, תודה!
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Sub-component to handle PayPal Buttons Ref
function PayPalButtonContainer({ plan, onSuccess }) {
    const paypalRef = React.useRef(null);

    React.useEffect(() => {
        if (window.paypal && paypalRef.current) {
            // Clear previous buttons if any (though component remounts usually handle this)
            paypalRef.current.innerHTML = '';
            
            window.paypal.Buttons({
                style: {
                    layout: 'vertical',
                    color:  'blue',
                    shape:  'rect',
                    label:  'pay'
                },
                createOrder: async (data, actions) => {
                    try {
                        console.log("Creating PayPal order for plan:", plan.id);
                        const response = await base44.functions.invoke('paypal', { 
                            action: 'createOrder',
                            planId: plan.id
                        });
                        
                        console.log("PayPal CreateOrder Response:", response);

                        if (!response.data || !response.data.id) {
                            const errorMsg = response.data?.error || "Invalid response from server";
                            const errorDetails = response.data?.details ? JSON.stringify(response.data.details) : "";
                            throw new Error(`${errorMsg} ${errorDetails}`);
                        }
                        
                        return response.data.id;
                    } catch (err) {
                        console.error("PayPal CreateOrder FAILED:", err);
                        
                        let errorMessage = err.message;
                        if (err.response?.data) {
                            errorMessage = err.response.data.error || JSON.stringify(err.response.data);
                        }

                        toast.error(`שגיאה בתשלום: ${errorMessage}`);
                        // Backup alert in case toast is missed
                        if (!errorMessage.includes("Minimum")) { // Don't alert for expected validation errors
                             alert(`שגיאה ביצירת הזמנה: ${errorMessage}`);
                        }
                        
                        throw err; 
                    }
                },
                onApprove: async (data, actions) => {
                    try {
                        const response = await base44.functions.invoke('paypal', {
                            action: 'captureOrder',
                            orderID: data.orderID,
                            planId: plan.id
                        });
                        
                        if (response.data.success) {
                            onSuccess();
                        } else {
                            toast.error('התשלום לא הושלם');
                        }
                    } catch (err) {
                        toast.error('שגיאה באישור התשלום');
                        console.error(err);
                    }
                },
                onError: (err) => {
                    console.error("PayPal Error", err);
                    toast.error("שגיאה בתהליך התשלום");
                },
                onCancel: (data) => {
                    toast.info("התשלום בוטל");
                }
            }).render(paypalRef.current);
        }
    }, [plan.id]);

    return <div ref={paypalRef} className="w-full relative z-0" />;
}