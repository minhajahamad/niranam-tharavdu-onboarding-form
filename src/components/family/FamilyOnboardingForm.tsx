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
import axiosInstance from '../apiconfig/axios';
import { API_URL } from '../apiconfig/api_url';

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedHeadUuid, setSelectedHeadUuid] = useState<string | null>(null); // Track selected head UUID

  const isAlive = formData.personalDetails.isDeceased !== 'Yes';
  const maxStep = isAlive ? 5 : 3; // Skip contact and employment if deceased

  const updateFormData = (step: keyof FormData, data: any) => {
    setFormData(prev => ({
      ...prev,
      [step]: { ...prev[step], ...data },
    }));
  };

  // New function to handle head selection from FamilyDetailsStep
  const handleHeadSelection = (headUuid: string | null) => {
    setSelectedHeadUuid(headUuid);
  };

  const validateFamilyDetails = () => {
    const { headOfFamily, branch } = formData.familyDetails;
    if (!headOfFamily.trim()) {
      alert('Please enter head of family name');
      return false;
    }
    if (!branch) {
      alert('Please select a branch');
      return false;
    }
    return true;
  };

  const nextStep = async () => {
    if (currentStep === 1) {
      // Validate family details before proceeding
      if (!validateFamilyDetails()) {
        return;
      }

      console.log('=== DEBUG: nextStep called ===');
      console.log('selectedHeadUuid:', selectedHeadUuid);
      console.log('formData.familyDetails.headOfFamily:', formData.familyDetails.headOfFamily);
      console.log('formData.familyDetails.branch:', formData.familyDetails.branch);

      setIsSubmitting(true);
      
      try {
        let headUuid: string;

        // Check if an existing head was selected
        if (selectedHeadUuid) {
          // Existing head selected - just store UUID and move to next step
          console.log('Using existing head with UUID:', selectedHeadUuid);
          headUuid = selectedHeadUuid;
          
          // Store in localStorage (Note: won't work in artifacts environment)
          try {
            localStorage.setItem('familyHeadUuid', headUuid);
            console.log('Stored existing head UUID in localStorage:', headUuid);
          } catch (e) {
            console.log('localStorage not available (artifacts environment):', e);
          }
          
          alert('Existing family head selected successfully!');
          
        } else {
          // New head - make API call to create it
          const payload = {
            branch: parseInt(formData.familyDetails.branch),
            head_name: formData.familyDetails.headOfFamily.trim(),
          };
          
          console.log('Creating new head with payload:', payload);
          console.log('API URL:', API_URL.HEAD_MEMBER.POST_HEAD_MEMBER);

          const response = await axiosInstance.post(API_URL.HEAD_MEMBER.POST_HEAD_MEMBER, payload);
          
          console.log('New head created successfully:', response.data);
          
          // Extract UUID from response
          headUuid = response.data.uuid;
          
          // Store in localStorage (Note: won't work in artifacts environment)
          try {
            localStorage.setItem('familyHeadUuid', headUuid);
            console.log('Stored new head UUID in localStorage:', headUuid);
          } catch (e) {
            console.log('localStorage not available (artifacts environment):', e);
          }
        }
        
        alert('Family details processed successfully!');
        
        // Move to next step
        setCurrentStep(currentStep + 1);
        
      } catch (error) {
        console.error('Error processing family details:', error);
        console.error('Error response:', error.response);
        
        // Handle different error scenarios
        if (error.response) {
          // Server responded with error status
          console.log('Response data:', error.response.data);
          console.log('Response status:', error.response.status);
          console.log('Response headers:', error.response.headers);
          
          let errorMessage = '';
          
          // Handle Django validation errors
          if (error.response.data && typeof error.response.data === 'object') {
            const errorData = error.response.data;
            
            // Log the full error data for debugging
            console.log('Full error data:', JSON.stringify(errorData, null, 2));
            
            // Check for field-specific validation errors
            if (errorData.head_name && Array.isArray(errorData.head_name)) {
              errorMessage = errorData.head_name.join(', ');
            } else if (errorData.branch && Array.isArray(errorData.branch)) {
              errorMessage = errorData.branch.join(', ');
            } else if (errorData.message) {
              errorMessage = errorData.message;
            } else if (errorData.error) {
              errorMessage = errorData.error;
            } else if (errorData.detail) {
              errorMessage = errorData.detail;
            } else {
              // Extract all error messages
              const errors = Object.values(errorData)
                .flat()
                .filter(msg => typeof msg === 'string')
                .join(', ');
              errorMessage = errors || JSON.stringify(errorData);
            }
          } else {
            errorMessage = error.response.data?.message || 
                          error.response.data?.error || 
                          `Server error: ${error.response.status}`;
          }
          
          // Special handling for duplicate head name error
          if (errorMessage.includes('already exists') || errorMessage.includes('duplicate')) {
            errorMessage += '\n\nSuggestions:\n1. Try a different name\n2. Or search and select the existing head from the dropdown';
          }
          
          alert(`Failed to process family details: ${errorMessage}`);
        } else if (error.request) {
          // Request was made but no response received
          alert('Network error: Unable to connect to server. Please check your connection.');
        } else {
          // Something else happened
          alert('An unexpected error occurred. Please try again.');
        }
        
        return; // Don't proceed to next step if there's an error
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Handle other steps
      if (currentStep === 2 && !isAlive) {
        setCurrentStep(5); // Skip to preview if deceased
      } else if (currentStep < maxStep) {
        setCurrentStep(currentStep + 1);
      }
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
            onChange={data => updateFormData('familyDetails', data)}
            onHeadSelection={handleHeadSelection}
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
            disabled={currentStep === 1 || isSubmitting}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          {currentStep === maxStep ? (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-family-primary hover:bg-family-primary/90 text-family-primary-foreground flex items-center gap-2"
            >
              <Check className="h-4 w-4" />
              Submit Registration
            </Button>
          ) : (
            <Button
              onClick={nextStep}
              disabled={isSubmitting}
              className="bg-family-primary hover:bg-family-primary/90 text-family-primary-foreground flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};