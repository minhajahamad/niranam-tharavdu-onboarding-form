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
  const [createdMemberId, setCreatedMemberId] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  // State to track original data for each completed step
  const [originalStepData, setOriginalStepData] = useState<{
    [step: number]: any;
  }>({});

  const markStepCompleted = (step: number) => {
    setCompletedSteps(prev => new Set(prev).add(step));
  };

  // Store original data when a step is first completed
  const storeOriginalStepData = (step: number, data: any) => {
    setOriginalStepData(prev => ({
      ...prev,
      [step]: JSON.parse(JSON.stringify(data)), // Deep clone to avoid reference issues
    }));
  };

  // Check if step data has been modified
  const hasStepDataChanged = (step: number): boolean => {
    if (!originalStepData[step]) return false;

    let currentData: any;
    switch (step) {
      case 1:
        currentData = formData.familyDetails;
        break;
      case 2:
        currentData = formData.personalDetails;
        break;
      case 3:
        currentData = formData.contactInfo;
        break;
      case 4:
        currentData = formData.employment;
        break;
      default:
        return false;
    }

    return (
      JSON.stringify(currentData) !== JSON.stringify(originalStepData[step])
    );
  };

  // Create refs for step validation
  const personalDetailsValidationRef = useRef<any>();

  const isAlive = formData.personalDetails.isDeceased !== 'Yes';
  const maxStep = isAlive ? 5 : 3;

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

  const validateContactInfo = () => {
    const { contactNumber, whatsappNumber } = formData.contactInfo;
    const errors = [];

    if (!contactNumber.trim()) {
      errors.push('Contact number is required');
    } else if (!/^\+?[\d\s-()]+$/.test(contactNumber.trim())) {
      errors.push('Please enter a valid contact number');
    }

    if (!whatsappNumber.trim()) {
      errors.push('WhatsApp number is required');
    } else if (!/^\+?[\d\s-()]+$/.test(whatsappNumber.trim())) {
      errors.push('Please enter a valid WhatsApp number');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  const validateEmployment = () => {
    const { jobStatus, companyName, designation } = formData.employment;
    const errors = [];

    if (!jobStatus) {
      errors.push('Job status is required');
    }

    // If job status is "Working", validate required fields
    if (jobStatus === 'Working') {
      if (!companyName.trim()) {
        errors.push('Company name is required for working status');
      }
      if (!designation.trim()) {
        errors.push('Designation is required for working status');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  const submitMemberData = async (
    memberFormData: FormData,
    isEdit: boolean = false
  ) => {
    try {
      console.log(
        `=== DEBUG: ${isEdit ? 'Updating' : 'Creating'} Member Data ===`
      );

      let apiUrl: string;
      let method: string;

      if (isEdit && createdMemberId) {
        apiUrl = API_URL.MEMBER.EDIT_MEMBER(parseInt(createdMemberId));
        method = 'PATCH';
        console.log('PATCH API URL:', apiUrl);
      } else {
        apiUrl = API_URL.MEMBER.POST_MEMBER;
        method = 'POST';
        console.log('POST API URL:', apiUrl);
      }

      console.log('FormData prepared successfully with all member data');

      let response;
      if (isEdit) {
        response = await axiosInstance.patch(apiUrl, memberFormData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        response = await axiosInstance.post(apiUrl, memberFormData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      console.log(
        `Member ${isEdit ? 'updated' : 'created'} successfully:`,
        response.data
      );

      if (!isEdit) {
        const memberId = response.data.data.id;
        setCreatedMemberId(memberId);
        console.log('New member ID:', memberId);

        try {
          localStorage.setItem('member_id', memberId);
          console.log('Stored member ID in localStorage:', memberId);
        } catch (e) {
          console.log('localStorage not available (artifacts environment):', e);
        }
      }

      return { success: true, data: response.data };
    } catch (error) {
      console.error(`Error ${isEdit ? 'updating' : 'creating'} member:`, error);
      console.error('Error response:', error.response);

      let errorMessage = '';

      if (error.response) {
        console.log('Response data:', error.response.data);
        console.log('Response status:', error.response.status);

        if (error.response.data && typeof error.response.data === 'object') {
          const errorData = error.response.data;
          console.log('Full error data:', JSON.stringify(errorData, null, 2));

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

  const submitContactData = async (isEdit: boolean = false) => {
    try {
      console.log(
        `=== DEBUG: ${isEdit ? 'Updating' : 'Creating'} Contact Data ===`
      );

      // Get member_id from localStorage
      let memberId;
      try {
        memberId = localStorage.getItem('member_id') || createdMemberId;
        console.log('Retrieved member ID:', memberId);
      } catch (e) {
        console.log('localStorage not available (artifacts environment):', e);
        memberId = createdMemberId;
      }

      if (!memberId) {
        throw new Error(
          'Member ID not found. Please complete previous steps first.'
        );
      }

      // Prepare contact data payload
      const contactPayload = {
        member_id: parseInt(memberId),
        phone_number: formData.contactInfo.contactNumber.trim(),
        whatsapp_number: formData.contactInfo.whatsappNumber.trim() || null,
        email: formData.contactInfo.email.trim() || null,
        address: formData.contactInfo.location.trim() || null,
      };

      console.log('Contact payload:', contactPayload);

      let response;
      if (isEdit) {
        // Get contact_id from localStorage for PATCH request
        let contactId;
        try {
          contactId = localStorage.getItem('contact_id');
          console.log('Retrieved contact ID for update:', contactId);
        } catch (e) {
          console.log('localStorage not available (artifacts environment):', e);
        }

        if (!contactId) {
          throw new Error(
            'Contact ID not found. Cannot update contact information.'
          );
        }

        response = await axiosInstance.patch(
          API_URL.CONTACT.EDIT_CONTACT(parseInt(contactId)),
          contactPayload,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      } else {
        response = await axiosInstance.post(
          API_URL.CONTACT.POST_CONTACT,
          contactPayload,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        // Store contact_id in localStorage after successful creation
        if (response.data && response.data.data && response.data.data.id) {
          const contactId = response.data.data.id;
          try {
            localStorage.setItem('contact_id', contactId.toString());
            console.log('Stored contact ID in localStorage:', contactId);
          } catch (e) {
            console.log(
              'localStorage not available (artifacts environment):',
              e
            );
          }
        } else if (response.data && response.data.id) {
          // Alternative response structure
          const contactId = response.data.id;
          try {
            localStorage.setItem('contact_id', contactId.toString());
            console.log('Stored contact ID in localStorage:', contactId);
          } catch (e) {
            console.log(
              'localStorage not available (artifacts environment):',
              e
            );
          }
        }
      }

      console.log(
        `Contact ${isEdit ? 'updated' : 'created'} successfully:`,
        response.data
      );

      return { success: true, data: response.data };
    } catch (error) {
      console.error(
        `Error ${isEdit ? 'updating' : 'creating'} contact:`,
        error
      );
      console.error('Error response:', error.response);

      let errorMessage = '';

      if (error.response) {
        console.log('Response data:', error.response.data);
        console.log('Response status:', error.response.status);

        if (error.response.data && typeof error.response.data === 'object') {
          const errorData = error.response.data;
          console.log('Full error data:', JSON.stringify(errorData, null, 2));

          if (errorData.phone_number && Array.isArray(errorData.phone_number)) {
            errorMessage = `Phone Number: ${errorData.phone_number.join(', ')}`;
          } else if (errorData.email && Array.isArray(errorData.email)) {
            errorMessage = `Email: ${errorData.email.join(', ')}`;
          } else if (errorData.member && Array.isArray(errorData.member)) {
            errorMessage = `Member: ${errorData.member.join(', ')}`;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          } else if (errorData.detail) {
            errorMessage = errorData.detail;
          } else {
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
        errorMessage =
          error.message || 'An unexpected error occurred. Please try again.';
      }

      return { success: false, error: errorMessage };
    }
  };

  const submitEmploymentData = async (isEdit: boolean = false) => {
    try {
      console.log(
        `=== DEBUG: ${isEdit ? 'Updating' : 'Creating'} Employment Data ===`
      );

      // Get member_id from localStorage
      let memberId;
      try {
        memberId = localStorage.getItem('member_id') || createdMemberId;
        console.log('Retrieved member ID:', memberId);
      } catch (e) {
        console.log('localStorage not available (artifacts environment):', e);
        memberId = createdMemberId;
      }

      if (!memberId) {
        throw new Error(
          'Member ID not found. Please complete previous steps first.'
        );
      }

      // Prepare employment data payload
      const employmentPayload = {
        member_id: parseInt(memberId),
        job_status: formData.employment.jobStatus,
        company_name: formData.employment.companyName.trim() || null,
        designation: formData.employment.designation.trim() || null,
        work_location: formData.employment.workLocation.trim() || null,
      };

      console.log('Employment payload:', employmentPayload);

      let response;
      if (isEdit) {
        // Get employment_id from localStorage for PATCH request
        let employmentId;
        try {
          employmentId = localStorage.getItem('employment_id');
          console.log('Retrieved employment ID for update:', employmentId);
        } catch (e) {
          console.log('localStorage not available (artifacts environment):', e);
        }

        if (!employmentId) {
          throw new Error(
            'Employment ID not found. Cannot update employment information.'
          );
        }

        response = await axiosInstance.patch(
          API_URL.EMPLOYEMENT.EDIT_EMPLOYEMENT(parseInt(employmentId)),
          employmentPayload
        );
      } else {
        response = await axiosInstance.post(
          API_URL.EMPLOYEMENT.POST_EMPLOYEMENT,
          employmentPayload
        );

        // Store employment_id in localStorage after successful creation
        if (response.data && response.data.data && response.data.data.id) {
          const employmentId = response.data.data.id;
          try {
            localStorage.setItem('employment_id', employmentId.toString());
            console.log('Stored employment ID in localStorage:', employmentId);
          } catch (e) {
            console.log(
              'localStorage not available (artifacts environment):',
              e
            );
          }
        } else if (response.data && response.data.id) {
          // Alternative response structure
          const employmentId = response.data.id;
          try {
            localStorage.setItem('employment_id', employmentId.toString());
            console.log('Stored employment ID in localStorage:', employmentId);
          } catch (e) {
            console.log(
              'localStorage not available (artifacts environment):',
              e
            );
          }
        }
      }

      console.log(
        `Employment ${isEdit ? 'updated' : 'created'} successfully:`,
        response.data
      );

      return { success: true, data: response.data };
    } catch (error) {
      console.error(
        `Error ${isEdit ? 'updating' : 'creating'} employment:`,
        error
      );
      console.error('Error response:', error.response);

      let errorMessage = '';

      if (error.response) {
        console.log('Response data:', error.response.data);
        console.log('Response status:', error.response.status);

        if (error.response.data && typeof error.response.data === 'object') {
          const errorData = error.response.data;
          console.log('Full error data:', JSON.stringify(errorData, null, 2));

          if (errorData.job_status && Array.isArray(errorData.job_status)) {
            errorMessage = `Job Status: ${errorData.job_status.join(', ')}`;
          } else if (
            errorData.company_name &&
            Array.isArray(errorData.company_name)
          ) {
            errorMessage = `Company Name: ${errorData.company_name.join(', ')}`;
          } else if (
            errorData.member_id &&
            Array.isArray(errorData.member_id)
          ) {
            errorMessage = `Member ID: ${errorData.member_id.join(', ')}`;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          } else if (errorData.detail) {
            errorMessage = errorData.detail;
          } else {
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
        errorMessage =
          error.message || 'An unexpected error occurred. Please try again.';
      }

      return { success: false, error: errorMessage };
    }
  };

  const nextStep = async () => {
    // Check if step is already completed
    const isStepCompleted = completedSteps.has(currentStep);
    const hasDataChanged = hasStepDataChanged(currentStep);

    // Skip API call if step is completed and no changes made
    if (isStepCompleted && !hasDataChanged) {
      console.log(
        `Step ${currentStep} already completed with no changes, skipping API call`
      );

      // Special handling for deceased members
      if (currentStep === 2 && !isAlive) {
        setCurrentStep(5); // Skip to preview if deceased
      } else if (currentStep < maxStep) {
        setCurrentStep(currentStep + 1);
      }
      return;
    }

    if (currentStep === 1) {
      // Handle family details step
      if (!validateFamilyDetails()) {
        return;
      }

      setIsSubmitting(true);

      try {
        let headUuid: string;

        if (selectedHeadUuid) {
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

        markStepCompleted(1);
        storeOriginalStepData(1, formData.familyDetails);
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
      // Handle personal details step
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
        console.log(
          `${isStepCompleted ? 'Updating' : 'Creating'} personal details...`
        );
        const result = await submitMemberData(
          validation.formData,
          isStepCompleted
        );

        if (result.success) {
          markStepCompleted(2);
          storeOriginalStepData(2, formData.personalDetails);
          alert(
            `Personal details ${
              isStepCompleted ? 'updated' : 'saved'
            } successfully!`
          );

          if (isAlive) {
            setCurrentStep(currentStep + 1); // Go to contact info
          } else {
            setCurrentStep(5); // Skip to preview if deceased
          }
        } else {
          alert(
            `Failed to ${
              isStepCompleted ? 'update' : 'save'
            } personal details: ${result.error}`
          );
        }
      } catch (error) {
        console.error('Unexpected error during member submission:', error);
        alert('An unexpected error occurred while saving. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    } else if (currentStep === 3) {
      // Handle contact information step
      console.log('=== DEBUG: nextStep called for Contact Information ===');

      const validation = validateContactInfo();

      if (!validation.isValid) {
        console.log('Contact info validation failed:', validation.errors);
        alert(
          `Please fix the following errors:\n${validation.errors.join('\n')}`
        );
        return;
      }

      setIsSubmitting(true);

      try {
        console.log(
          `${isStepCompleted ? 'Updating' : 'Creating'} contact information...`
        );
        const result = await submitContactData(isStepCompleted);

        if (result.success) {
          markStepCompleted(3);
          storeOriginalStepData(3, formData.contactInfo);
          alert(
            `Contact information ${
              isStepCompleted ? 'updated' : 'saved'
            } successfully!`
          );
          setCurrentStep(currentStep + 1); // Go to employment step
        } else {
          alert(
            `Failed to ${
              isStepCompleted ? 'update' : 'save'
            } contact information: ${result.error}`
          );
        }
      } catch (error) {
        console.error('Unexpected error during contact submission:', error);
        alert(
          `An unexpected error occurred while ${
            isStepCompleted ? 'updating' : 'saving'
          } contact info. Please try again.`
        );
      } finally {
        setIsSubmitting(false);
      }
    } else if (currentStep === 4) {
      // Handle employment step
      console.log('=== DEBUG: nextStep called for Employment ===');

      const validation = validateEmployment();

      if (!validation.isValid) {
        console.log('Employment validation failed:', validation.errors);
        alert(
          `Please fix the following errors:\n${validation.errors.join('\n')}`
        );
        return;
      }

      setIsSubmitting(true);

      try {
        console.log(
          `${
            isStepCompleted ? 'Updating' : 'Creating'
          } employment information...`
        );
        const result = await submitEmploymentData(isStepCompleted);

        if (result.success) {
          markStepCompleted(4);
          storeOriginalStepData(4, formData.employment);
          alert(
            `Employment information ${
              isStepCompleted ? 'updated' : 'saved'
            } successfully!`
          );
          setCurrentStep(currentStep + 1); // Go to preview step
        } else {
          alert(
            `Failed to ${
              isStepCompleted ? 'update' : 'save'
            } employment information: ${result.error}`
          );
        }
      } catch (error) {
        console.error('Unexpected error during employment submission:', error);
        alert(
          `An unexpected error occurred while ${
            isStepCompleted ? 'updating' : 'saving'
          } employment info. Please try again.`
        );
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Handle other steps (employment)
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

    // Show success alert
    alert('Member added successfully!');

    // Clear all data from localStorage
    try {
      localStorage.removeItem('member_id');
      localStorage.removeItem('contact_id');
      localStorage.removeItem('employment_id');
      localStorage.removeItem('familyHeadUuid');
      console.log('All localStorage data cleared');
    } catch (e) {
      console.log('localStorage not available (artifacts environment):', e);
    }

    // Reset form data to initial state
    setFormData(getInitialFormData());

    // Reset other state variables
    setCurrentStep(1);
    setSelectedHeadUuid(null);
    setCreatedMemberId(null);
    setCompletedSteps(new Set());
    setOriginalStepData({});

    console.log('Form reset to initial state');
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
            // formData={formData}
            onEdit={goToStep}
            // isAlive={isAlive}
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
                  {currentStep === 2
                    ? 'Saving Member...'
                    : currentStep === 3
                    ? 'Saving Contact...'
                    : currentStep === 4
                    ? 'Saving Employment...'
                    : 'Saving...'}
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
