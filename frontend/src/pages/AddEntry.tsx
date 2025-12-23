import React from "react";
import ExpenseEntryForm from "@/components/ExpenseEntryForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus,
  Shield,
  Lock,
  Eye,
  Zap,
  Info,
  CheckCircle,
  AlertCircle
} from "lucide-react";

const AddEntry: React.FC = () => {
  const features = [
    {
      icon: Lock,
      title: "End-to-End Encryption",
      description: "Your data is encrypted before leaving your device"
    },
    {
      icon: Shield,
      title: "Privacy First",
      description: "No one can see your expense amounts except you"
    },
    {
      icon: Zap,
      title: "Instant Processing",
      description: "Transactions are processed quickly on the blockchain"
    },
    {
      icon: Eye,
      title: "Owner Control",
      description: "Only you can decrypt and view your data"
    }
  ];

  const steps = [
    {
      step: 1,
      title: "Fill Details",
      description: "Enter your expense information securely"
    },
    {
      step: 2,
      title: "Encrypt Data",
      description: "Your data is encrypted using FHE"
    },
    {
      step: 3,
      title: "Submit to Blockchain",
      description: "Transaction is recorded immutably"
    },
    {
      step: 4,
      title: "Verify & Analyze",
      description: "View insights while keeping data private"
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
          <Plus className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium text-primary">Add New Entry</span>
        </div>
        <h1 className="text-4xl font-bold">Record Your Expense</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Securely encrypt and store your expense data with full privacy protection
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <ExpenseEntryForm />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Process Steps */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Info className="mr-2 h-5 w-5" />
                How It Works
              </CardTitle>
              <CardDescription>
                Your data privacy journey in 4 simple steps
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {steps.map((step) => (
                <div key={step.step} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                    {step.step}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{step.title}</h4>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Security Features */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                Security Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="flex items-start space-x-3">
                    <Icon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-sm">{feature.title}</h4>
                      <p className="text-xs text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Tips */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="mr-2 h-5 w-5 text-blue-500" />
                Pro Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></div>
                <p>Use consistent categories for better analysis</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></div>
                <p>Record expenses as soon as possible for accuracy</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></div>
                <p>Your data remains encrypted and private forever</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AddEntry;
