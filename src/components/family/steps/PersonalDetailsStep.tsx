import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Upload,
  X,
  Users,
  Heart,
  Camera,
  ImagePlus,
  ChevronDown,
  Check,
} from 'lucide-react';
import { PersonalDetails, StepProps } from '../types';
import { EnhancedDatePicker } from '@/components/ui/date-picker-enhanced';

import { API_URL } from '@/components/apiconfig/api_url';
import axiosInstance from '@/components/apiconfig/axios';

const MARITAL_STATUS = ['Single', 'Married'];
const GENDER_OPTIONS = ['Male', 'Female'];

interface PersonalDetailsStepProps extends StepProps {
  data: PersonalDetails;
  onValidate?: React.MutableRefObject<any>;
}

interface MemberOption {
  id: number;
  name: string;
  gender: string;
  date_of_birth: string;
  spouse_name?: string; // Add spouse_name field
}

// Autocomplete Component
interface AutocompleteProps {
  value: string;
  onChange: (value: string, option?: MemberOption) => void;
  placeholder: string;
  gender: 'Male' | 'Female';
  className?: string;
  id?: string;
}

const Autocomplete: React.FC<AutocompleteProps> = ({
  value,
  onChange,
  placeholder,
  gender,
  className = '',
  id,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<MemberOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounce function
  const debounce = (func: Function, wait: number) => {
    let timeout: NodeJS.Timeout;
    return function executedFunction(...args: any[]) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  // Fetch members from API
  const fetchMembers = useCallback(
    async (searchValue: string) => {
      if (searchValue.length < 1) {
        setOptions([]);
        return;
      }

      setLoading(true);
      try {
        const response = await axiosInstance.get(
          API_URL.MEMBER.GET_FATHER_NAME,
          {
            params: {
              gender: gender,
              search: searchValue, // Add search parameter if your API supports it
            },
          }
        );

        if (response.data && Array.isArray(response.data)) {
          // Filter results based on the search term (client-side filtering as backup)
          const filteredOptions = response.data.filter((member: MemberOption) =>
            member.name.toLowerCase().includes(searchValue.toLowerCase())
          );
          setOptions(filteredOptions);
        }
      } catch (error) {
        console.error('Error fetching members:', error);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    },
    [gender]
  );

  // Debounced fetch function
  const debouncedFetch = useCallback(debounce(fetchMembers, 300), [
    fetchMembers,
  ]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    onChange(newValue); // Don't pass option when typing manually

    if (newValue.length >= 1) {
      setIsOpen(true);
      debouncedFetch(newValue);
    } else {
      setIsOpen(false);
      setOptions([]);
    }
  };

  // Handle option selection
  const handleOptionSelect = (option: MemberOption) => {
    setSearchTerm(option.name);
    onChange(option.name, option); // Pass the full option object
    setIsOpen(false);
    setOptions([]);
  };

  // Handle input focus
  const handleFocus = () => {
    if (searchTerm.length >= 1) {
      setIsOpen(true);
      debouncedFetch(searchTerm);
    }
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Update search term when value prop changes
  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        id={id}
        value={searchTerm}
        onChange={handleInputChange}
        onFocus={handleFocus}
        placeholder={placeholder}
        className={className}
        autoComplete="off"
      />

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {loading && (
            <div className="px-3 py-2 text-sm text-gray-500">Loading...</div>
          )}

          {!loading && options.length === 0 && searchTerm.length >= 1 && (
            <div className="px-3 py-2 text-sm text-gray-500">
              No results found
            </div>
          )}

          {!loading && options.length > 0 && (
            <div className="py-1">
              {options.map(option => (
                <button
                  key={option.id}
                  onClick={() => handleOptionSelect(option)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium">{option.name}</div>
                    <div className="text-xs text-gray-500">
                      Born:{' '}
                      {new Date(option.date_of_birth).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">{option.gender}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const PersonalDetailsStep: React.FC<PersonalDetailsStepProps> = ({
  data,
  onChange,
  onValidate,
}) => {
  const [showValidation, setShowValidation] = useState(false);

  // Validate required fields
  const validateForm = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!data.memberName?.trim()) {
      errors.push('Member name is required');
    }

    if (!data.gender) {
      errors.push('Gender is required');
    }

    if (!data.dateOfBirth) {
      errors.push('Date of birth is required');
    }

    // Validate children details if they have children
    if (data.numberOfChildren > 0) {
      data.children.forEach((child, index) => {
        if (!child.name?.trim()) {
          errors.push(`Child ${index + 1} name is required`);
        }
        if (!child.gender) {
          errors.push(`Child ${index + 1} gender is required`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  // Prepare form data for API submission
  const prepareFormData = (): FormData => {
    const formData = new FormData();

    // Get stored head UUID from localStorage (or use a prop/context in real implementation)
    let headUuid = '';
    try {
      headUuid = localStorage.getItem('familyHeadUuid') || '';
      console.log('Retrieved head UUID from localStorage:', headUuid);
    } catch (e) {
      console.log('localStorage not available (artifacts environment):', e);
      // In artifacts environment, you might pass this as a prop instead
    }

    // Validate that we have a head UUID
    if (!headUuid) {
      console.error('No family head UUID found in localStorage');
      throw new Error(
        'Family head UUID is required but not found. Please complete step 1 first.'
      );
    }

    // Basic information
    formData.append('name', data.memberName || '');
    formData.append(
      'is_deceased',
      data.isDeceased === 'Yes' ? 'true' : 'false'
    );
    formData.append('gender', data.gender || '');
    formData.append('date_of_birth', data.dateOfBirth || '');
    formData.append('head_uuid', headUuid); // Use head_uuid as expected by the API

    // Death date if applicable
    if (data.isDeceased === 'Yes' && data.dateOfDeath) {
      formData.append('date_of_death', data.dateOfDeath);
    }

    // Marital information
    formData.append('marital_status', data.maritalStatus || '');
    if (data.maritalStatus === 'Married') {
      if (data.spouseName) formData.append('spouse_name', data.spouseName);
      if (data.weddingAnniversary)
        formData.append('wedding_anniversary', data.weddingAnniversary);
    }

    // Parent information
    if (data.fatherName) formData.append('father_name', data.fatherName);
    if (data.motherName) formData.append('mother_name', data.motherName);

    // Children information
    formData.append('number_of_children', data.numberOfChildren.toString());
    if (data.numberOfChildren > 0) {
      formData.append('children', JSON.stringify(data.children));
    }

    // Photos
    if (data.personalPhoto) {
      formData.append('personal_photo', data.personalPhoto);
    }
    if (data.familyPhoto) {
      formData.append('family_photo', data.familyPhoto);
    }

    return formData;
  };

  // Create the validation function that will be called by parent
  const performValidation = () => {
    setShowValidation(true);
    const validation = validateForm();
    return {
      ...validation,
      formData: validation.isValid ? prepareFormData() : undefined,
    };
  };

  // Expose validation function to parent through ref
  React.useEffect(() => {
    if (onValidate) {
      onValidate.current = performValidation;
    }
  }, [data, onValidate]);

  // Handle father name selection and auto-populate mother name
  const handleFatherNameChange = (value: string, option?: MemberOption) => {
    handleInputChange('fatherName', value);

    // If an option was selected (not just typed), populate mother name with spouse
    if (option && option.spouse_name) {
      handleInputChange('motherName', option.spouse_name);
    }
  };

  const handleInputChange = (field: keyof PersonalDetails, value: any) => {
    onChange({ [field]: value });
  };

  const handleChildrenCountChange = (count: number) => {
    const children = Array.from(
      { length: count },
      (_, i) => data.children[i] || { name: '', gender: '' }
    );
    onChange({ numberOfChildren: count, children });
  };

  const handleChildChange = (
    index: number,
    field: keyof (typeof data.children)[0],
    value: string
  ) => {
    const updatedChildren = [...data.children];
    updatedChildren[index] = { ...updatedChildren[index], [field]: value };
    onChange({ children: updatedChildren });
  };

  const handleFileUpload = (
    field: 'familyPhoto' | 'personalPhoto',
    file: File | null
  ) => {
    onChange({ [field]: file });
  };

  // Format date for display
  const formatDateForInput = (dateString: string | null): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch {
      return dateString;
    }
  };

  const PhotoUploadCard = ({
    file,
    onUpload,
    onRemove,
    label,
    description,
  }: {
    file: File | null;
    onUpload: (file: File) => void;
    onRemove: () => void;
    label: string;
    description: string;
  }) => (
    <div className="relative group">
      <div className="border-2 border-dashed border-muted rounded-lg p-4 transition-colors hover:border-primary/50 hover:bg-muted/50">
        {file ? (
          <div className="relative">
            <img
              src={URL.createObjectURL(file)}
              alt={label}
              className="w-full h-32 object-cover rounded-md"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2 h-8 w-8 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={onRemove}
            >
              <X className="h-4 w-4" />
            </Button>
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() =>
                  document
                    .getElementById(
                      `upload-${label.replace(/\s+/g, '-').toLowerCase()}`
                    )
                    ?.click()
                }
              >
                Change Photo
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
              <ImagePlus className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">{label}</p>
            <p className="text-xs text-muted-foreground mb-4">{description}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                document
                  .getElementById(
                    `upload-${label.replace(/\s+/g, '-').toLowerCase()}`
                  )
                  ?.click()
              }
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Photo
            </Button>
          </div>
        )}
        <Input
          type="file"
          accept="image/*"
          onChange={e => {
            const file = e.target.files?.[0];
            if (file) {
              // Validate file size (e.g., max 5MB)
              if (file.size > 5 * 1024 * 1024) {
                alert('File size should be less than 5MB');
                return;
              }
              // Validate file type
              if (!file.type.startsWith('image/')) {
                alert('Please upload only image files');
                return;
              }
              onUpload(file);
            }
          }}
          className="hidden"
          id={`upload-${label.replace(/\s+/g, '-').toLowerCase()}`}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-family-primary" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="memberName">
              Member Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="memberName"
              placeholder="Enter your name"
              value={data.memberName || ''}
              onChange={e => handleInputChange('memberName', e.target.value)}
              required
              className={
                showValidation && !data.memberName?.trim()
                  ? 'border-red-200'
                  : ''
              }
            />
            {showValidation && !data.memberName?.trim() && (
              <p className="text-sm text-red-500">Member name is required</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Is this member deceased?</Label>
            <Select
              value={data.isDeceased || 'No'}
              onValueChange={value => handleInputChange('isDeceased', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Please select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="No">No</SelectItem>
                <SelectItem value="Yes">Yes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>
              Gender <span className="text-red-500">*</span>
            </Label>
            <Select
              value={data.gender || ''}
              onValueChange={value => handleInputChange('gender', value)}
            >
              <SelectTrigger
                className={
                  showValidation && !data.gender ? 'border-red-200' : ''
                }
              >
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                {GENDER_OPTIONS.map(gender => (
                  <SelectItem key={gender} value={gender}>
                    {gender}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {showValidation && !data.gender && (
              <p className="text-sm text-red-500">Gender is required</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>
              Date of Birth <span className="text-red-500">*</span>
            </Label>
            <EnhancedDatePicker
              value={data.dateOfBirth || ''}
              onChange={date => handleInputChange('dateOfBirth', date)}
              placeholder="Select date of birth"
              className={
                showValidation && !data.dateOfBirth ? 'border-red-200' : ''
              }
            />
            {showValidation && !data.dateOfBirth && (
              <p className="text-sm text-red-500">Date of birth is required</p>
            )}
          </div>

          {data.isDeceased === 'Yes' && (
            <div className="space-y-2">
              <Label>Date of Death</Label>
              <EnhancedDatePicker
                value={data.dateOfDeath || ''}
                onChange={date => handleInputChange('dateOfDeath', date)}
                placeholder="Select date of death"
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-family-accent" />
            Family Relations
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Marital Status</Label>
            <Select
              value={data.maritalStatus || ''}
              onValueChange={value => handleInputChange('maritalStatus', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {MARITAL_STATUS.map(status => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {data.maritalStatus === 'Married' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="spouseName">Spouse Name</Label>
                <Input
                  id="spouseName"
                  placeholder="Enter spouse's name"
                  value={data.spouseName || ''}
                  onChange={e =>
                    handleInputChange('spouseName', e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Wedding Anniversary</Label>
                <EnhancedDatePicker
                  value={data.weddingAnniversary || ''}
                  onChange={date =>
                    handleInputChange('weddingAnniversary', date)
                  }
                  placeholder="Select anniversary date"
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="fatherName">Father Name</Label>
            <Autocomplete
              id="fatherName"
              value={data.fatherName || ''}
              onChange={handleFatherNameChange}
              placeholder="Enter your father's name"
              gender="Male"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="motherName">Mother Name</Label>
            <Input
              id="motherName"
              placeholder="Enter your mother's name"
              value={data.motherName || ''}
              onChange={e => handleInputChange('motherName', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {data.maritalStatus === 'Married' && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Children Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label>Number of Children</Label>
              <Select
                value={(data.numberOfChildren || 0).toString()}
                onValueChange={value =>
                  handleChildrenCountChange(parseInt(value))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="How many children?" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 21 }, (_, i) => (
                    <SelectItem key={i} value={i.toString()}>
                      {i}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {data.numberOfChildren > 0 && (
              <div className="space-y-3">
                <Label>Children Details</Label>
                {data.children.map((child, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 border rounded-lg"
                  >
                    <div className="space-y-2">
                      <Label>
                        Child {index + 1} Name{' '}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        value={child.name || ''}
                        onChange={e =>
                          handleChildChange(index, 'name', e.target.value)
                        }
                        placeholder={`Child ${index + 1} name`}
                        className={
                          showValidation && !child.name?.trim()
                            ? 'border-red-200'
                            : ''
                        }
                      />
                      {showValidation && !child.name?.trim() && (
                        <p className="text-sm text-red-500">
                          Child name is required
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>
                        Gender <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={child.gender || ''}
                        onValueChange={value =>
                          handleChildChange(index, 'gender', value)
                        }
                      >
                        <SelectTrigger
                          className={
                            showValidation && !child.gender
                              ? 'border-red-200'
                              : ''
                          }
                        >
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Son">Son</SelectItem>
                          <SelectItem value="Daughter">Daughter</SelectItem>
                        </SelectContent>
                      </Select>
                      {showValidation && !child.gender && (
                        <p className="text-sm text-red-500">
                          Child gender is required
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-family-accent" />
            Photos
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PhotoUploadCard
            file={data.personalPhoto}
            onUpload={file => handleFileUpload('personalPhoto', file)}
            onRemove={() => handleFileUpload('personalPhoto', null)}
            label="Personal Photo"
            description="Upload a clear photo (Max 5MB)"
          />
          <PhotoUploadCard
            file={data.familyPhoto}
            onUpload={file => handleFileUpload('familyPhoto', file)}
            onRemove={() => handleFileUpload('familyPhoto', null)}
            label="Family Photo"
            description="Upload a family photo (Max 5MB)"
          />
        </CardContent>
      </Card>
    </div>
  );
};
