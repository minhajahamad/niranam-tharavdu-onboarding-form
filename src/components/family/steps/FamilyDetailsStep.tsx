import React, { useState, useEffect } from 'react';
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
import axiosInstance from '@/components/apiconfig/axios';
import { API_URL } from '@/components/apiconfig/api_url';

interface FamilyDetailsStepProps extends StepProps {
  data: FamilyDetails;
  onHeadSelection?: (headUuid: string | null) => void;
}

export const FamilyDetailsStep: React.FC<FamilyDetailsStepProps> = ({
  data,
  onChange,
  onHeadSelection,
}) => {
  const [headOfFamilyOpen, setHeadOfFamilyOpen] = useState(false);
  const [headOfFamilyInput, setHeadOfFamilyInput] = useState('');

  const [branches, setBranches] = useState<{ id: number; name: string }[]>([]);
  const [heads, setHeads] = useState<{ uuid: string; head_name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedHeadUuid, setSelectedHeadUuid] = useState<string | null>(null);

  // 🔧 FIX: Sync local state with props when data changes
  useEffect(() => {
    setHeadOfFamilyInput(data.headOfFamily || '');
  }, [data.headOfFamily]);

  // 🔧 FIX: Also sync selectedHeadUuid when coming back to this step
  useEffect(() => {
    // If we have head of family data but no selected UUID,
    // we need to determine if this is an existing head or new one
    if (data.headOfFamily && data.branch) {
      // Try to find if this head name exists in the current branch
      const searchExistingHead = async () => {
        try {
          const res = await axiosInstance.get(
            API_URL.HEAD_MEMBER.SEARCH_HEAD_MEMBER,
            {
              params: {
                branch_id: data.branch,
                search: data.headOfFamily.trim(),
              },
            }
          );
          const existingHead = (res.data || []).find(
            (h: any) =>
              h.head_name.toLowerCase() === data.headOfFamily.toLowerCase()
          );
          if (existingHead) {
            setSelectedHeadUuid(existingHead.uuid);
            onHeadSelection?.(existingHead.uuid);
          }
        } catch (error) {
          console.error('Error checking existing head:', error);
        }
      };

      searchExistingHead();
    }
  }, [data.headOfFamily, data.branch]);

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

  const handleInputChange = (field: keyof FamilyDetails, value: string) => {
    onChange({ [field]: value });
  };

  const handleHeadOfFamilySelect = (
    head: { uuid: string; head_name: string } | string
  ) => {
    if (typeof head === 'string') {
      // "Create new head" - user typed a new name

      // Check if this name exists in the current search results
      const existingHead = heads.find(
        h => h.head_name.toLowerCase() === head.toLowerCase()
      );
      if (existingHead) {
        // If the name exists in search results, select the existing one instead
        setHeadOfFamilyInput(existingHead.head_name);
        handleInputChange('headOfFamily', existingHead.head_name);
        setSelectedHeadUuid(existingHead.uuid);
        onHeadSelection?.(existingHead.uuid);
        console.log(
          'Found existing head, selecting instead of creating new -',
          existingHead.head_name,
          'UUID:',
          existingHead.uuid
        );
        alert(
          `Head "${existingHead.head_name}" already exists. Selected the existing one.`
        );
      } else {
        // Proceed with creating new head
        setHeadOfFamilyInput(head);
        handleInputChange('headOfFamily', head);
        setSelectedHeadUuid(null);
        onHeadSelection?.(null);
        console.log('Selected: New head -', head);
      }
    } else {
      // Existing head selected
      setHeadOfFamilyInput(head.head_name);
      handleInputChange('headOfFamily', head.head_name);
      setSelectedHeadUuid(head.uuid);
      console.log('=== DEBUG: Existing head selected ===');
      console.log('Head name:', head.head_name);
      console.log('Head UUID:', head.uuid);
      console.log('About to call onHeadSelection with UUID:', head.uuid);
      onHeadSelection?.(head.uuid);
      console.log('onHeadSelection called');
    }
    setHeadOfFamilyOpen(false);
  };

  // 🔍 Search API call when input changes
  const handleHeadOfFamilyInputChange = async (value: string) => {
    setHeadOfFamilyInput(value);
    handleInputChange('headOfFamily', value);

    // Reset selection when user types manually
    setSelectedHeadUuid(null);
    onHeadSelection?.(null);

    // 🛑 If no branch selected, don't search
    if (!data.branch) {
      setHeads([]);
      setHeadOfFamilyOpen(false);
      return;
    }

    if (value.length > 0) {
      setHeadOfFamilyOpen(true);
      setLoading(true);
      try {
        const res = await axiosInstance.get(
          API_URL.HEAD_MEMBER.SEARCH_HEAD_MEMBER,
          {
            params: {
              branch_id: data.branch,
              search: value.trim(),
            },
          }
        );
        setHeads(res.data || []);
      } catch (error) {
        console.error('Error fetching heads:', error);
      } finally {
        setLoading(false);
      }
    } else {
      setHeads([]);
      setHeadOfFamilyOpen(false);
    }
  };

  // 🔄 Reset heads when branch changes
  useEffect(() => {
    // Only reset if we're actually changing to a different branch
    // and not just initializing with existing data
    if (data.branch && headOfFamilyInput && !data.headOfFamily) {
      setHeadOfFamilyInput('');
      setHeads([]);
      setSelectedHeadUuid(null);
      onHeadSelection?.(null);
      handleInputChange('headOfFamily', '');
    }
  }, [data.branch]);

  // Close dropdown when clicking outside
  React.useEffect(() => {
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
            <Select
              value={data.branch}
              onValueChange={value => handleInputChange('branch', value)}
            >
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
                placeholder={
                  data.branch
                    ? 'Enter or search head of family'
                    : 'Select a branch first'
                }
                value={headOfFamilyInput}
                onChange={e => handleHeadOfFamilyInputChange(e.target.value)}
                onFocus={() =>
                  setHeadOfFamilyOpen(headOfFamilyInput.length > 0)
                }
                disabled={!data.branch}
                className={
                  selectedHeadUuid ? 'border-green-500 bg-green-50' : ''
                }
              />
              {selectedHeadUuid && (
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  <Check className="h-4 w-4 text-green-600" />
                </div>
              )}
              {headOfFamilyOpen && (
                <div className="absolute top-full left-0 right-0 z-50 mt-1">
                  <div className="rounded-md border border-input bg-popover shadow-lg">
                    <Command>
                      <CommandList className="max-h-40 overflow-y-auto">
                        <CommandGroup>
                          {loading ? (
                            <div className="px-3 py-2 text-sm text-muted-foreground">
                              Searching...
                            </div>
                          ) : heads.length > 0 ? (
                            heads.map(head => (
                              <CommandItem
                                key={head.uuid}
                                value={head.head_name}
                                onSelect={() => handleHeadOfFamilySelect(head)}
                                className="cursor-pointer"
                              >
                                <Check
                                  className={cn(
                                    'mr-2 h-4 w-4',
                                    selectedHeadUuid === head.uuid
                                      ? 'opacity-100'
                                      : 'opacity-0'
                                  )}
                                />
                                {head.head_name}
                                <span className="ml-auto text-xs text-muted-foreground">
                                  Existing
                                </span>
                              </CommandItem>
                            ))
                          ) : (
                            headOfFamilyInput.trim() && (
                              <CommandItem
                                value={headOfFamilyInput}
                                onSelect={() =>
                                  handleHeadOfFamilySelect(headOfFamilyInput)
                                }
                                className="cursor-pointer"
                              >
                                <Check className="mr-2 h-4 w-4 opacity-0" />
                                <div className="flex flex-col">
                                  <span>Create new: "{headOfFamilyInput}"</span>
                                </div>
                                <span className="ml-auto text-xs">New</span>
                              </CommandItem>
                            )
                          )}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </div>
                </div>
              )}
            </div>
            {selectedHeadUuid && (
              <p className="text-sm text-green-600">✓ Existing head selected</p>
            )}
            {!selectedHeadUuid && headOfFamilyInput && (
              <p className="text-sm text-blue-600">
                + New head will be created
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
