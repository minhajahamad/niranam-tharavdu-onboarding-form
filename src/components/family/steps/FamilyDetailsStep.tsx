import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Command, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Check, Users } from 'lucide-react';
import { FamilyDetails, StepProps } from '../types';
import { cn } from '@/lib/utils';

const BRANCHES = [
  'Mattackal',
  'Mattackal Puthukeril',
  'Mattackal Pallivathukkal',
  'Mattackal Karikkotta',
  'Mattackal Venparampil',
  'Mattackal Valaparambil',
  'Mattackal Kizhakkepurathu',
  'Mattackal Thoppil',
  'Mattackal Nidhirickal Kaithamattom'
];

// Mock data for heads of family - in real app this would come from database
const HEADS_OF_FAMILY = [
  'John Mattackal',
  'Mary Mattackal Puthukeril',
  'James Mattackal Pallivathukkal',
  'Sarah Mattackal Karikkotta',
  'Michael Mattackal Venparampil',
  'Anna Mattackal Valaparambil',
  'Peter Mattackal Kizhakkepurathu',
  'Lisa Mattackal Thoppil',
  'David Mattackal Nidhirickal Kaithamattom'
];

interface FamilyDetailsStepProps extends StepProps {
  data: FamilyDetails;
}

export const FamilyDetailsStep: React.FC<FamilyDetailsStepProps> = ({
  data,
  onChange
}) => {
  const [headOfFamilyOpen, setHeadOfFamilyOpen] = React.useState(false);
  const [headOfFamilyInput, setHeadOfFamilyInput] = React.useState(data.headOfFamily || '');

  const handleInputChange = (field: keyof FamilyDetails, value: string) => {
    onChange({ [field]: value });
  };

  const handleHeadOfFamilySelect = (value: string) => {
    setHeadOfFamilyInput(value);
    handleInputChange('headOfFamily', value);
    setHeadOfFamilyOpen(false);
  };

  const handleHeadOfFamilyInputChange = (value: string) => {
    setHeadOfFamilyInput(value);
    handleInputChange('headOfFamily', value);
    setHeadOfFamilyOpen(value.length > 0);
  };

  const filteredHeads = HEADS_OF_FAMILY.filter(head =>
    head.toLowerCase().includes(headOfFamilyInput.toLowerCase())
  );

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
            <Label>Head of Family *</Label>
            <div className="relative" data-combobox>
              <Input
                placeholder="Enter or search head of family name"
                value={headOfFamilyInput}
                onChange={(e) => handleHeadOfFamilyInputChange(e.target.value)}
                onFocus={() => setHeadOfFamilyOpen(headOfFamilyInput.length > 0)}
              />
              {headOfFamilyOpen && filteredHeads.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-50 mt-1">
                  <div className="rounded-md border border-input bg-popover shadow-lg">
                    <Command>
                      <CommandList className="max-h-40">
                        <CommandGroup>
                          {filteredHeads.map((head) => (
                            <CommandItem
                              key={head}
                              value={head}
                              onSelect={() => handleHeadOfFamilySelect(head)}
                              className="cursor-pointer"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  headOfFamilyInput === head ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {head}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Branch *</Label>
            <Select
              value={data.branch}
              onValueChange={(value) => handleInputChange('branch', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select branch" />
              </SelectTrigger>
              <SelectContent>
                {BRANCHES.map((branch) => (
                  <SelectItem key={branch} value={branch}>
                    {branch}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};