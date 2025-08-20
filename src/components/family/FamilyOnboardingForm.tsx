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
  const [selectedHeadUuid, setSelectedHeadUuid] = useState<string | null>(null);
  const [createdMemberId, setCreatedMemberId] = useState<string | null>(null); // Track created member ID

  // Create refs for step validation
  const personalDetailsValidationRef = useRef<any>();

  const isAlive = formData.personalDetails.isDeceased !== 'Yes';
  const maxStep = isAlive ? 5 : 3; // Skip contact and employment if deceased

  const updateFormData = (step: keyof FormData, data: any) => {
    setFormData(prev => ({
      ...prev,
      [step]: { ...prev[step], ...data },
    }));
  };

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

  const validatePersonalDetails = () => {
    // Call the validation function from PersonalDetailsStep
    if (
      personalDetailsValidationRef.current &&
      typeof personalDetailsValidationRef.current === 'function'
    ) {
      const result = personalDetailsValidationRef.current();
      return result;
    }
    return {
      isValid: false,
      errors: ['Validation not available'],
      formData: null,
    };
  };

  const submitMemberData = async (memberFormData: FormData) => {
    try {
      console.log('=== DEBUG: Submitting Member Data ===');
      console.log('API URL:', API_URL.MEMBER.POST_MEMBER);

      // Log form data contents for debugging
      console.log('FormData contents:');
      // Log FormData without using entries() to avoid TypeScript issues
      console.log('FormData prepared successfully with all member data');

      const response = await axiosInstance.post(
        API_URL.MEMBER.POST_MEMBER,
        memberFormData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log('Member created successfully:', response.data);

      // Store the created member ID (not UUID)
      const memberId = response.data.data.id;
      setCreatedMemberId(memberId);
      console.log(memberId);

      // Store member_id in localStorage
      try {
        localStorage.setItem('member_id', memberId);
        console.log('Stored member ID in localStorage:', memberId);
      } catch (e) {
        console.log('localStorage not available (artifacts environment):', e);
      }

      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error creating member:', error);
      console.error('Error response:', error.response);

      let errorMessage = '';

      if (error.response) {
        console.log('Response data:', error.response.data);
        console.log('Response status:', error.response.status);

        if (error.response.data && typeof error.response.data === 'object') {
          const errorData = error.response.data;
          console.log('Full error data:', JSON.stringify(errorData, null, 2));

          // Handle Django validation errors
          if (errorData.name && Array.isArray(errorData.name)) {
            errorMessage = `Name: ${errorData.name.join(', ')}`;
          } else if (errorData.gender && Array.isArray(errorData.gender)) {
            errorMessage = `Gender: ${errorData.gender.join(', ')}`;
          } else if (
            errorData.date_of_birth &&
            Array.isArray(errorData.date_of_birth)
          ) {
            errorMessage = `Date of Birth: ${errorData.date_of_birth.join(
              ', '
            )}`;
          } else if (errorData.head && Array.isArray(errorData.head)) {
            errorMessage = `Head: ${errorData.head.join(', ')}`;
          } else if (errorData.children && Array.isArray(errorData.children)) {
            errorMessage = `Children: ${errorData.children.join(', ')}`;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          } else if (errorData.detail) {
            errorMessage = errorData.detail;
          } else {
            // Extract all error messages
            const errors = Object.entries(errorData)
              .map(([field, messages]) => {
                if (Array.isArray(messages)) {
                  return `${field}: ${messages.join(', ')}`;
                }
                return `${field}: ${messages}`;
              })
              .join('\n');
            errorMessage = errors || JSON.stringify(errorData);
          }
        } else {
          errorMessage =
            error.response.data?.message ||
            error.response.data?.error ||
            `Server error: ${error.response.status}`;
        }
      } else if (error.request) {
        errorMessage =
          'Network error: Unable to connect to server. Please check your connection.';
      } else {
        errorMessage = 'An unexpected error occurred. Please try again.';
      }

      return { success: false, error: errorMessage };
    }
  };

  const nextStep = async () => {
    if (currentStep === 1) {
      // Validate and handle family details step
      if (!validateFamilyDetails()) {
        return;
      }

      console.log('=== DEBUG: nextStep called for Family Details ===');
      console.log('selectedHeadUuid:', selectedHeadUuid);
      console.log(
        'formData.familyDetails.headOfFamily:',
        formData.familyDetails.headOfFamily
      );
      console.log(
        'formData.familyDetails.branch:',
        formData.familyDetails.branch
      );

      setIsSubmitting(true);

      try {
        let headUuid: string;

        if (selectedHeadUuid) {
          console.log('Using existing head with UUID:', selectedHeadUuid);
          headUuid = selectedHeadUuid;

          try {
            localStorage.setItem('familyHeadUuid', headUuid);
            console.log('Stored existing head UUID in localStorage:', headUuid);
          } catch (e) {
            console.log(
              'localStorage not available (artifacts environment):',
              e
            );
          }

          alert('Existing family head selected successfully!');
        } else {
          const payload = {
            branch: parseInt(formData.familyDetails.branch),
            head_name: formData.familyDetails.headOfFamily.trim(),
          };

          console.log('Creating new head with payload:', payload);
          const response = await axiosInstance.post(
            API_URL.HEAD_MEMBER.POST_HEAD_MEMBER,
            payload
          );

          console.log('New head created successfully:', response.data);
          headUuid = response.data.uuid;

          try {
            localStorage.setItem('familyHeadUuid', headUuid);
            console.log('Stored new head UUID in localStorage:', headUuid);
          } catch (e) {
            console.log(
              'localStorage not available (artifacts environment):',
              e
            );
          }
        }

        alert('Family details processed successfully!');
        setCurrentStep(currentStep + 1);
      } catch (error) {
        console.error('Error processing family details:', error);

        let errorMessage = '';
        if (error.response?.data) {
          const errorData = error.response.data;
          if (errorData.head_name && Array.isArray(errorData.head_name)) {
            errorMessage = errorData.head_name.join(', ');
          } else if (errorData.branch && Array.isArray(errorData.branch)) {
            errorMessage = errorData.branch.join(', ');
          } else {
            errorMessage =
              errorData.message ||
              errorData.error ||
              errorData.detail ||
              `Server error: ${error.response.status}`;
          }

          if (
            errorMessage.includes('already exists') ||
            errorMessage.includes('duplicate')
          ) {
            errorMessage +=
              '\n\nSuggestions:\n1. Try a different name\n2. Or search and select the existing head from the dropdown';
          }
        } else if (error.request) {
          errorMessage =
            'Network error: Unable to connect to server. Please check your connection.';
        } else {
          errorMessage = 'An unexpected error occurred. Please try again.';
        }

        alert(`Failed to process family details: ${errorMessage}`);
        return;
      } finally {
        setIsSubmitting(false);
      }
    } else if (currentStep === 2) {
      // Validate and submit personal details
      console.log('=== DEBUG: nextStep called for Personal Details ===');

      const validation = validatePersonalDetails();

      if (!validation.isValid) {
        console.log('Personal details validation failed:', validation.errors);
        alert(
          `Please fix the following errors:\n${validation.errors.join('\n')}`
        );
        return;
      }

      if (!validation.formData) {
        alert('Form data preparation failed. Please try again.');
        return;
      }

      setIsSubmitting(true);

      try {
        console.log('Submitting personal details...');
        const result = await submitMemberData(validation.formData);

        if (result.success) {
          alert('Personal details saved successfully!');

          // Move to next step based on whether person is alive
          if (isAlive) {
            setCurrentStep(currentStep + 1); // Go to contact info
          } else {
            setCurrentStep(5); // Skip to preview if deceased
          }
        } else {
          alert(`Failed to save personal details: ${result.error}`);
        }
      } catch (error) {
        console.error('Unexpected error during member submission:', error);
        alert('An unexpected error occurred while saving. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Handle other steps (contact info, employment)
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
    const validMaxStep = formData.personalDetails.isDeceased !== 'Yes' ? 5 : 3;
    if (step >= 1 && step <= validMaxStep) {
      setCurrentStep(step);
    }
  };

  const handleSubmit = () => {
    console.log('Form submitted:', formData);
    console.log('Created member ID:', createdMemberId);
    // Handle final form submission or navigation
    alert('Registration completed successfully!');
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
            onValidate={personalDetailsValidationRef}
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
                  {currentStep === 2 ? 'Saving Member...' : 'Saving...'}
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
