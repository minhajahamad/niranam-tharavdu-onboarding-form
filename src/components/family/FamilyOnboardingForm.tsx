import React, { useState, useEffect, useRef } from 'react';
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
  {
    id: 1,
    title: 'Family Details',
    description: 'Head of family and branch information',
  },
  {
    id: 2,
    title: 'Personal Details',
    description: 'Basic information and family relations',
  },
  {
    id: 3,
    title: 'Contact Information',
    description: 'Phone, email, and location',
  },
  { id: 4, title: 'Employment', description: 'Work and career details' },
  { id: 5, title: 'Preview', description: 'Review and submit' },
];

type HeadValidationResult = {
  uuid: string;
  head_name: string;
  branch: number;
  branch_name: string;
  created_at: string;
  updated_at: string;
  isNew?: boolean;
};

const getInitialFormData = (): FormData => {
  return {
    familyDetails: {
      headOfFamily: '',
      branch: '',
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
        spouseOf: [],
      },
    },
    contactInfo: {
      contactNumber: '',
      whatsappNumber: '',
      email: '',
      location: '',
    },
    employment: {
      jobStatus: '',
      companyName: '',
      designation: '',
      workLocation: '',
    },
  };
};

export const FamilyOnboardingForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(getInitialFormData);
  const [headData, setHeadData] = useState<HeadValidationResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Use a ref to store the validation function
  const validateHeadFunctionRef = useRef<
    (() => Promise<HeadValidationResult>) | null
  >(null);

  const isAlive = formData.personalDetails.isDeceased !== 'Yes';
  const maxStep = isAlive ? 5 : 3; // Skip contact and employment if deceased

  // Load saved data from localStorage on component mount
  useEffect(() => {
    const savedFormData = localStorage.getItem('familyOnboardingForm');
    const savedHeadData = localStorage.getItem('pendingHeadData');

    if (savedFormData) {
      try {
        const parsedFormData = JSON.parse(savedFormData);
        setFormData(parsedFormData);
      } catch (error) {
        console.error('Error loading saved form data:', error);
      }
    }

    if (savedHeadData) {
      try {
        const parsedHeadData = JSON.parse(savedHeadData);
        setHeadData(parsedHeadData);
      } catch (error) {
        console.error('Error loading saved head data:', error);
      }
    }
  }, []);

  const updateFormData = (step: keyof FormData, data: any) => {
    setFormData(prev => ({
      ...prev,
      [step]: { ...prev[step], ...data },
    }));
  };

  // Function to set the validation function
  const setValidateHeadFunction = (
    fn: (() => Promise<HeadValidationResult>) | null
  ) => {
    validateHeadFunctionRef.current = fn;
  };

  const handleNextStep = async () => {
    // If we're on step 1 (Family Details), validate and create/get head
    if (currentStep === 1) {
      // Check if required fields are filled before attempting validation
      if (
        !formData.familyDetails.headOfFamily?.trim() ||
        !formData.familyDetails.branch
      ) {
        alert('Please fill in both branch and head of family name');
        return;
      }

      if (!validateHeadFunctionRef.current) {
        console.error('Validation function not available');
        alert('Please wait for the form to load completely');
        return;
      }

      setIsProcessing(true);
      try {
        const headResult = await validateHeadFunctionRef.current();
        setHeadData(headResult);
        console.log('Head data:', headResult);
      } catch (error) {
        console.error('Error validating head:', error);
        alert('Error validating head of family. Please try again.');
        setIsProcessing(false);
        return; // Don't proceed to next step if validation fails
      }
      setIsProcessing(false);
    }

    // Proceed to next step
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
    console.log('Head data:', headData);

    try {
      setIsProcessing(true);

      // If the head is new (has isNew flag or temp UUID), create it first
      if (headData && (headData.isNew || headData.uuid.startsWith('temp-'))) {
        console.log('Creating new head member...');
        // Here you would make the API call to create the head member
        // const response = await axiosInstance.post(API_URL.HEAD_MEMBER.POST_HEAD_MEMBER, {
        //   head_name: headData.head_name,
        //   branch: headData.branch
        // });
        // Update headData with the real UUID from the response
        // setHeadData(response.data);
      }

      // Then submit the main form data
      console.log('Submitting member data...');
      // Handle the main form submission here

      // Clear localStorage after successful submission
      localStorage.removeItem('familyOnboardingForm');
      localStorage.removeItem('pendingHeadData');

      alert('Registration submitted successfully!');

      // Reset form
      setFormData(getInitialFormData());
      setHeadData(null);
      setCurrentStep(1);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error submitting registration. Please try again.');
    } finally {
      setIsProcessing(false);
    }
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
            onChange={data => updateFormData('familyDetails', data)}
            onSetValidateFunction={setValidateHeadFunction}
          />
        );
      case 2:
        return (
          <PersonalDetailsStep
            data={formData.personalDetails}
            onChange={data => updateFormData('personalDetails', data)}
          />
        );
      case 3:
        return (
          <ContactInfoStep
            data={formData.contactInfo}
            onChange={data => updateFormData('contactInfo', data)}
          />
        );
      case 4:
        return (
          <EmploymentStep
            data={formData.employment}
            onChange={data => updateFormData('employment', data)}
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

  // Function to clear all saved data
  const clearSavedData = () => {
    localStorage.removeItem('familyOnboardingForm');
    localStorage.removeItem('pendingHeadData');
    setFormData(getInitialFormData());
    setHeadData(null);
    setCurrentStep(1);
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-center mb-2">
            Family Member Registration
          </h1>
          <p className="text-muted-foreground text-center">
            Add a new member to the family tree
          </p>
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
              {headData && (
                <span className="text-xs text-green-600">
                  Head: {headData.head_name} ({headData.branch_name})
                  {headData.isNew && ' - New'}
                </span>
              )}
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
          <CardContent className="p-6">{renderStep()}</CardContent>
        </Card>

        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1 || isProcessing}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          {currentStep === maxStep ? (
            <Button
              onClick={handleSubmit}
              disabled={isProcessing}
              className="bg-family-primary hover:bg-family-primary/90 text-family-primary-foreground flex items-center gap-2"
            >
              <Check className="h-4 w-4" />
              Submit Registration
            </Button>
          ) : (
            <Button
              onClick={handleNextStep}
              disabled={isProcessing}
              className="bg-family-primary hover:bg-family-primary/90 text-family-primary-foreground flex items-center gap-2"
            >
              {isProcessing ? 'Processing...' : 'Next'}
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
