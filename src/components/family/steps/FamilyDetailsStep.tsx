import React, { useEffect, useState, useCallback } from 'react';
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
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Check, Users } from 'lucide-react';
import { FamilyDetails, StepProps } from '../types';
import { cn } from '@/lib/utils';

import { API_URL } from '@/components/apiconfig/api_url';
import axiosInstance from '@/components/apiconfig/axios';

type HeadValidationResult = {
  uuid: string;
  head_name: string;
  branch: number;
  branch_name: string;
  created_at: string;
  updated_at: string;
  isNew?: boolean;
};

interface FamilyDetailsStepProps extends StepProps {
  data: FamilyDetails;
  onSetValidateFunction: (
    fn: (() => Promise<HeadValidationResult>) | null
  ) => void;
}

export const FamilyDetailsStep: React.FC<FamilyDetailsStepProps> = ({
  data,
  onChange,
  onSetValidateFunction,
}) => {
  const [headOfFamilyOpen, setHeadOfFamilyOpen] = useState(false);
  const [headOfFamilyInput, setHeadOfFamilyInput] = useState(
    data.headOfFamily || ''
  );

  const [branches, setBranches] = useState<{ id: number; name: string }[]>([]);
  const [heads, setHeads] = useState<{ uuid: string; head_name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedHeadUuid, setSelectedHeadUuid] = useState<string | null>(null);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await axiosInstance.get(API_URL.BRANCHES.GET_BRANCHES);
        setBranches(res.data || []);
      } catch (error) {
        console.error('Error fetching branches:', error);
      }
    };
    fetchBranches();
  }, []);

  // Load saved head data from localStorage on component mount
  useEffect(() => {
    const savedHeadData = localStorage.getItem('pendingHeadData');
    if (savedHeadData) {
      try {
        const parsedData: HeadValidationResult = JSON.parse(savedHeadData);
        // If the saved data matches current form data, restore the selection
        if (
          parsedData.head_name === data.headOfFamily &&
          parsedData.branch.toString() === data.branch
        ) {
          setSelectedHeadUuid(parsedData.uuid);
        }
      } catch (error) {
        console.error('Error parsing saved head data:', error);
      }
    }
  }, [data.headOfFamily, data.branch]);

  // 🔍 Fetch heads on input change
  useEffect(() => {
    if (!headOfFamilyInput.trim() || !data.branch) {
      setHeads([]);
      setHeadOfFamilyOpen(false);
      return;
    }

    const fetchHeads = async () => {
      setLoading(true);
      try {
        // Add debugging
        console.log('Fetching heads with params:', {
          branch_id: data.branch,
          search: headOfFamilyInput.trim(),
        });

        const res = await axiosInstance.get(
          API_URL.HEAD_MEMBER.SEARCH_HEAD_MEMBER,
          {
            params: {
              branch_id: data.branch,
              search: headOfFamilyInput.trim(),
            },
          }
        );

        console.log('API Response:', res.data);
        setHeads(res.data || []);
        setHeadOfFamilyOpen(true); // Always show dropdown when search is performed
      } catch (error) {
        console.error('Error fetching heads:', error);
        console.error('Error details:', error.response?.data);
        setHeads([]);
        setHeadOfFamilyOpen(true); // Show dropdown even on error to display "No result found"
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchHeads, 200); // debounce API calls
    return () => clearTimeout(debounce);
  }, [headOfFamilyInput, data.branch]);

  const handleInputChange = (field: keyof FamilyDetails, value: string) => {
    onChange({ [field]: value });
  };

  const handleBranchChange = (value: string) => {
    handleInputChange('branch', value);
    // Clear head of family when branch changes
    setHeadOfFamilyInput('');
    handleInputChange('headOfFamily', '');
    setSelectedHeadUuid(null);
    setHeads([]);
    setHeadOfFamilyOpen(false);
    // Clear any saved head data when branch changes
    localStorage.removeItem('pendingHeadData');
  };

  const handleHeadOfFamilySelect = (value: string) => {
    setHeadOfFamilyInput(value);
    handleInputChange('headOfFamily', value);

    // Find the selected head's UUID
    const selectedHead = heads.find(head => head.head_name === value);
    setSelectedHeadUuid(selectedHead?.uuid || null);

    setHeadOfFamilyOpen(false);
  };

  const handleHeadOfFamilyInputChange = (value: string) => {
    setHeadOfFamilyInput(value);
    handleInputChange('headOfFamily', value);

    // If user types something different, it's potentially a new head
    const existingHead = heads.find(head => head.head_name === value);
    setSelectedHeadUuid(existingHead?.uuid || null);
  };

  // Generate a temporary UUID for new heads
  const generateTempUuid = () => {
    return 'temp-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now();
  };

  // Create validation function using useCallback to ensure stable reference
  const validationFunction =
    useCallback(async (): Promise<HeadValidationResult> => {
      console.log('Validation called with:', {
        headOfFamily: data.headOfFamily,
        branch: data.branch,
        selectedHeadUuid,
      });

      if (!data.headOfFamily?.trim() || !data.branch) {
        throw new Error('Head of family name and branch are required');
      }

      // If we have a selected UUID, return existing head data
      if (selectedHeadUuid && !selectedHeadUuid.startsWith('temp-')) {
        const existingHead = heads.find(head => head.uuid === selectedHeadUuid);
        if (existingHead) {
          const headResult: HeadValidationResult = {
            uuid: existingHead.uuid,
            head_name: existingHead.head_name,
            branch: parseInt(data.branch),
            branch_name:
              branches.find(b => b.id.toString() === data.branch)?.name || '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          // Save to localStorage
          localStorage.setItem('pendingHeadData', JSON.stringify(headResult));
          return headResult;
        }
      }

      // For new heads, create a temporary entry and save to localStorage
      const newHeadResult: HeadValidationResult = {
        uuid: generateTempUuid(),
        head_name: data.headOfFamily.trim(),
        branch: parseInt(data.branch),
        branch_name:
          branches.find(b => b.id.toString() === data.branch)?.name || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        isNew: true, // Add a flag to indicate this is a new head
      } as HeadValidationResult & { isNew: boolean };

      // Save to localStorage
      localStorage.setItem('pendingHeadData', JSON.stringify(newHeadResult));

      console.log('New head data saved to localStorage:', newHeadResult);
      return newHeadResult;
    }, [data.headOfFamily, data.branch, selectedHeadUuid, heads, branches]);

  // Set the validation function in the parent component
  useEffect(() => {
    // Only set the validation function if we have the required data
    if (data.headOfFamily?.trim() && data.branch) {
      onSetValidateFunction(validationFunction);
    } else {
      onSetValidateFunction(null);
    }

    // Cleanup function to clear the validation function when component unmounts
    return () => onSetValidateFunction(null);
  }, [
    validationFunction,
    onSetValidateFunction,
    data.headOfFamily,
    data.branch,
  ]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('[data-combobox]')) {
        setHeadOfFamilyOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-family-primary" />
            Family Details
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Branch *</Label>
            <Select value={data.branch} onValueChange={handleBranchChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select branch" />
              </SelectTrigger>
              <SelectContent>
                {branches.map(branch => (
                  <SelectItem key={branch.id} value={branch.id.toString()}>
                    {branch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Head of Family *</Label>
            <div className="relative" data-combobox>
              <Input
                placeholder="Enter or search head of family name"
                value={headOfFamilyInput}
                onChange={e => handleHeadOfFamilyInputChange(e.target.value)}
                onFocus={() => {
                  if (headOfFamilyInput.trim()) {
                    setHeadOfFamilyOpen(true);
                  }
                }}
                disabled={!data.branch}
              />
              {headOfFamilyOpen && (
                <div className="absolute top-full left-0 right-0 z-50 mt-1">
                  <div className="rounded-md border border-input bg-popover shadow-lg">
                    <Command>
                      <CommandList className="max-h-40">
                        <CommandGroup>
                          {loading ? (
                            <CommandItem disabled>Searching...</CommandItem>
                          ) : heads.length > 0 ? (
                            heads.map(head => (
                              <CommandItem
                                key={head.uuid}
                                value={head.head_name}
                                onSelect={() =>
                                  handleHeadOfFamilySelect(head.head_name)
                                }
                                className="cursor-pointer"
                              >
                                <Check
                                  className={cn(
                                    'mr-2 h-4 w-4',
                                    headOfFamilyInput === head.head_name
                                      ? 'opacity-100'
                                      : 'opacity-0'
                                  )}
                                />
                                {head.head_name}
                              </CommandItem>
                            ))
                          ) : (
                            <CommandItem disabled>
                              No result for: "{headOfFamilyInput.trim()}" - Will
                              create new head
                            </CommandItem>
                          )}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
