import React from 'react';
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
import { Briefcase, Building, MapPin } from 'lucide-react';
import { Employment, StepProps } from '../types';

const JOB_STATUS_OPTIONS = ['Working', 'Retired', 'Not Working'];

interface EmploymentStepProps extends StepProps {
  data: Employment;
}

export const EmploymentStep: React.FC<EmploymentStepProps> = ({
  data,
  onChange,
}) => {
  const handleInputChange = (field: keyof Employment, value: string) => {
    onChange({ [field]: value });
  };

  const showWorkingFields = data.jobStatus === 'Working';

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Employment Information
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Professional and career details
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Job Status</Label>
            <Select
              value={data.jobStatus}
              onValueChange={value => handleInputChange('jobStatus', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select job status" />
              </SelectTrigger>
              <SelectContent>
                {JOB_STATUS_OPTIONS.map(status => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {showWorkingFields && (
            <div className="space-y-4 pt-4 border-t">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="companyName"
                    className="flex items-center gap-2"
                  >
                    Company Name
                  </Label>
                  <Input
                    id="companyName"
                    value={data.companyName}
                    onChange={e =>
                      handleInputChange('companyName', e.target.value)
                    }
                    placeholder="Company or organization name"
                  />
                </div>

                <div>
                  <Label htmlFor="designation">Designation</Label>
                  <Input
                    id="designation"
                    value={data.designation}
                    onChange={e =>
                      handleInputChange('designation', e.target.value)
                    }
                    placeholder="Job title or position"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="workLocation"
                  className="flex items-center gap-2"
                >
                  Work Location
                </Label>
                <Input
                  id="workLocation"
                  value={data.workLocation}
                  onChange={e =>
                    handleInputChange('workLocation', e.target.value)
                  }
                  placeholder="Office location or remote"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
