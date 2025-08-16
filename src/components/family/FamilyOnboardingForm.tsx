import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { StepIndicator } from './StepIndicator';
import { FamilyDetailsStep } from './steps/FamilyDetailsStep';
import { PersonalDetailsStep } from './steps/PersonalDetailsStep';
import { ContactInfoStep } from './steps/ContactInfoStep';
import { EmploymentStep } from './steps/EmploymentStep';
import { PreviewStep } from './steps/PreviewStep';
import { FormData } from './types';

const STEPS = [
  { id: 1, title: 'Family Details', description: 'Head of family and branch information' },
  { id: 2, title: 'Personal Details', description: 'Basic information and family relations' },
  { id: 3, title: 'Contact Information', description: 'Phone, email, and location' },
  { id: 4, title: 'Employment', description: 'Work and career details' },
  { id: 5, title: 'Preview', description: 'Review and submit' }
];


const getInitialFormData = (): FormData => {
  return {
    familyDetails: {
      headOfFamily: '',
      branch: ''
    },
    personalDetails: {
      memberName: '',
      gender: '',
      dateOfBirth: '',
      isDeceased: '',
      dateOfDeath: '',
      maritalStatus: '',
      spouseName: '',
      weddingAnniversary: '',
      fatherName: '',
      motherName: '',
      familyPhoto: null,
      personalPhoto: null,
      numberOfChildren: 0,
      children: [],
      relationships: {
        parentOf: [],
        childOf: [],
        siblingOf: [],
        spouseOf: []
      }
    },
    contactInfo: {
      contactNumber: '',
      whatsappNumber: '',
      email: '',
      location: ''
    },
    employment: {
      jobStatus: '',
      companyName: '',
      designation: '',
      workLocation: ''
    }
  };
};


export const FamilyOnboardingForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(getInitialFormData);


  const isAlive = formData.personalDetails.isDeceased !== 'Yes';
  const maxStep = isAlive ? 5 : 3; // Skip contact and employment if deceased

  const updateFormData = (step: keyof FormData, data: any) => {
    setFormData(prev => ({
      ...prev,
      [step]: { ...prev[step], ...data }
    }));
  };

  const nextStep = () => {
    if (currentStep === 2 && !isAlive) {
      setCurrentStep(5); // Skip to preview if deceased
    } else if (currentStep < maxStep) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep === 5 && !isAlive) {
      setCurrentStep(2); // Go back to step 2 if deceased
    } else if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step: number) => {
    // Allow navigation to any valid step based on current form state
    const validMaxStep = formData.personalDetails.isDeceased !== 'Yes' ? 5 : 3;
    if (step >= 1 && step <= validMaxStep) {
      setCurrentStep(step);
    }
  };

  const handleSubmit = () => {
    console.log('Form submitted:', formData);
    // Handle form submission
  };

  const getProgressPercentage = () => {
    if (!isAlive) {
      return currentStep <= 2 ? (currentStep / 3) * 100 : 100;
    }
    return (currentStep / 5) * 100;
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <FamilyDetailsStep
            data={formData.familyDetails}
            onChange={(data) => updateFormData('familyDetails', data)}
          />
        );
      case 2:
        return (
          <PersonalDetailsStep
            data={formData.personalDetails}
            onChange={(data) => updateFormData('personalDetails', data)}
          />
        );
      case 3:
        return (
          <ContactInfoStep
            data={formData.contactInfo}
            onChange={(data) => updateFormData('contactInfo', data)}
          />
        );
      case 4:
        return (
          <EmploymentStep
            data={formData.employment}
            onChange={(data) => updateFormData('employment', data)}
          />
        );
      case 5:
        return (
          <PreviewStep
            formData={formData}
            onEdit={goToStep}
            isAlive={isAlive}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-center mb-2">Family Member Registration</h1>
          <p className="text-muted-foreground text-center">Add a new member to the family tree</p>
        </div>

        <Card className="mb-6">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between mb-4">
              <CardTitle className="text-lg">
                Step {currentStep} of {maxStep}: {STEPS[currentStep - 1]?.title}
              </CardTitle>
              <span className="text-sm text-muted-foreground">
                {Math.round(getProgressPercentage())}% Complete
              </span>
            </div>
            <Progress value={getProgressPercentage()} className="h-2" />
          </CardHeader>
        </Card>

        <StepIndicator
          steps={STEPS.slice(0, maxStep)}
          currentStep={currentStep}
          onStepClick={goToStep}
          isAlive={isAlive}
        />

        <Card className="mt-6">
          <CardContent className="p-6">
            {renderStep()}
          </CardContent>
        </Card>

        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          {currentStep === maxStep ? (
            <Button
              onClick={handleSubmit}
              className="bg-family-primary hover:bg-family-primary/90 text-family-primary-foreground flex items-center gap-2"
            >
              <Check className="h-4 w-4" />
              Submit Registration
            </Button>
          ) : (
            <Button
              onClick={nextStep}
              className="bg-family-primary hover:bg-family-primary/90 text-family-primary-foreground flex items-center gap-2"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};